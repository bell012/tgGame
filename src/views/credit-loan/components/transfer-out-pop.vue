<template>
  <Teleport to="body">
    <div>
      <transition name="transfer-pop-fade">
        <div v-show="visible" class="fixed inset-0 z-[10020] bg-mask-60-1" />
      </transition>

      <transition name="transfer-pop-scale">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex items-center justify-center px-4"
          @click.self="close"
        >
          <section
            role="dialog"
            aria-modal="true"
            :aria-label="t('creditLoan.transferPop.title')"
            class="transfer-pop-container w-full max-w-[343px] rounded-2xl bg-bg-4 p-5 sm:max-w-[464px] sm:p-8"
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

            <div class="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
              <div
                v-for="row in balanceRows"
                :key="row.label"
                class="flex h-11 items-center justify-between gap-3 rounded-lg bg-bg-2 px-3 sm:h-12"
              >
                <span class="min-w-0 truncate text-sm text-text-1 sm:text-base">
                  {{ row.label }}
                </span>
                <span class="shrink-0 text-sm font-[700] text-text-1">
                  ${{ formatBalance(row.value) }}
                </span>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:h-12"
              :disabled="!canTransfer"
              @click="handleTransferAll"
            >
              {{ t('creditLoan.transferPop.transferAll') }}
            </button>

            <p class="mt-4 text-xs leading-[18px] text-text-1 sm:mt-5 sm:text-sm sm:leading-5">
              {{ t('creditLoan.transferPop.desc') }}
            </p>
          </section>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatBalance } from '@/utils/locale'
import CloseIcon from '@/static/svg/close.svg?component'

const props = defineProps<{
  visible: boolean
  loanBalance: number
  transferableBalance: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'transfer-all': []
}>()

const { t } = useI18n()

const balanceRows = computed(() => [
  { label: t('creditLoan.transferPop.loanBalance'), value: props.loanBalance },
  { label: t('creditLoan.transferPop.transferableBalance'), value: props.transferableBalance }
])

const close = () => {
  emit('update:visible', false)
}

const canTransfer = computed(() => props.transferableBalance > 0)

const handleTransferAll = () => {
  if (!canTransfer.value) return

  emit('transfer-all')
  close()
}
</script>

<style scoped lang="scss">
.transfer-pop-fade-enter-active,
.transfer-pop-fade-leave-active,
.transfer-pop-scale-enter-active,
.transfer-pop-scale-leave-active {
  transition: opacity 0.24s ease;
}

.transfer-pop-fade-enter-from,
.transfer-pop-fade-leave-to,
.transfer-pop-scale-enter-from,
.transfer-pop-scale-leave-to {
  opacity: 0;
}

.transfer-pop-scale-enter-active .transfer-pop-container,
.transfer-pop-scale-leave-active .transfer-pop-container {
  transition: transform 0.24s ease;
}

.transfer-pop-scale-enter-from .transfer-pop-container,
.transfer-pop-scale-leave-to .transfer-pop-container {
  transform: translateY(18px) scale(0.96);
}
</style>
