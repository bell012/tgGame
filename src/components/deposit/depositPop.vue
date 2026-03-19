<template>
  <div class="min-h-screen">
    <!-- H5端 - 统一布局 -->
    <div v-if="isMobile" class="sm:hidden"></div>
    <!-- PC端 - 大于640px显示 -->
    <teleport v-if="!isMobile" to="body">
      <transition name="modal-fade">
        <div
          v-if="modelValue"
          class="fixed inset-0 bg-[#000a] flex items-center justify-center z-[10000] overflow-hidden"
          @click.self="handleClose"
        >
          <div
            class="relative w-full max-w-[480px] h-full sm:max-h-[704px] overflow-hidden rounded-2xl modal-container"
          ></div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'

const isMobile = useIsMobile()

interface Props {
  modelValue: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss"></style>
