<template>
  <Teleport to="body">
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="fixed inset-0 z-[10010] flex items-end justify-center bg-mask-60-1 sm:items-center"
        @click.self="handleClose"
      >
        <transition name="popup-scale">
          <div
            v-show="visible"
            class="task-pop__dialog relative flex w-full max-h-[70dvh] flex-col overflow-hidden rounded-t-xl bg-bg-1 sm:mx-auto sm:max-h-[560px] sm:max-w-[400px] sm:rounded-xl"
          >
            <div class="relative shrink-0 px-4 pb-3 pt-5">
              <h3 class="text-center text-[18px] font-[700] leading-[22px] text-text-1">
                Kind Reminder
              </h3>

              <button
                type="button"
                class="absolute right-4 top-5 flex h-6 w-6 items-center justify-center rounded-[6px] bg-opacity-10"
                aria-label="Close"
                @click="handleClose"
              >
                <CloseIcon class="h-2.5 w-2.5 text-text-1" />
              </button>
            </div>

            <div class="task-pop__body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
              <p class="text-sm leading-[20px] text-text-1">
                Complete the tasks below to unlock
                <span class="text-theme-primary">{{ voucherName }}</span>
              </p>
              <p class="mt-2.5 text-[14px] leading-[20px] text-text-1">Win cash rewards</p>

              <ul class="mt-4 flex flex-col gap-3">
                <li
                  v-for="task in taskItems"
                  :key="task.id"
                  class="rounded-[12px] bg-bg-1 px-3 py-3"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0 w-[70%] text-[14px] font-[500] leading-[17px] text-text-1">
                      <span>
                        {{ task.title }}
                      </span>
                      <button
                        v-if="task.description || task.helpSections?.length"
                        type="button"
                        class="ml-1 inline-flex align-[-2px]"
                        :aria-label="task.title"
                        @click="openTaskRule(task)"
                      >
                        <ModalHelpIcon class="h-3.5 w-3.5 text-icon-2" />
                      </button>
                    </div>

                    <button
                      v-if="task.status === 'action'"
                      type="button"
                      class="shrink-0 rounded-[8px] bg-theme-primary px-3 py-2 text-[12px] font-[700] leading-[14px] text-text-4"
                      @click="handleTaskAction(task)"
                    >
                      {{ task.actionLabel }}
                    </button>
                    <span
                      v-else
                      class="shrink-0 rounded-[8px] border border-theme-primary px-3 py-1.5 text-[12px] font-[700] leading-[14px] text-theme-primary"
                    >
                      {{ task.actionLabel }}
                    </span>
                  </div>

                  <div class="mt-3 flex items-center gap-2">
                    <Progress
                      class="task-pop__progress flex-1"
                      :percentage="task.progress"
                      color="var(--color-theme-level-1)"
                      track-color="var(--color-theme-level-3)"
                      :show-pivot="false"
                      :stroke-width="6"
                    />
                    <span class="w-9 shrink-0 text-right text-[12px] leading-[14px] text-text-2">
                      {{ task.progress }}%
                    </span>
                  </div>
                </li>
              </ul>

              <div class="mt-4">
                <h4 class="text-[14px] font-[700] leading-[17px] text-text-1">Rules: :</h4>
                <ol class="mt-2 list-decimal space-y-2 pl-4 text-sm leading-[18px] text-text-2">
                  <li v-for="(rule, index) in ruleItems" :key="index">
                    {{ rule }}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <HelpPop
      v-model:visible="ruleVisible"
      :title="activeHelp.title"
      :content="activeHelp.content"
      :sections="activeHelp.sections"
    />
  </Teleport>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  MbTicketRecord,
  TicketProgressExt,
  TicketThresholdCondition
} from '@/api/interface/activity'
import { PAY_CHANNEL_TAB_LIST } from '@/constants/payChannelTabs'
import CloseIcon from '@/static/svg/close.svg?component'
import ModalHelpIcon from '@/static/img/lucky-spin/modal-help-icon.svg?component'
import { formatBalance, getCurrencySymbol, getLanguageCode } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { globalTicketToastState } from '../ticket/shell/ticketToast'
import { Progress } from 'vant'
import { computed, ref, watch } from 'vue'
import HelpPop from './help-pop.vue'

const CONDITION_RECHARGE = 1
const CONDITION_WAGERING = 2
const CONDITION_LOSS = 3
const CONDITION_INVITE = 4

