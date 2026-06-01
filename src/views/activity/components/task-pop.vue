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
            <p class="mt-2.5 text-[14px] leading-[20px] text-text-1">
              Win up to <span class="text-theme-primary">{{ maxReward }}</span> cash
            </p>

            <ul class="mt-4 flex flex-col gap-3">
              <li v-for="task in tasks" :key="task.id" class="rounded-[12px] bg-bg-1 px-3 py-3">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex min-w-0 items-center gap-1">
                    <span class="truncate text-[14px] font-[500] leading-[17px] text-text-1">
                      {{ task.title }}
                    </span>
                    <InfoIcon class="h-3.5 w-3.5 shrink-0 text-icon-2" />
                  </div>

                  <button
                    v-if="task.status === 'action'"
                    type="button"
                    class="shrink-0 rounded-[8px] bg-theme-primary px-3 py-1.5 text-[12px] font-[700] leading-[14px] text-text-4"
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
                <li>
                  During the promo period, complete the voucher requirements to get
                  <span class="text-theme-primary">{{ voucherName }}</span>
                  and win up to
                  <span class="text-theme-primary">{{ maxReward }}</span>
                  cash.
                </li>
                <li>
                  Cash rewards will be credited directly to your account balance. You may check it
                  under My Balance.
                </li>
                <li>
                  Each user can join this promo only once during the promo period. Chances cannot be
                  stacked, so please use it in time.
                </li>
                <li>
                  If any irregular activity is detected, including but not limited to cheating, fake
                  transactions, order brushing, or malicious abuse, the platform reserves the right
                  to cancel the user's eligibility and withhold the reward.
                </li>
                <li>
                  The platform reserves the final interpretation rights for this activity. For any
                  questions, please contact online customer service.
                </li>
              </ol>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import { Progress } from 'vant'

interface TaskItem {
  id: number
  title: string
  progress: number
  status: 'action' | 'completed'
  actionLabel: string
}

const visible = defineModel<boolean>('visible', { default: false })

const voucherName = 'Voucher Name'
const maxReward = '₱8,888'

const tasks: TaskItem[] = [
  {
    id: 1,
    title: 'Valid Bets ≥ ₱100',
    progress: 82,
    status: 'action',
    actionLabel: 'Deposit'
  },
  {
    id: 2,
    title: 'Valid Bets ≥ ₱100',
    progress: 100,
    status: 'completed',
    actionLabel: 'Completed'
  }
]

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
