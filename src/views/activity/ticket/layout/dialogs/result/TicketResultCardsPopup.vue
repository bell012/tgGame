<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 bg-mask-60-1"
          :style="{ zIndex: TICKET_DIALOG_Z.resultMask }"
          @click.self="close"
        />
      </transition>

      <transition name="result-popup-transition">
        <div
          v-show="visible"
          class="fixed inset-0 flex flex-col items-center justify-center px-6 py-8"
          :style="{ zIndex: TICKET_DIALOG_Z.resultPanel }"
          @click.self="close"
        >
          <section
            role="dialog"
            aria-modal="true"
            class="modal-container w-full"
            :class="isMobile ? 'max-w-[320px]' : 'max-w-[440px]'"
          >
            <div class="flex flex-col items-center">
              <h2 class="text-[20px] font-[700] text-[#F7D060]">{{ resolvedTitle }}</h2>
              <p class="mt-1 text-center text-[13px] text-common-80">{{ resolvedSubtext }}</p>

              <div
                class="relative mt-4 w-full rounded-[16px] bg-[linear-gradient(123deg,#18884E_0%,#062917_100%)] px-4 pb-4 pt-8"
              >
                <div
                  class="absolute left-1/2 top-[-28px] flex -translate-x-1/2 items-center justify-center"
                >
                  <img
                    :src="LUCKY_SPIN_ASSETS.modals.ribbonGift"
                    alt=""
                    class="h-[56px] w-auto object-contain"
                  />
                </div>
                <div
                  class="flex flex-col gap-2"
                  :class="
                    vouchers.length > 1
                      ? isMobile
                        ? 'max-h-[220px] overflow-y-auto pr-1'
                        : 'max-h-[280px] overflow-y-auto pr-1'
                      : ''
                  "
                >
                  <TicketVoucherCard v-for="item in vouchers" :key="item.id" :data="item" />
                </div>
                <button
                  type="button"
                  class="mt-4 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
                  @click="close"
                >
                  {{ resolvedButtonText }}
                </button>
              </div>
            </div>
          </section>

          <button
            type="button"
            class="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-common-30 text-common-80"
            :aria-label="t('common.cancel')"
            @click="close"
          >
            ✕
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { useTicketResultCardsCopy } from './composables/useTicketResultCardsCopy'
import { useTicketResultCardsDialog } from './composables/useTicketResultCardsDialog'
import { LUCKY_SPIN_ASSETS, TICKET_DIALOG_Z } from '@/views/activity/ticket/shared/constants'
import TicketVoucherCard from './TicketVoucherCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, result, close } = useTicketResultCardsDialog()
const { vouchers, resolvedTitle, resolvedSubtext, resolvedButtonText } = useTicketResultCardsCopy(
  result,
  t
)
</script>

<style scoped lang="scss">
@use '../dialog-transitions.scss';
</style>
