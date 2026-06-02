<template>
  <ul class="mt-4 flex flex-col gap-3">
    <li
      v-for="task in dialogState.reminder.tasks"
      :key="task.id"
      class="rounded-[10px] bg-bg-1 px-3 py-3"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[14px] font-[500] text-text-1">{{ task.title }}</span>
        <button
          v-if="!task.finished && task.actionType === 'deposit'"
          type="button"
          class="shrink-0 rounded-[6px] bg-theme-primary px-3 py-1 text-[12px] font-[700] text-text-4"
          @click="goTicketDeposit"
        >
          {{ t('luckySpinPage.reminder.deposit') }}
        </button>
        <span v-else-if="task.finished" class="shrink-0 text-[12px] font-[500] text-common-60">
          {{ t('luckySpinPage.reminder.finished') }}
        </span>
      </div>
      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-common-10">
        <div
          class="h-full rounded-full bg-theme-primary transition-all"
          :style="{ width: `${task.progress}%` }"
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { goTicketDeposit } from './composables/goTicketDeposit'
import { globalTicketDialogState } from '../../shell/ticketDialog'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const dialogState = globalTicketDialogState
</script>
