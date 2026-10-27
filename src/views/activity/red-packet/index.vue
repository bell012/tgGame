<template>
  <!-- H5 红包页面 -->
  <div class="flex h-[100dvh] flex-col bg-[#292D2E]">
    <H5Header v-show="view === 'list'" title="Red Pocket" class="shrink-0" />
    <RedPacketPanel @update:view="view = $event" display-mode="h5" class="min-h-0 flex-1" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import H5Header from '@/components/common/H5Header.vue'
import RedPacketPanel from './components/RedPacketPanel.vue'
import type { RedPacketPanelView } from './useRedPacketList'

const view = ref<RedPacketPanelView>('list')
</script>
