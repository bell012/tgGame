<template>
  <section
    class="notification-detail-page min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]"
  >
    <div
      class="notifications-shell min-h-screen bg-bg-1"
      style="font-family: Inter, avertastd, sans-serif"
    >
      <header
        class="page-nav fixed left-0 right-0 top-0 z-20 grid h-[49px] grid-cols-[33px_1fr_33px] items-center bg-bg-2 px-[14px]"
      >
        <button
          class="back-button inline-flex h-[33px] w-[33px] items-center justify-center rounded-[8px] bg-opacity-5"
          type="button"
          @click="goBack"
          aria-label="Back"
        >
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            class="h-[14px] w-[14px] fill-text-1"
          >
            <path
              d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
            ></path>
          </svg>
        </button>

        <h1 class="page-title text-center text-[16px] font-[700] leading-[1.2] text-text-1">
          Notifications
        </h1>

        <div class="nav-placeholder h-[33px] w-[33px]"></div>
      </header>

      <main class="page-body px-[14px] pb-[calc(env(safe-area-inset-bottom)+74px)]">
        <nav
          class="tab-bar flex min-h-[37px] w-full items-stretch rounded-[12px] bg-bg-2"
          aria-label="Notification tabs"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="tab-button flex min-w-0 flex-1 items-center justify-center gap-[4px] rounded-[12px] px-[8px] py-[11px]"
            :class="activeTab === tab.key ? 'tab-button-active bg-bg-3 text-text-1' : 'text-text-2'"
            @click="activeTab = tab.key"
          >
            <span
              class="tab-text whitespace-nowrap text-[12px] leading-[1.2]"
              :class="activeTab === tab.key ? 'font-[700]' : 'font-[400]'"
            >
              {{ tab.label }}
            </span>
            <span
              v-if="unreadCountByCategory[tab.key] > 0"
              class="tab-badge min-w-[18px] rounded-[5px] bg-theme-primary px-[5px] text-center text-[10px] font-[700] leading-[16px] text-text-4"
            >
              {{ unreadCountByCategory[tab.key] }}
            </span>
          </button>
        </nav>

        <section
          v-if="filteredNotifications.length > 0"
          class="notice-stack mt-[14px] flex flex-col gap-[10px]"
        >
          <article
            v-for="item in filteredNotifications"
            :key="`${item.category}-${item.rowId}`"
            class="notice-card flex flex-col rounded-[10px]"
            :class="[
              isTransactionNotification(item)
                ? 'gap-[10px] bg-bg-2 px-[14px] pb-0 pt-[14px]'
                : 'gap-[10px] bg-bg-2 px-[14px] pb-[10px] pt-[14px]',
              { 'notice-card-read opacity-[0.72]': item.read }
            ]"
          >
            <template v-if="isTransactionNotification(item)">
              <div class="notice-title-row flex items-center gap-[7px]">
                <h2
                  class="notice-title min-w-0 break-words text-[14px] font-[700] leading-[17px] text-text-1"
                >
                  {{ getNoticeTitle(item) }}
                </h2>
                <span
                  v-if="!item.read"
                  class="notice-dot h-[8px] w-[8px] shrink-0 rounded-full bg-theme-primary"
                ></span>
              </div>

              <p
                class="notice-message break-words text-[12px] font-[400] leading-[15px] text-text-1"
              >
                {{ getTransactionMessage(item) }}
              </p>

              <div
                class="notice-footer flex items-center justify-between gap-[12px] border-t border-opacity-5 py-[10px]"
              >
                <time class="notice-time text-[12px] font-[400] leading-[15px] text-text-2">
                  {{ getNoticeTime(item) }}
                </time>

                <button
                  type="button"
                  class="delete-button inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
                  @click.stop="removeNotification(item.rowId, item.category)"
                  aria-label="Delete notification"
                >
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-[14px] w-[14px] fill-text-2"
                  >
                    <path
                      d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm-1 11h12a2 2 0 0 0 2-2V7H4v11a2 2 0 0 0 2 2Z"
                    />
                  </svg>
                </button>
              </div>
            </template>

            <template v-else>
              <div class="cursor-pointer" @click="openNotificationDetail(item)">
                <div class="notice-title-row flex items-center gap-[7px]">
                  <h2
                    class="notice-title min-w-0 break-words text-[14px] font-[700] leading-[1.25] text-text-1"
                  >
                    {{ getNoticeTitle(item) }}
                  </h2>
                  <span
                    v-if="!item.read"
                    class="notice-dot h-[8px] w-[8px] shrink-0 rounded-full bg-theme-primary"
                  ></span>
                </div>

                <div
                  v-if="hasPreviewImage(item)"
                  class="notice-preview mt-[10px] h-[150px] w-full overflow-hidden rounded-[8px] bg-common-100"
                >
                  <img
                    :src="toGameImageUrl(item.noticeText)"
                    :alt="getNoticeTitle(item)"
                    class="notice-image h-full w-full object-cover"
                  />
                </div>

                <div
                  v-else
                  class="notice-content-preview mt-[10px] flex min-h-[32px] flex-col justify-between gap-[10px] rounded-[8px] px-[12px] py-[12px]"
                >
                  <p
                    class="notice-summary overflow-hidden break-words text-[12px] leading-[1.5] text-text-1"
                    style="
                      display: -webkit-box;
                      -webkit-box-orient: vertical;
                      -webkit-line-clamp: 4;
                    "
                  >
                    {{ getNoticeSummary(item) }}
                  </p>
                </div>
              </div>

              <div class="notice-footer flex items-center justify-between gap-[12px]">
                <time
                  class="notice-time cursor-pointer text-[12px] font-[400] leading-[1.2] text-text-2"
                  @click="openNotificationDetail(item)"
                >
                  {{ getNoticeTime(item) }}
                </time>

                <button
                  type="button"
                  class="delete-button inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
                  @click.stop="removeNotification(item.rowId, item.category)"
                  aria-label="Delete notification"
                >
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-[14px] w-[14px] fill-text-2"
                  >
                    <path
                      d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm-1 11h12a2 2 0 0 0 2-2V7H4v11a2 2 0 0 0 2 2Z"
                    />
                  </svg>
                </button>
              </div>
            </template>
          </article>
        </section>

        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          image-alt="No notifications"
          message="Stay tuned—something's coming!"
          text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
        />
      </main>

      <footer
        class="bottom-bar fixed bottom-0 left-0 right-0 z-20 flex h-[calc(env(safe-area-inset-bottom)+49px)] items-center justify-between gap-[14px] bg-bg-2 px-[14px] pb-[calc(env(safe-area-inset-bottom)+10px)] pt-[10px]"
      >
        <button
          type="button"
          class="unread-control inline-flex min-w-0 items-center gap-[7px]"
          @click="showUnreadOnly = !showUnreadOnly"
        >
          <span class="control-label text-[12px] font-[400] leading-[1.2] text-text-1"
            >Show Unread</span
          >
          <span
            class="toggle-track relative h-[21px] w-[40px] rounded-full transition-colors duration-200"
            :class="showUnreadOnly ? 'toggle-track-active bg-secondary-3' : 'bg-opacity-5'"
          >
            <span
              class="toggle-thumb absolute left-[3px] top-[3px] h-[15px] w-[15px] rounded-full bg-common-60 shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-[transform,background-color] duration-200"
              :class="
                showUnreadOnly
                  ? 'toggle-thumb-active translate-x-[18px] bg-theme-primary'
                  : 'translate-x-0'
              "
            ></span>
          </span>
        </button>

        <button
          type="button"
          class="mark-read-button inline-flex items-center justify-end gap-[6px] text-right text-[12px] font-[400] leading-[1.2]"
          :class="currentTabUnreadCount === 0 ? 'text-text-3' : 'text-theme-primary'"
          :disabled="currentTabUnreadCount === 0"
          @click="markCurrentTabAsRead"
        >
          <span
            class="mark-read-icon inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              class="h-[15px] w-[15px] fill-current"
            >
              <path d="m9.2 16.6-4-4 1.7-1.7 2.3 2.3 7-7 1.7 1.7-8.7 8.7Z"></path>
            </svg>
          </span>
          <span>Mark all as read</span>
        </button>
      </footer>

      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-30 flex items-center justify-center bg-mask-60-1 px-[14px]"
        @click.self="closeDeleteConfirm"
      >
        <section
          class="relative w-full max-w-[300px] rounded-[14px] bg-bg-1 p-[20px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-notification-title"
          aria-describedby="delete-notification-description"
        >
          <button
            type="button"
            class="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-opacity-10"
            style="position: absolute; right: 14px; top: 14px"
            @click="closeDeleteConfirm"
            aria-label="Close delete confirmation"
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              class="h-[10px] w-[10px] stroke-text-1"
              fill="none"
            >
              <path
                d="M5 5L19 19M19 5L5 19"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div class="flex flex-col gap-[30px]">
            <div class="flex flex-col gap-[14px]">
              <h2
                id="delete-notification-title"
                class="text-[16px] font-[700] leading-[19px] text-text-1"
              >
                Delete Notification
              </h2>
              <p
                id="delete-notification-description"
                class="text-[14px] font-[400] leading-[17px] text-text-2"
              >
                Are you sure you want to delete this notification?
              </p>
            </div>

            <div class="flex flex-col gap-[13px]">
              <button
                type="button"
                class="inline-flex h-[40px] items-center justify-center rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-text-4"
                :disabled="isDeletingNotification"
                @click="confirmRemoveNotification"
              >
                {{ isDeletingNotification ? 'Deleting...' : 'Delete' }}
              </button>
              <button
                type="button"
                class="inline-flex h-[40px] items-center justify-center rounded-[8px] bg-opacity-10 text-[14px] font-[400] leading-[17px] text-text-2"
                :disabled="isDeletingNotification"
                @click="closeDeleteConfirm"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Api from '@/api'
