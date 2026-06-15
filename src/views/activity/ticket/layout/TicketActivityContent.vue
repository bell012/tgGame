<template>
  <TicketActivityStatePanel
    v-if="isLoading"
    state="loading"
    :layout="stateLayout"
    :panel-style="panelStyle"
  />
  <TicketActivityStatePanel
    v-else-if="loadError"
    state="error"
    :layout="stateLayout"
    :panel-style="panelStyle"
    @retry="emit('retry')"
  />
  <slot v-else-if="activitySession" />
</template>

<script setup lang="ts">
import type { TicketActivityContentProps, TicketActivityCoreEmits } from './types/layout-props'
import TicketActivityStatePanel from './TicketActivityStatePanel.vue'

defineProps<{
  isLoading: boolean
  loadError: boolean
  activitySession: TicketActivityContentProps['activitySession']
  stateLayout: 'mobile' | 'desktop'
  panelStyle?: Record<string, string>
}>()

const emit = defineEmits<Pick<TicketActivityCoreEmits, 'retry'>>()
</script>