interface HelpSection {
  title: string
  content: string
}

type TaskStatus = 'action' | 'completed'
type TaskActionType = 'deposit' | 'invite' | 'add' | 'complete' | 'link' | 'wagering' | 'loss'

interface TaskItem {
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

interface Props {
  ticketId?: number
  rowId?: number
}

const props = defineProps<Props>()
const visible = defineModel<boolean>('visible', { default: false })

const ticketId = computed(() => globalTicketToastState.activeTicketRecord?.ticketId)
const rowId = computed(() => globalTicketToastState.activeTicketRecord?.rowId)
const resolvedTicketId = computed(() => props.ticketId ?? ticketId.value)
const resolvedRowId = computed(() => props.rowId ?? rowId.value)

const ruleVisible = ref(false)
const activeHelp = ref({
  title: '',
  content: '',
  sections: [] as HelpSection[]
})

const currentLanguageCode = computed(() => getLanguageCode())
const voucherName = 'Voucher Name'

const taskItems = ref<TaskItem[]>([])

const isConditionEnabled = (condition?: TicketThresholdCondition) => condition?.enabled === 1

const isTargetMet = (current: number, target: number, operator = '>=') => {
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

const calcProgress = (current: number, target: number) => {
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

const buildTaskItems = (
  ticketData?: MbTicketRecord,
  progressData?: {
    bindData?: { bindWithdrawalAccount?: boolean; bindWithdrawalName?: boolean }
    completeVerification?: { verifyPhone?: boolean }
    ext?: TicketProgressExt
  }
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

const ruleItems = [
  'During the promo period, complete the voucher requirements to get rewards.',
  'Cash rewards will be credited directly to your account balance. You may check it under My Balance.',
  'Each user can join this promo only once during the promo period. Chances cannot be stacked, so please use it in time.',
  'If any irregular activity is detected, the platform reserves the right to cancel eligibility and withhold the reward.',
  'The platform reserves the final interpretation rights for this activity.'
]

const loadTaskData = async () => {
  if (!resolvedTicketId.value) return

  try {
    const [ticketResponse, progressResponse] = await Promise.all([
      Api.activity.mbTicketList({
        ticketId: resolvedTicketId.value,
        languageCode: currentLanguageCode.value
      }),
      Api.activity.ticketProgress({
        rowId: resolvedRowId.value,
        ticketId: resolvedTicketId.value
      })
    ])

    const ticketData = Array.isArray(ticketResponse.result)
      ? ticketResponse.result[0]
      : ticketResponse.result

    const progressData = Array.isArray(progressResponse.result)
      ? progressResponse.result[0]
      : progressResponse.result

    taskItems.value = buildTaskItems(ticketData, progressData)

    console.log('mbTicketList response:', ticketResponse)
    console.log('ticketProgress response:', progressResponse)
  } catch (error) {
    console.error('task-pop load failed:', error)
  }
}

watch(
  [visible, resolvedTicketId, resolvedRowId],
  ([nextVisible]) => {
    if (!nextVisible) return
    void loadTaskData()
  },
  { immediate: true }
)

const handleTaskAction = async (task: TaskItem) => {
  let targetPath = '/deposit'

  if (task.actionType === 'invite') {
    targetPath = '/referral'
  } else if (task.actionType === 'add') {
    targetPath = '/payment-methods'
  } else if (task.actionType === 'link') {
    targetPath = '/security'
  } else if (task.actionType === 'complete') {
    targetPath = '/security'
  } else if (task.actionType === 'wagering' || task.actionType === 'loss') {
    targetPath = '/casino'
  }

  await navigateTo(targetPath)
  visible.value = false
}

const openTaskRule = (task: TaskItem) => {
  activeHelp.value = {
    title: task.descriptionTitle ?? task.helpSections?.[0]?.title ?? task.title,
    content: task.description ?? '',
    sections: task.helpSections ?? []
  }
  ruleVisible.value = true
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.task-pop__body {
  -webkit-overflow-scrolling: touch;
}

.task-pop__progress {
  :deep(.van-progress),
  :deep(.van-progress__portion) {
    border-radius: 999px;
  }
}

.popup-fade-enter-active,
.popup-fade-leave-active,
.popup-scale-enter-active,
.popup-scale-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-scale-enter-active,
.popup-scale-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.popup-scale-enter-from,
.popup-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
