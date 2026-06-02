<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 bg-mask-60-1"
          :style="{ zIndex: TICKET_DIALOG_Z.reminderMask }"
          @click.self="close"
        />
      </transition>

      <transition name="sheet-transition">
        <div
          v-show="visible"
          class="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-[20px] bg-bg-2 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-5"
          :style="{ zIndex: TICKET_DIALOG_Z.reminderSheet }"
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
            @click="close"
          >
            {{ t('luckySpinPage.result.ok') }}
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useTicketReminderDialog } from './composables/useTicketDialogVisible'
import { TICKET_DIALOG_Z } from '../../shared/constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { visible, contentComponent, rules, close } = useTicketReminderDialog()
</script>

<style scoped lang="scss">
@use './dialog-transitions.scss';
</style>
