import { ref, shallowRef, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import Api from '@/api'
import type {
  GetSportsV2Params,
  SportCompetitionGroup,
  SportsResponse
} from '@/api/interface/sport'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'

type EventDetailsSportsError = {
  kind: 'config' | 'business' | 'response' | 'network'
  message: string
  code?: number | string
}

const isSportsSuccess = (response: SportsResponse) => response.stc === 100 || response.stc === '100'

/** 赛事详情页独立拉取 getSportsV2，不占用体育首页 Store 的 events 请求槽。 */
export function useEventDetailsSports(sportId: Ref<number>) {
  const siteConfigStore = useSiteConfigStore()
  const sportsStore = useSportsStore()
  const { languageCode, sportsMemberCode } = storeToRefs(sportsStore)

  const loading = ref(false)
  const error = ref<EventDetailsSportsError | null>(null)
  const groups = shallowRef<SportCompetitionGroup[]>([])

  let generation = 0
  let controller: AbortController | undefined

  const cancel = () => {
    generation += 1
    controller?.abort()
    controller = undefined
    loading.value = false
  }

  const fetchSportsV2 = async (id: number) => {
    const baseUrl = siteConfigStore.getConfigString('IM.im_app_url')
    if (!baseUrl) {
      groups.value = []
      error.value = { kind: 'config', message: 'Missing IM.im_app_url' }
      return
    }

    cancel()
    const currentGeneration = generation
    controller = new AbortController()
    const signal = controller.signal
    loading.value = true
    error.value = null

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
      console.log('[eventDetailsGetSportsV2]', {
        sportId: id,
        groups: response.e,
        total: response.Total
      })
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

  watch(
    sportId,
    id => {
      void fetchSportsV2(id)
    },
    { immediate: true }
  )

  watch(languageCode, () => {
    void fetchSportsV2(sportId.value)
  })

  return {
    loading,
    error,
    groups,
    refresh: () => fetchSportsV2(sportId.value),
    cancel
  }
}
