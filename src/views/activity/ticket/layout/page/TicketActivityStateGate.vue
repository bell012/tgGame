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
import type { TicketActivitySession } from '../../shared/types'
import type { TicketActivityCoreEmits } from './activity-props'
import TicketActivityStatePanel from './TicketActivityStatePanel.vue'
import type { CSSProperties } from 'vue'

defineProps<{
  isLoading: boolean
  loadError: boolean
  activitySession: TicketActivitySession | null
  stateLayout: 'mobile' | 'desktop'
  panelStyle?: CSSProperties
}>()

const emit = defineEmits<Pick<TicketActivityCoreEmits, 'retry'>>()
</script>
