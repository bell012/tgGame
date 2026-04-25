import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { sideIcons } from '@/static/svg/side'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RebateCategory, RebateRow, RebateTab } from './types'

/**
 * 返水页面组合逻辑（useRebatePage）
 *
 * 说明：
 * 1. 本文件只负责“状态 + 计算 + 行为”，不负责模板渲染。
 * 2. 为了和父组件 index.vue 的子组件结构一致，这里按子组件维度分模块组织代码：
 *    - RebateOverviewCard（概览卡）
 *    - RebateCategoryTabs（分类 Tab）
 *    - RebateProgressCard（进度卡）
 *    - RebateRateTable（返利表格）
 *    - RebateActionTabs / 各类弹窗（交互与弹层）
 */

type RebateApiRow = Record<string, unknown>
type TranslateFn = (key: string) => string
type CategoryLabelStrategy = (translate: TranslateFn) => string
type DeviceType = 'mobile' | 'desktop'

/**
 * 返利阶梯文案（用于 RebateRateTable）。
 */
const VALID_BET_TIERS = ['1+', '100K+', '200K+', '300K+', '400K+', '500K+', '600K+', '700K+']

/**
 * 表格返利比例策略（策略模式）：
 * - 移动端显示递增档位
 * - PC 端保持当前统一档位
 */
const RATE_VALUES_STRATEGY: Record<DeviceType, number[]> = {
  mobile: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4],
  desktop: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]
}

/**
 * 分类名称策略（策略模式）：
 * 不同 sysGameTypeCode 对应不同国际化文案来源。
 */
const CATEGORY_LABEL_STRATEGIES: Record<string, CategoryLabelStrategy> = {
  CP: translate => translate('betHistory.filterOptions.lottery'),
  TY: translate => translate('betHistory.filterOptions.sports'),
  ZR: translate => translate('betHistory.filterOptions.live'),
  SX: translate => translate('betHistory.filterOptions.live'),
  DZ: translate => translate('betHistory.filterOptions.electronic'),
  QP: translate => translate('betHistory.filterOptions.chess'),
  BY: translate => translate('betHistory.filterOptions.fishing'),
  DJ: translate => translate('betHistory.filterOptions.esports')
}

/**
 * 从多个候选字段中取第一个有效值。
 * 用于兼容后端字段偶尔变动或缺失的场景。
 */
const pickField = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }

  return undefined
}

/**
 * 安全转数字：
 * - 可转数字时返回数值
 * - 非法值返回 fallback，避免 NaN 污染后续计算
 */
const toNumber = (value: unknown, fallback = 0) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

/**
 * 统一将金额格式化为 2 位小数（用于主金额展示）。
 */
const formatAmount = (value: number) => value.toFixed(2)

/**
 * 明细金额格式化：
 * - 整数显示为整数
 * - 小数保留 2 位
 */
const formatDetailAmount = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2)

/**
 * 根据终端类型返回当前设备标识，供策略映射使用。
 */
const resolveDeviceType = (isMobile: boolean): DeviceType => (isMobile ? 'mobile' : 'desktop')

/**
 * 根据游戏类型 code 获取 tab 名称。
 * 若 code 未配置策略，则回退为 code 本身，再回退为 "--"。
 */
const getRebateCategoryLabel = (code: string, translate: TranslateFn) => {
  const labelStrategy = CATEGORY_LABEL_STRATEGIES[code]
  return labelStrategy ? labelStrategy(translate) : code || '--'
}

/**
 * 将后端图片字段统一转为可用图片 URL。
 * - 支持绝对地址（http/https）
 * - 支持相对路径拼接环境变量基地址
 */
const toImageUrl = (value: unknown) => {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue
  }

  const baseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  const imagePath = normalizedValue.replace(/^\/+/, '')

  return baseUrl ? `${baseUrl}/${imagePath}` : normalizedValue
}

/**
 * 判断对象是否为“可用普通对象”（非数组、非 null）。
 */
const isPlainObject = (value: unknown): value is RebateApiRow =>
  !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * 将 rebateData 接口返回值规范化为对象数组，便于后续统一计算。
 */
const normalizeRebateDataRows = (result: unknown): RebateApiRow[] => {
  if (!Array.isArray(result)) {
    return []
  }
  return result.filter(isPlainObject)
}

