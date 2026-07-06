<template>
  <!-- H5 公共头部 -->
  <div class="h-[49px]">
    <div
      :class="
        props.fixedTop
          ? 'fixed left-0 top-0 z-[99] flex h-[49px] w-full items-center bg-bg-2 px-[10px]'
          : 'relative z-[1] flex h-[49px] w-full items-center bg-bg-2 px-[10px]'
      "
    >
      <!-- 左侧返回按钮 -->
      <div class="size-[33px] flex items-center justify-center">
        <button
          v-if="props.showBack"
          type="button"
          class="size-[33px] bg-opacity-5 rounded-md flex items-center justify-center cursor-pointer"
          @click="handleBack"
        >
          <ArrowLeftIcon :class="props.leftIconClass || 'h-3.5 w-3.5 text-text-1'" />
        </button>
      </div>

      <!-- 中间标题 -->
      <div class="flex flex-1 justify-center items-center text-base font-[700] text-text-1">
        <slot>{{ props.title }}</slot>
      </div>

      <!-- 右侧按钮 -->
      <div class="size-[33px] rounded-md flex items-center justify-center">
        <div
          v-if="props.showSort"
          class="size-[33px] bg-opacity-5 rounded-md flex items-center justify-center cursor-pointer"
          @click="handleSort"
        >
          <component
            :is="props.rightIcon || SiftIcon"
            :class="props.rightIconClass || 'h-3.5 w-3.5 text-text-1'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import SiftIcon from '@/static/svg/sift.svg?component'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  title?: string
  showSort?: boolean
  showBack?: boolean
  leftIconClass?: string
  rightIcon?: Component
  rightIconClass?: string
  fixedTop?: boolean
  disableDefaultBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showSort: false,
  showBack: true,
  leftIconClass: '',
  rightIconClass: '',
  fixedTop: true,
  disableDefaultBack: false
})

const emit = defineEmits<{
  back: []
  sort: []
}>()

const router = useRouter()

const handleBack = () => {
  emit('back')
  if (!props.disableDefaultBack) {
    router.back()
  }
}

const handleSort = () => {
  emit('sort')
}
</script>

<style scoped lang="scss"></style>
