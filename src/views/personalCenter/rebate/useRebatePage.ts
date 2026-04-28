import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
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
type SuccessArrayResponse = {
  success?: boolean
  result?: unknown
}

const DEFAULT_TIER_START_VALUE = 0.01

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
 * 统一规范化 code 字段（去空格 + 字符串化）。
 */
const normalizeCode = (value: unknown) => String(value ?? '').trim()

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
 * 将数值转换为用于展示的字符串：
 * - 数值型字符串 / number 会标准化为 "100" / "0.8" 这种格式
 * - 非法值回退为 fallback
 */
const toDisplayNumberText = (value: unknown, fallback = '0') => {
  const rawValue = String(value ?? '').trim()
  if (!rawValue) {
    return fallback
  }

  const parsedValue = Number(rawValue)
  if (!Number.isFinite(parsedValue)) {
    return fallback
  }

  return String(parsedValue)
}

/**
 * 比例文案格式化：
 * - 整数：10 -> 10%
 * - 小数：0.7 -> 0.70%
 */
const formatRatioPercentText = (value: number) =>
  Number.isInteger(value) ? `${value}%` : `${value.toFixed(2)}%`

/**
 * 进度百分比文案格式化：
 * - 0 显示 0%
 * - 小于 1% 的值保留更多小数，避免被误显示成 0%
 * - 大于等于 1% 时保留两位小数并去掉多余 0
 */
const formatProgressPercentText = (value: number) => {
  if (value <= 0) {
    return '0%'
  }

  const precisionValue = value < 1 ? value.toFixed(4) : value.toFixed(2)
  const normalizedValue = precisionValue.replace(/\.?0+$/, '')
  return `${normalizedValue}%`
}

/**
 * 根据游戏类型 code 获取 tab 名称。
 * 若 code 未配置策略，则回退为 code 本身，再回退为 "--"。
 */
const getRebateCategoryLabel = (code: string, translate: TranslateFn) => {
  const labelStrategy = CATEGORY_LABEL_STRATEGIES[code]
  return labelStrategy ? labelStrategy(translate) : code || '--'
}

/**
 * 判断接口是否返回了“成功 + 数组结果”。
 */
const isSuccessArrayResult = (response: SuccessArrayResponse | null | undefined) =>
  Boolean(response?.success && Array.isArray(response.result))

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
    const sysGameTypeCode = normalizeCode(row.sysGameTypeCode)
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
 * 从分类配置中取出 betRate.rebateRateVos（数组 A）。
 *
 * 规则：
 * 1. 先根据 activeCategory（sysGameTypeCode）匹配分类配置；
 * 2. 再从该分类下的 betRate 中取第一个可用的 rebateRateVos。
 */
const getRebateRateVosByCategoryCode = (
  categoryConfigs: RebateApiRow[],
  categoryCode: string
): RebateApiRow[] => {
  if (!categoryCode) {
    return []
  }

  const matchedCategory = categoryConfigs.find(
    row => normalizeCode(row.sysGameTypeCode) === categoryCode
  )
  if (!matchedCategory) {
    return []
  }

  const betRateRows = normalizeRebateDataRows(matchedCategory.betRate)
  for (const betRateRow of betRateRows) {
    const rebateRateVos = normalizeRebateDataRows(betRateRow.rebateRateVos)
    if (rebateRateVos.length > 0) {
      return rebateRateVos
    }
  }

  return []
}

/**
 * 根据数组 A 生成 RebateRateTable 需要的数据结构。
 *
 * 生成规则（与需求一致）：
 * - 第 1 行：有效投注固定为 0.01+，反水比例取 A[0].ratio%
 * - 第 N 行（N>=2）：有效投注取 A[N-2].betLine+，反水比例取 A[N-1].ratio%
 */
const buildRebateRowsFromRateVos = (
  rateVos: RebateApiRow[],
  currentTierIndex: number
): RebateRow[] => {
  return rateVos.map((currentItem, index) => {
    const previousItem = rateVos[index - 1]
    const validBets = index === 0 ? '0.01+' : `${toDisplayNumberText(previousItem?.betLine)}+`
    const rebateRate = `${toDisplayNumberText(currentItem.ratio)}%`

    return {
      id: `row-${index}-${validBets}-${rebateRate}`,
      validBets,
      rebateRate,
      isCurrent: index === currentTierIndex
    }
  })
}

/**
 * 根据数组 A 生成每一档的起始投注门槛值。
 * 示例：
 * - A[0] 对应 0.01
 * - A[1] 对应 A[0].betLine
 * - A[2] 对应 A[1].betLine
 */
const buildTierStartValuesFromRateVos = (rateVos: RebateApiRow[]): number[] =>
  rateVos.map((_, index) => {
    if (index === 0) {
      return DEFAULT_TIER_START_VALUE
    }
    return toNumber(rateVos[index - 1]?.betLine, DEFAULT_TIER_START_VALUE)
  })

