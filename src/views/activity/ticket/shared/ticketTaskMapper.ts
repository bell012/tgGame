import type {
  MbTicketRecord,
  TicketProgressExt,
  TicketProgressResult,
  TicketThresholdCondition
} from '@/api/interface/activity'

import { PAY_CHANNEL_TAB_LIST } from '@/constants/payChannelTabs'
import { formatBalance, getCurrencySymbol } from '@/utils/locale'

const CONDITION_RECHARGE = 1
const CONDITION_WAGERING = 2
const CONDITION_LOSS = 3
const CONDITION_INVITE = 4

export interface HelpSection {
  title: string
  content: string
}

export type TaskStatus = 'action' | 'completed'
export type TaskActionType =
  | 'deposit'
  | 'invite'
  | 'add'
  | 'complete'
  | 'link'
  | 'wagering'
  | 'loss'

export interface TaskItem {
  id: string
  title: string
  progress: number
  status: TaskStatus
  actionLabel: string
  actionType?: TaskActionType
  description?: string
  descriptionTitle?: string
  helpSections?: HelpSection[]
}

interface ProgressTaskOptions {
  id: string
  title: string
  current?: number
  target?: number
  operator?: string
  actionType: TaskActionType
  pendingLabel: string
  description?: string
  descriptionTitle?: string
  helpSections?: HelpSection[]
}

interface StatusTaskOptions {
  id: string
  title: string
  satisfied: boolean | undefined
  actionType: TaskActionType
  pendingLabel?: string
  description?: string
  descriptionTitle?: string
  helpSections?: HelpSection[]
}

export const TICKET_TASK_RULE_ITEMS = [
  'During the promo period, complete the voucher requirements to get rewards.',
  'Cash rewards will be credited directly to your account balance. You may check it under My Balance.',
  'Each user can join this promo only once during the promo period. Chances cannot be stacked, so please use it in time.',
  'If any irregular activity is detected, the platform reserves the right to cancel eligibility and withhold the reward.',
  'The platform reserves the final interpretation rights for this activity.'
]

const isConditionEnabled = (condition?: TicketThresholdCondition) => condition?.enabled === 1

export const isTargetMet = (current: number, target: number, operator = '>=') => {
  switch (operator) {
    case '>':
      return current > target
    case '<=':
      return current <= target
    case '=':
    case '==':
      return current === target
    default:
      return current >= target
  }
}

export const calcProgress = (current: number, target: number) => {
  if (target <= 0) return 0
  return Math.min(100, Math.floor((current / target) * 100))
}

const formatThresholdAmount = (amount: number, currency?: string) => {
  const formatted = formatBalance(amount, 2)
  return `${getCurrencySymbol(currency)}${formatted}`
}

const normalizeTimestamp = (value?: number) => {
  if (!value) return null
  return value < 1_000_000_000_000 ? value * 1000 : value
}

const formatAccumulationStartDate = (value?: number) => {
  const timestamp = normalizeTimestamp(value)
  if (!timestamp) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(timestamp))
}

const getAccumulationDescriptionPrefix = (condition: TicketThresholdCondition) => {
  switch (condition.accumulateType) {
    case 2: {
      const formattedDate = formatAccumulationStartDate(condition.startDate)
      return formattedDate ? `Starting from ${formattedDate},` : 'Starting from the specified date,'
    }
    case 3:
      return 'After creating your account,'
    default:
      return 'After receiving the voucher,'
  }
}

const formatDisplayList = (values: Array<number | string> | undefined, fallback: string) => {
  if (!values?.length) return fallback
  return values.join(', ')
}

const formatPayChannelList = (methods: number[] | undefined, fallback: string) => {
  if (!methods?.length) return fallback

  return methods
    .map(method => {
      const methodKey = String(method)
      return PAY_CHANNEL_TAB_LIST.find(item => item.key === methodKey)?.value ?? methodKey
    })
    .join(', ')
}

const createSimpleHelpSections = (title: string, content: string): HelpSection[] => [
  { title, content }
]

const createDepositAmountHelpSections = (
  condition: TicketThresholdCondition,
  rechargeMethods?: number[]
): HelpSection[] => [
  {
    title: 'Total Deposit Amount',
    content: `${getAccumulationDescriptionPrefix(condition)} your total deposit amount must reach the required amount for this task to be completed.`
  },
  {
    title: 'Valid Deposit Amount',
    content:
      'Only deposits made through the platform’s specified channels will count toward this voucher requirement. Deposits made through non-specified channels or abnormal deposit activities will not be counted.'
  },
  {
    title: 'Valid Deposit Channels',
    content: formatPayChannelList(rechargeMethods, 'Specified deposit channels.')
  }
]

