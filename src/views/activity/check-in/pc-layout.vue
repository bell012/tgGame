<template>
  <!-- PC 签到页面内容 -->
  <CheckInPageContent
    mode="pc"
    :view-data="props.viewData"
    :loading="props.loading"
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
  loading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  rules: []
  action: []
}>()
</script>
