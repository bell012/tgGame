<template>
  <div class="search-container">
    <div :class="{ 'search-filter-panel': isMobile }">
      <!-- 搜索框-->
      <top-input :data-list="typeList" @change-type="changeTypeHandler" @search="topInputSearch" />
      <!-- 顶部tab切换 -->
      <top-tab
        v-if="currentType === 'casino' || currentType === 'sports'"
        class="search-top-tabs"
        :tab-list="topTabList"
        @change="topTabChange"
      />
      <!-- 筛选条件 -->
      <div
        class="search-select-row grid lg:grid-cols-4 grid-cols-2 lg:gap-4 gap-2.5"
        v-if="currentType === 'casino'"
      >
        <select-popup
          :label="t('search.sort')"
          v-model="currentSort"
          :dataList="sortList"
          @change="sortChange"
        />
        <multiple-select-popup
          :label="t('search.providers')"
          v-model="currentProvider"
          :dataList="providerOptions"
          @change="providerChange"
        />
      </div>
      <!-- 国家 -->
      <div v-if="currentType === 'lottery'" class="w-full mt-[12px]">
        <select-popup
          v-model="currentCountry"
          :dataList="countryOptions"
          @change="countryChange"
          country-image
        />
      </div>
    </div>
    <!-- 列表采用动态组件渲染 -->
    <component :is="listCompMap[currentType]" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import TopInput from './top-input/index.vue'
import TopTab from './top-tab/index.vue'
import SelectPopup from './select-popup/index.vue'
import MultipleSelectPopup from './multiple-select-popup/index.vue'
import { useThemeStore } from '@/stores/theme'
import { useGameStore } from '@/stores/game'
import Api from '@/api'
import Casino from '@/components/explore/list/casino.vue'
import Sports from '@/components/explore/list/sports.vue'
import Lottery from '@/components/explore/list/lottery.vue'
// mock数据
import { countryList } from '@/components/explore/mock/index.ts'

const themeStore = useThemeStore()
const gameStore = useGameStore()
const { t } = useI18n()
const isMobile = useIsMobile()

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
  icon?: string
  iconActive?: string
}

type GameTypeConfigItem = {
  gameTypeCode?: string
  gameTypeName?: string
  icon?: string
  iconSelect?: string
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
  providerCode?: number | string
  providerName?: string
  logo?: string
  logoWhite?: string
  retrieveId?: string
  brandId?: number | string
  brandCode?: number | string
  brandName?: string
  brandLogo?: string
  brandLogoWhite?: string
}

// 搜索的关键字
const keywords = ref('')
provide('explore-keywords', keywords)
const exploreHotGameList = ref<ExploreHotGameItem[]>([])
provide('explore-hot-game-list', exploreHotGameList)

// top-input
const typeList = computed(() => [
  { id: 'casino', name: t('bottom_tab_bar.casino') }
  // { id: 'sports', name: t('bottom_tab_bar.sports') }
  // { id: 'lottery', name: 'Lottery' }
])

// 游戏类型
const currentType = ref<keyof typeof listCompMap>('casino')
provide('explore-current-type', currentType)

const currentSubGameTypeCode = ref('')

const queryGameList = ref<GameSection[]>([])
const queryGameTypeList = ref<GameTypeConfigItem[]>([])

const imageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')

