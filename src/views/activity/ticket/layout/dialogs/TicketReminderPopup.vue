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

      <!-- Mobile: bottom sheet -->
      <transition v-if="isMobile" name="sheet-transition">
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

      <!-- Desktop: centered modal -->
      <transition v-else name="result-popup-transition">
        <div
          v-show="visible"
          class="fixed inset-0 flex items-center justify-center px-4 py-8"
          :style="{ zIndex: TICKET_DIALOG_Z.reminderSheet }"
          @click.self="close"
        >
          <section
            role="dialog"
            aria-modal="true"
            class="modal-container w-full max-w-[480px] rounded-[12px] bg-bg-2 px-6 py-5 shadow-[0_18px_54px_rgba(0,0,0,0.32)]"
            @click.stop
          >
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
          </section>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import { useTicketReminderDialog } from './composables/useTicketDialogVisible'
import { TICKET_DIALOG_Z } from '../../shared/constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, contentComponent, rules, close } = useTicketReminderDialog()
</script>

<style scoped lang="scss">
@use './dialog-transitions.scss';
</style>
