<template>
  <div v-if="showIntro" class="mt-4 space-y-1 text-[14px] leading-[20px] text-text-1">
    <p>
      {{ t('luckySpinPage.reminder.introUnlockPrefix') }}
      <span class="font-[700] text-theme-primary">{{ introVoucherName }}</span>
    </p>
    <p>
      {{ t('luckySpinPage.reminder.introRewardPrefix') }}
      <span class="font-[700] text-theme-primary">{{ introMaxPrize }}</span>
      {{ t('luckySpinPage.reminder.introRewardSuffix') }}
    </p>
  </div>

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
        <button
          v-else-if="task.finished"
          type="button"
          disabled
          class="shrink-0 rounded-[6px] border border-theme-primary bg-transparent px-3 py-1 text-[12px] font-[700] text-theme-primary"
        >
          {{ t('luckySpinPage.reminder.completed') }}
        </button>
      </div>
      <div class="mt-2 flex items-center gap-2">
        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-common-10">
          <div
            class="h-full rounded-full bg-theme-primary transition-all"
            :style="{ width: `${task.progress}%` }"
          />
        </div>
        <span class="shrink-0 text-[12px] font-[500] text-text-2">{{ task.progress }}%</span>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { globalTicketDialogState } from '../../../shell/ticketDialog'
import { goTicketDeposit } from '../shared/goTicketDeposit'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const dialogState = globalTicketDialogState

const showIntro = computed(
  () =>
    dialogState.kind === 'reminder' &&
    Boolean(dialogState.reminder.voucherName || dialogState.reminder.maxPrizeText)
)

const introVoucherName = computed(() => dialogState.reminder.voucherName)
const introMaxPrize = computed(() => dialogState.reminder.maxPrizeText)
</script>
