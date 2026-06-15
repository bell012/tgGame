import type {
  MbTicketRecord,
  TicketProgressExt,
  TicketProgressResult,
  TicketThresholdCondition
} from '@/api/interface/activity'
import {
  createDepositAmountHelpSections,
  createDepositCountHelpSections,
  createGameLossHelpSections,
  createSimpleHelpSections,
  createTurnoverHelpSections
} from './helpSections'
import { calcProgress, formatThresholdAmount, isTargetMet } from './helpers'
import type {
  BuildTaskItemsOptions,
  ProgressTaskOptions,
  StatusTaskOptions,
  TaskItem
} from './types'
import { TASK_I18N_PREFIX } from './types'

const CONDITION_RECHARGE = 1
const CONDITION_WAGERING = 2
const CONDITION_LOSS = 3
const CONDITION_INVITE = 4

const isConditionEnabled = (condition?: TicketThresholdCondition) => condition?.enabled === 1

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