/**
 * 将 selectRebateRate 接口结果转换为分类 Tab 数据。
 * - 去重：按 sysGameTypeCode 去重
 * - 图标：优先当前字段，无值时互相兜底
 */
const buildRebateCategories = (rows: RebateApiRow[], translate: TranslateFn): RebateCategory[] => {
  const seenCategoryIds = new Set<string>()

  return rows.reduce<RebateCategory[]>((acc, row) => {
    const sysGameTypeCode = String(row.sysGameTypeCode ?? '').trim()
    if (!sysGameTypeCode || seenCategoryIds.has(sysGameTypeCode)) {
      return acc
    }

    seenCategoryIds.add(sysGameTypeCode)

    const icon = toImageUrl(row.icon)
    const activeIcon = toImageUrl(row.activeIcon)

    acc.push({
      id: sysGameTypeCode,
      label: getRebateCategoryLabel(sysGameTypeCode, translate),
      icon: icon || activeIcon,
      activeIcon: activeIcon || icon
    })

    return acc
  }, [])
}

/**
 * 构建 RebateRateTable 默认表格行（当前版本保持原行为，不做业务变更）。
 */
const buildDefaultRebateRows = (isMobile: boolean): RebateRow[] => {
  const rateValues = RATE_VALUES_STRATEGY[resolveDeviceType(isMobile)]

  return VALID_BET_TIERS.map((validBets, index) => ({
    id: `row-${validBets}-${index}`,
    validBets,
    rebateRate: `${rateValues[index].toFixed(2)}%`,
    isCurrent: index === 0
  }))
}

/**
 * 进度百分比计算，返回区间 [0, 100]。
 */
const calcProgressPercent = (currentValue: number, targetValue: number) => {
  if (!targetValue) {
    return 0
  }
  const ratio = (currentValue / targetValue) * 100
  return Math.min(Math.max(ratio, 0), 100)
}

