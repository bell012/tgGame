<!--
  票券活动全局入口（App.vue 挂载一次）

  职责边界：
  - 本文件：Teleport + 挂载子树，不含业务编排
  - TicketActivityOrchestrator：活动页 session / 券种切换 / provide 上下文（layout/）
  - layout/popups/*：二级弹窗，自读 globalTicketDialogState，零 props
-->
<template>
  <Teleport to="body">
    <!-- 活动页编排（Header / 玩法区 / 券种条） -->
    <TicketActivityOrchestrator />
    <TaskPop
      v-model:visible="taskPopVisible"
      :ticket-id="toastState.activeTicketRecord?.ticketId"
      :row-id="toastState.activeTicketRecord?.rowId"
    />
    <!-- 二级 overlay 弹窗：任务提醒 / 中奖结果 -->
    <TicketReminderPopup />
    <TicketResultHeroPopup />
    <TicketResultCardsPopup />
  </Teleport>
</template>

<script setup lang="ts">
import TaskPop from '../components/task-pop.vue'
import { TicketReminderPopup, TicketResultCardsPopup, TicketResultHeroPopup } from './layout/popups'
import TicketActivityOrchestrator from './layout/TicketActivityOrchestrator.vue'
import { closeTicketTaskPop, globalTicketToastState, openTicketTaskPop } from './shell/ticketToast'
import { computed } from 'vue'

const toastState = globalTicketToastState

const taskPopVisible = computed({
  get: () => toastState.taskPopVisible,
  set: value => {
    if (value) {
      openTicketTaskPop()
      return
    }
    closeTicketTaskPop()
  }
})
</script>
