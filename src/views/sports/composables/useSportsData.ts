import { computed, onActivated, onDeactivated, onMounted, onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useSportsStore } from '@/stores/sports'
import type { SportsRefreshTarget } from '@/stores/sports'
import type { SportMarketLine } from '@/api/interface/sport'
import { stripLocalePrefix } from '@/utils/locale'
import { sportItems } from '../components/sports-navigation/sport-items'
import { mapSportsMatches } from '../shared/match'
import { createHomepageRefresh } from './refreshScheduler'
import { useMatchTime } from './useMatchTime'

const MATCH_PAGE_SIZE = 12

type SportsDataOptions = {
  getTeamLogoUrl: (id: number) => string
  getBetTargets: () => readonly SportsRefreshTarget[]
}

export const useSportsData = ({ getTeamLogoUrl, getBetTargets }: SportsDataOptions) => {
  const route = useRoute()
  const isHomepageRoute = computed(() => stripLocalePrefix(route.path) === '/sports')
  const isMobile = useIsMobile()
  const sportsStore = useSportsStore()
  const siteConfigStore = useSiteConfigStore()
  const localeStore = useLocaleStore()
  const { t } = useI18n()
  const {
    sportCounts,
    sportCountsLoading,
    sportCountsError,
    selectedSportId,
    selectedFilterKey,
    market,
    sortType,
    isFavourite: collectOnly,
    competitionIds,
    keyword,
    earlyTradingDate,
    homepageLoading,
    homepageError: initializationError,
    matchListContext: storeMatchListContext,
    matchListLoading: matchesLoading,
    matchListError: matchesError,
    eventsList,
    hotEvents,
    hotEventsLoading,
    hotEventsError,
    sportsSessionVersion,
    retryingSports,
    pageNumber
  } = storeToRefs(sportsStore)
  // 页面球种与导航共用 Store 的业务 ID，不另存一份默认足球状态。
  const selectedSportKey = computed(
    () => sportItems.find(item => item.sportId === selectedSportId.value)?.key ?? ''
  )
  const selectedSportIcon = computed(
    () => sportItems.find(item => item.sportId === selectedSportId.value)?.icon
  )
  const selectedSportLabel = computed(
    () => sportCounts.value.find(item => item.sid === selectedSportId.value)?.sn ?? ''
  )
  let sportsPageDisposed = false
  let stopSportsRefresh: (() => void) | undefined
  const sportsPageActive = ref(true)
  const initializing = ref(true)
  const searchInput = ref(keyword.value)
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  const handleSearchChange = (value: string) => {
    searchInput.value = value
    clearTimeout(searchTimer)
    // 输入搜索词立即暂停普通联赛补查，接口搜索等待防抖结束后发起。
    if (value.trim()) sportsStore.syncLeagueRequests([])
    const commit = () => {
      if (!sportsPageDisposed && sportsPageActive.value) keyword.value = value.trim()
    }
    if (!value.trim()) commit()
    else searchTimer = setTimeout(commit, 300)
  }
  watch(keyword, value => {
    if (searchInput.value.trim() !== value) {
      clearTimeout(searchTimer)
      searchInput.value = value
    }
  })
  const expandedLeagueIds = ref<number[]>([])
  // H5 可多选，PC 只有单选；切回 PC 时与组件的“全部联赛”高亮保持一致。
  watch(
    [isMobile, () => competitionIds.value.length],
    () => {
      if (!isMobile.value && competitionIds.value.length > 1) competitionIds.value = []
    },
    { immediate: true, flush: 'sync' }
  )
  const syncExpandedLeagues = (ids: number[]) => {
    expandedLeagueIds.value = ids
  }
  const getLeagueLoadState = (id: number) => sportsStore.getLeagueLoadState(id)
  const retryLeague = (id: number) => sportsStore.retryLeague(id)
  const leagueCounts = computed(
    () =>
      new Map(
        eventsList.value.map(group => [
          `${selectedSportId.value}:${group.CompetitionId}`,
          group.competitionCount
        ])
      )
  )
  // PC 单选即加载；H5 只接收已渲染且展开的组，两个入口共用同一个调度器。
  watch(
    [
      initializing,
      sportsPageActive,
      isMobile,
      () => searchInput.value.trim(),
      keyword,
      () => competitionIds.value.join(','),
      () => expandedLeagueIds.value.join(','),
      selectedSportId,
      market,
      sortType,
      () => siteConfigStore.getConfigString('IM.im_app_url'),
      () => localeStore.currentLanguage,
      sportsSessionVersion
    ],
    () => {
      const ids =
        !initializing.value &&
        sportsPageActive.value &&
        !searchInput.value.trim() &&
        !keyword.value.trim()
          ? isMobile.value
            ? expandedLeagueIds.value
            : competitionIds.value
          : []
      sportsStore.syncLeagueRequests(ids)
    },
    { immediate: true, flush: 'post' }
  )
  const sportsPageLoading = computed(
    () =>
      initializing.value ||
      retryingSports.value ||
      ((homepageLoading.value || matchesLoading.value) && !eventsList.value.length)
  )
  const homepageError = computed(
    () => initializationError.value ?? (!eventsList.value.length ? matchesError.value : null)
  )
  const sportsLoadFailedText = computed(() => t('sports.loadFailed'))
  const sportsRetryText = computed(() => t('sports.retry'))
  const sportsEmptyText = computed(() => t('sports.noEvents'))
  const sportsLoadingText = computed(() => t('sports.loadingEvents'))
  // PC 对当前数据源本地分页；默认数据由 Store 按联赛页逐步累积。
  const currentPage = ref(1)
  const expandedMatchId = ref<string | null>(null)
  const visibleBySource = ref<Record<'pc' | 'h5', SportsRefreshTarget[]>>({ pc: [], h5: [] })
  const visibleMatchTargets = computed(() => visibleBySource.value[isMobile.value ? 'h5' : 'pc'])
  const setVisibleMatches = (source: 'pc' | 'h5', targets: readonly SportsRefreshTarget[]) => {
    const unique = new Map<string, SportsRefreshTarget>()
    for (const target of targets) {
      if (!Number.isSafeInteger(target.sportId) || !Number.isSafeInteger(target.eventId)) continue
      if (target.sportId <= 0 || target.eventId <= 0) continue
      unique.set(`${target.sportId}:${target.eventId}`, { ...target })
    }
    visibleBySource.value[source] = [...unique.values()]
  }
  const refreshTargets = computed(() => {
    const targets = new Map<string, SportsRefreshTarget>()
    const expanded = expandedMatchId.value
      ?.replace(/^live:/, '')
      .split(':')
      .map(Number)
    for (const target of [
      ...visibleMatchTargets.value,
      ...getBetTargets(),
      ...(expanded?.length === 2 && expanded.every(id => Number.isSafeInteger(id) && id > 0)
        ? [{ sportId: expanded[0], eventId: expanded[1] }]
        : [])
    ]) {
      targets.set(`${target.sportId}:${target.eventId}`, target)
    }
    return [...targets.values()]
  })
  const homepageRefresh = createHomepageRefresh({
    visible: () => sportsStore.refreshVisibleEvents(refreshTargets.value),
    counts: () => sportsStore.refreshHomepageCounts(),
    background: () => sportsStore.refreshHomepageBackground(),
    cancel: () => sportsStore.cancelHomepageRefresh()
  })
  let homepageReady = false
  let homepageLoadVersion = 0
  const resumeHomepageRefresh = (immediate = false) => {
    if (
      homepageReady &&
      isHomepageRoute.value &&
      sportsPageActive.value &&
      !sportsPageDisposed &&
      !document.hidden
    ) {
      homepageRefresh.start(immediate)
    }
  }
  const handlePageVisibility = () => {
    if (document.hidden || !isHomepageRoute.value) homepageRefresh.stop()
    else resumeHomepageRefresh(true)
  }
  watch(isHomepageRoute, handlePageVisibility)
  watch(
    () =>
      refreshTargets.value
        .map(target => `${target.sportId}:${target.eventId}`)
        .sort()
        .join(','),
    () => homepageRefresh.targetsChanged()
  )
  const matchListContext = computed(() =>
    JSON.stringify([storeMatchListContext.value, collectOnly.value])
  )
  const matches = computed(() =>
    mapSportsMatches(
      eventsList.value,
      selectedSportId.value,
      getTeamLogoUrl,
      undefined,
      sportsStore.getEventClockUpdatedAt
    )
  )
  // 热门名单决定顺序，联赛预览和按 ID 补查提供信息与主盘口，不限制必须是滚球。
  const liveMatches = computed(() => {
    const currentMatches = new Map(matches.value.map(match => [match.id, match]))
    return mapSportsMatches(
      hotEvents.value.map(event => ({
        ...event.Competition,
        competitionCount: 1,
        Sports: [event]
      })),
      selectedSportId.value,
      getTeamLogoUrl,
      undefined,
      sportsStore.getEventClockUpdatedAt
    ).map(match => currentMatches.get(match.id) ?? match)
  })
  // 热门赛事可加入投注单，但不参与下方列表的筛选和分页。
  const matchById = computed(
    () => new Map([...liveMatches.value, ...matches.value].map(match => [match.id, match]))
  )
  const { getMatchTime } = useMatchTime({
    enabled: () =>
      isHomepageRoute.value &&
      sportsPageActive.value &&
      refreshTargets.value.some(
        target => matchById.value.get(`${target.sportId}:${target.eventId}`)?.phaseClock?.running
      ),
    // 换页和滚动不丢失计时起点，只有需要显示时才启动秒表。
    matches: () => [...matchById.value.values()]
  })
  const totalPages = computed(() => Math.max(1, Math.ceil(matches.value.length / MATCH_PAGE_SIZE)))
  const pagedMatches = computed(() =>
    matches.value.slice(
      (currentPage.value - 1) * MATCH_PAGE_SIZE,
      currentPage.value * MATCH_PAGE_SIZE
    )
  )
  watch(totalPages, pages => {
    if (currentPage.value > pages) currentPage.value = pages
  })
  // 换页只更新赛事窗口并关闭展开层，投注选择和金额继续保留。
  const setPage = (page: number) => {
    if (!Number.isFinite(page) || !Number.isInteger(page)) return
    const nextPage = Math.min(Math.max(1, page), totalPages.value)
    if (nextPage === currentPage.value) return
    currentPage.value = nextPage
    expandedMatchId.value = null
  }

  // 页面与投注单共用原盘口数组，不改造成展示 DTO。
  const getMatchMarkets = (matchId: string): SportMarketLine[] => {
    const match = matchById.value.get(matchId)
    return match?.MarketLines ?? []
  }
  const getLiveMarkets = getMatchMarkets
  // 先同步筛选与分页，再由下方单一请求监听批量刷新。
  const resetMatchListState = () => {
    currentPage.value = 1
    pageNumber.value = 1
    expandedMatchId.value = null
  }
  // 候选范围变化时清理旧联赛，兼容组件先写 Store 再 emit，以及其他入口直接更新 Store。
  watch(
    [
      selectedSportId,
      market,
      () => siteConfigStore.getConfigString('IM.im_app_url'),
      () => localeStore.currentLanguage,
      keyword
    ],
    () => {
      if (competitionIds.value.length) competitionIds.value = []
      resetMatchListState()
    },
    { flush: 'sync' }
  )
  watch([sortType, () => competitionIds.value.join(','), collectOnly], resetMatchListState, {
    flush: 'sync'
  })
  const retrySports = () => {
    if (!sportsPageDisposed && sportsPageActive.value && !sportsPageLoading.value) {
      homepageRefresh.stop()
      homepageReady = false
      const version = ++homepageLoadVersion
      void sportsStore.retryHomepage().finally(() => {
        if (version !== homepageLoadVersion) return
        homepageReady = true
        resumeHomepageRefresh()
      })
    }
  }
  const retryHotEvents = () => {
    if (!sportsPageDisposed && sportsPageActive.value && !hotEventsLoading.value) {
      void sportsStore.retryHotEvents()
    }
  }
  onMounted(() => document.addEventListener('visibilitychange', handlePageVisibility))
  onMounted(async () => {
    // 全局配置就绪后再订阅，避免初次加载因域名变化重复请求。
    try {
      await siteConfigStore.initSiteConfig()
    } catch {
      // 交由统一流程重试初始化并向页面提供失败状态。
    }
    if (sportsPageDisposed) return
    stopSportsRefresh = watch(
      [
        sportsPageActive,
        () => siteConfigStore.getConfigString('IM.im_app_url'),
        () => localeStore.currentLanguage,
        selectedSportId,
        market,
        sortType,
        () => competitionIds.value.join(','),
        keyword,
        () => (keyword.value.trim() && market.value === 1 ? earlyTradingDate.value : null),
        collectOnly,
        sportsSessionVersion
      ],
      (values, previous) => {
        if (!sportsPageActive.value || sportsPageDisposed) return
        homepageRefresh.stop()
        homepageReady = false
        const version = ++homepageLoadVersion
        const refreshCounts =
          previous[0] !== true || values[1] !== previous[1] || values[2] !== previous[2]
        if (refreshCounts) resetMatchListState()
        // 热门随进入页面、语言、球种或分类变化刷新；先等待数量接口成功。
        const refreshCompetitionList =
          refreshCounts || values[3] !== previous[3] || values[4] !== previous[4]
        void sportsStore.loadHomepage({ refreshCounts, refreshCompetitionList }).finally(() => {
          if (version !== homepageLoadVersion) return
          homepageReady = true
          resumeHomepageRefresh()
        })
      },
      { immediate: true }
    )
    initializing.value = false
  })
  onActivated(() => {
    sportsPageActive.value = true
    resumeHomepageRefresh(true)
  })
  onDeactivated(() => {
    sportsPageActive.value = false
    homepageRefresh.stop()
    homepageLoadVersion += 1
    clearTimeout(searchTimer)
    searchInput.value = keyword.value
    sportsStore.cancelRequests()
  })
  onScopeDispose(() => {
    sportsPageDisposed = true
    homepageRefresh.stop()
    homepageLoadVersion += 1
    stopSportsRefresh?.()
    sportsStore.cancelRequests()
    clearTimeout(searchTimer)
    document.removeEventListener('visibilitychange', handlePageVisibility)
  })

  const isPageActive = () => sportsPageActive.value && !sportsPageDisposed

  return {
    sportCounts,
    sportCountsLoading,
    sportCountsError,
    selectedSportId,
    selectedSportKey,
    selectedSportIcon,
    selectedSportLabel,
    selectedFilterKey,
    market,
    sortType,
    competitionIds,
    keyword,
    searchInput,
    handleSearchChange,
    displayLeagueGroups: eventsList,
    leagueCounts,
    syncExpandedLeagues,
    getLeagueLoadState,
    retryLeague,
    homepageLoading: sportsPageLoading,
    homepageError,
    matchesLoading,
    matchesError,
    matchListContext,
    hotEventsLoading,
    hotEventsError,
    sportsLoadFailedText,
    sportsRetryText,
    sportsEmptyText,
    sportsLoadingText,
    retrySports,
    retryHotEvents,
    refreshSportCounts: sportsStore.fetchSportCounts,
    matches,
    liveMatches,
    visibleMatchTargets,
    setVisibleMatches,
    currentPage,
    totalPages,
    pagedMatches,
    setPage,
    expandedMatchId,
    collectOnly,
    getMatchMarkets,
    getLiveMarkets,
    getMatchTime,
    matchById,
    isPageActive
  }
}
