<template>
  <TicketDialogOverlay
    :visible="visible"
    :mask-z-index="TICKET_DIALOG_Z.reminderMask"
    :panel-z-index="TICKET_DIALOG_Z.reminderSheet"
    layout="sheet"
    @close="close"
  >
    <template v-if="isMobile">
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
        @click="close"
      >
        {{ t('luckySpinPage.result.ok') }}
      </button>
    </template>

    <template v-else>
      <div class="relative flex items-start justify-between gap-4">
        <h3 class="text-[18px] font-[700] text-text-1">
          {{ t('luckySpinPage.reminder.title') }}
        </h3>
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-bg-3"
          :aria-label="t('common.cancel')"
          @click="close"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </div>

      <component :is="contentComponent" v-if="contentComponent" />

      <div class="mt-4">
        <h4 class="text-[14px] font-[700] text-text-1">
          {{ t('luckySpinPage.reminder.rulesTitle') }}
        </h4>
        <ol class="mt-2 list-decimal space-y-1 pl-4 text-[12px] leading-[18px] text-text-2">
          <li v-for="(rule, index) in rules" :key="index">{{ rule }}</li>
        </ol>
      </div>
    </template>
  </TicketDialogOverlay>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import { TICKET_DIALOG_Z } from '../../../shared/constants'
import TicketDialogOverlay from '../shared/TicketDialogOverlay.vue'
import { useTicketReminderDialog } from './useTicketReminderDialog'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, contentComponent, rules, close } = useTicketReminderDialog()
</script>