import type {
  NoticeRecord,
  QueryNoticeMsgResponse,
  QueryNoticeMsgResult
} from '@/api/interface/notification.interface'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import {
  default as defaultImgDark,
  default as defaultImgLight
} from '@/static/img/explore/default.png'
import { getLanguageCode } from '@/utils/locale'
import { formatNotificationTime } from '@/utils/notification'
import {
  getDeletedNotificationIds,
  getReadNotificationIds,
  markNotificationAsDeleted,
  markNotificationAsRead,
  markNotificationsAsRead
} from '@/utils/notification-cache'
import { navigateTo } from '@/utils/router'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

type NotificationCategory = 'promotions' | 'transactions' | 'system'
const NOTIFICATION_DETAIL_STORAGE_KEY = 'menuNotificationDetail'
const NOTIFICATION_LIST_STATE_STORAGE_KEY = 'menuNotificationListState'
const NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY = 'menuNotificationListRestoreFlag'

interface NotificationItem extends NoticeRecord {
  category: NotificationCategory
  read: boolean
}

interface NotificationListState {
  activeTab: NotificationCategory
  showUnreadOnly: boolean
  notifications: NotificationItem[]
  loadedCategories: NotificationCategory[]
}

const router = useRouter()

const tabs: Array<{ key: NotificationCategory; label: string }> = [
  { key: 'promotions', label: 'Promotions' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'system', label: 'System' }
]

