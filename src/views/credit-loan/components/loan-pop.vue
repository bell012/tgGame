<template>
  <Teleport to="body">
    <div>
      <transition name="loan-pop-fade">
        <div v-show="visible" class="fixed inset-0 z-[10020] bg-mask-60-1" />
      </transition>

      <transition name="loan-pop-scale">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex items-center justify-center px-4"
          @click.self="close"
        >
          <section
            role="dialog"
            aria-modal="true"
            :aria-label="t('creditLoan.loanPop.title')"
            class="loan-pop-container w-full max-w-[343px] rounded-2xl bg-bg-4 p-5 sm:max-w-[464px] sm:p-8"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-base font-[700] leading-5 text-text-1 sm:text-xl sm:leading-6">
                {{ t('creditLoan.loanPop.title') }}
              </h3>
              <button
                type="button"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-opacity-10 sm:h-6 sm:w-6"
                @click="close"
              >
                <CloseIcon class="h-2.5 w-2.5 text-text-1" />
              </button>
            </div>

            <div
              class="mt-4 flex h-[72px] items-center justify-center gap-2 rounded-xl bg-bg-2 sm:mt-5 sm:h-[86px] sm:gap-4"
            >
              <span class="text-[36px] font-[700] leading-none text-text-1 sm:text-[48px]">
                {{ formatBalance(props.amount) }}
              </span>
              <span class="text-sm text-text-1">{{ props.currency }}</span>
            </div>

            <button
              type="button"
              class="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4 sm:mt-6 sm:h-12"
              @click="handleAccept"
            >
              {{ t('creditLoan.loanPop.accept') }}
            </button>

            <p
              class="mt-4 text-center text-xs leading-[15px] text-text-1 sm:mt-5 sm:text-sm sm:leading-[17px]"
            >
              {{ t('creditLoan.loanPop.desc') }}
            </p>
          </section>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatBalance } from '@/utils/locale'
import CloseIcon from '@/static/svg/close.svg?component'

const props = withDefaults(
  defineProps<{
    visible: boolean
    amount: number
    currency?: string
  }>(),
  {
    currency: 'USD'
  }
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  accept: []
}>()

const { t } = useI18n()

const close = () => {
  emit('update:visible', false)
}

const handleAccept = () => {
  emit('accept')
  close()
}
</script>

<style scoped lang="scss">
.loan-pop-fade-enter-active,
.loan-pop-fade-leave-active,
.loan-pop-scale-enter-active,
.loan-pop-scale-leave-active {
  transition: opacity 0.24s ease;
}

.loan-pop-fade-enter-from,
.loan-pop-fade-leave-to,
.loan-pop-scale-enter-from,
.loan-pop-scale-leave-to {
  opacity: 0;
}

.loan-pop-scale-enter-active .loan-pop-container,
.loan-pop-scale-leave-active .loan-pop-container {
  transition: transform 0.24s ease;
}

.loan-pop-scale-enter-from .loan-pop-container,
.loan-pop-scale-leave-to .loan-pop-container {
  transform: translateY(18px) scale(0.96);
}
</style>
