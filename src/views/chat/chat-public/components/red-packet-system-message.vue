<template>
  <!-- 红包领取完成后插入聊天记录中的系统提示。 -->
  <div
    class="flex w-full items-center justify-center gap-[4px] py-[2px] text-[12px] leading-[15px] text-text-2"
  >
    <img :src="redPacketIcon" alt="" class="h-[16px] w-[14px] shrink-0 object-fill" />
    <span>{{ t('chatPublic.claimedRedPacketPrefix') }}</span>
    <span class="text-secondary-2">{{ t('chatPublic.redPacket') }}</span>
    <span>{{ t('chatPublic.claimedRedPacketSuffix', { name: props.serviceName }) }}</span>
  </div>
</template>

<script setup lang="ts">
import redPacketIcon from '@/static/svg/chat/public/red-packet-icon.svg?url'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ serviceName: string }>()
const { t } = useI18n()
</script>
