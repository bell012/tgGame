import { computed, onScopeDispose, ref, shallowReactive, watch } from 'vue'
import Api from '@/api'
import type {
  GetCompetitionListParams,
  GetCompetitionListResponse,
  GetSelectedEventInfoParams,
  GetSelectedEventInfoResponse,
  SportEvent,
  SportsResponse
} from '@/api/interface/sport'
import { isApiBusinessSuccess } from '@/utils/apiBusiness'

type HotRequestError = {
  kind: 'business' | 'response' | 'network'
  message: string
  code?: string | number
}
type HotListState = {
  params: GetCompetitionListParams | null
  response: GetCompetitionListResponse | null
  data: GetCompetitionListResponse | null
  loading: boolean
  error: HotRequestError | null
}
type HotEventsOptions = {
  getContext: () => string
  isActive: () => boolean
  getBaseUrl: () => string
  getSportId: () => number
  getListParams: () => GetCompetitionListParams
  getDetailParams: (sportId: number, eventIds: number[]) => GetSelectedEventInfoParams
  getVisit?: () => number
  nextRevision?: () => number
  reuseEvent?: (previous: SportEvent, next: SportEvent) => SportEvent
}
const SELECTED_EVENT_BATCH_SIZE = 5
const isSportsSuccess = (response: SportsResponse) => response.stc === 100 || response.stc === '100'