const tabLabelMap: Record<NotificationCategory, string> = {
  promotions: 'Promotions',
  transactions: 'Transactions',
  system: 'System'
}

const activeTab = ref<NotificationCategory>('promotions')
const showUnreadOnly = ref(true)
const showDeleteConfirm = ref(false)
const pendingDelete = ref<{ rowId: number; category: NotificationCategory } | null>(null)
const isDeletingNotification = ref(false)
// 页面分类和接口 msgType 的映射关系
const msgTypeMap: Record<NotificationCategory, number> = {
  promotions: 0,
  transactions: 999,
  system: 1
}

// 当前页的统一展示数据源；切换 tab 后只替换对应分类的数据。
const notifications = ref<NotificationItem[]>([])
const loadedCategories = ref<NotificationCategory[]>([])
const fetchingCategories = new Set<NotificationCategory>()

// 按分类统计未读数量，用于顶部 tab 徽标显示。
const unreadCountByCategory = computed<Record<NotificationCategory, number>>(() => {
  return notifications.value.reduce(
    (acc, item) => {
      if (!item.read) {
        acc[item.category] += 1
      }

      return acc
    },
    {
      promotions: 0,
      transactions: 0,
      system: 0
    }
  )
})

// 当前激活分类的未读数量。
const currentTabUnreadCount = computed(() => unreadCountByCategory.value[activeTab.value])

// 按当前 tab + 未读开关过滤出页面实际展示的数据。
const filteredNotifications = computed(() => {
  return notifications.value.filter(item => {
    const inCurrentTab = item.category === activeTab.value
    const matchesUnreadState = showUnreadOnly.value ? !item.read : true

    return inCurrentTab && matchesUnreadState
  })
})

// 判断是否为交易通知，用于切换交易卡片样式。
const isTransactionNotification = (item: NotificationItem) => {
  return item.category === 'transactions' || item.msgType === 'transactions'
}

// 将通知图片路径转换为完整资源地址。
const toGameImageUrl = (value: string) => {
  if (!value) {
    return 'placeholderImg.png'
  }
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}
// 获取通知标题，接口为空时回退到分类标题。
const getNoticeTitle = (item: NotificationItem) => {
  return item.noticeTitle || tabLabelMap[item.category]
}

