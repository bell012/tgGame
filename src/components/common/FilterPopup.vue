<template>
  <!-- 公共筛选组件 -->
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed z-[9999] inset-0 bg-mask-60-1" @click="close" />
    </transition>

    <transition name="up-down">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full">
        <div class="filter-panel bg-bg-1 rounded-t-xl p-3.5 pb-5">
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex-1 text-center text-base font-[700] text-text-1">
              {{ props.titleText || $t('common.filter') }}
            </div>
            <button class="text-theme-primary text-xs font-[700]" @click="handleApply">
              {{ props.applyText || $t('common.apply') }}
            </button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto">
            <div v-for="(group, index) in filterGroups" :key="index" class="mb-5 last:mb-0">
              <h3 class="text-text-1 text-xs font-normal mb-2.5">
                {{ group.title }}
              </h3>
              <div :class="['grid gap-[7px]', getColumnsClass(group.columns)]">
                <button
                  v-for="option in group.options"
                  :key="option.value"
                  :class="[
                    'h-[40px] rounded-lg text-xs font-[400] transition-all',
                    isSelected(index, option.value)
                      ? 'bg-theme-primary text-text-4 font-[700]'
                      : 'bg-bg-2 text-text-2'
                  ]"
                  @click="handleSelect(index, option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterGroup {
  key?: string
  title: string
  options: FilterOption[]
  multiple?: boolean
  /** 每行展示的按钮数量，不传默认 3 */
  columns?: number
}

// 把 columns 数值映射到固定的 Tailwind 类，保证 JIT 能识别
const COLUMNS_CLASS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6'
}

const getColumnsClass = (columns?: number) =>
  COLUMNS_CLASS_MAP[columns ?? 3] ?? COLUMNS_CLASS_MAP[3]

interface Props {
  visible: boolean
  filterGroups: FilterGroup[]
  modelValue?: Record<string, string | string[]>
  titleText?: string
  applyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:modelValue': [value: Record<string, string | string[]>]
  apply: [value: Record<string, string | string[]>]
}>()

const selectedValues = ref<Record<string, string | string[]>>({})

const getGroupKey = (group: FilterGroup, index: number) => group.key ?? String(index)

// 初始化默认选中第一个选项
const initDefaultValues = () => {
  const defaultValues: Record<string, string | string[]> = {}
  props.filterGroups.forEach((group, index) => {
    const key = getGroupKey(group, index)
    if (group.options.length > 0) {
      if (group.multiple) {
        defaultValues[key] = [group.options[0].value]
      } else {
        defaultValues[key] = group.options[0].value
      }
    }
  })
  return defaultValues
}

const getInitialValues = () => ({
  ...initDefaultValues(),
  ...props.modelValue
})

watch(
  [() => props.visible, () => props.modelValue, () => props.filterGroups],
  ([visible]) => {
    if (visible) {
      selectedValues.value = getInitialValues()
    }
  },
  { immediate: true, deep: true }
)

// 判断是否选中
const isSelected = (groupIndex: number, value: string): boolean => {
  const key = getGroupKey(props.filterGroups[groupIndex], groupIndex)
  const selected = selectedValues.value[key]

  if (Array.isArray(selected)) {
    return selected.includes(value)
  }
  return selected === value
}

// 处理选择
const handleSelect = (groupIndex: number, value: string) => {
  const group = props.filterGroups[groupIndex]
  const key = getGroupKey(group, groupIndex)

  if (group.multiple) {
    // 多选模式
    const current = (selectedValues.value[key] as string[]) || []
    const index = current.indexOf(value)

    if (index > -1) {
      selectedValues.value[key] = current.filter(v => v !== value)
    } else {
      selectedValues.value[key] = [...current, value]
    }
  } else {
    // 单选模式
    selectedValues.value[key] = value
  }
}

// 关闭弹窗
const close = () => {
  emit('update:visible', false)
}

// 应用筛选
const handleApply = () => {
  emit('update:modelValue', selectedValues.value)
  emit('apply', selectedValues.value)
  close()
}
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.filter-panel {
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  overflow: hidden;
}

@include popup-transition;
</style>
