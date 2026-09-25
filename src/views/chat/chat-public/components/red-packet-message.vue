<template>
  <!-- 红包消息根据发送方显示在会话左右两侧。 -->
  <div
    class="flex w-full"
    :class="props.message.direction === 'outgoing' ? 'justify-end' : 'justify-start'"
  >
    <!-- 待领取红包可点击，已领取红包仅保留聊天记录展示。 -->
    <button
      type="button"
      class="relative shrink-0 overflow-hidden rounded-[10px] bg-[#F3674C] text-left transition-opacity disabled:cursor-default"
      :class="[
        props.displayMode === 'pc' ? 'h-[92px] w-[258px]' : 'h-[90px] w-[254px]',
        isClaimable ? 'cursor-pointer active:opacity-80' : 'opacity-70'
      ]"
      :disabled="!isClaimable"
      :aria-label="packetLabel"
      @click="$emit('claim', props.message)"
    >
      <!-- 红包主题图标。 -->
      <img
        :src="redPacketIcon"
        alt=""
        class="absolute left-[12px] top-[11px] h-[40px] w-[34px] object-fill"
      />

      <!-- 红包标题与当前状态。 -->
      <div class="absolute left-[58px] top-[14px]">
        <p class="font-inter text-[14px] font-[700] leading-[17px] text-[#FFD59E]">
          {{ t('chatPublic.redPacketGoodLuck') }}
        </p>
        <p class="mt-[4px] text-[12px] leading-[14px] text-[#FFD59E]">
          {{ packetLabel }}
        </p>
      </div>

      <!-- 红包信息区与时间的分隔线。 -->
      <i
        aria-hidden="true"
        class="absolute left-[12px] right-[12px] top-[64px] h-px bg-[#E65A3F]"
      />

      <!-- 红包来源与发送时间。 -->
      <span class="absolute bottom-[8px] left-[12px] text-[12px] leading-[14px] text-[#FFD59E]">
        {{ t('chatPublic.supportRedPacket') }}
      </span>
      <span class="absolute bottom-[8px] right-[12px] text-[12px] leading-[14px] text-[#FFD59E]">
        {{ props.message.time }} {{ props.message.period }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import redPacketIcon from '@/static/img/chat/public/red-packet-icon.svg'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatMessage } from '../types'

const props = withDefaults(
  defineProps<{
    message: ChatMessage
    loading?: boolean
    claimed?: boolean
    displayMode?: 'h5' | 'pc'
  }>(),
  {
    loading: false,
    claimed: false,
    displayMode: 'h5'
  }
)

defineEmits<{ claim: [message: ChatMessage] }>()

const { t } = useI18n()

/** 判断当前红包是否仍可由会员点击领取。 */
const isClaimable = computed(
  () => props.message.redPacket?.status === 0 && !props.claimed && !props.loading
)

/** 根据红包领取状态返回卡片中的操作文案。 */
const packetLabel = computed(() =>
  props.message.redPacket?.status === 1 || props.claimed
    ? t('chatPublic.claimed')
    : t('chatPublic.claimRedPacket')
)
</script>
