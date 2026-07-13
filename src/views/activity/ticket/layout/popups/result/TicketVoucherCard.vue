<template>
  <div
    class="flex h-[76.67px] items-center gap-3 rounded-[13px] px-3"
    :style="{ background: resolvedBg }"
  >
    <div
      class="flex shrink-0 items-center justify-center"
      :class="isMobile ? 'h-[56px] w-[50px]' : 'h-[72px] w-[64px]'"
    >
      <img :src="resolvedIcon" alt="" class="max-h-full max-w-full object-contain" />
    </div>
    <div class="min-w-0 flex-1 border-l border-dashed border-black/10 pl-3">
      <p class="truncate text-[13px] font-[700] text-[#1A1A1A]">{{ data.title }}</p>
      <p class="mt-0.5 text-[12px] font-[500]" :style="{ color: textColors.reward }">
        {{ data.rewardText }}
      </p>
      <p class="mt-0.5 text-[10px]" :style="{ color: textColors.meta }">
        {{ t('luckySpinPage.expiresOn') }}: {{ data.expiresAt }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import type { TicketVoucherCardData } from '@/views/activity/ticket/shared/types'
import {
  getGameIcon,
  getVoucherCardBg,
  getVoucherCardTextColors
} from '@/views/activity/ticket/shared/constants'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  data: TicketVoucherCardData
}

const props = defineProps<Props>()
const { t } = useI18n()
const isMobile = useIsMobile()

const resolvedBg = computed(() => props.data.bgColor ?? getVoucherCardBg(props.data.type))

const textColors = computed(() => getVoucherCardTextColors(props.data.type))

const resolvedIcon = computed(() => props.data.icon ?? getGameIcon(props.data.type))
</script>
