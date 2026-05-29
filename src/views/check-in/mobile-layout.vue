<template>
  <!-- H5 签到页面内容 -->
  <CheckInPageContent
    mode="mobile"
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
