<template>
  <div class="ticket-game-stub min-h-[200px]" data-game-id="mystery_box">
    开盲盒网格界面
    <div>ticketId: {{ ticketId ?? '—' }}</div>
  </div>
</template>

<script setup lang="ts">
/** 开盲盒中间区 — 阶段 1 空壳，后续在此文件内填充 UI */
import { TICKET_ACTIVITY_CONTEXT_KEY } from '../../shell/ticketActivityContext'
import { computed, inject } from 'vue'

const ticketContext = inject(TICKET_ACTIVITY_CONTEXT_KEY)

/** 当前选中票券（券种条切换时随 activeTicketRecord 更新） */
const ticketId = computed(() => ticketContext?.activeTicketRecord.value?.ticketId)
</script>
