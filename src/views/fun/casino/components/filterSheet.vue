<template>
  <div :class="containerClass">
    <!-- 排序选择 -->
    <DropdownSelect
      v-if="!hideSort"
      :options="resolvedSortOptions"
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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DropdownSelect from './dropdownSelect.vue'

interface FilterOption {
  label: string
  value: string
}

interface ProviderOption {
  label: string
  value: string
  icon: string
}

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    sortOptions?: FilterOption[]
    providerOptions?: ProviderOption[]
    selectedSort?: string
    selectedProviders?: string[]
    hideSort?: boolean
  }>(),
  {
    sortOptions: undefined,
    providerOptions: () => [],
    selectedSort: '',
    selectedProviders: () => [],
    hideSort: false
  }
)

const hideSort = computed(() => props.hideSort)
const containerClass = computed(() =>
  hideSort.value ? 'grid grid-cols-1 gap-4' : 'grid lg:grid-cols-4 grid-cols-2 gap-4'
)

const resolvedSortOptions = computed<FilterOption[]>(() => {
  if (props.sortOptions && props.sortOptions.length > 0) {
    return props.sortOptions
  }

  return [
    { label: t('casino.filter_hot'), value: 'hot' },
    { label: t('casino.filter_new'), value: 'latest' },
    { label: 'A-Z', value: 'A-Z' },
    { label: 'Z-A', value: 'Z-A' }
  ]
})

// 状态
const sortBy = ref(props.selectedSort || resolvedSortOptions.value[0]?.value || '')
const providers = ref<string[]>([...props.selectedProviders])
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

watch(
  () => props.selectedSort,
  value => {
    sortBy.value = value || resolvedSortOptions.value[0]?.value || ''
  }
)

watch(
  () => props.selectedProviders,
  value => {
    providers.value = [...value]
  },
  { deep: true }
)
</script>
<style scoped lang="scss"></style>
