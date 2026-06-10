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
                    <div class="flex min-w-0 items-center gap-1">
                      <span class="truncate text-[14px] font-[500] leading-[17px] text-text-1">
                        {{ task.title }}
                      </span>
                      <button
                        v-if="task.description"
                        type="button"
                        class="shrink-0"
                        :aria-label="task.title"
                        @click="openTaskRule(task)"
                      >
                        <InfoIcon class="h-3.5 w-3.5 text-icon-2" />
                      </button>
                    </div>

                    <button
                      v-if="task.status === 'action'"
                      type="button"
                      class="shrink-0 rounded-[8px] bg-theme-primary px-3 py-1.5 text-[12px] font-[700] leading-[14px] text-text-4"
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

    <transition name="popup-fade">
      <div
        v-show="ruleVisible"
        class="fixed inset-0 z-[10011] flex items-end justify-center bg-mask-60-1 px-4 sm:items-center"
        @click.self="ruleVisible = false"
      >
        <section
          class="mb-4 w-full max-w-[320px] rounded-[8px] bg-bg-1 p-3 sm:mb-0"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-center justify-between gap-3">
            <h4 class="text-[13px] font-[700] text-theme-primary">{{ activeRuleTitle }}</h4>
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded-[6px]"
              aria-label="Close"
              @click="ruleVisible = false"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>
          </div>
          <p class="mt-2 whitespace-pre-line text-[12px] leading-[18px] text-text-2">
            {{ activeRuleText }}
          </p>
          <button
            type="button"
            class="mt-4 flex h-9 w-full items-center justify-center rounded-[8px] bg-theme-primary text-[13px] font-[700] text-text-4"
            @click="ruleVisible = false"
          >
            Get It
          </button>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  MbTicketRecord,
  TicketProgressExt,
  TicketThresholdCondition
} from '@/api/interface/activity'
import CloseIcon from '@/static/svg/close.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import { formatBalance, getLanguageCode } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import { globalTicketToastState } from '../ticket/shell/ticketToast'
import { Progress } from 'vant'
import { computed, ref, watch } from 'vue'

const CONDITION_RECHARGE = 1
const CONDITION_WAGERING = 2
const CONDITION_LOSS = 3
const CONDITION_INVITE = 4

interface TaskItem {
  id: string
  title: string
  progress: number
  status: 'action' | 'completed'
  actionLabel: string
  actionType?: 'deposit' | 'invite' | 'withdraw' | 'complete' | 'wagering' | 'loss'
  description?: string
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
const activeRuleTitle = ref('')
const activeRuleText = ref('')

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
  return currency ? `${currency} ${formatted}` : formatted
}

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

const createProgressTask = (
  id: string,
  title: string,
  current = 0,
  target = 0,
  operator = '>=',
  actionType: TaskItem['actionType'],
  pendingLabel: string,
  description?: string
): TaskItem => {
  const satisfied = isTargetMet(current, target, operator)
  const progress = satisfied ? 100 : calcProgress(current, target)

  return {
    id,
    title,
    progress,
    status: satisfied ? 'completed' : 'action',
    actionLabel: satisfied ? 'Completed' : pendingLabel,
    actionType,
    description
  }
}

const createStatusTask = (
  id: string,
  title: string,
  satisfied: boolean | undefined,
  actionType: TaskItem['actionType'],
  pendingLabel = 'Add'
): TaskItem | null => {
  if (satisfied === undefined) return null

  return {
    id,
    title,
    progress: satisfied ? 100 : 0,
    status: satisfied ? 'completed' : 'action',
    actionLabel: satisfied ? 'Completed' : pendingLabel,
    actionType
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
        createProgressTask(
          'recharge-deposit-amount',
          `Total Deposit Amount ${operator} ${formatThresholdAmount(target, currency)}`,
          current,
          target,
          operator,
          'deposit',
          'Deposit',
          'After receiving the voucher, your total deposit amount must reach the required amount for this task to be completed.'
        )
      )
    }

    if (isConditionEnabled(rechargeCondition?.depositCount)) {
      const condition = rechargeCondition!.depositCount!
      const target = condition.count ?? 0
      const current = getRechargeExtValue(ext, condition, true) ?? 0
      const operator = condition.operator ?? operatorFallback

      items.push(
        createProgressTask(
          'recharge-deposit-count',
          `Deposit Count ${operator} ${target}`,
          current,
          target,
          operator,
          'deposit',
          'Deposit'
        )
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
        createProgressTask(
          'wagering-valid-bet',
          `Valid Bet ${operator} ${formatThresholdAmount(target, currency)}`,
          current,
          target,
          operator,
          'wagering',
          'Bet'
        )
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
        createProgressTask(
          'loss-game-amount',
          `Game Loss Amount  ${operator} ${formatThresholdAmount(target, currency)}`,
          current,
          target,
          operator,
          'loss',
          'Play'
        )
      )
    }
  }

  if (conditionTypes.includes(CONDITION_INVITE)) {
    const inviteFriendCount = ticketData?.inviteCondition?.inviteFriendCount
    if (inviteFriendCount !== undefined && inviteFriendCount > 0) {
      const current = ext?.invitationNum ?? 0

      items.push(
        createProgressTask(
          'invite-friend-count',
          `Valid Invited Friends ${operatorFallback} ${inviteFriendCount}`,
          current,
          inviteFriendCount,
          operatorFallback,
          'invite',
          'Invite'
        )
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

  const withdrawalAccountTask = createStatusTask(
    'bind-withdrawal-account',
    'Add Withdrawal Method',
    bindData?.bindWithdrawalAccount,
    'withdraw'
  )
  if (withdrawalAccountTask) items.push(withdrawalAccountTask)

  const withdrawalNameTask = createStatusTask(
    'bind-withdrawal-name',
    'Add Account Name',
    bindData?.bindWithdrawalName,
    'withdraw'
  )
  if (withdrawalNameTask) items.push(withdrawalNameTask)

  const verifyPhoneTask = createStatusTask(
    'verify-phone',
    'Link Mobile Number',
    completeVerification?.verifyPhone,
    'complete',
    'Verify'
  )
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

const handleTaskAction = (task: TaskItem) => {
  if (task.actionType === 'invite') {
    void navigateTo('/referral')
    return
  }

  if (task.actionType === 'withdraw') {
    void navigateTo('/withdraw')
    return
  }

  if (task.actionType === 'complete') {
    void navigateTo('/security')
    return
  }

  if (task.actionType === 'wagering' || task.actionType === 'loss') {
    void navigateTo('/')
    return
  }

  void navigateTo('/deposit')
}

const openTaskRule = (task: TaskItem) => {
  activeRuleTitle.value = task.title
  activeRuleText.value = task.description ?? ''
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
