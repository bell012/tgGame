import type {
  MbTicketRecord,
  TicketProgressExt,
  TicketProgressResult,
  TicketThresholdCondition
} from '@/api/interface/activity'

import { PAY_CHANNEL_TAB_LIST } from '@/constants/payChannelTabs'
import { formatBalance, getCurrencySymbol } from '@/utils/locale'

export type TicketTaskTranslate = (key: string, params?: Record<string, unknown>) => string

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
  completedLabel: string
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
  completedLabel: string
  description?: string
  descriptionTitle?: string
  helpSections?: HelpSection[]
}

interface BuildTaskItemsOptions {
  t: TicketTaskTranslate
  locale?: string
}

const TASK_I18N_PREFIX = 'ticketPage.taskPop'

export const getTicketTaskCompleteRequirementsRule = (t: TicketTaskTranslate) => ({
  prefix: t(`${TASK_I18N_PREFIX}.rules.items.completeRequirementsPrefix`),
  suffix: t(`${TASK_I18N_PREFIX}.rules.items.completeRequirementsSuffix`)
})

export const getTicketTaskRuleItems = (t: TicketTaskTranslate) => [
  t(`${TASK_I18N_PREFIX}.rules.items.cashCredited`),
  t(`${TASK_I18N_PREFIX}.rules.items.onceOnly`),
  t(`${TASK_I18N_PREFIX}.rules.items.irregularActivity`),
  t(`${TASK_I18N_PREFIX}.rules.items.finalInterpretation`)
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

const normalizeTaskLocale = (locale?: string) => (locale === 'zh' ? 'zh-CN' : 'en-US')

const formatAccumulationStartDate = (value?: number, locale?: string) => {
  const timestamp = normalizeTimestamp(value)
  if (!timestamp) return ''

  return new Intl.DateTimeFormat(normalizeTaskLocale(locale), {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(timestamp))
}

const getAccumulationDescriptionPrefix = (
  condition: TicketThresholdCondition,
  t: TicketTaskTranslate,
  locale?: string
) => {
  switch (condition.accumulateType) {
    case 2: {
      const formattedDate = formatAccumulationStartDate(condition.startDate, locale)
      return formattedDate
        ? t(`${TASK_I18N_PREFIX}.accumulation.startingFromDate`, { date: formattedDate })
        : t(`${TASK_I18N_PREFIX}.accumulation.startingFromSpecifiedDate`)
    }
    case 3:
      return t(`${TASK_I18N_PREFIX}.accumulation.afterAccountCreated`)
    default:
      return t(`${TASK_I18N_PREFIX}.accumulation.afterReceivingVoucher`)
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
  rechargeMethods: number[] | undefined,
  t: TicketTaskTranslate,
  locale?: string
): HelpSection[] => [
  {
    title: t(`${TASK_I18N_PREFIX}.help.totalDepositAmount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.totalDepositAmount.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositAmount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.validDepositAmount.content`)
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositChannels.title`),
    content: formatPayChannelList(
      rechargeMethods,
      t(`${TASK_I18N_PREFIX}.help.validDepositChannels.fallback`)
    )
  }
]

const createDepositCountHelpSections = (
  condition: TicketThresholdCondition,
  rechargeMethods: number[] | undefined,
  t: TicketTaskTranslate,
  locale?: string
): HelpSection[] => [
  {
    title: t(`${TASK_I18N_PREFIX}.help.totalDepositCount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.totalDepositCount.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositCount.title`),
    content: t(`${TASK_I18N_PREFIX}.help.validDepositCount.content`)
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validDepositChannels.title`),
    content: formatPayChannelList(
      rechargeMethods,
      t(`${TASK_I18N_PREFIX}.help.validDepositChannels.fallback`)
    )
  }
]

const createTurnoverHelpSections = (
  condition: TicketThresholdCondition,
  t: TicketTaskTranslate,
  locale?: string,
  validPlatforms?: string[],
  platformGameCodes?: string[]
): HelpSection[] => [
  {
    title: t(`${TASK_I18N_PREFIX}.help.totalTurnover.title`),
    content: t(`${TASK_I18N_PREFIX}.help.totalTurnover.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validTurnover.title`),
    content: t(`${TASK_I18N_PREFIX}.help.validTurnover.content`)
  },
  {
    title: t(`${TASK_I18N_PREFIX}.help.validTurnoverScope.title`),
    content: formatDisplayList(
      validPlatforms?.length ? validPlatforms : platformGameCodes,
      t(`${TASK_I18N_PREFIX}.help.validTurnoverScope.fallback`)
    )
  }
]

const createGameLossHelpSections = (
  condition: TicketThresholdCondition,
  t: TicketTaskTranslate,
  locale?: string
): HelpSection[] =>
  createSimpleHelpSections(
    t(`${TASK_I18N_PREFIX}.help.lossAmount.title`),
    t(`${TASK_I18N_PREFIX}.help.lossAmount.content`, {
      prefix: getAccumulationDescriptionPrefix(condition, t, locale)
    })
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
  completedLabel,
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
    actionLabel: satisfied ? completedLabel : pendingLabel,
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
  completedLabel,
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
    actionLabel: satisfied ? completedLabel : pendingLabel,
    actionType,
    description,
    descriptionTitle,
    helpSections
  }
}

const appendConditionTasks = (
  items: TaskItem[],
  ticketData?: MbTicketRecord,
  ext?: TicketProgressExt,
  options?: BuildTaskItemsOptions
) => {
  if (!options) return
  const { t, locale } = options
  const conditionTypes = ticketData?.conditionType ?? []
  const currency = ticketData?.currency ?? ext?.currency
  const operatorFallback = '>='
  const completedLabel = t(`${TASK_I18N_PREFIX}.actions.completed`)

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
          title: t(`${TASK_I18N_PREFIX}.tasks.totalDepositAmount`, {
            operator,
            amount: formatThresholdAmount(target, currency)
          }),
          current,
          target,
          operator,
          actionType: 'deposit',
          pendingLabel: t(`${TASK_I18N_PREFIX}.actions.deposit`),
          completedLabel,
          helpSections: createDepositAmountHelpSections(
            condition,
            rechargeCondition?.rechargeMethods,
            t,
            locale
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
          title: t(`${TASK_I18N_PREFIX}.tasks.totalDepositCount`, { operator, count: target }),
          current,
          target,
          operator,
          actionType: 'deposit',
          pendingLabel: t(`${TASK_I18N_PREFIX}.actions.deposit`),
          completedLabel,
          helpSections: createDepositCountHelpSections(
            condition,
            rechargeCondition?.rechargeMethods,
            t,
            locale
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
          title: t(`${TASK_I18N_PREFIX}.tasks.validBetAmount`, {
            operator,
            amount: formatThresholdAmount(target, currency)
          }),
          current,
          target,
          operator,
          actionType: 'wagering',
          pendingLabel: t(`${TASK_I18N_PREFIX}.actions.betNow`),
          completedLabel,
          helpSections: createTurnoverHelpSections(
            validBet!,
            t,
            locale,
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
          title: t(`${TASK_I18N_PREFIX}.tasks.gameLossAmount`, {
            operator,
            amount: formatThresholdAmount(target, currency)
          }),
          current,
          target,
          operator,
          actionType: 'loss',
          pendingLabel: t(`${TASK_I18N_PREFIX}.actions.betNow`),
          completedLabel,
          helpSections: createGameLossHelpSections(gameLossAmount!, t, locale)
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
          title: t(`${TASK_I18N_PREFIX}.tasks.validInvitedFriends`, {
            operator: operatorFallback,
            count: inviteFriendCount
          }),
          current,
          target: inviteFriendCount,
          operator: operatorFallback,
          actionType: 'invite',
          pendingLabel: t(`${TASK_I18N_PREFIX}.actions.invite`),
          completedLabel,
          helpSections: createSimpleHelpSections(
            t(`${TASK_I18N_PREFIX}.help.inviteRegistration.title`),
            t(`${TASK_I18N_PREFIX}.help.inviteRegistration.content`)
          )
        })
      )
    }
  }
}

