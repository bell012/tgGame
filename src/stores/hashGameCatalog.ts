import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'
import type { HashGameLotteryGame } from '@/api/interface/hash_game.interface'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { requestHashGames } from '@/views/hash_game/gameList'
import { useLocaleStore } from '@/stores/locale'

export const HASH_CASINO_TAB_CODE = 'fixed_hx'

/** 菜单与列表共用目录；与普通游戏缓存、查询和轮询相互独立。 */
export const useHashGameCatalogStore = defineStore('hashGameCatalog', () => {
  const localeStore = useLocaleStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const scope = computed(() =>
    JSON.stringify([currentCurrencyCode.value, i18n.global.locale.value])
  )
  const snapshot = ref({
    scope: '',
    games: [] as HashGameLotteryGame[],
    loaded: false,
    loading: false,
    failed: false
  })
  let pending: { scope: string; promise: Promise<void> } | undefined
  let generation = 0
  const games = computed(() => (snapshot.value.scope === scope.value ? snapshot.value.games : []))
  const loaded = computed(() => snapshot.value.scope === scope.value && snapshot.value.loaded)
  const loading = computed(
    () =>
      !localeStore.isSiteDefaultsReady ||
      (snapshot.value.scope === scope.value && snapshot.value.loading)
  )
  const failed = computed(() => snapshot.value.scope === scope.value && snapshot.value.failed)
  const available = computed(() => games.value.length > 0)

  const load = (refresh = false): Promise<void> => {
    // 首次访问的 PHP 只是临时回退值，等站点默认币种确定后再查询目录。
    if (!localeStore.isSiteDefaultsReady) return Promise.resolve()
    const requestScope = scope.value
    if (pending?.scope === requestScope) return pending.promise
    if (!refresh && loaded.value) return Promise.resolve()

    const requestGeneration = ++generation
    if (snapshot.value.scope !== requestScope) {
      snapshot.value = {
        scope: requestScope,
        games: [],
        loaded: false,
        loading: false,
        failed: false
      }
    }
    snapshot.value.loading = true
    snapshot.value.failed = false
    const isCurrent = () => generation === requestGeneration && scope.value === requestScope
    const promise = requestHashGames(currentCurrencyCode.value, String(i18n.global.locale.value), {
      refresh
    })
      .then(result => {
        if (!isCurrent()) return
        snapshot.value.games = [...new Map(result.map(game => [game.gameCode, game])).values()]
        snapshot.value.loaded = true
      })
      .catch(() => {
        // 请求层负责错误提示；同一币种/语言刷新失败保留上次成功目录。
        if (isCurrent()) snapshot.value.failed = true
      })
      .finally(() => {
        if (isCurrent()) snapshot.value.loading = false
        if (pending?.promise === promise) pending = undefined
      })
    pending = { scope: requestScope, promise }
    return promise
  }

  watch(
    [scope, () => localeStore.isSiteDefaultsReady],
    () => {
      void load(true)
    },
    { immediate: true, flush: 'sync' }
  )
  return { games, loaded, loading, failed, available, scope, load }
})
