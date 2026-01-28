<template>
  <div class="search-container">
    <!-- 搜索框-->
    <top-input
      :data-list="typeList"
      :default-type="currentType"
      @change-type="changeTypeHandler"
      @search="topInputSearch"
    />
    <!-- 顶部tab切换 -->
    <top-tab />
    <!-- 筛选条件 -->
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
    <!-- 列表采用动态组件渲染 -->
    <component :is="listCompMap[currentType]" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import TopInput from './top-input/index.vue'
import TopTab from './top-tab/index.vue'
import SelectPopup from './select-popup/index.vue'
import MultipleSelectPopup from './multiple-select-popup/index.vue'
import { useThemeStore } from '@/stores/theme'
import Casino from '@/components/explore/list/casino.vue'
import Sports from '@/components/explore/list/sports.vue'
import Lottery from '@/components/explore/list/lottery.vue'

import { providerList } from '@/components/explore/mock/index.ts'

const themeStore = useThemeStore()

const listCompMap = {
  casino: Casino,
  sports: Sports,
  lottery: Lottery
}

// top-input
const typeList = [
  { id: 'casino', name: 'Casino' },
  { id: 'sports', name: 'Sports' },
  { id: 'lottery', name: 'Lottery' }
]
const currentType = ref<keyof typeof listCompMap>('casino')
const changeTypeHandler = (val: keyof typeof listCompMap) => {
  currentType.value = val
}
const topInputSearch = (value: string) => {
  console.log(value)
}

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
      label: themeStore.theme === 'light' ? item.logoWhite : item.logo,
      value: item.providerId + ''
    }
  })
})
const providerChange = (val: string[]) => {
  console.log(val)
}
</script>

<style lang="scss" scoped></style>
