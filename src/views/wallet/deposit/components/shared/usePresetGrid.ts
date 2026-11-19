import { computed, nextTick, ref, type Ref, watch } from 'vue'

const PRESET_ROW_LIMIT = 2

// 管理预设金额网格的展开状态与回滚行为
export const usePresetGrid = (
  presetsRef: Ref<HTMLDivElement | null>,
  presetAmounts?: Ref<number[]>,
  columns?: number
) => {
  const expanded = ref(false)
  // 未传入数量时保持原行为，展开按钮由调用方自己决定是否显示
  const canExpand = computed(() => {
    if (!presetAmounts || !columns) return true
    return presetAmounts.value.length > columns * PRESET_ROW_LIMIT
  })

  watch(canExpand, value => {
    if (!value) expanded.value = false
  })

  watch(expanded, async isExpanded => {
    if (isExpanded) return

    await nextTick()
    presetsRef.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })

  return {
    expanded,
    canExpand
  }
}
