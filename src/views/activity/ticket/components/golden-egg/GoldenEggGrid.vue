<template>
  <div class="ticket-game-stub min-h-[200px]" data-game-id="golden_egg">
    砸金蛋网格界面
    <div>ticketId: {{ ticketId ?? '—' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { globalTicketToastState } from '../../shell/ticketToast'

/** 当前选中票券（券种条切换时随 activeTicketRecord 更新） */
const ticketId = computed(() => globalTicketToastState.activeTicketRecord?.ticketId)
</script>
