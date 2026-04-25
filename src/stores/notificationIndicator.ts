import Api from '@/api'
import type { NoticeRecord, QueryNoticeMsgResult } from '@/api/interface/notification.interface'
import { useTradeMessageSyncStore } from '@/stores/tradeMessageSync'
import { useUserStore } from '@/stores/user'
import { getDeletedNotificationIds, getReadNotificationIds } from '@/utils/notification-cache'
import { getLanguageCode } from '@/utils/locale'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

const NOTICE_PAGE_SIZE = 50
const PROMOTIONS_MSG_TYPE = 0
const SYSTEM_MSG_TYPE = 1

/**
 * 将通知接口返回值统一规整为列表结果，兼容 result 包裹和直接平铺两种结构。
 */
const getQueryResult = (response: {
  result?: QueryNoticeMsgResult
  current?: number
  records?: NoticeRecord[]
  size?: number
  total?: number
}): QueryNoticeMsgResult => {
  if (response.result) {
    return response.result
  }

  return {
    current: response.current || 1,
    pages: 1,
    records: response.records || [],
    size: response.size || 0,
    total: response.total || 0
  }
}

/**
 * 判断单条普通通知在当前账号维度下是否仍然属于未读状态。
 */
const isUnreadNoticeRecord = (
  record: NoticeRecord,
  readIds: Set<number>,
  deletedIds: Set<number>
) => {
  const rowId = Number(record.rowId)

  if (Number.isInteger(rowId) && rowId > 0 && deletedIds.has(rowId)) {
    return false
  }

  if (Number(record.readStatus) === 1) {
    return false
  }

  if (Number.isInteger(rowId) && rowId > 0 && readIds.has(rowId)) {
    return false
  }

  return true
}

export const useNotificationIndicatorStore = defineStore('notificationIndicator', () => {
  const userStore = useUserStore()
  const tradeMessageSyncStore = useTradeMessageSyncStore()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  const {
    deletedMessageKeys: tradeDeletedMessageKeys,
    messageStream: tradeMessageStream,
    readMessageKeys: tradeReadMessageKeys
  } = storeToRefs(tradeMessageSyncStore)

  const hasPromotionUnread = ref(false)
  const hasSystemUnread = ref(false)
  const hasTransactionUnread = ref(false)
  const isRefreshingStaticUnread = ref(false)

  let refreshPromise: Promise<void> | null = null

  const isLoggedIn = computed(() => {
    return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
  })
  const activeMemberId = computed(() => String(userInfo.value?.memberId ?? '').trim())

  /**
   * 汇总首页铃铛是否应显示未读态。
   *
   * 只要 promotions、transactions、system 任意一类存在未读，就返回 true。
   */
  const hasUnread = computed(() => {
    return hasPromotionUnread.value || hasSystemUnread.value || hasTransactionUnread.value
  })

  /**
   * 重置普通通知未读态缓存，通常用于退出登录或切换账号后的清理。
   */
  const resetStaticUnreadState = () => {
    hasPromotionUnread.value = false
    hasSystemUnread.value = false
  }

  /**
   * 分页扫描指定分类通知，只要命中一条未读消息就提前结束。
   */
  const fetchCategoryHasUnread = async (msgType: number) => {
    const readIds = getReadNotificationIds()
    const deletedIds = getDeletedNotificationIds()
    let currentPage = 1
    let totalPages = 1

    while (currentPage <= totalPages) {
      const response = await Api.notifications.queryNoticeMsg({
        languageCode: getLanguageCode(),
        msgType,
        channelId: 4,
        sysLevelId: '1',
        page: {
          current: currentPage,
          size: NOTICE_PAGE_SIZE
        }
      })

      const result = getQueryResult(response)

      if (result.records.some(record => isUnreadNoticeRecord(record, readIds, deletedIds))) {
        return true
      }

      totalPages =
        Number(result.pages) > 0
          ? Number(result.pages)
          : Math.max(1, Math.ceil(Number(result.total || 0) / NOTICE_PAGE_SIZE))
      currentPage += 1
    }

    return false
  }

  /**
   * 主动刷新 promotions / system 两类普通通知未读态。
   *
   * 该方法不会处理 transactions，交易消息未读状态由实时 store 单独维护。
   */
  const refreshStaticUnread = async () => {
    if (!isLoggedIn.value) {
      resetStaticUnreadState()
      return
    }

    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = (async () => {
      isRefreshingStaticUnread.value = true

      try {
        const [promotionUnread, systemUnread] = await Promise.all([
          fetchCategoryHasUnread(PROMOTIONS_MSG_TYPE),
          fetchCategoryHasUnread(SYSTEM_MSG_TYPE)
        ])

        hasPromotionUnread.value = promotionUnread
        hasSystemUnread.value = systemUnread
      } catch (error) {
        console.error('refreshStaticUnread failed', error)
      } finally {
        isRefreshingStaticUnread.value = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  /**
   * 登录态失效时立即清空普通通知未读缓存，避免不同账号状态串用。
   */
  watch(isLoggedIn, loggedIn => {
    if (!loggedIn) {
      resetStaticUnreadState()
    }
  })

  /**
   * 账号切换时先清空旧账号状态，后续由页面触发重新拉取新账号数据。
   */
  watch(activeMemberId, (nextMemberId, previousMemberId) => {
    if (nextMemberId !== previousMemberId) {
      resetStaticUnreadState()
    }
  })

  /**
   * 显式监听交易消息流及其已读/删除状态，确保 MQTT 推送后首页铃铛立即响应。
   */
  watch(
    [tradeMessageStream, tradeReadMessageKeys, tradeDeletedMessageKeys],
    ([messageStream, readMessageKeys, deletedMessageKeys]) => {
      const readMessageKeySet = new Set(readMessageKeys)
      const deletedMessageKeySet = new Set(deletedMessageKeys)

      hasTransactionUnread.value = messageStream.some(item => {
        return !deletedMessageKeySet.has(item.key) && !readMessageKeySet.has(item.key)
      })
    },
    {
      deep: true,
      immediate: true
    }
  )

  return {
    hasPromotionUnread,
    hasSystemUnread,
    hasTransactionUnread,
    hasUnread,
    isRefreshingStaticUnread,
    refreshStaticUnread,
    resetStaticUnreadState
  }
})
