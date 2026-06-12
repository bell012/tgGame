<template>
  <div class="ticket-game-stub min-h-[200px]" data-game-id="golden_egg">
    砸金蛋网格界面
    <div>ticketId: {{ ticketId ?? '—' }}</div>
  </div>
</template>

<script setup lang="ts">
import { TICKET_ACTIVITY_CONTEXT_KEY } from '../../shell/ticketActivityContext'
import { computed, inject } from 'vue'

const ticketContext = inject(TICKET_ACTIVITY_CONTEXT_KEY)

/** 当前选中票券（券种条切换时随 activeTicketRecord 更新） */
const ticketId = computed(() => ticketContext?.activeTicketRecord.value?.ticketId)
</script>
