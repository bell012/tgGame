<template>
  <casinoGameModule :module="singleModule" :loading="loading" view-all-mode="home" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameDataItem } from '@/api/interface/game'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import casinoGameModule from '@/views/fun/casino/components/casinoGameModule.vue'

interface Props {
  title?: string
  list?: GameDataItem[]
  sysGameTypeCode?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  list: (): GameDataItem[] => [],
  sysGameTypeCode: '',
  loading: false
})
const singleModule = computed<CasinoLobbyButtonItem>(() => {
  return {
    sysGameTypeName: props.title || '',
    sysGameTypeCode: props.sysGameTypeCode || '',
    items: props.list ?? []
  } as CasinoLobbyButtonItem
})
</script>
