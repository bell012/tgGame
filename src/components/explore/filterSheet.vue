<template>
  <div :class="containerClass">
    <DropdownSelect
      v-if="!hideSort"
      :options="resolvedSortOptions"
      :selected="sortBy"
      :label="t('casino.sort')"
      @update:selected="onSortChange"
    />

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
  hideSort.value ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4 lg:grid-cols-4'
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

const sortBy = ref(props.selectedSort || resolvedSortOptions.value[0]?.value || '')
const providers = ref<string[]>([...props.selectedProviders])
const keyword = ref('')

const filteredProviders = computed(() => {
  if (!keyword.value) {
    return props.providerOptions
  }

  const normalizedKeyword = keyword.value.toLowerCase()
  return props.providerOptions.filter(
    item =>
      item.label.toLowerCase().includes(normalizedKeyword) ||
      item.value.toLowerCase().includes(normalizedKeyword)
  )
})

const emit = defineEmits<{
  (e: 'update:sort', value: string): void
  (e: 'update:providers', value: string[]): void
}>()

const onSortChange = (value: string) => {
  sortBy.value = value
  emit('update:sort', value)
}

const onProvidersChange = (value: string[]) => {
  providers.value = value
  emit('update:providers', value)
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
