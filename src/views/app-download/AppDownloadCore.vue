<template>
  <slot
    :download-links="downloadLinks"
    :handle-download="handleDownload"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 下载链接配置
const downloadLinks = ref({
  ios: '',
  android: ''
})

// 下载
const handleDownload = (platform: 'ios' | 'android') => {
  console.log('下载:', platform)
}

defineExpose({
  downloadLinks,
  handleDownload
})
</script>