const createDepositCountHelpSections = (
  condition: TicketThresholdCondition,
  rechargeMethods?: number[]
): HelpSection[] => [
  {
    title: 'Total Deposit Count',
    content: `${getAccumulationDescriptionPrefix(condition)} your total deposit count must reach the required count for this task to be completed.`
  },
  {
    title: 'Valid Deposit Count',
    content:
      'Only deposits made through the platform’s specified channels will count toward this voucher requirement. Deposits made through non-specified channels or abnormal deposit activities will not be counted.'
  },
  {
    title: 'Valid Deposit Channels',
    content: formatPayChannelList(rechargeMethods, 'Specified deposit channels.')
  }
]

const createTurnoverHelpSections = (
  condition: TicketThresholdCondition,
  validPlatforms?: string[],
  platformGameCodes?: string[]
): HelpSection[] => [
  {
    title: 'Total Turnover',
    content: `${getAccumulationDescriptionPrefix(condition)} your total turnover must reach the required amount for this task to be completed.`
  },
  {
    title: 'Valid Turnover',
    content:
      'Only turnover generated from the platform’s specified games will count toward this activity requirement. Turnover from non-specified games or abnormal betting activities will not be counted.'
  },
  {
    title: 'Valid Turnover Scope',
    content: formatDisplayList(
      validPlatforms?.length ? validPlatforms : platformGameCodes,
      'Specified games.'
    )
  }
]

const createGameLossHelpSections = (condition: TicketThresholdCondition): HelpSection[] =>
  createSimpleHelpSections(
    'Loss Amount',
    `${getAccumulationDescriptionPrefix(condition)} your total game loss must reach the required amount to complete this task.`
  )

const getRechargeExtValue = (
  ext: TicketProgressExt | undefined,
  condition: TicketThresholdCondition,
  isCount: boolean
) => {
  switch (condition.accumulateType) {
    case 1:
      return isCount ? ext?.claimRechargeNum : ext?.claimRechargeAmount
    case 2:
      return isCount ? ext?.rechargeNum : ext?.rechargeAmount
    case 3:
      return isCount ? ext?.totalRechargeNum : ext?.totalRechargeAmount
    case 4:
      return isCount ? undefined : ext?.fristRechargeAmount
    default:
      return undefined
  }
}

const getBetExtValue = (
  ext: TicketProgressExt | undefined,
  condition: TicketThresholdCondition
) => {
  switch (condition.accumulateType) {
    case 1:
      return ext?.claimBetAmount
    case 2:
      return ext?.betAmount
    case 3:
      return ext?.totalBetAmount
    default:
      return undefined
  }
}

const getLossExtValue = (
  ext: TicketProgressExt | undefined,
  condition: TicketThresholdCondition
) => {
  switch (condition.accumulateType) {
    case 1:
      return ext?.claimLossAmount
    case 2:
      return ext?.totalLossAmount
    case 3:
      return ext?.totalLossAmount
    default:
      return undefined
  }
}

const createProgressTask = ({
  id,
  title,
  current = 0,
  target = 0,
  operator = '>=',
  actionType,
  pendingLabel,
  description,
  descriptionTitle,
  helpSections
}: ProgressTaskOptions): TaskItem => {
  const satisfied = isTargetMet(current, target, operator)
  const progress = satisfied ? 100 : calcProgress(current, target)

  return {
    id,
    title,
    progress,
    status: satisfied ? 'completed' : 'action',
    actionLabel: satisfied ? 'Completed' : pendingLabel,
    actionType,
    description,
    descriptionTitle,
    helpSections
  }
}

const createStatusTask = ({
  id,
  title,
  satisfied,
  actionType,
  pendingLabel = 'Add',
  description,
  descriptionTitle,
  helpSections
}: StatusTaskOptions): TaskItem | null => {
  if (satisfied === undefined) return null

  return {
    id,
    title,
    progress: satisfied ? 100 : 0,
    status: satisfied ? 'completed' : 'action',
    actionLabel: satisfied ? 'Completed' : pendingLabel,
    actionType,
    description,
    descriptionTitle,
    helpSections
  }
}

