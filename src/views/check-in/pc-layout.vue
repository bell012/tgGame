<template>
  <!-- PC 签到页面内容 -->
  <CheckInPageContent
    mode="pc"
    @close="$emit('close')"
    @rules="$emit('rules')"
    @action="$emit('action')"
  />
</template>

<script setup lang="ts">
import CheckInPageContent from './components/CheckInPageContent.vue'

defineEmits<{
  close: []
  rules: []
  action: []
}>()
</script>
