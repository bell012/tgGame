import { onMounted, onScopeDispose, ref, shallowRef, watch } from 'vue'
import Api from '@/api'
import type { SportCountItem, SportsLanguageCode } from '@/api/interface/sport'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'

// 切换球种会重建详情页；仅保留最近一次成功数量，刷新页面后仍重新查询。
let lastCounts:
  { baseUrl: string; languageCode: SportsLanguageCode; items: SportCountItem[] } | undefined

const getCachedCounts = (baseUrl: string, languageCode: SportsLanguageCode) =>
  lastCounts?.baseUrl === baseUrl && lastCounts.languageCode === languageCode
    ? lastCounts.items
    : undefined

/** 详情导航独立补查数量，不占用首页请求槽或启动首页轮询。 */
export function useEventDetailsSportCounts(enabled: () => boolean) {
  const siteConfigStore = useSiteConfigStore()
  const sportsStore = useSportsStore()
  const counts = shallowRef<SportCountItem[]>(
    getCachedCounts(siteConfigStore.getConfigString('IM.im_app_url'), sportsStore.languageCode) ??
      sportsStore.sportCounts
  )
  const ready = ref(false)
  let disposed = false

  onMounted(async () => {
    if (!enabled()) return
    try {
      await siteConfigStore.initSiteConfig()
    } catch {
      // 已有有效配置时仍可补查；无配置时等待下方监听。
    }
    if (!disposed) ready.value = true
  })

  watch(
    [
      enabled,
      ready,
      () => siteConfigStore.getConfigString('IM.im_app_url'),
      () => sportsStore.languageCode
    ],
    async ([active, initialized, baseUrl, languageCode], previous, onCleanup) => {
      if (previous.length && (baseUrl !== previous[2] || languageCode !== previous[3])) {
        counts.value = getCachedCounts(baseUrl, languageCode) ?? []
      }
      if (!active || !initialized || !baseUrl) return
      const controller = new AbortController()
      onCleanup(() => controller.abort())
      try {
        const response = await Api.sport.getAllSportCount(
          baseUrl,
          { LanguageCode: languageCode, IsCombo: false },
          { signal: controller.signal }
        )
        if (
          !controller.signal.aborted &&
          (response.stc === 100 || response.stc === '100') &&
          Array.isArray(response.spc)
        ) {
          lastCounts = { baseUrl, languageCode, items: response.spc }
          counts.value = response.spc
        }
      } catch {
        // 静默查询失败保留当前数量，不影响赛事加载。
      }
    },
    { immediate: true, flush: 'sync' }
  )

  onScopeDispose(() => {
    disposed = true
  })

  return counts
}
