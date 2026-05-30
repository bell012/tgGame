<template>
  <!-- H5 签到页面内容 -->
  <CheckInPageContent
    mode="mobile"
    :view-data="props.viewData"
    @close="$emit('close')"
    @rules="$emit('rules')"
    @action="$emit('action')"
  />
</template>

<script setup lang="ts">
import CheckInPageContent from './components/CheckInPageContent.vue'
import type { CheckInViewData } from './shared'

interface Props {
  viewData: CheckInViewData
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  rules: []
  action: []
}>()
</script>
