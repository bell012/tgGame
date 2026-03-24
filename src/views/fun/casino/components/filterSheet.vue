<template>
  <div class="grid lg:grid-cols-4 grid-cols-2 gap-4">
    <!-- 排序选择 -->
    <DropdownSelect
      :options="sortOptions"
      :selected="sortBy"
      :label="t('casino.sort')"
      @update:selected="onSortChange"
    />

    <!-- 提供商选择 -->
    <DropdownSelect
      :options="filteredProviders"
      :selected-list="providers"
      :label="t('casino.providers')"
      Multi
      search
      :clear-label="t('search.botClear')"
      @update:selected-list="onProvidersChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DropdownSelect from './dropdownSelect.vue'
import wlImg from '@/static/img/supplier/wl.png'
import pgImg from '@/static/img/supplier/pg.png'
import fgImg from '@/static/img/supplier/fg.png'
import jlImg from '@/static/img/supplier/jl.png'

const { t } = useI18n()

const props = defineProps({
  sortOptions: {
    type: Array as () => { label: string; value: string }[],
    default: () => [
      { label: '热门', value: '热门' },
      { label: '最新', value: '最新' },
      { label: 'A-Z', value: 'A-Z' },
      { label: 'Z-A', value: 'Z-A' }
    ]
  },
  providerOptions: {
    type: Array as () => { label: string; value: string; icon: string }[],
    default: () => [
      { label: 'P1', value: 'p1', icon: wlImg },
      { label: 'P2', value: 'p2', icon: pgImg },
      { label: 'P3', value: 'p3', icon: fgImg },
      { label: 'P4', value: 'p4', icon: jlImg },
      { label: 'A1', value: 'a1', icon: wlImg },
      { label: 'A2', value: 'a2', icon: pgImg },
      { label: 'A3', value: 'a3', icon: fgImg },
      { label: 'A4', value: 'a4', icon: jlImg },
      { label: 'C1', value: 'c1', icon: wlImg },
      { label: 'C2', value: 'c2', icon: pgImg },
      { label: 'C3', value: 'c3', icon: fgImg },
      { label: 'C4', value: 'c4', icon: jlImg },
      { label: 'D1', value: 'd1', icon: wlImg },
      { label: 'D2', value: 'd2', icon: pgImg },
      { label: 'D3', value: 'd3', icon: fgImg },
      { label: 'D4', value: 'd4', icon: jlImg },
      { label: 'EE', value: 'ee', icon: pgImg }
    ]
  }
})
// 状态
const sortBy = ref(props.sortOptions[0].value)
const providers = ref<string[]>([])
const keyword = ref('')

// 计算筛选后的提供商（搜索功能）
const filteredProviders = computed(() => {
  if (!keyword.value) return props.providerOptions
  const k = keyword.value.toLowerCase()
  return props.providerOptions.filter(
    item => item.label.toLowerCase().includes(k) || item.value.toLowerCase().includes(k)
  )
})

const emit = defineEmits<{
  (e: 'update:sort', value: string): void
  (e: 'update:providers', value: string[]): void
}>()

const onSortChange = (val: string) => {
  sortBy.value = val
  emit('update:sort', val)
}

const onProvidersChange = (val: string[]) => {
  providers.value = val
  emit('update:providers', val)
}
</script>
<style scoped lang="scss"></style>
