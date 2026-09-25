import { ref, shallowRef, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import Api from '@/api'
import type {
  GetSelectedEventInfoParams,
  GetSportsV2Params,
  SportCompetitionGroup,
  SportsResponse
} from '@/api/interface/sport'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import { eventToCompetitionGroup } from './map-seed-match'

type EventDetailsSportsError = {
  kind: 'config' | 'business' | 'response' | 'network'
  message: string
  code?: number | string
}

const isSportsSuccess = (response: SportsResponse) => response.stc === 100 || response.stc === '100'

type UseEventDetailsSportsOptions = {
  targetEventId?: Ref<string>
  initialGroups?: SportCompetitionGroup[]
}

/** 赛事详情页独立拉取数据，不占用体育首页 Store 的 events 请求槽。 */
export function useEventDetailsSports(
  sportId: Ref<number>,
  options?: UseEventDetailsSportsOptions
) {
  const siteConfigStore = useSiteConfigStore()
  const sportsStore = useSportsStore()
  const { languageCode, sportsMemberCode } = storeToRefs(sportsStore)

  const loading = ref(false)
  const error = ref<EventDetailsSportsError | null>(null)
  const groups = shallowRef<SportCompetitionGroup[]>(options?.initialGroups ?? [])

  let generation = 0
  let controller: AbortController | undefined

  const cancel = () => {
    generation += 1
    controller?.abort()
    controller = undefined
    loading.value = false
  }

  const beginRequest = () => {
    cancel()
    const currentGeneration = generation
    controller = new AbortController()
    loading.value = true
    error.value = null
    return { currentGeneration, signal: controller.signal }
  }

  const fetchSportsV2 = async (id: number) => {
    const baseUrl = siteConfigStore.getConfigString('IM.im_app_url')
    if (!baseUrl) {
      groups.value = []
      error.value = { kind: 'config', message: 'Missing IM.im_app_url' }
      return
    }

    const { currentGeneration, signal } = beginRequest()

    await sportsStore.ensureSportsMemberCode()
    if (currentGeneration !== generation || signal.aborted) {
      return
    }

    const params: GetSportsV2Params = {
      SportId: id,
      Market: 3,
      LanguageCode: languageCode.value,
      competitionCondType: 1,
      PageNumber: 1,
      PageSize: 10,
      SortType: 1,
      CompetitionIds: [],
      Keyword: '',
      IsFavourite: false,
      earlyTradingDate: null,
      MemberCode: sportsMemberCode.value
    }

    try {
      const response = await Api.sport.getSportsV2(baseUrl, params, { signal })
      if (currentGeneration !== generation) {
        return
      }
      if (!isSportsSuccess(response)) {
        error.value = {
          kind: 'business',
          code: response.stc,
          message: response.std ?? 'Sports list request failed'
        }
        return
      }
      if (!Array.isArray(response.e)) {
        error.value = { kind: 'response', message: 'Unexpected sports response structure' }
        return
      }
      groups.value = response.e
    } catch {
      if (currentGeneration !== generation || signal.aborted) {
        return
      }
      error.value = { kind: 'network', message: 'Sports list request failed' }
    } finally {
      if (currentGeneration === generation) {
        loading.value = false
      }
    }
  }

  const fetchTargetEvent = async (id: number, eventId: number) => {
    const baseUrl = siteConfigStore.getConfigString('IM.im_app_url')
    if (!baseUrl) {
      if (!groups.value.length) {
        groups.value = []
      }
      error.value = { kind: 'config', message: 'Missing IM.im_app_url' }
      return
    }

    const { currentGeneration, signal } = beginRequest()

    await sportsStore.ensureSportsMemberCode()
    if (currentGeneration !== generation || signal.aborted) {
      return
    }

    const params: GetSelectedEventInfoParams = {
      SportId: id,
      EventIds: [eventId],
      OddsType: 1,
      IsCombo: false,
      IncludeGroupEvents: false,
      LanguageCode: languageCode.value
    }

    try {
      const response = await Api.sport.getSelectedEventInfo(baseUrl, params, { signal })
      if (currentGeneration !== generation) {
        return
      }
      if (!isSportsSuccess(response)) {
        error.value = {
          kind: 'business',
          code: response.stc,
          message: response.std ?? 'Selected event request failed'
        }
        return
      }
      if (!Array.isArray(response.e) || !response.e.length) {
        error.value = { kind: 'response', message: 'Unexpected selected event response' }
        return
      }
      groups.value = response.e.map(eventToCompetitionGroup)
    } catch {
      if (currentGeneration !== generation || signal.aborted) {
        return
      }
      error.value = { kind: 'network', message: 'Selected event request failed' }
    } finally {
      if (currentGeneration === generation) {
        loading.value = false
      }
    }
  }

  const loadSports = () => {
    const eventId = Number(options?.targetEventId?.value)
    if (Number.isFinite(eventId) && eventId > 0) {
      void fetchTargetEvent(sportId.value, eventId)
      return
    }
    void fetchSportsV2(sportId.value)
  }

  watch(
    [sportId, () => options?.targetEventId?.value ?? ''],
    () => {
      loadSports()
    },
    { immediate: true }
  )

  watch(languageCode, () => {
    loadSports()
  })

  return {
    loading,
    error,
    groups,
    refresh: loadSports,
    cancel
  }
}
