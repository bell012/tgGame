<template>
  <popShell v-model="visible" :transition-type="isMobile ? 'bottom-sheet' : 'modal'">
    <section
      class="bg-bg-2 text-text-1"
      :class="
        isMobile
          ? 'w-full rounded-t-[18px] px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4'
          : 'mx-auto w-[420px] max-w-[calc(100vw-40px)] rounded-[12px] px-4 pb-5 pt-3 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
      "
    >
      <div class="relative flex items-center justify-center">
        <h3
          class="text-center font-[700] text-text-1"
          :class="isMobile ? 'text-[20px] leading-[24px]' : 'text-[16px] leading-[20px]'"
        >
          {{ t('rebatePage.eligiblePopup.title') }}
        </h3>
        <button
          type="button"
          class="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[10px] bg-bg-3 text-text-1"
          :class="isMobile ? 'h-[40px] w-[40px]' : 'h-[28px] w-[28px]'"
          @click="visible = false"
        >
          <CloseIcon :class="'h-2.5 w-2.5 text-text-1'" />
        </button>
      </div>

      <div class="mt-5 rounded-[12px] bg-bg-3" :class="isMobile ? 'px-4 py-5' : 'px-4 py-4'">
        <div class="flex items-center justify-between gap-3 text-text-2">
          <span :class="isMobile ? 'text-[12px] leading-[16px]' : 'text-[14px] leading-[20px]'">
            {{ t('rebatePage.eligiblePopup.pendingRebateTurnover') }}
          </span>
          <span class="shrink-0 text-right text-text-1" :class="valueClass">
            {{ pendingRebateTurnoverText }}
          </span>
        </div>

        <div
          class="mt-4 flex items-center justify-between gap-3 text-text-2"
          :class="isMobile ? 'text-[12px] leading-[16px]' : 'text-[14px] leading-[20px]'"
        >
          <span>{{ t('rebatePage.eligiblePopup.promoBonusTurnoverDeduction') }}</span>
          <span class="shrink-0 text-right text-text-1" :class="valueClass">
            {{ promoBonusTurnoverDeductionText }}
          </span>
        </div>

        <div
          class="mt-4 flex items-center justify-between gap-3"
          :class="isMobile ? 'text-[12px] leading-[16px]' : 'text-[14px] leading-[20px]'"
        >
          <span class="text-text-2">{{
            t('rebatePage.eligiblePopup.eligibleRebateTurnover')
          }}</span>
          <span class="shrink-0 text-right text-theme-primary" :class="valueClass">
            {{ eligibleTurnoverText }}
          </span>
        </div>
      </div>

      <div class="mt-6">
        <p class="font-[700] text-text-1" :class="isMobile ? 'text-[12px]' : 'text-[14px]'">
          {{ t('rebatePage.eligiblePopup.calculationRuleTitle') }}
        </p>
        <p
          class="mt-2 text-text-2"
          :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
        >
          {{ t('rebatePage.eligiblePopup.calculationRuleContent') }}
        </p>
      </div>

      <div class="mt-6">
        <p class="font-[700] text-text-1" :class="isMobile ? 'text-[12px]' : 'text-[14px]'">
          {{ t('rebatePage.eligiblePopup.promoBonusNoteTitle') }}
        </p>
        <p
          class="mt-2 text-text-2"
          :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
        >
          {{ t('rebatePage.eligiblePopup.promoBonusNoteContent') }}
        </p>
      </div>
    </section>
  </popShell>
</template>

<script setup lang="ts">
import popShell from '@/components/withdraw/popShell.vue'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  eligibleTurnoverText: string
  isMobile: boolean
  modelValue: boolean
  pendingRebateTurnoverText: string
  promoBonusTurnoverDeductionText: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const valueClass = computed(() => {
  return props.isMobile ? 'text-[14px]' : 'text-[16px]'
})

useLockBodyScroll(visible)
</script>

<style scoped lang="scss"></style>
