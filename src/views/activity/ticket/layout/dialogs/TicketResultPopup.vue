<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10020] bg-mask-60-1"
          @click.self="handleOverlayClose"
        />
      </transition>

      <transition name="result-popup-transition">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex flex-col items-center justify-center px-6 py-8"
          @click.self="handleOverlayClose"
        >
          <section role="dialog" aria-modal="true" class="modal-container w-full max-w-[320px]">
            <div v-if="isVoucherVariant" class="flex flex-col items-center">
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
                  class="flex max-h-[220px] flex-col gap-2 overflow-y-auto"
                  :class="vouchers.length > 1 ? 'pr-1' : ''"
                >
                  <TicketVoucherCard v-for="item in vouchers" :key="item.id" :data="item" />
                </div>
                <button
                  type="button"
                  class="mt-4 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
                  @click="handleClose"
                >
                  {{ resolvedButtonText }}
                </button>
              </div>
            </div>

            <div v-else class="flex flex-col items-center">
              <h2 class="text-[18px] font-[700] text-common-100">{{ resolvedTitle }}</h2>
              <p class="mt-1 text-[28px] font-[700] text-[#F7D060]">{{ resolvedHighlight }}</p>
              <p v-if="resolvedSubtext" class="mt-1 text-[13px] text-common-60">
                {{ resolvedSubtext }}
              </p>

              <div
                v-if="resolvedHeroImage"
                class="my-4 flex h-[160px] w-[160px] items-center justify-center"
              >
                <img :src="resolvedHeroImage" alt="" class="h-full w-full object-contain" />
              </div>

              <button
                type="button"
                class="flex h-[44px] w-full max-w-[280px] items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
                @click="handleClose"
              >
                {{ resolvedButtonText }}
              </button>
            </div>
          </section>

          <button
            type="button"
            class="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-common-30 text-common-80"
            :aria-label="t('common.cancel')"
            @click="handleClose"
          >
            ✕
          </button>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { closeTicketDialog, globalTicketDialogState } from '../../shell/ticketDialog'
import { LUCKY_SPIN_ASSETS } from '../../shared/assets'
import { RESULT_HERO_IMAGES } from '../../shared/constants'
import TicketVoucherCard from './TicketVoucherCard.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const dialogState = globalTicketDialogState

const visible = computed(() => dialogState.kind === 'result')
const result = computed(() => dialogState.result)
const variant = computed(() => result.value.variant)
const vouchers = computed(() => result.value.vouchers)

const isVoucherVariant = computed(
  () => variant.value === 'voucher_single' || variant.value === 'voucher_multi'
)

const resolvedTitle = computed(() => {
  if (result.value.title) return result.value.title
  if (isVoucherVariant.value) return t('luckySpinPage.result.congratulations')
  if (variant.value === 'no_prize') return t('luckySpinPage.result.sorry')
  return t('luckySpinPage.result.congratsWon')
})

const resolvedHighlight = computed(() => result.value.highlightText ?? '')

const resolvedHeroImage = computed(() => {
  if (result.value.heroImage) return result.value.heroImage
  if (variant.value === 'cash' || variant.value === 'spin_again' || variant.value === 'no_prize') {
    return RESULT_HERO_IMAGES[variant.value]
  }
  return ''
})

const resolvedSubtext = computed(() => {
  if (result.value.subtext) return result.value.subtext
  if (isVoucherVariant.value) {
    const count = result.value.voucherCount || vouchers.value.length
    return t('luckySpinPage.result.receivedVouchers', { count })
  }
  if (variant.value === 'cash') return t('luckySpinPage.result.creditedToWallet')
  if (variant.value === 'spin_again') return t('luckySpinPage.result.extraSpin')
  if (variant.value === 'no_prize') return t('luckySpinPage.result.betterLuck')
  return ''
})

const resolvedButtonText = computed(() => {
  if (result.value.buttonText) return result.value.buttonText
  if (isVoucherVariant.value) return t('luckySpinPage.result.useNow')
  if (variant.value === 'cash') return t('luckySpinPage.result.nextRound')
  return t('luckySpinPage.result.ok')
})

const handleClose = () => {
  closeTicketDialog()
}

const handleOverlayClose = () => {
  handleClose()
}
</script>

<style scoped lang="scss">
.popup-fade-enter-active,
.popup-fade-leave-active,
.result-popup-transition-enter-active,
.result-popup-transition-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to,
.result-popup-transition-enter-from,
.result-popup-transition-leave-to {
  opacity: 0;
}

.result-popup-transition-enter-active :deep(.modal-container),
.result-popup-transition-leave-active :deep(.modal-container) {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
}

.result-popup-transition-enter-from :deep(.modal-container),
.result-popup-transition-leave-to :deep(.modal-container) {
  transform: translateY(18px) scale(0.96);
}
</style>
