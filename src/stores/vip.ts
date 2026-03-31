import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Api from '@/api'
import type { MyVipInfoResult, VipListItem } from '@/api/interface/vip'

export const useVipStore = defineStore('vip', () => {
  const vipList = ref<VipListItem[]>([])
  const myVipInfo = ref<MyVipInfoResult | null>(null)

  const normalizeVipList = (result?: VipListItem[] | VipListItem) => {
    if (!result) {
      return []
    }

    return Array.isArray(result) ? result : [result]
  }

  const refreshVipList = async () => {
    try {
      const response = await Api.vip.vipList({})

      vipList.value = normalizeVipList(response?.result)
      return vipList.value
    } catch (error) {
      console.error(error)
      return vipList.value
    }
  }

  const refreshMyVipInfo = async () => {
    try {
      const response = await Api.vip.myVipInfo({})

      if (response?.result) {
        myVipInfo.value = response.result
      }

      return myVipInfo.value
    } catch (error) {
      console.error(error)
      return myVipInfo.value
    }
  }

  const refreshVipData = async () => {
    const [latestVipList, latestMyVipInfo] = await Promise.all([
      refreshVipList(),
      refreshMyVipInfo()
    ])

    return {
      vipList: latestVipList,
      myVipInfo: latestMyVipInfo
    }
  }

  const hasVipData = computed(() => vipList.value.length > 0 || Boolean(myVipInfo.value))

  const getVipTargetConfig = (vipId: number) => {
    if (!vipList.value.length) {
      return null
    }

    return vipList.value.find(item => item.vipId === vipId) ?? null
  }

  return {
    vipList,
    myVipInfo,
    hasVipData,
    refreshVipList,
    refreshMyVipInfo,
    refreshVipData,
    getVipTargetConfig
  }
})