/**
 * 在门槛数组中匹配当前有效投注所属档位（返回行下标）。
 * 规则：取“最后一个 <= 当前有效投注”的档位。
 */
const findMatchedTierIndex = (currentValidBets: number, tierStartValues: number[]) => {
  let matchedIndex = -1
  for (let index = 0; index < tierStartValues.length; index += 1) {
    const startValue = tierStartValues[index]
    if (currentValidBets >= startValue) {
      matchedIndex = index
    }
  }
  return matchedIndex
}

/**
 * 进度百分比计算，返回区间 [0, 100]。
 */
const calcProgressPercent = (currentValue: number, targetValue: number) => {
  if (targetValue <= 0) {
    return 0
  }
  const ratio = (currentValue / targetValue) * 100
  return Math.min(Math.max(ratio, 0), 100)
}

/**
 * 打开“洗码记录”策略（策略模式）：
 * - mobile：跳转独立页面
 * - desktop：打开当前页弹窗
 */
const createOpenRebateRecordsStrategies = (showRebateRecordsPopup: {
  value: boolean
}): Record<DeviceType, () => void> => ({
  mobile: () => {
    void navigateTo('/personal-center/rebate-records')
  },
  desktop: () => {
    showRebateRecordsPopup.value = true
  }
})

/**
 * 页面初始化加载策略（策略模式）：
 * 以列表方式编排初始化任务，便于后续按模块扩展。
 */
const runMountedLoaders = (loaders: Array<() => Promise<void>>) => {
  loaders.forEach(loader => {
    void loader()
  })
}

