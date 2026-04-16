<template>
  <div
    class="top-tab-row flex w-full overflow-x-auto scrollbar-none gap-2.5 md:gap-3 my-2.5 md:my-3.5"
  >
    <div
      v-for="item in renderTabList"
      :key="item.sysGameTypeCode"
      :class="
        item.sysGameTypeCode === currentTabCode
          ? 'top-tab-item-active text-text-1'
          : 'top-tab-item-inactive text-text-2'
      "
      class="top-tab-item flex h-[42px] px-3 shrink-0 rounded-[10px] text-xs items-center cursor-pointer"
      @click="changeTab(item.sysGameTypeCode)"
    >
      <SmartImage
        :src="item.sysGameTypeCode === currentTabCode ? item.iconActive || item.icon : item.icon"
        alt=""
        class="w-[18px] h-[18px] mr-1.5"
      />
      <div class="font-[700] whitespace-nowrap">
        {{ item.sysGameTypeName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SmartImage from '@/components/common/SmartImage.vue'
import g1Img from '@/static/img/explore/g1.png'
import g1aImg from '@/static/img/explore/g1a.png'
import g2Img from '@/static/img/explore/g2.png'
import g2aImg from '@/static/img/explore/g2a.png'
import g3Img from '@/static/img/explore/g3.png'
import g3aImg from '@/static/img/explore/g3a.png'
import g4Img from '@/static/img/explore/g4.png'
import g4aImg from '@/static/img/explore/g4a.png'
import g5Img from '@/static/img/explore/g5.png'
import g5aImg from '@/static/img/explore/g5a.png'

type TopTabItem = {
  sysGameTypeCode: string
  sysGameTypeName: string
  icon?: string
  iconActive?: string
}

const props = withDefaults(
  defineProps<{
    tabList: TopTabItem[]
  }>(),
  {
    tabList: () => []
  }
)

const emit = defineEmits<{
  (event: 'change', code: string): void
}>()

const currentTabCode = ref('')

const iconList = [
  { icon: g1Img, iconActive: g1aImg },
  { icon: g2Img, iconActive: g2aImg },
  { icon: g3Img, iconActive: g3aImg },
  { icon: g4Img, iconActive: g4aImg },
  { icon: g5Img, iconActive: g5aImg }
]

const renderTabList = computed(() => {
  return props.tabList.map((item, index) => {
    const iconPair = iconList[index % iconList.length]
    return {
      ...item,
      icon: item.icon || iconPair.icon,
      iconActive: item.iconActive || item.icon || iconPair.iconActive
    }
  })
})

const changeTab = (code: string) => {
  currentTabCode.value = code
  emit('change', code)
}

watch(
  () => props.tabList,
  list => {
    if (!list.length) {
      currentTabCode.value = ''
      return
    }
    const nextCode = list[0].sysGameTypeCode
    currentTabCode.value = nextCode
    emit('change', nextCode)
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.top-tab-row {
  -webkit-overflow-scrolling: touch;
}

.top-tab-item {
  border: 1px solid transparent;
}

.top-tab-item-active {
  background: var(--color-background-level-2);
  border-color: var(--color-opacity-10);
}

.top-tab-item-inactive {
  background: transparent;
}
</style>
