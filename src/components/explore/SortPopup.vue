<template>
  <OptionPopupCore
    v-slot="slotProps"
    :visible="props.visible"
    :list="props.sortList"
    :selectedId="props.selectedId"
    @update:visible="emit('update:visible', $event)"
    @confirm="emit('confirm', $event)"
  >
    <SortPopupMobile v-if="isMobile" v-bind="slotProps" />
    <SortPopupDesktop v-else v-bind="slotProps" />
  </OptionPopupCore>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OptionPopupCore from '@/components/explore/core/OptionPopupCore.vue'
import SortPopupMobile from '@/components/explore/mobile/SortPopup.vue'
import SortPopupDesktop from '@/components/explore/desktop/SortPopup.vue'
import { useIsMobile } from '@/utils/media'

type OptionItem = { id: number | string; name: string }

const props = defineProps<{
  visible: boolean
  sortList: OptionItem[]
  selectedId?: number | string
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: [val: OptionItem]
}>()

const isMobileRef = useIsMobile()
const isMobile = computed(() => isMobileRef.value)
</script>