export const useRebatePage = () => {
  const { t } = useI18n()
  const isMobile = useIsMobile()
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

  /**
   * 将来源对象中的候选字段解析为数字并回填到指定状态。
   * 字段不存在时不覆盖原状态，避免把已有值重置掉。
   */
  const applyOptionalNumberToState = (
    source: RebateApiRow,
    fieldCandidates: string[],
    targetState: { value: number }
  ) => {
    const rawFieldValue = pickField(source, fieldCandidates)
    if (rawFieldValue === undefined) {
      return
    }
    targetState.value = toNumber(rawFieldValue, targetState.value)
  }

  /**
   * 解析并应用 queryRebateGameData 结果到概览卡状态。
   */
  const applyRebateOverviewResponse = (result: unknown) => {
    if (!isPlainObject(result)) {
      return
    }

    applyOptionalNumberToState(result, ['betAmount'], todayValidBets)
    applyOptionalNumberToState(result, ['flowAmount'], eligibleTurnover)
    applyOptionalNumberToState(result, ['rebatePoints'], claimableAmount)
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
  const claimButtonText = computed(() =>
    claimableAmount.value > 0 ? t('rebatePage.claim') : t('rebatePage.goBet')
  )
  const claimSuccessAmount = ref(0)
  const claimSuccessAmountText = computed(() => formatAmount(claimSuccessAmount.value))

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
  const rebateRateCategoryConfigs = ref<RebateApiRow[]>([])

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
      if (!isSuccessArrayResult(response)) {
        return
      }

      const normalizedCategoryConfigs = normalizeRebateDataRows(response.result)
      rebateRateCategoryConfigs.value = normalizedCategoryConfigs

      const nextCategories = buildRebateCategories(normalizedCategoryConfigs, t)
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
      if (!isSuccessArrayResult(response)) {
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
  // 模块 D：分类投注聚合（供进度卡与表格复用）
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
      item => normalizeCode(item.sysGameTypeCode) === currentCategoryCode.value
    )
  )

  /**
   * 当前分类有效投注总和（betAmount 累加）。
   */
  const currentValidBetsValue = computed(() =>
    currentCategoryRebateRows.value.reduce((total, item) => total + toNumber(item.betAmount), 0)
  )

  // ============================================================
  // 模块 E：RebateRateTable（返利表格）
  // ============================================================

  /**
   * 数组 A：从 selectRebateRate 返回数据中，根据 activeCategory 匹配出来的 rebateRateVos。
   */
  const currentCategoryRebateRateVos = computed<RebateApiRow[]>(() =>
    getRebateRateVosByCategoryCode(rebateRateCategoryConfigs.value, currentCategoryCode.value)
  )

  /**
   * 当前分类每一档“起始门槛值”数组。
   * 用于根据当前有效投注定位所属档位。
   */
  const currentCategoryTierStartValues = computed<number[]>(() =>
    buildTierStartValuesFromRateVos(currentCategoryRebateRateVos.value)
  )

  /**
   * 当前有效投注匹配到的档位下标。
   */
  const currentTierIndex = computed(() =>
    findMatchedTierIndex(currentValidBetsValue.value, currentCategoryTierStartValues.value)
  )

  /**
   * 页面展示用档位下标：
   * - 当前有效投注为 0 且存在档位数据时，默认按第一档展示（下标 0）
   * - 其他场景沿用正常匹配结果
   */
  const displayTierIndex = computed(() => {
    if (currentValidBetsValue.value === 0 && currentCategoryRebateRateVos.value.length > 0) {
      return 0
    }

    return currentTierIndex.value
  })

  /**
   * 当前档和下一档的返水比例（没有下一档时取当前档）。
   */
  const currentTierRatioValue = computed(() => {
    if (displayTierIndex.value < 0) {
      return 0
    }
    return toNumber(currentCategoryRebateRateVos.value[displayTierIndex.value]?.ratio, 0)
  })
  const nextTierRatioValue = computed(() => {
    if (displayTierIndex.value < 0) {
      return 0
    }

    const lastIndex = currentCategoryRebateRateVos.value.length - 1
    const nextIndex = Math.min(displayTierIndex.value + 1, lastIndex)
    return toNumber(
      currentCategoryRebateRateVos.value[nextIndex]?.ratio,
      currentTierRatioValue.value
    )
  })

  /**
   * 表格最终渲染数据：
   * - 有效投注字段：按需求使用 0.01+ / 上一条 betLine+
   * - 反水比例字段：使用当前条 ratio%
   */
  const rebateRows = computed<RebateRow[]>(() =>
    buildRebateRowsFromRateVos(currentCategoryRebateRateVos.value, displayTierIndex.value)
  )

  // ============================================================
  // 模块 F：RebateProgressCard（最终文案与进度）
  // ============================================================

  /**
   * 进度卡展示文案：
   * - 当前返水比例：当前档 ratio
   * - 下一档返水比例：下一档 ratio（不存在时沿用当前档）
   */
  const currentRebateText = computed(() => formatRatioPercentText(currentTierRatioValue.value))
  const nextRebateText = computed(() => formatRatioPercentText(nextTierRatioValue.value))
  const currentValidBetsPlainText = computed(() => String(Math.floor(currentValidBetsValue.value)))

  /**
   * 进度卡分母 X（红框值）的数值版本：
   * - 默认取打勾这一档在 rebateRateVos 中的 betLine
   * - 当当前有效投注为 0 时，固定为 0.01
   */
  const targetValidBetsValue = computed(() => {
    if (currentValidBetsValue.value === 0) {
      return DEFAULT_TIER_START_VALUE
    }

    if (currentTierIndex.value < 0) {
      return DEFAULT_TIER_START_VALUE
    }

    const currentTierBetLineValue =
      currentCategoryRebateRateVos.value[currentTierIndex.value]?.betLine
    return toNumber(currentTierBetLineValue, DEFAULT_TIER_START_VALUE)
  })

  /**
   * 进度卡分母 X（红框值）的文本版本。
   */
  const targetValidBetsText = computed(() =>
    toDisplayNumberText(targetValidBetsValue.value, String(DEFAULT_TIER_START_VALUE))
  )

  /**
   * 进度百分比（0-100），用于进度条宽度与百分比文本。
   *
   * 规则：
   * 仅按：当前有效投注 / 总投注数(X)。
   */
  const progressPercent = computed(() =>
    calcProgressPercent(currentValidBetsValue.value, targetValidBetsValue.value)
  )
  const progressPercentText = computed(() => formatProgressPercentText(progressPercent.value))

  // ============================================================
  // 模块 G：页面交互行为（按钮、Tab、弹窗）
  // ============================================================

  /**
   * 点击主按钮：
   * - 可领取金额 > 0：调用领取接口并展示成功弹窗
   * - 可领取金额 <= 0：跳转娱乐城
   */
  const handleClaimRebate = async () => {
    if (claimableAmount.value <= 0) {
      await navigateTo('/casino')
      return
    }

    try {
      const claimedAmount = claimableAmount.value
      const response = await Api.user.obtainRebate()
      if (!response?.success) {
        throw new Error(response?.message || 'obtain rebate failed')
      }

      claimSuccessAmount.value = claimedAmount
      showClaimSuccessPopup.value = true

      await Promise.allSettled([loadRebateOverview(), loadRebateData()])
    } catch (error) {
      console.error('handleClaimRebate failed', error)
    }
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
  const openRebateRecordsStrategies = createOpenRebateRecordsStrategies(showRebateRecordsPopup)

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
  // 模块 H：生命周期编排（页面初始化）
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
    runMountedLoaders(mountedLoaders)
  })

  // ============================================================
  // 输出给父组件 index.vue 的绑定字段
  // ============================================================
  return {
    activeCategory,
    activeTab,
    categoryOptions,
    claimButtonText,
    claimableAmountText,
    claimSuccessAmountText,
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
    supportHeaderIcon: CustomerServiceIcon,
    targetValidBetsText,
    todayValidBetsText
  }
}