// 获取交易卡片正文内容，优先使用 noticeText。
const getTransactionMessage = (item: NotificationItem) => {
  return item.noticeText || getNoticeTitle(item)
}

// 将 createTime 格式化为页面展示时间。
const getNoticeTime = (item: NotificationItem) => {
  return formatNotificationTime(item.createTime)
}

// 判断当前通知是否有可展示的图片内容。
const hasPreviewImage = (item: NotificationItem) => {
  return normalizeIsImage(item.isImage) === 1 && Boolean(item.noticeText)
}

// 生成普通通知卡片摘要内容（兼容图片/H5/富文本）。
const getNoticeSummary = (item: NotificationItem) => {
  const normalizedIsImage = normalizeIsImage(item.isImage)
  const textContent =
    normalizedIsImage === 2 ? stripHtml(item.noticeText || '') : item.noticeText || ''

  if (textContent) {
    return textContent
  }

  if (normalizedIsImage === 0) {
    return item.linkUrl || 'Tap to view details'
  }

  return getNoticeTitle(item)
}

// 归一化 isImage 值，非法值默认按 H5 处理。
const normalizeIsImage = (value: number) => {
  if (value === 1 || value === 2) {
    return value
  }

  return 0
}

// 去除富文本中的标签和冗余空白，保留可读文本。
const stripHtml = (value: string) => {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// 将接口 NoticeRecord 转成页面使用的数据结构。
const mapRecordToNotification = (
  record: NoticeRecord,
  category: NotificationCategory
): NotificationItem => {
  const normalizedIsImage = normalizeIsImage(Number(record.isImage))
  return {
    ...record,
    isImage: normalizedIsImage,
    category,
    msgType: record.msgType || category,
    read: false
  }
}

// 统一解析接口返回结构，兼容 result 包裹与平铺两种格式。
const getQueryResult = (response: QueryNoticeMsgResponse): QueryNoticeMsgResult => {
  // 兼容两种返回结构：{ result: {...} } 和直接平铺 { records, total, ... }。
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

// 仅替换某个分类的数据，保留其它分类缓存。
const replaceCategoryNotifications = (
  category: NotificationCategory,
  nextItems: NotificationItem[]
) => {
  // 仅替换当前分类，保留其它 tab 已加载的数据作为本地缓存。
  const remainingItems = notifications.value.filter(item => item.category !== category)
  notifications.value = [...remainingItems, ...nextItems]
}

// 应用本地缓存：删除过的直接剔除，已读的打上 read 标识。
const applyNotificationCache = (items: NotificationItem[]) => {
  const deletedIds = getDeletedNotificationIds()
  const readIds = getReadNotificationIds()

  return items
    .filter(item => !deletedIds.has(item.rowId))
    .map(item => ({
      ...item,
      read: readIds.has(item.rowId)
    }))
}

// 判断通知列表状态缓存是否有效。
const isValidNotificationListState = (value: unknown): value is NotificationListState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<NotificationListState>
  const validCategories: NotificationCategory[] = ['promotions', 'transactions', 'system']

  return (
    typeof state.showUnreadOnly === 'boolean' &&
    typeof state.activeTab === 'string' &&
    validCategories.includes(state.activeTab as NotificationCategory) &&
    Array.isArray(state.notifications) &&
    Array.isArray(state.loadedCategories) &&
    state.loadedCategories.every(category => validCategories.includes(category))
  )
}

// 从 sessionStorage 恢复通知列表页状态。
const restoreNotificationListState = () => {
  const rawValue = sessionStorage.getItem(NOTIFICATION_LIST_STATE_STORAGE_KEY)
  if (!rawValue) {
    return false
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!isValidNotificationListState(parsedValue)) {
      return false
    }

    activeTab.value = parsedValue.activeTab
    showUnreadOnly.value = parsedValue.showUnreadOnly
    notifications.value = parsedValue.notifications
    loadedCategories.value = [...new Set(parsedValue.loadedCategories)]
    return true
  } catch (error) {
    console.error('restoreNotificationListState failed', error)
    return false
  }
}

// 持久化通知列表页状态，用于详情返回时直接恢复。
const persistNotificationListState = () => {
  const nextState: NotificationListState = {
    activeTab: activeTab.value,
    showUnreadOnly: showUnreadOnly.value,
    notifications: notifications.value,
    loadedCategories: loadedCategories.value
  }

  sessionStorage.setItem(NOTIFICATION_LIST_STATE_STORAGE_KEY, JSON.stringify(nextState))
}

