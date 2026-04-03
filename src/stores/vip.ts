import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Api from '@/api'
import type { GetVipInfoResult, MyVipInfoResult, VipListItem } from '@/api/interface/vip'

export const useVipStore = defineStore('vip', () => {
  const vipList = ref<VipListItem[]>([])
  const myVipInfo = ref<MyVipInfoResult | null>(null)
  const vipInfo = ref<GetVipInfoResult | null>(null)

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

      myVipInfo.value = response?.result ?? null

      return myVipInfo.value
    } catch (error) {
      console.error(error)
      return myVipInfo.value
    }
  }

  const refreshVipInfo = async () => {
    try {
      const response = await Api.vip.getVipInfo({})

      vipInfo.value = response?.result ?? null
      return vipInfo.value
    } catch (error) {
      console.error(error)
      return vipInfo.value
    }
  }

  const refreshVipData = async () => {
    const [latestVipList, latestMyVipInfo, latestVipInfo] = await Promise.all([
      refreshVipList(),
      refreshMyVipInfo(),
      refreshVipInfo()
    ])

    return {
      vipList: latestVipList,
      myVipInfo: latestMyVipInfo,
      vipInfo: latestVipInfo
    }
  }

  const hasVipData = computed(
    () => vipList.value.length > 0 || Boolean(myVipInfo.value) || Boolean(vipInfo.value)
  )

  const getVipTargetConfig = (vipId: number) => {
    if (!vipList.value.length) {
      return null
    }

    return vipList.value.find(item => item.vipId === vipId) ?? null
  }

  return {
    vipList,
    myVipInfo,
    vipInfo,
    hasVipData,
    refreshVipList,
    refreshMyVipInfo,
    refreshVipInfo,
    refreshVipData,
    getVipTargetConfig
  }
})
