import type { GameDataItem } from '@/api/interface/game'
import { useAuthModalStore } from '@/stores/authModal'
import { useGameStore } from '@/stores/game'
import { navigateTo, navigateToName } from '@/utils/router'
import type { TaskInfoPopupData, TaskViewItem } from './shared'

/** 后台约定中需要跳转法币充值页的支付方式编码。 */
const TASK_CENTER_FIAT_DEPOSIT_METHOD_CODES = new Set(['5', '64', '65', '66'])

/** 任务中心跳转执行时需要的当前设备信息。 */
interface TaskCenterNavigationOptions {
  isMobile: boolean
}

/** 任务卡片与任务说明弹窗共用的最小跳转数据结构。 */
type TaskCenterNavigationTask = Pick<TaskViewItem, 'taskType' | 'platformGameCodes'>

/** 平台任务首个编码解析后的游戏跳转目标。 */
interface TaskGameNavigationTarget {
  gameTypeCode: string
  platformCode?: string
  itemCode?: string
}

/** 规范后台任务类型，避免空格或大小写差异影响映射。 */
const normalizeTaskType = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

/** 取得后台下发的首个游戏分类或充值方式编码。 */
const getFirstPlatformGameCode = (task: TaskCenterNavigationTask) =>
  task.platformGameCodes.find(code => String(code ?? '').trim())?.trim() ?? ''

/** 将后台首个平台编码解析为游戏分类、游戏平台和具体游戏三种结构。 */
const parseTaskGameNavigationTarget = (value: string): TaskGameNavigationTarget | null => {
  const segments = value.split('|').map(segment => segment.trim())

  if (segments.length < 1 || segments.length > 3 || segments.some(segment => !segment)) {
    return null
  }

  const [gameTypeCode, platformCode, itemCode] = segments

  return {
    gameTypeCode,
    ...(platformCode ? { platformCode } : {}),
    ...(itemCode ? { itemCode } : {})
  }
}

/** 将嵌套游戏树拍平成列表，便于按后台编码精确匹配。 */
const flattenTaskGameItems = (items: GameDataItem[]): GameDataItem[] => {
  const flattenedItems: GameDataItem[] = []

  for (const item of items) {
    flattenedItems.push(item)
    flattenedItems.push(...flattenTaskGameItems(item.subGame ?? []))
  }

  return flattenedItems
}

/** 匹配游戏树中可能以逗号分隔保存的编码字段。 */
const isTaskGameCodeMatched = (source: unknown, target: string) =>
  String(source ?? '')
    .split(',')
    .map(value => value.trim())
    .includes(target)

/** 按后台首个游戏编码的层级，跳转分类、平台筛选页或具体游戏详情。 */
const navigateToTaskGame = async (task: TaskCenterNavigationTask) => {
  const sourceCode = getFirstPlatformGameCode(task)
  const target = parseTaskGameNavigationTarget(sourceCode)

  if (!target) {
    console.warn('task center game task payload is invalid', { sourceCode, task })
    return false
  }

  try {
    const gameStore = useGameStore()
    const gameItems = flattenTaskGameItems(await gameStore.ensureGameData())
    const gameTypeItems = gameItems.filter(item =>
      isTaskGameCodeMatched(item.gameTypeCode, target.gameTypeCode)
    )

    if (gameTypeItems.length === 0) {
      console.warn('task center gameTypeCode is not available', { target, task })
      return false
    }

    if (!target.platformCode) {
      await navigateTo(`/gamelist/${encodeURIComponent(target.gameTypeCode)}`)
      return true
    }

    const platformItems = gameTypeItems.filter(item =>
      isTaskGameCodeMatched(item.platformCode, target.platformCode!)
    )

    if (platformItems.length === 0) {
      console.warn('task center platformCode is not available', { target, task })
      return false
    }

    if (!target.itemCode) {
      await navigateTo(`/gamelist/${encodeURIComponent(target.gameTypeCode)}`, {
        query: {
          providerCode: target.platformCode
        }
      })
      return true
    }

    const matchedGame = platformItems.find(item =>
      isTaskGameCodeMatched(item.itemCode, target.itemCode!)
    )
    const gameRowId = Number(matchedGame?.rowId)

    if (!Number.isFinite(gameRowId) || gameRowId <= 0) {
      console.warn('task center itemCode is not available', { target, task })
      return false
    }

    await navigateTo(`/game/${gameRowId}`)
    return true
  } catch (error) {
    console.warn('task center game navigation failed', { error, target, task })
    return false
  }
}

/** 按后台固定支付方式编码规则跳转并预选本项目充值方式。 */
const navigateToTaskDeposit = async (task: TaskCenterNavigationTask) => {
  const methodCode = getFirstPlatformGameCode(task)
  // 后台旧逻辑在未配置方式编码时默认跳法币充值。
  const tab =
    TASK_CENTER_FIAT_DEPOSIT_METHOD_CODES.has(methodCode) || !methodCode ? 'Fiat' : 'Crypto'

  await navigateTo('/deposit', {
    query: {
      taskCenterTab: tab,
      ...(methodCode ? { taskCenterMethodCode: methodCode } : {})
    }
  })
  return true
}

/** 跳转本项目收款管理，并保留后台账户任务类型供页面预选。 */
const navigateToTaskPaymentMethods = async (taskType: string) => {
  await navigateTo('/payment-methods', {
    query: {
      taskCenterAccountType: taskType
    }
  })
  return true
}

/** 跳转安全设置中的指定操作；PC 使用现有安全页弹窗，H5 使用已有独立页面。 */
const navigateToTaskSecurityAction = async (
  action: 'transaction-password' | 'mobile-number',
  isMobile: boolean
) => {
  if (isMobile) {
    await navigateToName(
      action === 'transaction-password' ? 'transactionPassword' : 'changeMobileNumber'
    )
    return true
  }

  await navigateTo('/security', {
    query: {
      taskCenterSecurityAction: action
    }
  })
  return true
}

/**
 * 执行任务中心“去完成”跳转。
 * 仅处理后台明确约定的 taskType，未知类型不会猜测为游戏任务。
 */
export const executeTaskCenterGoToTask = async (
  task: TaskViewItem | TaskInfoPopupData,
  options: TaskCenterNavigationOptions
) => {
  const taskType = normalizeTaskType(task.taskType)

  switch (taskType) {
    case 'ZC':
      useAuthModalStore().openRegisterModal()
      return true
    case 'CZ':
    case 'CZ2':
    case 'CZ3':
    case 'CZ4':
    case 'CZ5':
      return navigateToTaskDeposit(task)
    case 'YHK':
    case 'SZHB':
    case 'TXZH':
      return navigateToTaskPaymentMethods(taskType)
    case 'JYMM':
      return navigateToTaskSecurityAction('transaction-password', options.isMobile)
    case 'BDSJ':
      return navigateToTaskSecurityAction('mobile-number', options.isMobile)
    case 'DAPP':
      await navigateTo('/app-download')
      return true
    case 'GAME':
    case 'FIRSTBET':
      return navigateToTaskGame(task)
    case 'XYZ':
    case 'TG':
      console.warn('task center taskType navigation is not configured', { taskType, task })
      return false
    default:
      console.warn('task center received an unknown taskType', { taskType, task })
      return false
  }
}
