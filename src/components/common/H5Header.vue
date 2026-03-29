<template>
  <!-- H5 公共头部 -->
  <div class="h-[49px]">
    <div class="flex items-center fixed left-0 top-0 px-[10px] h-[49px] w-full bg-bg-2 z-[99]">
      <!-- 左侧返回按钮 -->
      <div
        class="size-[33px] bg-opacity-5 rounded-md flex items-center justify-center cursor-pointer"
        @click="handleBack"
      >
        <ArrowLeftIcon class="w-3.5 h-3.5 text-text-1" />
      </div>

      <!-- 中间标题 -->
      <div class="flex flex-1 justify-center items-center text-base font-[700] text-text-1">
        <slot>{{ title }}</slot>
      </div>

      <!-- 右侧按钮 -->
      <div class="size-[33px] rounded-md flex items-center justify-center">
        <div
          v-if="showSort"
          class="size-[33px] bg-opacity-5 rounded-md flex items-center justify-center cursor-pointer"
          @click="handleSort"
        >
          <slot name="right">
            <!-- 默认图标 -->
            <SiftIcon class="w-3.5 h-3.5 text-text-1" />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import SiftIcon from '@/static/svg/sift.svg?component'

interface Props {
  title?: string
  showSort?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  showSort: false
})

const emit = defineEmits<{
  back: []
  sort: []
}>()

const router = useRouter()

const handleBack = () => {
  emit('back')
  router.back()
}

const handleSort = () => {
  emit('sort')
}
</script>

<style scoped lang="scss"></style>
