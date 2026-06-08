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
            class="relative w-full rounded-t-xl bg-bg-1 px-4 pb-5 pt-5 sm:max-w-[400px] sm:mx-auto"
          >
            <h3 class="text-center text-[18px] font-[700] leading-[22px] text-text-1">
              Kind Reminder
            </h3>

            <button
              type="button"
              class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-[6px] bg-opacity-10"
              aria-label="Close"
              @click="handleClose"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>

            <p class="mt-4 text-sm leading-[20px] text-text-1">
              Complete the tasks below to unlock
              <span class="text-theme-primary">{{ voucherName }}</span>
            </p>
            <p class="mt-2.5 text-[14px] leading-[20px] text-text-1">Win cash rewards</p>

            <div v-if="isLoading" class="mt-4 py-6 text-center text-[13px] text-text-2">
              {{ t('common.loading') }}
            </div>

            <div v-else-if="loadError" class="mt-4 py-6 text-center">
              <p class="text-[13px] text-text-2">{{ t('common.requestError') }}</p>
              <button
                type="button"
                class="mt-3 rounded-[8px] bg-theme-primary px-4 py-2 text-[12px] font-[700] text-text-4"
                @click="loadTaskData"
              >
                {{ t('luckySpinPage.retry') }}
              </button>
            </div>

            <ul v-else class="mt-4 flex flex-col gap-3">
              <li v-for="task in taskItems" :key="task.id" class="rounded-[12px] bg-bg-1 px-3 py-3">
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
                <li v-for="(rule, index) in ruleItems" :key="index" v-html="rule" />
              </ol>
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
import type { MbTicketRecord, TicketProgressResult } from '@/api/interface/activity'
import CloseIcon from '@/static/svg/close.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import { getLanguageCode } from '@/utils/locale'
import { navigateTo } from '@/utils/router'
import {
  getMbTicketLanguageCopy,
  normalizeMbTicketRecords
} from '@/views/activity/ticket/shared/mbTicketMapper'
import { globalTicketToastState } from '../ticket/shell/ticketToast'
import { Progress } from 'vant'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface TaskItem {
  id: string
  title: string
  progress: number
  status: 'action' | 'completed'
  actionLabel: string
  actionType?: 'deposit' | 'invite' | 'withdraw' | 'complete'
  description?: string
}

interface Props {
  ticketId?: number
  rowId?: number
}

const props = defineProps<Props>()
const ticketId = computed(() => globalTicketToastState.activeTicketRecord?.ticketId)
const rowId = computed(() => globalTicketToastState.activeTicketRecord?.rowId)
const resolvedTicketId = computed(() => props.ticketId ?? ticketId.value)
const resolvedRowId = computed(() => props.rowId ?? rowId.value)

const visible = defineModel<boolean>('visible', { default: false })
const { t } = useI18n()

const ticketRecord = ref<MbTicketRecord | null>(null)
const progressResult = ref<TicketProgressResult | null>(null)
const isLoading = ref(false)
const loadError = ref(false)
const ruleVisible = ref(false)
const activeRuleTitle = ref('')
const activeRuleText = ref('')

type TaskRecord = Record<string, unknown>

const asRecord = (value: unknown): TaskRecord =>
  value && typeof value === 'object' ? (value as TaskRecord) : {}