const normalizeImageUrl = (value?: string) => {
  const source = String(value ?? '').trim()
  if (!source) {
    return ''
  }

  if (/^https?:\/\//i.test(source)) {
    return source
  }

  const normalizedSource = source.replace(/^\/+/, '')
  if (!imageBaseUrl) {
    return normalizedSource
  }

  return `${imageBaseUrl}/${normalizedSource}`
}

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
  const sectionList = Array.isArray(queryGameList.value)
    ? (queryGameList.value as GameSection[])
    : []
  const sectionMap = new Map<string, GameSection>()

  sectionList.forEach(item => {
    const code = String(item?.sysGameTypeCode ?? '').trim()
    if (!code || sectionMap.has(code)) {
      return
    }
    sectionMap.set(code, item)
  })

  const mergedList: TopTabItem[] = []

  queryGameTypeList.value.forEach(item => {
    const code = String(item?.gameTypeCode ?? '').trim()
    if (!code) {
      return
    }

    const matchedSection = sectionMap.get(code)
    if (!matchedSection) {
      return
    }

    mergedList.push({
      sysGameTypeCode: code,
      sysGameTypeName:
        String(item?.gameTypeName ?? '').trim() ||
        String(matchedSection?.sysGameTypeName ?? '').trim(),
      icon: normalizeImageUrl(item?.icon),
      iconActive: normalizeImageUrl(item?.iconSelect)
    })

    sectionMap.delete(code)
  })

  sectionMap.forEach(item => {
    const code = String(item?.sysGameTypeCode ?? '').trim()
    const name = String(item?.sysGameTypeName ?? '').trim()
    if (!code || !name) {
      return
    }

    mergedList.push({
      sysGameTypeCode: code,
      sysGameTypeName: name
    })
  })

  return mergedList
})

const topTabChange = (code: string) => {
  currentSubGameTypeCode.value = code
}

const getQueryGameListForApp = async () => {
  try {
    const res = await Api.home.getGameData({
      showSuccessToast: false,
      showErrorToast: true
    })
    const nextList = Array.isArray(res?.result) ? (res.result as GameSection[]) : []
    queryGameList.value = nextList
  } catch (error) {
    console.error('queryGameListForApp failed', error)
    queryGameList.value = []
  }
}

const getGameTypeList = async () => {
  try {
    const result = await gameStore.getGameTypeData()
    queryGameTypeList.value = Array.isArray(result) ? (result as GameTypeConfigItem[]) : []
  } catch (error) {
    console.error('getGameTypeList failed', error)
    queryGameTypeList.value = []
  }
}

const changeTypeHandler = (val: string) => {
  if (!(val in listCompMap)) {
    return
  }

  const nextType = val as keyof typeof listCompMap
  currentType.value = nextType
  currentSubGameTypeCode.value = ''
  if (nextType !== 'casino') {
    exploreHotGameList.value = []
  }
}
const topInputSearch = (_value: string) => {
  void _value
}

// 排序
const currentSort = ref('0')
provide('explore-current-sort', currentSort)

const sortList = computed(() => [
  { value: '0', label: t('search.sortDefault') },
  { value: '1', label: 'A-Z' },
  { value: '2', label: 'Z-A' }
])

// 供应商
const currentProvider = ref<string[]>([])
provide('explore-current-provider', currentProvider)
const queryProviderList = ref<GameBrandItem[]>([])

const getGameBrandList = async () => {
  try {
    const res = await Api.home.getGameBrandList({
      showSuccessToast: false,
      showErrorToast: true
    })
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

const providerNameMap = computed<Record<string, string>>(() => {
  return queryProviderList.value.reduce<Record<string, string>>((acc, item) => {
    const providerName = String(item.providerName ?? item.brandName ?? '').trim()
    if (!providerName) {
      return acc
    }

    const providerCodeList = [item.providerId, item.providerCode, item.brandId, item.brandCode]

    providerCodeList
      .map(code => String(code ?? '').trim())
      .filter(Boolean)
      .forEach(code => {
        acc[code] = providerName
      })

    return acc
  }, {})
})

provide('explore-provider-name-map', providerNameMap)

// 国家
const currentCountry = ref('')
const countryOptions = computed(() =>
  countryList.map(item => {
    return {
      label: item || t('search.all'),
      value: item
    }
  })
)

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
  getGameTypeList()
  getGameBrandList()
})
</script>

<style lang="scss" scoped>
@media (max-width: 767px) {
  .search-container {
    padding-top: 60px;
  }

  .search-filter-panel {
    background: var(--color-background-level-1);
    margin-left: -12px;
    margin-right: -12px;
    padding: 10px 12px 8px;
    margin-bottom: 0;
  }

  .search-top-tabs {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .search-select-row {
    margin-bottom: 0;
  }
}
</style>
