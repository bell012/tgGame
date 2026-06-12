<template>
  <p class="mt-3 text-center text-[14px] font-[500] leading-[20px] text-text-1">
    {{
      t('luckySpinPage.reminder.unlocked', {
        voucherName: dialogState.taskSuccess.voucherName
      })
    }}
  </p>
</template>

<script setup lang="ts">
import { globalTicketDialogState } from '../../../shell/ticketDialog'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const dialogState = globalTicketDialogState
</script>
