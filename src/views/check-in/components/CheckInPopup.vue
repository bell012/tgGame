<template>
  <!-- 将签到弹窗挂载到 body，避免受页面层级影响 -->
  <Teleport to="body">
    <!-- 签到弹窗遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex items-start justify-center overflow-hidden sm:items-center sm:bg-mask-60-1 sm:px-4 sm:py-8 sm:backdrop-blur-[2px]"
      :style="
        isMobile
          ? { background: 'var(--color-mask-60-1, #00000099)', backdropFilter: 'blur(5px)' }
          : undefined
      "
    >
      <!-- H5 签到弹窗布局 -->
      <CheckInMobileLayout
        v-if="isMobile"
        @close="handleClose"
        @rules="$emit('rules')"
        @action="$emit('action')"
      />
      <!-- PC 签到弹窗布局 -->
      <CheckInPcLayout
        v-else
        @close="handleClose"
        @rules="$emit('rules')"
        @action="$emit('action')"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import CheckInMobileLayout from '../mobile-layout.vue'
import CheckInPcLayout from '../pc-layout.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  rules: []
  action: []
}>()

const isMobile = useIsMobile()

// 关闭签到弹窗并同步外层显示状态。
const handleClose = () => {
  emit('update:modelValue', false)
}
</script>
