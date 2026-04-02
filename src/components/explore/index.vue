<template>
  <div class="search-container">
    <!-- 搜索框-->
    <top-input :data-list="typeList" @change-type="changeTypeHandler" @search="topInputSearch" />
    <!-- 顶部tab切换 -->
    <top-tab
      v-if="currentType === 'casino' || currentType === 'sports'"
      :tab-list="topTabList"
      @change="topTabChange"
    />
    <!-- 筛选条件 -->
    <div class="grid lg:grid-cols-4 grid-cols-2 gap-4" v-if="currentType === 'casino'">
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
    <!-- 国家 -->
    <div class="w-full mt-[12px]">
      <select-popup
        v-if="currentType === 'lottery'"
        v-model="currentCountry"
        :dataList="countryOptions"
        @change="countryChange"
        country-image
      />
    </div>
    <!-- 列表采用动态组件渲染 -->
    <component :is="listCompMap[currentType]" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, provide, ref } from 'vue'
import TopInput from './top-input/index.vue'
import TopTab from './top-tab/index.vue'
import SelectPopup from './select-popup/index.vue'
import MultipleSelectPopup from './multiple-select-popup/index.vue'
import { useThemeStore } from '@/stores/theme'
import Api from '@/api'
import Casino from '@/components/explore/list/casino.vue'
import Sports from '@/components/explore/list/sports.vue'
import Lottery from '@/components/explore/list/lottery.vue'
// mock数据
import { countryList } from '@/components/explore/mock/index.ts'

const themeStore = useThemeStore()

const listCompMap = {
  casino: Casino,
  sports: Sports,
  lottery: Lottery
}

type GameSection = {
  sysGameTypeCode?: string
  sysGameTypeName?: string
  subGame?: unknown[]
}

type GameSubNode = {
  subGame?: unknown[]
}

type TopTabItem = {
  sysGameTypeCode: string
  sysGameTypeName: string
}

type ExploreHotGameItem = {
  id?: string | number
  rowId?: string | number
  platformName?: string
  gameItemHotVo?: {
    hot?: number
  }
}

type GameBrandItem = {
  providerId?: number | string
  providerName?: string
  logo?: string
  logoWhite?: string
  retrieveId?: string
  brandId?: number | string
  brandName?: string
  brandLogo?: string
  brandLogoWhite?: string
}

type ExploreCacheGlobal = {
  __exploreGameListCache__?: GameSection[]
}

const exploreCacheGlobal = globalThis as typeof globalThis & ExploreCacheGlobal

// 搜索的关键字
const keywords = ref('')
provide('explore-keywords', keywords)
const exploreHotGameList = ref<ExploreHotGameItem[]>([])
provide('explore-hot-game-list', exploreHotGameList)

// top-input
const typeList = [
  { id: 'casino', name: 'Casino' },
  { id: 'sports', name: 'Sports' }
  // { id: 'lottery', name: 'Lottery' }
]

// 游戏类型
const currentType = ref<keyof typeof listCompMap>('casino')
provide('explore-current-type', currentType)

const currentSubGameTypeCode = ref('')

const queryGameList = ref<GameSection[]>([])

const currentTypeGameList = computed(() => {
  const section = queryGameList.value.find(
    item => item?.sysGameTypeCode === currentSubGameTypeCode.value
  )
  const list = Array.isArray(section?.subGame) ? (section.subGame as GameSubNode[]) : []
  return list.reduce<unknown[]>((acc, item) => {
    if (Array.isArray(item?.subGame)) {
      acc.push(...item.subGame)
    }
    return acc
  }, [])
})

provide('explore-game-list', currentTypeGameList)

const topTabList = computed<TopTabItem[]>(() => {
  const list = Array.isArray(queryGameList.value) ? (queryGameList.value as GameSection[]) : []
  return list
    .map(item => ({
      sysGameTypeCode: item?.sysGameTypeCode ?? '',
      sysGameTypeName: item?.sysGameTypeName ?? ''
    }))
    .filter(item => item.sysGameTypeCode && item.sysGameTypeName)
})

const topTabChange = (code: string) => {
  currentSubGameTypeCode.value = code
}

const getQueryGameListForApp = async () => {
  const cachedList = exploreCacheGlobal.__exploreGameListCache__
  if (Array.isArray(cachedList) && cachedList.length) {
    queryGameList.value = cachedList
    return
  }

  try {
    const res = await Api.home.getGameData()
    const nextList = Array.isArray(res?.result) ? (res.result as GameSection[]) : []
    queryGameList.value = nextList
    exploreCacheGlobal.__exploreGameListCache__ = nextList
  } catch (error) {
    console.error('queryGameListForApp failed', error)
    queryGameList.value = []
  }
}

const changeTypeHandler = (val: keyof typeof listCompMap) => {
  currentType.value = val
  currentSubGameTypeCode.value = ''
  if (val !== 'casino') {
    exploreHotGameList.value = []
  }
}
const topInputSearch = (_value: string) => {
  void _value
}

// 排序
const currentSort = ref('0')
provide('explore-current-sort', currentSort)

const sortList = [
  { value: '0', label: 'Default' },
  { value: '1', label: 'A-Z' },
  { value: '2', label: 'Z-A' }
]

// 供应商
const currentProvider = ref<string[]>([])
provide('explore-current-provider', currentProvider)
const queryProviderList = ref<GameBrandItem[]>([])

const getGameBrandList = async () => {
  try {
    const res = await Api.home.getGameBrandList()
    queryProviderList.value = Array.isArray(res?.result) ? (res.result as GameBrandItem[]) : []
  } catch (error) {
    console.error('getGameBrandList failed', error)
    queryProviderList.value = []
  }
}

const providerOptions = computed(() => {
  return queryProviderList.value.map(item => {
    const providerId = item.providerId ?? item.brandId
    const providerName = item.providerName ?? item.brandName ?? ''
    const logo = item.logo ?? item.brandLogo ?? ''
    const logoWhite = item.logoWhite ?? item.brandLogoWhite ?? logo

    return {
      ...item,
      providerId: providerId ?? '',
      providerName,
      logo,
      logoWhite,
      label: themeStore.theme === 'light' ? logoWhite : logo,
      value: String(providerId ?? '')
    }
  })
})

// 国家
const currentCountry = ref('')
const countryOptions = countryList.map(item => {
  return {
    label: item || '全部国家',
    value: item
  }
})

const providerChange = (val: string[]) => {
  console.log(val)
}

const sortChange = (val: string) => {
  console.log(val)
}

const countryChange = (val: string) => {
  console.log(val)
}

onMounted(() => {
  getQueryGameListForApp()
  getGameBrandList()
})
</script>

<style lang="scss" scoped>
@media (max-width: 767px) {
  .search-container {
    padding-top: 60px;
  }
}
</style>
