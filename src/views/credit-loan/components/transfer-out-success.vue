<template>
  <Teleport to="body">
    <div>
      <transition name="transfer-success-fade">
        <div v-show="visible" class="fixed inset-0 z-[10020] bg-mask-60-1" />
      </transition>

      <transition name="transfer-success-scale">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex items-center justify-center px-4"
          @click.self="close"
        >
          <section
            role="dialog"
            aria-modal="true"
            :aria-label="t('creditLoan.transferSuccess.title')"
            class="transfer-success-container w-full max-w-[343px] rounded-2xl bg-bg-4 p-5 sm:max-w-[464px] sm:p-8"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-base font-[700] leading-5 text-text-1 sm:text-xl sm:leading-6">
                {{ t('creditLoan.transferPop.title') }}
              </h3>
              <button
                type="button"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-opacity-10 sm:h-6 sm:w-6"
                @click="close"
              >
                <CloseIcon class="h-2.5 w-2.5 text-text-1" />
              </button>
            </div>

            <div class="mt-5 flex flex-col items-center sm:mt-6">
              <img :src="successIcon" alt="" class="h-14 w-14 sm:h-[68px] sm:w-[68px]" />
              <p
                class="mt-4 text-center text-base font-[700] leading-5 text-text-1 sm:mt-5 sm:text-xl sm:leading-6"
              >
                {{ t('creditLoan.transferSuccess.title') }}
              </p>
              <p
                class="mt-3 text-center text-xs leading-[15px] text-text-1 sm:mt-4 sm:text-sm sm:leading-[17px]"
              >
                {{ t('creditLoan.transferSuccess.desc') }}
              </p>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import successIcon from '../img/success.svg?url'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { t } = useI18n()

const close = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.transfer-success-fade-enter-active,
.transfer-success-fade-leave-active,
.transfer-success-scale-enter-active,
.transfer-success-scale-leave-active {
  transition: opacity 0.24s ease;
}

.transfer-success-fade-enter-from,
.transfer-success-fade-leave-to,
.transfer-success-scale-enter-from,
.transfer-success-scale-leave-to {
  opacity: 0;
}

.transfer-success-scale-enter-active .transfer-success-container,
.transfer-success-scale-leave-active .transfer-success-container {
  transition: transform 0.24s ease;
}

.transfer-success-scale-enter-from .transfer-success-container,
.transfer-success-scale-leave-to .transfer-success-container {
  transform: translateY(18px) scale(0.96);
}
</style>
