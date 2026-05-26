<template>
  <casinoGameModule
    :module="singleModule"
    :loading="loading"
    view-all-mode="home"
    :show-favorite-card-badge="props.sysGameTypeCode === 'favorites'"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameBrandItem, GameDataItem } from '@/api/interface/game'
import type { HomeCollectionDisplayItem } from '@/stores/game'
import type { CasinoLobbyButtonItem } from '@/composables/useCasinoTabButtons'
import casinoGameModule from '@/views/fun/casino/components/casinoGameModule.vue'

interface Props {
  title?: string
  list?: (GameDataItem | HomeCollectionDisplayItem)[]
  sysGameTypeCode?: string
  brandItems?: GameBrandItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  list: (): (GameDataItem | HomeCollectionDisplayItem)[] => [],
  sysGameTypeCode: '',
  loading: false
})
const singleModule = computed<CasinoLobbyButtonItem>(() => {
  const code = props.sysGameTypeCode || ''
  return {
    sysGameTypeName: props.title || '',
    sysGameTypeCode: code,
    items: props.list ?? [],
    ...(code === 'providers' && props.brandItems?.length ? { brandItems: props.brandItems } : {})
  } as CasinoLobbyButtonItem
})
</script>