/** 热门赛事请求与缓存按实例隔离；调用方负责页面生命周期和轮询。 */
export const useHotEvents = (options: HotEventsOptions) => {
  let localRevision = 0
  // 热门名单独立管理，首次与普通查询并行，后续最多每60秒刷新一次。
  const competitionListState = shallowReactive<HotListState>({
    params: null,
    response: null,
    data: null,
    loading: false,
    error: null
  })
  let competitionListController: AbortController | undefined
  const competitionListContext = ref('')
  const getCompetitionListContext = () => options.getContext()
  const cancelCompetitionList = () => {
    competitionListController?.abort()
    competitionListController = undefined
    competitionListState.loading = false
  }
  const requestCompetitionList = async () => {
    cancelCompetitionList()
    cancelHotDetails()
    const controller = new AbortController()
    competitionListController = controller
    const params = options.getListParams()
    const context = getCompetitionListContext()
    const isCurrent = () =>
      competitionListController === controller &&
      !controller.signal.aborted &&
      context === getCompetitionListContext()
    if (context !== competitionListContext.value) competitionListState.data = null
    competitionListContext.value = context
    competitionListState.params = params
    competitionListState.response = null
    competitionListState.error = null
    competitionListState.loading = true
    try {
      const response = await Api.sport.getCompetitionList(params, { signal: controller.signal })
      if (!isCurrent()) return null
      competitionListState.response = response
      if (isApiBusinessSuccess(response)) {
        if (
          Array.isArray(response.result) &&
          response.result.every(
            record =>
              record &&
              Number.isSafeInteger(record.sportId) &&
              record.sportId > 0 &&
              Number.isSafeInteger(record.eventId) &&
              record.eventId > 0
          )
        ) {
          applyHotEventList(response)
        } else {
          competitionListState.error = { kind: 'response', message: 'Invalid hot events response' }
        }
      } else {
        competitionListState.error = {
          kind: 'business',
          code: response.code,
          message: response.message
        }
      }
      return response
    } catch {
      if (isCurrent()) {
        competitionListState.error = { kind: 'network', message: 'Hot events request failed' }
      }
      return null
    } finally {
      if (competitionListController === controller) {
        competitionListController = undefined
        competitionListState.loading = false
        hotListCheckedAt = Date.now()
      }
    }
  }

  const fetchCompetitionList = (): Promise<GetCompetitionListResponse | null> => {
    if (hotListPending) return hotListPending
    const pending = requestCompetitionList().finally(() => {
      if (hotListPending === pending) hotListPending = null
    })
    hotListPending = pending
    return pending
  }

  // 热门使用独立详情缓存和缺失记录，不参与普通赛事的更新及下架判定。
  const hotDetailsState = shallowReactive<{
    params: GetSelectedEventInfoParams | null
    response: GetSelectedEventInfoResponse | null
    data: SportEvent[]
    loading: boolean
    error: HotRequestError | null
  }>({ params: null, response: null, data: [], loading: false, error: null })
  const hotDetailsContext = ref('')
  const publishedHotEvents = ref<{ context: string; ids: number[] }>({ context: '', ids: [] })
  let hotDetailsController: AbortController | undefined
  let hotDetailsPending: Promise<SportEvent[] | null> | null = null
  const missingHotRounds = new Map<number, number>()
  const hotEventCache = new Map<
    number,
    { event: SportEvent; clockUpdatedAt: number; revision: number }
  >()
  let hotListCheckedAt = 0
  let hotListPending: Promise<GetCompetitionListResponse | null> | null = null
  let hotRoundPending: Promise<unknown> | null = null
  let hotGeneration = 0
  const cancelHotDetails = () => {
    hotDetailsController?.abort()
    hotDetailsController = undefined
    hotDetailsPending = null
    hotDetailsState.loading = false
  }
  const reset = () => {
    cancelCompetitionList()
    cancelHotDetails()
    hotListPending = null
    hotRoundPending = null
    hotGeneration += 1
    missingHotRounds.clear()
    hotEventCache.clear()
    hotListCheckedAt = 0
    competitionListState.data = null
    competitionListState.response = null
    competitionListState.error = null
    competitionListContext.value = ''
    hotDetailsState.params = null
    hotDetailsState.response = null
    hotDetailsState.data = []
    hotDetailsState.error = null
    hotDetailsContext.value = ''
    publishedHotEvents.value = { context: '', ids: [] }
    competitionListState.params = null
  }
  watch(options.getContext, reset, { flush: 'sync' })
  const getHotEventIds = () => [
    ...new Set(
      (competitionListState.data?.result ?? [])
        .filter(
          record =>
            record.sportId === options.getSportId() &&
            Number.isSafeInteger(record.eventId) &&
            record.eventId > 0
        )
        .map(record => record.eventId)
    )
  ]
  const publishHotEvents = () => {
    publishedHotEvents.value = {
      context: options.getContext(),
      ids: getHotEventIds().filter(id => (missingHotRounds.get(id) ?? 0) < 2)
    }
  }
  const applyHotEventList = (response: GetCompetitionListResponse) => {
    const previousIds = getHotEventIds()
    competitionListState.data = response
    competitionListContext.value = getCompetitionListContext()
    const nextIds = new Set(getHotEventIds())
    const membershipChanged =
      previousIds.length !== nextIds.size || previousIds.some(id => !nextIds.has(id))
    if (membershipChanged) {
      // 防止上一轮详情迟到后重新发布已移出热门名单的赛事。
      cancelHotDetails()
    }
    // 首次进入、重进和定时刷新共用删除规则，不等待新增赛事的详情。
    if (publishedHotEvents.value.context === options.getContext()) {
      publishedHotEvents.value = {
        context: options.getContext(),
        ids: publishedHotEvents.value.ids.filter(id => nextIds.has(id))
      }
    }
    for (const id of hotEventCache.keys()) if (!nextIds.has(id)) hotEventCache.delete(id)
    for (const id of missingHotRounds.keys()) if (!nextIds.has(id)) missingHotRounds.delete(id)
    hotDetailsState.data = hotDetailsState.data.filter(event => nextIds.has(event.EventId))
  }
  const getHotEventClockUpdatedAt = (_sportId: number, eventId: number) =>
    hotEventCache.get(eventId)?.clockUpdatedAt ?? Date.now()
  /** 每轮查询全部热门 ID；连续两次有效缺失隐藏卡片，但仍保留 ID 复核。 */
  const fetchMissingHotEvents = (): Promise<SportEvent[] | null> => {
    if (hotDetailsPending) return hotDetailsPending
    if (
      !options.isActive() ||
      !options.getBaseUrl() ||
      competitionListContext.value !== getCompetitionListContext() ||
      !competitionListState.data
    )
      return Promise.resolve(null)
    const context = options.getContext()
    const sportId = options.getSportId()
    const controller = new AbortController()
    hotDetailsController = controller
    hotDetailsContext.value = context
    hotDetailsState.loading = true
    hotDetailsState.error = null
    const isCurrent = () =>
      !controller.signal.aborted &&
      options.isActive() &&
      context === options.getContext() &&
      hotDetailsController === controller
    const ids = getHotEventIds()
    const pending = Promise.resolve().then(async () => {
      try {
        for (let offset = 0; offset < ids.length; offset += SELECTED_EVENT_BATCH_SIZE) {
          if (!isCurrent()) return null
          const batch = ids.slice(offset, offset + SELECTED_EVENT_BATCH_SIZE)
          const params = options.getDetailParams(sportId, batch)
          hotDetailsState.params = params
          const revision = options.nextRevision?.() ?? ++localRevision
          try {
            const response = await Api.sport.getSelectedEventInfo(options.getBaseUrl(), params, {
              signal: controller.signal
            })
            if (!isCurrent()) return null
            hotDetailsState.response = response
            if (
              !isSportsSuccess(response) ||
              !Array.isArray(response.e) ||
              response.e.some(
                event => !event || !Number.isSafeInteger(event.EventId) || event.EventId <= 0
              )
            ) {
              hotDetailsState.error = {
                kind: 'business',
                code: response.stc,
                message: response.std
              }
              continue
            }
            const targets = response.e.filter(event => batch.includes(event.EventId))
            if (
              targets.some(
                event =>
                  !Array.isArray(event.MarketLines) ||
                  !Number.isSafeInteger(event.Competition?.CompetitionId)
              )
            ) {
              hotDetailsState.error = { kind: 'response', message: 'Invalid hot event details' }
              continue
            }
            const returned = new Map(targets.map(event => [event.EventId, event]))
            for (const id of batch) {
              const event = returned.get(id)
              if (event) {
                const previous = hotEventCache.get(id)
                const clockChanged =
                  !previous ||
                  previous.event.RBTime !== event.RBTime ||
                  previous.event.RBTimeStatus !== event.RBTimeStatus
                hotEventCache.set(id, {
                  event:
                    previous && options.reuseEvent
                      ? options.reuseEvent(previous.event, event)
                      : event,
                  clockUpdatedAt: clockChanged ? Date.now() : previous.clockUpdatedAt,
                  revision
                })
                missingHotRounds.delete(id)
              } else missingHotRounds.set(id, Math.min(2, (missingHotRounds.get(id) ?? 0) + 1))
            }
          } catch {
            if (!isCurrent()) return null
            hotDetailsState.error = { kind: 'network', message: 'Selected events request failed' }
          }
        }
        if (!isCurrent()) return null
        hotDetailsState.data = ids
          .filter(id => (missingHotRounds.get(id) ?? 0) < 2)
          .flatMap(id => {
            const event = hotEventCache.get(id)?.event
            return event ? [event] : []
          })
        publishHotEvents()
        return hotDetailsState.data
      } finally {
        if (hotDetailsController === controller) {
          hotDetailsState.loading = false
          hotDetailsController = undefined
          hotDetailsPending = null
        }
      }
    })
    hotDetailsPending = pending
    return pending
  }

  const cancelHomepageHot = () => {
    hotGeneration += 1
    cancelCompetitionList()
    hotListPending = null
    cancelHotDetails()
    hotRoundPending = null
  }
  const refreshHomepageHot = (): Promise<unknown> => {
    if (hotRoundPending) return hotRoundPending
    const context = options.getContext()
    const visit = options.getVisit?.() ?? 0
    const generation = hotGeneration
    const pending = Promise.resolve()
      .then(async () => {
        if (!options.isActive() || !options.getBaseUrl() || generation !== hotGeneration) return
        if (hotListPending) await hotListPending
        else if (Date.now() - hotListCheckedAt >= 60_000) await fetchCompetitionList()
        if (
          !options.isActive() ||
          generation !== hotGeneration ||
          context !== options.getContext() ||
          visit !== (options.getVisit?.() ?? 0)
        )
          return
        await fetchMissingHotEvents()
      })
      .finally(() => {
        if (hotRoundPending === pending) hotRoundPending = null
      })
    hotRoundPending = pending
    return pending
  }

  const records = computed(() =>
    competitionListContext.value === options.getContext()
      ? (competitionListState.data?.result ?? [])
      : []
  )
  const events = computed(() =>
    publishedHotEvents.value.context === options.getContext() &&
    hotDetailsContext.value === options.getContext()
      ? hotDetailsState.data.filter(event => publishedHotEvents.value.ids.includes(event.EventId))
      : []
  )
  const loading = computed(() => competitionListState.loading || hotDetailsState.loading)
  const error = computed(() => competitionListState.error ?? hotDetailsState.error)
  const getCurrentEntry = (eventId: number) => {
    if (
      competitionListContext.value !== options.getContext() ||
      hotDetailsContext.value !== options.getContext() ||
      !getHotEventIds().includes(eventId) ||
      (missingHotRounds.get(eventId) ?? 0) >= 2
    )
      return undefined
    return hotEventCache.get(eventId)
  }
  onScopeDispose(cancelHomepageHot)
  return {
    listState: competitionListState,
    detailsState: hotDetailsState,
    records,
    events,
    loading,
    error,
    getCurrentEntry,
    getClockUpdatedAt: getHotEventClockUpdatedAt,
    fetchList: fetchCompetitionList,
    fetchDetails: fetchMissingHotEvents,
    refresh: refreshHomepageHot,
    cancel: cancelHomepageHot,
    reset
  }
}