const appendConditionTasks = (
  items: TaskItem[],
  ticketData?: MbTicketRecord,
  ext?: TicketProgressExt
) => {
  const conditionTypes = ticketData?.conditionType ?? []
  const currency = ticketData?.currency ?? ext?.currency
  const operatorFallback = '>='

  if (conditionTypes.includes(CONDITION_RECHARGE)) {
    const rechargeCondition = ticketData?.rechargeCondition

    if (isConditionEnabled(rechargeCondition?.depositAmount)) {
      const condition = rechargeCondition!.depositAmount!
      const target = condition.amount ?? 0
      const current = getRechargeExtValue(ext, condition, false) ?? 0
      const operator = condition.operator ?? operatorFallback

      items.push(
        createProgressTask({
          id: 'recharge-deposit-amount',
          title: `Total Deposit Amount ${operator} ${formatThresholdAmount(target, currency)}`,
          current,
          target,
          operator,
          actionType: 'deposit',
          pendingLabel: 'Deposit',
          helpSections: createDepositAmountHelpSections(
            condition,
            rechargeCondition?.rechargeMethods
          )
        })
      )
    }

    if (isConditionEnabled(rechargeCondition?.depositCount)) {
      const condition = rechargeCondition!.depositCount!
      const target = condition.count ?? 0
      const current = getRechargeExtValue(ext, condition, true) ?? 0
      const operator = condition.operator ?? operatorFallback

      items.push(
        createProgressTask({
          id: 'recharge-deposit-count',
          title: `Total Deposit Count ${operator} ${target}`,
          current,
          target,
          operator,
          actionType: 'deposit',
          pendingLabel: 'Deposit',
          helpSections: createDepositCountHelpSections(
            condition,
            rechargeCondition?.rechargeMethods
          )
        })
      )
    }
  }

  if (conditionTypes.includes(CONDITION_WAGERING)) {
    const validBet = ticketData?.wageringCondition?.validBet
    if (isConditionEnabled(validBet)) {
      const target = validBet!.amount ?? 0
      const current = getBetExtValue(ext, validBet!) ?? 0
      const operator = validBet!.operator ?? operatorFallback

      items.push(
        createProgressTask({
          id: 'wagering-valid-bet',
          title: `Valid Bet Amount ${operator} ${formatThresholdAmount(target, currency)}`,
          current,
          target,
          operator,
          actionType: 'wagering',
          pendingLabel: 'Bet Now',
          helpSections: createTurnoverHelpSections(
            validBet!,
            ticketData?.wageringCondition?.validPlatforms,
            ticketData?.platformGameCodes
          )
        })
      )
    }
  }

  if (conditionTypes.includes(CONDITION_LOSS)) {
    const gameLossAmount = ticketData?.lossCondition?.gameLossAmount
    if (isConditionEnabled(gameLossAmount)) {
      const target = gameLossAmount!.amount ?? 0
      const current = getLossExtValue(ext, gameLossAmount!) ?? 0
      const operator = gameLossAmount!.operator ?? operatorFallback

      items.push(
        createProgressTask({
          id: 'loss-game-amount',
          title: `Game Loss Amount  ${operator} ${formatThresholdAmount(target, currency)}`,
          current,
          target,
          operator,
          actionType: 'loss',
          pendingLabel: 'Bet Now',
          helpSections: createGameLossHelpSections(gameLossAmount!)
        })
      )
    }
  }

  if (conditionTypes.includes(CONDITION_INVITE)) {
    const inviteFriendCount = ticketData?.inviteCondition?.inviteFriendCount
    if (inviteFriendCount !== undefined && inviteFriendCount > 0) {
      const current = ext?.invitationNum ?? 0

      items.push(
        createProgressTask({
          id: 'invite-friend-count',
          title: `Valid Invited Friends ${operatorFallback} ${inviteFriendCount}`,
          current,
          target: inviteFriendCount,
          operator: operatorFallback,
          actionType: 'invite',
          pendingLabel: 'Invite',
          helpSections: createSimpleHelpSections(
            'Invite Registration',
            'After receiving the voucher, invite the required number of valid friends to complete the task.'
          )
        })
      )
    }
  }
}

export const buildTaskItems = (
  ticketData?: MbTicketRecord,
  progressData?: TicketProgressResult
) => {
  const items: TaskItem[] = []
  const { bindData, completeVerification, ext } = progressData ?? {}

  appendConditionTasks(items, ticketData, ext)

  const withdrawalAccountTask = createStatusTask({
    id: 'bind-withdrawal-account',
    title: 'Add Withdrawal Method',
    satisfied: bindData?.bindWithdrawalAccount,
    actionType: 'add',
    pendingLabel: 'Add',
    helpSections: createSimpleHelpSections(
      'Withdrawal Account',
      'Your reward is ready. Link your withdrawal account to claim it now!'
    )
  })
  if (withdrawalAccountTask) items.push(withdrawalAccountTask)

  const withdrawalNameTask = createStatusTask({
    id: 'bind-withdrawal-name',
    title: 'Add Account Name',
    satisfied: bindData?.bindWithdrawalName,
    actionType: 'add',
    pendingLabel: 'Add',
    helpSections: createSimpleHelpSections(
      'Withdrawal Name',
      'Your reward is ready. Add your withdrawal name to claim it now!'
    )
  })
  if (withdrawalNameTask) items.push(withdrawalNameTask)

  const verifyPhoneTask = createStatusTask({
    id: 'verify-phone',
    title: 'Link Mobile Number',
    satisfied: completeVerification?.verifyPhone,
    actionType: 'link',
    pendingLabel: 'Link',
    helpSections: createSimpleHelpSections(
      'Phone Number',
      'Your reward is ready. Link your phone number to claim it now!'
    )
  })
  if (verifyPhoneTask) items.push(verifyPhoneTask)

  return items
}