// 清理通知列表页缓存和一次性恢复标记。
const clearNotificationListState = () => {
  sessionStorage.removeItem(NOTIFICATION_LIST_STATE_STORAGE_KEY)
  sessionStorage.removeItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY)
}

// 按分类请求通知列表并写入当前页面数据源。
const fetchNotificationsByCategory = async (category: NotificationCategory) => {
  if (loadedCategories.value.includes(category) || fetchingCategories.has(category)) {
    return
  }

  fetchingCategories.add(category)
  const languageCode = getLanguageCode()

  try {
    const res = await Api.notifications.queryNoticeMsg({
      languageCode,
      msgType: msgTypeMap[category],
      channelId: 4,
      sysLevelId: '1',
      page: { current: 1, size: 20 }
    })

    const result = getQueryResult(res)
    const mappedItems = result.records.map(record => mapRecordToNotification(record, category))
    replaceCategoryNotifications(category, applyNotificationCache(mappedItems))
    loadedCategories.value = [...new Set([...loadedCategories.value, category])]
  } catch (error) {
    console.error(`fetchNotificationsByCategory failed: ${category}`, error)
  } finally {
    fetchingCategories.delete(category)
  }
}

// 首次进入页面时，预先拉取 promotions 和 system，用于 tab 未读徽标统计。
const fetchInitialNotificationCategories = () => {
  fetchNotificationsByCategory('promotions')
  fetchNotificationsByCategory('system')
}

// 删除单条通知（通过 rowId + category 定位）。
const removeNotification = (rowId: number, category: NotificationCategory) => {
  pendingDelete.value = { rowId, category }
  showDeleteConfirm.value = true
}

// 打开通知详情页，并同步更新当前列表中的已读状态。
const openNotificationDetail = (item: NotificationItem) => {
  markNotificationAsRead(item.rowId)
  notifications.value = notifications.value.map(notification =>
    notification.rowId === item.rowId ? { ...notification, read: true } : notification
  )
  persistNotificationListState()
  sessionStorage.setItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY, '1')
  sessionStorage.setItem(NOTIFICATION_DETAIL_STORAGE_KEY, JSON.stringify(item))
  navigateTo('/menu/notifications/detail', {
    query: {
      rowId: String(item.rowId),
      category: item.category
    }
  })
}

// 关闭删除确认弹窗，并清空待删除项。
const closeDeleteConfirm = () => {
  if (isDeletingNotification.value) {
    return
  }

  showDeleteConfirm.value = false
  pendingDelete.value = null
}

// 确认删除当前选中的通知，并同步更新本地列表状态。
const confirmRemoveNotification = () => {
  if (!pendingDelete.value || isDeletingNotification.value) {
    return
  }

  const { rowId, category } = pendingDelete.value
  isDeletingNotification.value = true

  try {
    markNotificationAsDeleted(rowId)

    notifications.value = notifications.value.filter(
      item => !(item.rowId === rowId && item.category === category)
    )
    showDeleteConfirm.value = false
    pendingDelete.value = null
  } catch (error) {
    console.error('removeNotification failed', error)
  } finally {
    isDeletingNotification.value = false
  }
}

// 将当前 tab 下所有通知标记为已读。
const markCurrentTabAsRead = () => {
  const currentTabIds = notifications.value
    .filter(item => item.category === activeTab.value)
    .map(item => item.rowId)
  markNotificationsAsRead(currentTabIds)
  notifications.value = notifications.value.map(item =>
    item.category === activeTab.value ? { ...item, read: true } : item
  )
}

// 返回上一页；无历史时兜底跳转到 menu 页。
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  navigateTo('/menu')
}

const shouldRestoreNotificationListState =
  sessionStorage.getItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY) === '1'
const hasRestoredNotificationListState =
  shouldRestoreNotificationListState && restoreNotificationListState()

sessionStorage.removeItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY)

if (!hasRestoredNotificationListState) {
  clearNotificationListState()
  fetchInitialNotificationCategories()
}

// 首次进入和每次切换 tab 时刷新对应分类通知。
watch(
  activeTab,
  category => {
    if (loadedCategories.value.includes(category)) {
      return
    }

    fetchNotificationsByCategory(category)
  },
  { immediate: true }
)

// 监听页面状态变化，持续写入列表页缓存。
watch(
  [activeTab, showUnreadOnly, notifications, loadedCategories],
  () => {
    persistNotificationListState()
  },
  { deep: true }
)
</script>
