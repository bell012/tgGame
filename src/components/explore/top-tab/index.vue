<template>
  <div
    class="flex w-full justify-between overflow-x-auto scrollbar-none my-2.5 md:my-3.5 md:justify-start"
  >
    <div
      v-for="item in renderTabList"
      :key="item.sysGameTypeCode"
      :class="
        item.sysGameTypeCode === currentTabCode
          ? 'bg-[var(--color-background-level-2)] text-text-1'
          : 'text-text-2'
      "
      class="flex px-[7px] py-[9px] shrink-0 rounded-lg text-xs items-center cursor-pointer"
      @click="changeTab(item.sysGameTypeCode)"
    >
      <SmartImage
        :src="item.sysGameTypeCode === currentTabCode ? item.iconActive : item.icon"
        alt=""
        class="w-5 h-5 mr-[7px]"
      />
      <div class="font-[700]">
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
      icon: iconPair.icon,
      iconActive: iconPair.iconActive
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
