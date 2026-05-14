<!-- 专属权益说明弹窗 -->
<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center bg-mask-60-1">
    <div
      class="w-full max-w-[300px] rounded-[14px] bg-bg-1 px-[20px] pb-[37px] pt-[20px] sm:max-w-[490px] sm:rounded-[24px] sm:p-[32px]"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-base font-[700] text-text-1 sm:text-xl">
          {{ $t('vipPage.benefitExplainPopup.title') }}
        </h3>

        <button
          type="button"
          class="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-opacity-10 sm:h-[24px] sm:w-[24px] sm:rounded-[4px]"
          @click="$emit('close')"
        >
          <CloseIcon class="h-2.5 w-2.5 text-text-1" />
        </button>
      </div>

      <div class="mt-[14px] space-y-[14px] sm:mt-[24px] sm:space-y-3">
        <p v-for="item in explainItems" :key="item" class="text-sm text-text-2 sm:text-sm">
          {{ item }}
        </p>
      </div>

      <div
        class="mt-[30px] flex flex-col gap-[13px] sm:mt-[24px] sm:flex-row-reverse sm:justify-end sm:gap-6"
      >
        <button
          type="button"
          class="h-[40px] w-full rounded-[8px] bg-theme-primary text-sm font-[700] text-text-4 sm:h-[49px] sm:w-full sm:text-sm sm:rounded-[8px]"
          @click="$emit('close')"
        >
          {{ $t('vipPage.benefitExplainPopup.confirm') }}
        </button>
        <button
          type="button"
          class="h-[40px] w-full rounded-[8px] bg-opacity-10 text-sm font-[400] text-text-2 sm:h-[49px] sm:w-full sm:font-[700] sm:text-sm sm:rounded-[8px]"
          @click="$emit('close')"
        >
          {{ $t('vipPage.benefitExplainPopup.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'

defineEmits<{
  close: []
}>()

const { t } = useI18n()

const explainItems = computed(() => [
  t('vipPage.benefitExplainPopup.item1'),
  t('vipPage.benefitExplainPopup.item2'),
  t('vipPage.benefitExplainPopup.item3')
])
</script>