export const buildTaskItems = (
  ticketData?: MbTicketRecord,
  progressData?: TicketProgressResult,
  options?: BuildTaskItemsOptions
) => {
  if (!options) return []
  const { t } = options
  const completedLabel = t(`${TASK_I18N_PREFIX}.actions.completed`)
  const items: TaskItem[] = []
  const { bindData, completeVerification, ext } = progressData ?? {}

  appendConditionTasks(items, ticketData, ext, options)

  const withdrawalAccountTask = createStatusTask({
    id: 'bind-withdrawal-account',
    title: t(`${TASK_I18N_PREFIX}.tasks.addWithdrawalMethod`),
    satisfied: bindData?.bindWithdrawalAccount,
    actionType: 'add',
    pendingLabel: t(`${TASK_I18N_PREFIX}.actions.add`),
    completedLabel,
    helpSections: createSimpleHelpSections(
      t(`${TASK_I18N_PREFIX}.help.withdrawalAccount.title`),
      t(`${TASK_I18N_PREFIX}.help.withdrawalAccount.content`)
    )
  })
  if (withdrawalAccountTask) items.push(withdrawalAccountTask)

  const withdrawalNameTask = createStatusTask({
    id: 'bind-withdrawal-name',
    title: t(`${TASK_I18N_PREFIX}.tasks.addAccountName`),
    satisfied: bindData?.bindWithdrawalName,
    actionType: 'add',
    pendingLabel: t(`${TASK_I18N_PREFIX}.actions.add`),
    completedLabel,
    helpSections: createSimpleHelpSections(
      t(`${TASK_I18N_PREFIX}.help.withdrawalName.title`),
      t(`${TASK_I18N_PREFIX}.help.withdrawalName.content`)
    )
  })
  if (withdrawalNameTask) items.push(withdrawalNameTask)

  const verifyPhoneTask = createStatusTask({
    id: 'verify-phone',
    title: t(`${TASK_I18N_PREFIX}.tasks.linkMobileNumber`),
    satisfied: completeVerification?.verifyPhone,
    actionType: 'link',
    pendingLabel: t(`${TASK_I18N_PREFIX}.actions.link`),
    completedLabel,
    helpSections: createSimpleHelpSections(
      t(`${TASK_I18N_PREFIX}.help.phoneNumber.title`),
      t(`${TASK_I18N_PREFIX}.help.phoneNumber.content`)
    )
  })
  if (verifyPhoneTask) items.push(verifyPhoneTask)

  return items
}
