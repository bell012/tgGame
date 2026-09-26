<template>
  <section class="shrink-0" :aria-label="t('sports.betSlip.result.title')">
    <div class="relative mx-[18px] mt-[18px] h-[177px] text-center">
      <button
        type="button"
        class="absolute right-0 top-0 flex h-[18px] w-[18px] items-center justify-center text-text-3 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
        :aria-label="t('sports.betSlip.result.close')"
        @click="emit('dismiss')"
      >
        <CloseIcon class="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
      <div class="absolute inset-x-0 top-9 flex justify-center" aria-hidden="true">
        <SuccessIcon v-if="props.state === 'success'" class="h-[60px] w-[60px]" />
        <span
          v-else
          class="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-text-3"
        >
          <CloseIcon class="h-9 w-9 text-text-1" />
        </span>
      </div>
      <p class="absolute inset-x-0 top-[132px] text-sm font-bold leading-[17px]" role="status">
        {{
          t(
            props.state === 'success'
              ? 'sports.betSlip.result.success'
              : 'sports.betSlip.result.failed'
          )
        }}
      </p>
      <p class="absolute inset-x-0 top-[156px] text-[11px] leading-[15px] text-text-2">
        {{ t('sports.betSlip.result.simulation') }}
      </p>
    </div>
    <div class="mt-[18px] flex flex-col gap-3 px-3 pb-[18px]">
      <button type="button" :class="buttonClass" @click="emit('history')">
        {{ t('sports.betSlip.result.history') }}
      </button>
      <button type="button" :class="buttonClass" @click="emit('reuse')">
        {{ t('sports.betSlip.result.reuse') }}
      </button>
      <button type="button" :class="buttonClass" @click="emit('share')">
        {{ t('sports.betSlip.result.share') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import SuccessIcon from '@/static/svg/mobile_success.svg?component'

const props = defineProps<{ state: 'success' | 'failed' }>()
const { t } = useI18n()
const emit = defineEmits<{ dismiss: []; reuse: []; history: []; share: [] }>()
const buttonClass =
  'flex h-[49px] w-full items-center justify-center rounded-full bg-bg-2 px-4 text-sm font-bold text-text-1 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary'
</script>
