<template>
  <!-- 顶部搜索 -->
  <div class="relative bg-[var(--color-background-level-1)]">
    <div
      class="border border-solid text-[14px] border-[#3a4142] rounded-md h-[40px] flex items-center justify-between p-[8px]"
      @click="visible = true"
    >
      <div class="flex gap-[10px]">
        <div class="text-[var(--color-text-level-3)]">{{ label }}</div>
        <div>{{ inputText }}</div>
      </div>
      <div class="bg-[var(--color-background-level-2)] rounded-md">
        <div class="icon size-4 transition-all -rotate-90">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <!-- 搜索类型弹窗 -->
    <Teleport to="body" v-if="isMobile">
      <popup
        v-model:visible="visible"
        :dataList="dataList"
        :selectedIds="modelValue"
        @confirm="handleConfirm"
      />
    </Teleport>
    <popup
      v-else
      class="desktop-popup"
      v-model:visible="visible"
      :dataList="dataList"
      :selectedIds="modelValue"
      @confirm="handleConfirm"
      desktop
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Popup from './popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

interface OptionItem {
  value: string
  label: string
  [string: string]: string | number
}

const props = defineProps<{
  modelValue: string[]
  label: string
  dataList: OptionItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string[]]
  change: [val: string[]]
}>()

const isMobile = useIsMobile()
const visible = ref(false)

const inputText = computed(() => {
  if (props.modelValue.length === 0) {
    return '全部'
  }
  return '+' + props.modelValue.length
})

const handleConfirm = (data: string[]) => {
  emit('change', data)
  emit('update:modelValue', data)
}
</script>

<style scoped lang="scss">
.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 288px;
}
.icon {
  width: 24px;
  height: 24px;
  padding: 4px;
  fill: currentColor;
}
</style>
