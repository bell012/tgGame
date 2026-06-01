<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="receive-pop__mask fixed inset-0 z-[10020]"
          @click.self="handleOverlayClose"
        />
      </transition>

      <transition name="receive-pop-transition">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex flex-col items-center justify-center px-6 py-8"
          @click.self="handleOverlayClose"
        >
          <section role="dialog" aria-modal="true" class="receive-pop__dialog w-full max-w-[320px]">
            <h2 class="receive-pop__title text-center text-[32px] font-[700]">
              {{ resolvedTitle }}
            </h2>
            <p class="text-center text-[16px] leading-[18px] text-common-100">
              {{ resolvedSubtext }}
            </p>

            <div
              class="relative mt-12 w-full rounded-[24px] bg-[linear-gradient(123deg,#18884E_0%,#062917_100%)] px-4 pb-4 pt-8"
            >
              <div
                class="absolute left-1/2 top-[-43px] flex -translate-x-1/2 items-center justify-center"
              >
                <img
                  :src="titleBackImg"
                  alt=""
                  class="h-[64px] w-auto max-w-[280px] object-contain"
                />
              </div>

              <div class="flex items-center gap-3 rounded-[13px] bg-[#FFF9C4] px-3 py-2.5">
                <div class="flex h-[50px] w-[44px] shrink-0 items-center justify-center">
                  <img :src="eggImg" alt="" class="h-full w-full object-contain" />
                </div>
                <div class="min-w-0 flex-1 border-l border-dashed border-black/10 pl-3">
                  <p class="truncate text-[14px] font-[700] text-[#000]">
                    {{ voucherTitle }}
                  </p>
                  <p class="text-[13px] font-[400] text-[#8B7600]">
                    {{ rewardText }}
                  </p>
                  <p class="mt-1 text-[10px] text-[#8B7600] font-[400]">
                    {{ t('luckySpinPage.expiresOn') }} : {{ expiresAt }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="mt-4 flex h-[44px] w-full items-center justify-center rounded-[10px] bg-[#00E676] text-[15px] font-[700] text-[#1A1A1A]"
                @click="handleUseNow"
              >
                {{ resolvedButtonText }}
              </button>
            </div>
          </section>

          <button
            type="button"
            class="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-common-30 text-[18px] leading-none text-common-80"
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
import eggImg from '@/static/img/activity/receive-pop/egg.png'
import titleBackImg from '@/static/img/activity/receive-pop/title-back.png'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  title?: string
  subtext?: string
  buttonText?: string
  voucherCount?: number
  voucherTitle?: string
  rewardText?: string
  expiresAt?: string
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtext: undefined,
  buttonText: undefined,
  voucherCount: 1,
  voucherTitle: 'Golden Egg Voucher',
  rewardText: 'Win up to ₱888',
  expiresAt: '12/18/2026 11:14 AM',
  closeOnOverlay: true
})

const emit = defineEmits<{
  useNow: []
  close: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const { t } = useI18n()

const resolvedTitle = computed(() => props.title ?? t('luckySpinPage.result.congratulations'))

const resolvedSubtext = computed(
  () => props.subtext ?? t('luckySpinPage.result.receivedVouchers', { count: props.voucherCount })
)

const resolvedButtonText = computed(() => props.buttonText ?? t('luckySpinPage.result.useNow'))

const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleOverlayClose = () => {
  if (!props.closeOnOverlay) return
  handleClose()
}

const handleUseNow = () => {
  emit('useNow')
  handleClose()
}
</script>

<style scoped lang="scss">
.receive-pop__mask {
  background: var(--color-mask-60-1, rgb(0 0 0 / 60%));
  backdrop-filter: blur(5px);
}

.receive-pop__title {
  background: linear-gradient(180deg, #fffdf8 0%, #f9cf7b 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.popup-fade-enter-active,
.popup-fade-leave-active,
.receive-pop-transition-enter-active,
.receive-pop-transition-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to,
.receive-pop-transition-enter-from,
.receive-pop-transition-leave-to {
  opacity: 0;
}

.receive-pop-transition-enter-active .receive-pop__dialog,
.receive-pop-transition-leave-active .receive-pop__dialog {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
}

.receive-pop-transition-enter-from .receive-pop__dialog,
.receive-pop-transition-leave-to .receive-pop__dialog {
  transform: translateY(18px) scale(0.96);
}
</style>
