<template>
  <!-- 无客服可用时的空状态。 -->
  <div class="flex flex-1 flex-col items-center justify-center px-6 pb-[72px] text-center">
    <img :src="emptyImage" alt="" class="h-[200px] w-[220px] object-contain" />
    <p class="mt-[18px] text-[12px] font-medium text-text-1">
      {{ t('chatPublic.noAgentsOnline') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import emptyImage from '@/static/img/chat/public/chat-empty.jpg'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
