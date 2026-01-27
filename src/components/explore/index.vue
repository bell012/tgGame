<template>
  <div class="search-container">
    <top-input />
    <top-tab />
    <div class="grid lg:grid-cols-4 grid-cols-2 gap-4">
      <select-popup
        label="排序方式:"
        v-model="currentSort"
        :dataList="sortList"
        @change="sortChange"
      />
      <multiple-select-popup
        label="供应商:"
        v-model="currentProvider"
        :dataList="providerOptions"
        @change="providerChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import TopInput from './top-input/index.vue'
import TopTab from './top-tab/index.vue'
import SelectPopup from './select-popup/index.vue'
import MultipleSelectPopup from './multiple-select-popup/index.vue'
import { providerList } from '@/components/explore/mock/index.ts'

// 排序
const currentSort = ref('1')
const sortList = [
  { value: '1', label: '热门' },
  { value: '2', label: '最新' },
  { value: '3', label: 'A-Z' },
  { value: '4', label: 'Z-A' }
]
const sortChange = (val: string) => {
  console.log(val)
}

// 供应商
const currentProvider = ref([])
const providerOptions = computed(() => {
  return providerList.map(item => {
    return {
      ...item,
      label: item.logo,
      value: item.providerId + ''
    }
  })
})
const providerChange = (val: string[]) => {
  console.log(val)
}
</script>

<style lang="scss" scoped></style>
