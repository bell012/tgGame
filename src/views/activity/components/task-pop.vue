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
                {{ t('ticketPage.taskPop.title') }}
              </h3>

              <button
                type="button"
                class="absolute right-4 top-5 flex h-6 w-6 items-center justify-center rounded-[6px] bg-opacity-10"
                :aria-label="t('ticketPage.taskPop.closeAriaLabel')"
                @click="handleClose"
              >
                <CloseIcon class="h-2.5 w-2.5 text-text-1" />
              </button>
            </div>

            <div class="task-pop__body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
              <p class="text-sm leading-[20px] text-text-1">
                {{ t('ticketPage.taskPop.introUnlockPrefix') }}
                <span class="text-theme-primary">{{ voucherName }}</span>
              </p>
              <p class="mt-2.5 text-[14px] leading-[20px] text-text-1">
                {{ t('ticketPage.taskPop.introReward') }}
              </p>

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
                <h4 class="text-[14px] font-[700] leading-[17px] text-text-1">
                  {{ t('ticketPage.taskPop.rules.title') }}:
                </h4>
                <ol class="mt-2 list-decimal space-y-2 pl-4 text-sm leading-[18px] text-text-2">
                  <li>
                    <span>{{ completeRequirementsRule.prefix }}</span>
                    <span class="text-theme-primary">{{ voucherName }}</span>
                    <span>{{ completeRequirementsRule.suffix }}</span>
                  </li>
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
import CloseIcon from '@/static/svg/close.svg?component'
import ModalHelpIcon from '@/static/img/lucky-spin/modal-help-icon.svg?component'
import { globalTicketToastState } from '../ticket/shell/ticketToast'
import {
  getTicketTaskCompleteRequirementsRule,
  getTicketTaskRuleItems
} from '../ticket/shared/ticketTaskMapper'
import { useTaskHelpPop } from '../ticket/shared/useTaskHelpPop'
import { useTicketTaskActions } from '../ticket/shared/useTicketTaskActions'
import { useTicketTaskData } from '../ticket/shared/useTicketTaskData'
import { Progress } from 'vant'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HelpPop from './help-pop.vue'

interface Props {
  ticketId?: number
  rowId?: number
}

const props = defineProps<Props>()
const visible = defineModel<boolean>('visible', { default: false })
const { t } = useI18n()

const ticketId = computed(() => globalTicketToastState.activeTicketRecord?.ticketId)
const rowId = computed(() => globalTicketToastState.activeTicketRecord?.rowId)
const resolvedTicketId = computed(() => props.ticketId ?? ticketId.value)
const resolvedRowId = computed(() => props.rowId ?? rowId.value)

const handleClose = () => {
  visible.value = false
}

const { taskItems, voucherName: fetchedVoucherName } = useTicketTaskData({
  visible,
  ticketId: resolvedTicketId,
  rowId: resolvedRowId
})
const voucherName = computed(() => fetchedVoucherName.value || t('ticketPage.taskPop.voucherName'))
const translateTask = (key: string, params?: Record<string, unknown>) => t(key, params ?? {})
const completeRequirementsRule = computed(() =>
  getTicketTaskCompleteRequirementsRule(translateTask)
)
const ruleItems = computed(() => getTicketTaskRuleItems(translateTask))
const { ruleVisible, activeHelp, openTaskRule } = useTaskHelpPop()
const { handleTaskAction } = useTicketTaskActions(handleClose)
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