const pickFirst = (source: TaskRecord, keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const toPercent = (current: unknown, target: unknown, fallback = 0) => {
  const targetValue = toFiniteNumber(target)
  if (targetValue <= 0) return Math.min(100, Math.max(0, Math.round(fallback)))
  return Math.min(100, Math.max(0, Math.round((toFiniteNumber(current) / targetValue) * 100)))
}

const formatAmount = (value: unknown) => {
  const numberValue = toFiniteNumber(value)
  if (numberValue <= 0) return ''
  return `₱${numberValue.toLocaleString()}`
}

const normalizeText = (value: unknown) => String(value ?? '').trim()

const currentLanguageCode = computed(() => getLanguageCode())

const currentTicketSource = computed(() =>
  asRecord(ticketRecord.value ?? globalTicketToastState.activeTicketRecord)
)
const progressSource = computed(() => asRecord(progressResult.value?.ext))

const ticketCopy = computed(() =>
  getMbTicketLanguageCopy(
    ticketRecord.value ?? globalTicketToastState.activeTicketRecord,
    currentLanguageCode.value
  )
)

const voucherName = computed(() => ticketCopy.value.name || 'Voucher Name')

const buildTask = (
  id: string,
  title: string,
  current: unknown,
  target: unknown,
  actionLabel: string,
  actionType: TaskItem['actionType'],
  description: string
): TaskItem | null => {
  const targetValue = toFiniteNumber(target)
  if (targetValue <= 0) return null
  const progress = toPercent(current, target)
  return {
    id,
    title,
    progress,
    status: progress >= 100 ? 'completed' : 'action',
    actionLabel: progress >= 100 ? 'Completed' : actionLabel,
    actionType,
    description
  }
}

const mapApiTask = (rawTask: unknown, index: number): TaskItem | null => {
  const source = asRecord(rawTask)
  if (Object.keys(source).length === 0) return null

  const title = normalizeText(
    pickFirst(source, ['title', 'taskName', 'name', 'conditionName', 'displayName'])
  )
  const target = pickFirst(source, ['target', 'targetValue', 'required', 'requiredValue', 'amount'])
  const current = pickFirst(source, ['current', 'currentValue', 'progressValue', 'finishedValue'])
  const progressValue = pickFirst(source, ['progress', 'percent', 'percentage'])
  const progress =
    progressValue !== undefined ? toFiniteNumber(progressValue) : toPercent(current, target)
  const finished =
    Boolean(pickFirst(source, ['finished', 'completed', 'isCompleted'])) || progress >= 100
  const actionType = normalizeText(pickFirst(source, ['actionType', 'type'])).toLowerCase()

  return {
    id: normalizeText(pickFirst(source, ['id', 'taskId', 'code'])) || `api-task-${index}`,
    title: title || `Task ${index + 1}`,
    progress: Math.min(100, Math.max(0, Math.round(progress))),
    status: finished ? 'completed' : 'action',
    actionLabel:
      normalizeText(pickFirst(source, ['actionLabel', 'buttonText'])) ||
      (finished ? 'Completed' : resolveActionLabel(actionType)),
    actionType: resolveActionType(actionType),
    description: normalizeText(pickFirst(source, ['description', 'rule', 'ruleDesc', 'tips']))
  }
}

const resolveActionType = (value: string): TaskItem['actionType'] => {
  if (value.includes('invite') || value.includes('friend')) return 'invite'
  if (value.includes('withdraw')) return 'withdraw'
  if (value.includes('complete')) return 'complete'
  return 'deposit'
}

const resolveActionLabel = (value: string) => {
  const actionType = resolveActionType(value)
  if (actionType === 'invite') return 'Invite'
  if (actionType === 'withdraw') return 'Add'
  if (actionType === 'complete') return 'Completed'
  return 'Deposit'
}

const apiTaskItems = computed(() => {
  const source = currentTicketSource.value
  const rawTasks = pickFirst(source, [
    'tasks',
    'taskList',
    'conditions',
    'conditionList',
    'receiveConditions'
  ])
  if (!Array.isArray(rawTasks)) return []
  return rawTasks.map(mapApiTask).filter((task): task is TaskItem => Boolean(task))
})

const inferredTaskItems = computed(() => {
  const source = currentTicketSource.value
  const progress = progressSource.value
  const tasks: TaskItem[] = []

  const inviteTarget = pickFirst(source, [
    'validInviteFriends',
    'validInviteCount',
    'inviteFriends',
    'inviteCount',
    'friendCount'
  ])
  const inviteCurrent =
    pickFirst(source, [
      'currentValidInviteFriends',
      'currentInviteCount',
      'finishedInviteCount',
      'inviteProgress'
    ]) ?? pickFirst(progress, ['invitationNum'])
  const inviteTask = buildTask(
    'valid-invite',
    `Valid Invited Friends ≥ ${toFiniteNumber(inviteTarget)}`,
    inviteCurrent,
    inviteTarget,
    'Invite',
    'invite',
    'Invite valid friends during the promo period. The task is completed after the required number of valid friends is reached.'
  )
  if (inviteTask) tasks.push(inviteTask)

  const withdrawTarget = pickFirst(source, [
    'validWithdrawAmount',
    'withdrawAmount',
    'withdrawalAmount',
    'requiredWithdrawAmount'
  ])
  const withdrawCurrent =
    pickFirst(source, ['currentWithdrawAmount', 'finishedWithdrawAmount', 'withdrawProgress']) ??
    pickFirst(progress, ['bindWithdrawalAccount'])
  const withdrawTask = buildTask(
    'valid-withdraw',
    `Valid Withdrawal Amount ≥ ${formatAmount(withdrawTarget)}`,
    withdrawCurrent,
    withdrawTarget,
    'Add',
    'withdraw',
    'Only completed withdrawals during the promo period count toward this task.'
  )
  if (withdrawTask) tasks.push(withdrawTask)

  const depositTarget = pickFirst(source, [
    'validDepositAmount',
    'depositAmount',
    'rechargeAmount',
    'requiredDepositAmount',
    'totalDepositAmount'
  ])
  const depositCurrent =
    pickFirst(source, [
      'currentDepositAmount',
      'finishedDepositAmount',
      'rechargeProgress',
      'depositProgress'
    ]) ??
    pickFirst(progress, [
      'claimRechargeAmount',
      'rechargeAmount',
      'totalRechargeAmount',
      'fristRechargeAmount'
    ])
  const depositTask = buildTask(
    'valid-deposit',
    `Total Deposit Amount ≥ ${formatAmount(depositTarget)}`,
    depositCurrent,
    depositTarget,
    'Deposit',
    'deposit',
    'After receiving the voucher, your total deposit amount must reach the required amount for this task to be completed.'
  )
  if (depositTask) tasks.push(depositTask)

  const betTarget = pickFirst(source, ['validBetAmount', 'betAmount', 'requiredBetAmount'])
  const betCurrent =
    pickFirst(source, ['currentBetAmount', 'finishedBetAmount', 'betProgress']) ??
    pickFirst(progress, ['claimBetAmount', 'betAmount', 'totalBetAmount'])
  const betTask = buildTask(
    'valid-bet',
    `Valid Bets ≥ ${formatAmount(betTarget)}`,
    betCurrent,
    betTarget,
    'Deposit',
    'deposit',
    'Valid bets are calculated by the backend according to the activity rules.'
  )
  if (betTask) tasks.push(betTask)

  const bindData = progressResult.value?.bindData
  if (bindData?.bindWithdrawalAccount || bindData?.bindWithdrawalName) {
    const finished = Boolean(bindData.bindWithdrawalAccount && bindData.bindWithdrawalName)
    tasks.push({
      id: 'bind-withdrawal',
      title: 'Add Withdrawal Method',
      progress: finished ? 100 : 0,
      status: finished ? 'completed' : 'action',
      actionLabel: finished ? 'Completed' : 'Add',
      actionType: 'withdraw',
      description: 'Bind withdrawal account and withdrawal name to complete this condition.'
    })
  }

  const completeInfo = progressResult.value?.completeInfo
  if (completeInfo) {
    const required = [
      completeInfo.completeWhatsapp,
      completeInfo.completeFacebook,
      completeInfo.completeTelegram
    ].filter(value => value !== undefined)
    if (required.length > 0) {
      const completed = required.filter(Boolean).length
      const progressPercent = Math.round((completed / required.length) * 100)
      tasks.push({
        id: 'complete-contact',
        title: 'Complete Contact Info',
        progress: progressPercent,
        status: progressPercent >= 100 ? 'completed' : 'action',
        actionLabel: progressPercent >= 100 ? 'Completed' : 'Complete',
        actionType: 'complete',
        description: 'Complete required contact info such as Whatsapp, Facebook or Telegram.'
      })
    }
  }

  const completeVerification = progressResult.value?.completeVerification
  if (completeVerification?.verifyPhone !== undefined) {
    const finished = Boolean(completeVerification.verifyPhone)
    tasks.push({
      id: 'verify-phone',
      title: 'Verify Phone',
      progress: finished ? 100 : 0,
      status: finished ? 'completed' : 'action',
      actionLabel: finished ? 'Completed' : 'Complete',
      actionType: 'complete',
      description: 'Verify your phone number to complete this condition.'
    })
  }

  return tasks
})

const fallbackTaskItems = computed<TaskItem[]>(() => [
  {
    id: 'fallback-deposit',
    title: 'Total Deposit Amount ≥ ₱100',
    progress: 0,
    status: 'action',
    actionLabel: 'Deposit',
    actionType: 'deposit',
    description:
      'After receiving the voucher, your total deposit amount must reach the required amount for this task to be completed.'
  }
])

const taskItems = computed(() => {
  if (apiTaskItems.value.length > 0) return apiTaskItems.value
  if (inferredTaskItems.value.length > 0) return inferredTaskItems.value
  return fallbackTaskItems.value
})

const apiRules = computed(() => {
  const source = currentTicketSource.value
  const rawRules = pickFirst(source, ['rules', 'ruleList', 'ruleDesc', 'ruleDescription'])

  if (Array.isArray(rawRules)) {
    return rawRules.map(rule => normalizeText(rule)).filter(Boolean)
  }

  const text = normalizeText(rawRules)
  if (!text) return []
  return text
    .split(/\n+/)
    .map(rule => rule.trim())
    .filter(Boolean)
})

const ruleItems = computed(() => {
  if (apiRules.value.length > 0) return apiRules.value

  return [
    `During the promo period, complete the voucher requirements to get <span class="text-theme-primary">${voucherName.value}</span> and win cash rewards.`,
    'Cash rewards will be credited directly to your account balance. You may check it under My Balance.',
    'Each user can join this promo only once during the promo period. Chances cannot be stacked, so please use it in time.',
    'If any irregular activity is detected, including but not limited to cheating, fake transactions, order brushing, or malicious abuse, the platform reserves the right to cancel eligibility and withhold the reward.',
    'The platform reserves the final interpretation rights for this activity. For any questions, please contact online customer service.'
  ]
})

const loadTaskData = async () => {
  if (!resolvedTicketId.value) return

  isLoading.value = true
  loadError.value = false
  console.log('loadTaskData', resolvedTicketId.value, resolvedRowId.value)
  try {
    const [response, progressResponse] = await Promise.all([
      Api.activity.mbTicketList({
        ticketId: resolvedTicketId.value,
        languageCode: currentLanguageCode.value
      }),
      Api.activity.ticketProgress({
        rowId: resolvedRowId.value,
        ticketId: resolvedTicketId.value
      })
    ])
    console.log('mbTicketList response:', response)
    console.log('ticketProgress response:', progressResponse)

    if (!response.success) {
      throw new Error(response.message || 'mbTicketList failed')
    }

    const records = normalizeMbTicketRecords(response.result)
    ticketRecord.value =
      records.find(record => Number(record.ticketId) === Number(resolvedTicketId.value)) ??
      records[0] ??
      null

    if (progressResponse.success) {
      progressResult.value = progressResponse.result ?? null
    } else {
      progressResult.value = null
    }
  } catch (error) {
    console.error('task progress load failed:', error)
    loadError.value = true
    ticketRecord.value = null
    progressResult.value = null
  } finally {
    isLoading.value = false
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
