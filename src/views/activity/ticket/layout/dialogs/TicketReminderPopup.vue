<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10010] bg-mask-60-1"
          @click.self="handleClose"
        />
      </transition>

      <transition name="sheet-transition">
        <div
          v-show="visible"
          class="fixed inset-x-0 bottom-0 z-[10011] mx-auto max-w-[480px] rounded-t-[20px] bg-bg-2 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-5"
        >
          <h3 class="text-center text-[18px] font-[700] text-text-1">
            {{ t('luckySpinPage.reminder.title') }}
          </h3>

          <component :is="contentComponent" v-if="contentComponent" />

          <div class="mt-4">
            <h4 class="text-[14px] font-[700] text-text-1">
              {{ t('luckySpinPage.reminder.rulesTitle') }}
            </h4>
            <ol class="mt-2 list-decimal space-y-1 pl-4 text-[12px] leading-[18px] text-text-2">
              <li v-for="(rule, index) in rules" :key="index">{{ rule }}</li>
            </ol>
          </div>

          <button
            type="button"
            class="mt-5 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
            @click="handleClose"
          >
            {{ t('luckySpinPage.result.ok') }}
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { closeTicketDialog, globalTicketDialogState } from '../../shell/ticketDialog'
import TicketReminderTasksContent from './TicketReminderTasksContent.vue'
import TicketTaskSuccessContent from './TicketTaskSuccessContent.vue'
import type { Component } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const dialogState = globalTicketDialogState

const visible = computed(
  () => dialogState.kind === 'reminder' || dialogState.kind === 'task_success'
)

const contentComponent = computed<Component | null>(() => {
  if (dialogState.kind === 'task_success') return TicketTaskSuccessContent
  if (dialogState.kind === 'reminder') return TicketReminderTasksContent
  return null
})

const rules = computed(() =>
  dialogState.kind === 'task_success' ? dialogState.taskSuccess.rules : dialogState.reminder.rules
)

const handleClose = () => {
  closeTicketDialog()
}
</script>

<style scoped lang="scss">
.popup-fade-enter-active,
.popup-fade-leave-active,
.sheet-transition-enter-active,
.sheet-transition-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.sheet-transition-enter-active,
.sheet-transition-leave-active {
  transition: transform 0.28s ease;
}

.sheet-transition-enter-from,
.sheet-transition-leave-to {
  transform: translateY(100%);
}
</style>
