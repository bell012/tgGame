import { nextTick, ref, type Ref, watch } from 'vue'

// 管理预设金额网格的展开状态与回滚行为
export const usePresetGrid = (presetsRef: Ref<HTMLDivElement | null>) => {
  const expanded = ref(false)

  watch(expanded, async isExpanded => {
    if (isExpanded) return

    await nextTick()
    presetsRef.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })

  return {
    expanded
  }
}