export const useRebatePage = () => {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const { side } = sideIcons

  // ============================================================
  // 模块 A：页面级交互状态（RebateActionTabs + 各类弹窗）
  // ============================================================

  /**
   * 当前顶部行为 Tab：
   * - records：洗码记录
   * - rules：洗码规则
   */
  const activeTab = ref<RebateTab>('records')

  /**
   * 各弹窗显示状态。
   */
  const showClaimSuccessPopup = ref(false)
  const showRebateRecordsPopup = ref(false)
  const showEligibleTurnoverPopup = ref(false)
  const showRebateRulesPopup = ref(false)

  // ============================================================
  // 模块 B：RebateOverviewCard（概览卡）
  // ============================================================

  /**
   * 概览卡的核心数值状态。
   */
  const todayValidBets = ref(0)
  const eligibleTurnover = ref(0)
  const pendingRebateTurnover = ref(0)
  const promoBonusTurnoverDeduction = ref(0)
  const claimableAmount = ref(0)
  const targetValidBets = ref(500000)
  const currentRebateValue = ref(0.7)
  const nextRebateValue = ref(0.8)

  /**
   * 解析并应用 queryRebateGameData 结果到概览卡状态。
   */
  const applyRebateOverviewResponse = (result: unknown) => {
    if (!result) {
      return
    }

    const rawResult = result as RebateApiRow
    const todayValidBetsValue = pickField(rawResult, ['betAmount'])
    const eligibleTurnoverValue = pickField(rawResult, ['flowAmount'])
    const claimableAmountValue = pickField(rawResult, ['rebatePoints'])

    if (todayValidBetsValue !== undefined) {
      todayValidBets.value = toNumber(todayValidBetsValue, todayValidBets.value)
    }
    if (eligibleTurnoverValue !== undefined) {
      eligibleTurnover.value = toNumber(eligibleTurnoverValue, eligibleTurnover.value)
    }
    if (claimableAmountValue !== undefined) {
      claimableAmount.value = toNumber(claimableAmountValue, claimableAmount.value)
    }
  }

  /**
   * 拉取概览卡数据（今日有效投注 / 可计洗码流水 / 可领取金额）。
   */
  const loadRebateOverview = async () => {
    try {
      const response = await Api.user.queryRebateGameData()
      if (!response?.success) {
        throw new Error(response?.message || 'load rebate overview failed')
      }
      applyRebateOverviewResponse(response.result)
    } catch (error) {
      console.error('loadRebateOverview failed', error)
    }
  }

  /**
   * 概览卡文案计算。
   */
  const todayValidBetsText = computed(() => formatAmount(todayValidBets.value))
  const eligibleTurnoverText = computed(() => formatAmount(eligibleTurnover.value))
  const pendingRebateTurnoverText = computed(() => formatDetailAmount(pendingRebateTurnover.value))
  const promoBonusTurnoverDeductionText = computed(() =>
    formatDetailAmount(promoBonusTurnoverDeduction.value)
  )
  const claimableAmountText = computed(() => formatAmount(claimableAmount.value))

  // ============================================================
  // 模块 C：RebateCategoryTabs（分类 Tab）
  // ============================================================

  /**
   * 当前选中的游戏分类（即当前 tab 的 sysGameTypeCode）。
   */
  const activeCategory = ref('')

  /**
   * selectRebateRate 接口加工后的分类列表。
   */
  const rebateCategoriesFromApi = ref<RebateCategory[]>([])

  /**
   * rebateData 接口原始数据（已做基础规范化）。
   */
  const rebateDataRows = ref<RebateApiRow[]>([])

  /**
   * 拉取分类 Tab 配置（图标、激活图标、名称映射）。
   */
  const loadRebateCategories = async () => {
    try {
      const response = await Api.user.selectRebateRate()
      if (!response?.success || !Array.isArray(response.result)) {
        return
      }

      const nextCategories = buildRebateCategories(normalizeRebateDataRows(response.result), t)
      rebateCategoriesFromApi.value = nextCategories

      /**
       * 若当前 activeCategory 不在新列表中，自动选中第一项。
       * 该行为用于保证初次加载和接口变更后的可用性。
       */
      if (
        nextCategories.length > 0 &&
        !nextCategories.some(category => category.id === activeCategory.value)
      ) {
        activeCategory.value = nextCategories[0].id
      }
    } catch (error) {
      console.error('loadRebateCategories failed', error)
    }
  }

  /**
   * 拉取当前洗码数据源（后续会按 activeCategory 过滤并聚合 betAmount）。
   */
  const loadRebateData = async () => {
    try {
      const response = await Api.user.rebateData()
      if (!response?.success || !Array.isArray(response.result)) {
        rebateDataRows.value = []
        return
      }

      rebateDataRows.value = normalizeRebateDataRows(response.result)
    } catch (error) {
      console.error('loadRebateData failed', error)
      rebateDataRows.value = []
    }
  }

  /**
   * 提供给 RebateCategoryTabs 的分类数据。
   */
  const categoryOptions = computed<RebateCategory[]>(() => rebateCategoriesFromApi.value)

  // ============================================================
  // 模块 D：RebateProgressCard（进度卡）
  // ============================================================

  /**
   * 当前分类 code（与 tab 同步）。
   */
  const currentCategoryCode = computed(() => activeCategory.value.trim())

  /**
   * 过滤出当前分类下的 rebateData 数据。
   */
  const currentCategoryRebateRows = computed(() =>
    rebateDataRows.value.filter(
      item => String(item.sysGameTypeCode ?? '').trim() === currentCategoryCode.value
    )
  )

  /**
   * 当前分类有效投注总和（betAmount 累加）。
   */
  const currentValidBetsValue = computed(() =>
    currentCategoryRebateRows.value.reduce((total, item) => total + toNumber(item.betAmount), 0)
  )

  /**
   * 进度卡展示文案。
   */
  const currentRebateText = computed(() => `${currentRebateValue.value.toFixed(2)}%`)
  const nextRebateText = computed(() => `${nextRebateValue.value.toFixed(2)}%`)
  const currentValidBetsPlainText = computed(() => String(Math.floor(currentValidBetsValue.value)))
  const targetValidBetsText = computed(() => String(Math.floor(targetValidBets.value)))

  /**
   * 进度百分比（0-100），用于进度条宽度与百分比文本。
   */
  const progressPercent = computed(() =>
    calcProgressPercent(currentValidBetsValue.value, targetValidBets.value)
  )
  const progressPercentText = computed(() => `${Math.floor(progressPercent.value)}%`)

  // ============================================================
  // 模块 E：RebateRateTable（返利表格）
  // ============================================================

  /**
   * 当前版本表格数据仍使用默认策略，不引入业务侧动态映射，确保交互保持一致。
   */
  const defaultRebateRows = computed<RebateRow[]>(() => buildDefaultRebateRows(isMobile.value))
  const rebateRows = computed<RebateRow[]>(() => defaultRebateRows.value)

  // ============================================================
  // 模块 F：页面交互行为（按钮、Tab、弹窗）
  // ============================================================

  /**
   * 点击 Claim：打开领取成功弹窗。
   */
  const handleClaimRebate = () => {
    showClaimSuccessPopup.value = true
  }

  /**
   * 领取成功弹窗确认：关闭弹窗。
   */
  const handleClaimSuccessConfirm = () => {
    showClaimSuccessPopup.value = false
  }

  /**
   * 打开“洗码记录”策略（策略模式）：
   * - mobile：跳转独立页面
   * - desktop：打开当前页弹窗
   */
  const openRebateRecordsStrategies: Record<'mobile' | 'desktop', () => void> = {
    mobile: () => {
      void navigateTo('/personal-center/rebate-records')
    },
    desktop: () => {
      showRebateRecordsPopup.value = true
    }
  }

  /**
   * 洗码记录入口点击逻辑。
   */
  const handleOpenRebateRecords = () => {
    activeTab.value = 'records'
    const strategyKey = resolveDeviceType(isMobile.value)
    openRebateRecordsStrategies[strategyKey]()
  }

  /**
   * 关闭“洗码记录”弹窗（PC）。
   */
  const closeRebateRecordsPopup = () => {
    showRebateRecordsPopup.value = false
  }

  /**
   * 打开“可计洗码流水”说明弹窗。
   */
  const openEligibleTurnoverPopup = () => {
    showEligibleTurnoverPopup.value = true
  }

  /**
   * 关闭“可计洗码流水”说明弹窗。
   */
  const closeEligibleTurnoverPopup = () => {
    showEligibleTurnoverPopup.value = false
  }

  /**
   * 打开洗码规则弹窗，并切换顶部 tab 为 rules。
   */
  const openRebateRulesPopup = () => {
    activeTab.value = 'rules'
    showRebateRulesPopup.value = true
  }

  /**
   * 关闭洗码规则弹窗，并还原顶部 tab 为 records。
   */
  const closeRebateRulesPopup = () => {
    showRebateRulesPopup.value = false
    activeTab.value = 'records'
  }

  /**
   * 顶部客服按钮点击（当前仅预留日志）。
   */
  const handleSupportClick = () => {
    console.log('open live support')
  }

  // ============================================================
  // 模块 G：生命周期编排（页面初始化）
  // ============================================================

  /**
   * 页面初始化加载策略（策略模式）：
   * 以列表方式编排初始化任务，便于后续按模块扩展。
   */
  const mountedLoaders: Array<() => Promise<void>> = [
    loadRebateOverview,
    loadRebateCategories,
    loadRebateData
  ]

  onMounted(() => {
    mountedLoaders.forEach(loader => {
      void loader()
    })
  })

  // ============================================================
  // 输出给父组件 index.vue 的绑定字段
  // ============================================================
  return {
    activeCategory,
    activeTab,
    categoryOptions,
    claimableAmountText,
    closeEligibleTurnoverPopup,
    closeRebateRecordsPopup,
    closeRebateRulesPopup,
    currentRebateText,
    currentValidBetsPlainText,
    eligibleTurnoverText,
    handleClaimRebate,
    handleClaimSuccessConfirm,
    handleOpenRebateRecords,
    handleSupportClick,
    isMobile,
    nextRebateText,
    openEligibleTurnoverPopup,
    openRebateRulesPopup,
    pendingRebateTurnoverText,
    progressPercent,
    progressPercentText,
    promoBonusTurnoverDeductionText,
    rebateRows,
    showClaimSuccessPopup,
    showEligibleTurnoverPopup,
    showRebateRecordsPopup,
    showRebateRulesPopup,
    supportHeaderIcon: side.helpIcon,
    targetValidBetsText,
    todayValidBetsText
  }
}
