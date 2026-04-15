<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-mask-60-1 px-5">
    <div class="relative overflow-hidden" :class="modeConfig.cardClass">
      <SmartImage :src="ruleBgImage" alt="Claim Success" class="block w-full" />

      <div class="absolute inset-0 flex flex-col items-center" :class="modeConfig.contentClass">
        <p class="text-center font-[700] text-common-100" :class="modeConfig.amountClass">
          {{ amount }}
        </p>
        <p class="text-center font-[700] text-common-100" :class="modeConfig.titleClass">
          {{ $t('vipPage.claimPopup.title') }}
        </p>
        <p class="text-center text-common-60" :class="modeConfig.descriptionClass">
          {{ $t('vipPage.claimPopup.description') }}
        </p>

        <button
          type="button"
          class="flex items-center justify-center rounded-lg bg-theme-primary font-[700] text-text-4"
          :class="modeConfig.buttonClass"
          @click="$emit('confirm')"
        >
          {{ $t('vipPage.claimPopup.ok') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ruleBgImage from '@/static/img/personalCenter/rule_bg.webp'

const props = withDefaults(
  defineProps<{
    amount: string
    mode?: 'mobile' | 'pc'
  }>(),
  {
    mode: 'mobile'
  }
)

defineEmits<{
  confirm: []
}>()

const modeConfig = computed(() => {
  if (props.mode === 'pc') {
    return {
      cardClass: 'w-[480px]',
      contentClass: 'px-[32px] pt-[150px]',
      amountClass: 'text-[48px] leading-none',
      titleClass: 'mt-[48px] text-[20px] leading-none',
      descriptionClass: 'mt-[12px] text-[16px] leading-[22px]',
      buttonClass: 'mt-[40px] h-[48px] w-[416px] text-[16px]'
    }
  }

  return {
    cardClass: 'w-[300px]',
    contentClass: 'px-[20px] pt-[80px]',
    amountClass: 'text-3xl',
    titleClass: 'mt-[20px] text-base',
    descriptionClass: 'mt-[7px] text-sm',
    buttonClass: 'mt-[14px] h-[40px] w-[240px] text-sm'
  }
})
</script>
