<template>
  <section
    class="notification-detail-page min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]"
  >
    <div
      class="notifications-shell min-h-screen bg-bg-1"
      style="font-family: Inter, avertastd, sans-serif"
    >
      <H5Header :title="$t('notifications.title')" :show-sort="false" @sort="false" />

      <main class="page-body px-[14px] pb-[calc(env(safe-area-inset-bottom)+74px)] mt-[14px]">
        <nav
          class="tab-bar flex min-h-[37px] w-full items-stretch rounded-[12px] bg-bg-2"
          :aria-label="$t('notifications.tabsAria')"
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
                  :aria-label="$t('notifications.deleteAria')"
                >
                  <component :is="delIcon" class="h-[13px] w-[13px]" />
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
                  class="notice-preview mt-[10px] h-[150px] w-full overflow-hidden rounded-[8px]"
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
                  :aria-label="$t('notifications.deleteAria')"
                >
                  <component :is="delIcon" class="h-[13px] w-[13px]" />
                </button>
              </div>
            </template>
          </article>
        </section>

        <div
          v-else-if="activeCategoryLoading && !activeCategoryLoaded"
          class="mt-[14px] flex items-center justify-center py-[36px] text-[12px] text-text-2"
        >
          {{ $t('notifications.loading') }}
        </div>

        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :image-alt="$t('notifications.title')"
          :message="$t('notifications.emptyMessage')"
          text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
        />

        <div ref="loadMoreSentinel" class="h-px w-full"></div>

        <p
          v-if="activeCategoryLoading && activeCategoryLoaded"
          class="pb-[16px] pt-[14px] text-center text-[12px] text-text-2"
        >
          {{ $t('notifications.loadingMore') }}
        </p>

        <p
          v-else-if="
            activeCategoryLoaded && activeCategoryFinished && filteredNotifications.length > 0
          "
          class="pb-[16px] pt-[14px] text-center text-[12px] text-text-2"
        >
          {{ $t('notifications.noMore') }}
        </p>
      </main>

      <footer
        class="bottom-bar fixed bottom-0 left-0 right-0 z-20 flex h-[calc(env(safe-area-inset-bottom)+49px)] items-center justify-between gap-[14px] bg-bg-2 px-[14px] pb-[calc(env(safe-area-inset-bottom)+10px)] pt-[10px]"
      >
        <button
          type="button"
          class="unread-control inline-flex min-w-0 items-center gap-[7px]"
          @click="showUnreadOnly = !showUnreadOnly"
        >
          <span class="control-label text-[12px] font-[400] leading-[1.2] text-text-1">{{
            $t('notifications.showUnread')
          }}</span>
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
            <component :is="markReadIcon" class="h-[24px] w-[24px]" />
          </span>
          <span>{{ $t('notifications.markAllAsRead') }}</span>
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
            :aria-label="$t('notifications.closeDeleteDialogAria')"
          >
            <component :is="CloseIcon" class="h-2.5 w-2.5 text-icon-1" />
          </button>

          <div class="flex flex-col gap-[30px]">
            <div class="flex flex-col gap-[14px]">
              <h2
                id="delete-notification-title"
                class="text-[16px] font-[700] leading-[19px] text-text-1"
              >
                {{ $t('notifications.deleteDialog.title') }}
              </h2>
              <p
                id="delete-notification-description"
                class="text-[14px] font-[400] leading-[17px] text-text-2"
              >
                {{ $t('notifications.deleteDialog.description') }}
              </p>
            </div>

            <div class="flex flex-col gap-[13px]">
              <button
                type="button"
                class="inline-flex h-[40px] items-center justify-center rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-text-4"
                :disabled="isDeletingNotification"
                @click="confirmRemoveNotification"
              >
                {{
                  isDeletingNotification
                    ? $t('notifications.deleteDialog.confirmLoading')
                    : $t('notifications.deleteDialog.confirm')
                }}
              </button>
              <button
                type="button"
                class="inline-flex h-[40px] items-center justify-center rounded-[8px] bg-opacity-10 text-[14px] font-[400] leading-[17px] text-text-2"
                :disabled="isDeletingNotification"
                @click="closeDeleteConfirm"
              >
                {{ $t('common.cancel') }}
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
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import {
  default as defaultImgDark,
  default as defaultImgLight
} from '@/static/img/explore/default.png'
import CloseIcon from '@/static/svg/close.svg?component'
import delIcon from '@/static/svg/del.svg?component'
import markReadIcon from '@/static/svg/mark-read-icon.svg?component'

import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
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
import { useI18n } from 'vue-i18n'
type NotificationCategory = 'promotions' | 'transactions' | 'system'
const PAGE_SIZE = 10
const NOTIFICATION_DETAIL_STORAGE_KEY = 'menuNotificationDetail'
const NOTIFICATION_LIST_STATE_STORAGE_KEY = 'menuNotificationListState'
const NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY = 'menuNotificationListRestoreFlag'

interface NotificationItem extends NoticeRecord {
  category: NotificationCategory
  read: boolean
}

interface NotificationCategoryState {
  items: NotificationItem[]
  nextPage: number
  finished: boolean
  total: number | null
  loaded: boolean
}

interface NotificationListState {
  activeTab: NotificationCategory
  showUnreadOnly: boolean
  categories: Record<NotificationCategory, NotificationCategoryState>
}

interface LegacyNotificationListState {
  activeTab: NotificationCategory
  showUnreadOnly: boolean
  notifications: NotificationItem[]
  loadedCategories: NotificationCategory[]
}

const { t } = useI18n()

const tabs = computed<Array<{ key: NotificationCategory; label: string }>>(() => [
  { key: 'promotions', label: t('notifications.tabs.promotions') },
  { key: 'transactions', label: t('notifications.tabs.transactions') },
  { key: 'system', label: t('notifications.tabs.system') }
])

const tabLabelMap = computed<Record<NotificationCategory, string>>(() => ({
  promotions: t('notifications.tabs.promotions'),
  transactions: t('notifications.tabs.transactions'),
  system: t('notifications.tabs.system')
}))

const showDeleteConfirm = ref(false)
const pendingDelete = ref<{ rowId: number; category: NotificationCategory } | null>(null)
const isDeletingNotification = ref(false)
// 页面分类和接口 msgType 的映射关系
const msgTypeMap: Record<NotificationCategory, number> = {
  promotions: 0,
  transactions: 999,
  system: 1
}

const createEmptyCategoryState = (): NotificationCategoryState => ({
  items: [],
  nextPage: 1,
  finished: false,
  total: null,
  loaded: false
})

const createDefaultCategoryStates = (): Record<
  NotificationCategory,
  NotificationCategoryState
> => ({
  promotions: createEmptyCategoryState(),
  transactions: createEmptyCategoryState(),
  system: createEmptyCategoryState()
})

const cloneCategoryStates = (
  categories: Record<NotificationCategory, NotificationCategoryState>
): Record<NotificationCategory, NotificationCategoryState> => ({
  promotions: { ...categories.promotions, items: [...categories.promotions.items] },
  transactions: { ...categories.transactions, items: [...categories.transactions.items] },
  system: { ...categories.system, items: [...categories.system.items] }
})

const isNotificationCategory = (value: unknown): value is NotificationCategory => {
  return value === 'promotions' || value === 'transactions' || value === 'system'
}

const isNotificationCategoryState = (value: unknown): value is NotificationCategoryState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<NotificationCategoryState>
  return (
    Array.isArray(state.items) &&
    typeof state.nextPage === 'number' &&
    typeof state.finished === 'boolean' &&
    typeof state.loaded === 'boolean' &&
    (typeof state.total === 'number' || state.total === null)
  )
}

const isNotificationListState = (value: unknown): value is NotificationListState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<NotificationListState>
  if (!isNotificationCategory(state.activeTab) || typeof state.showUnreadOnly !== 'boolean') {
    return false
  }

  if (!state.categories || typeof state.categories !== 'object') {
    return false
  }

  return (
    isNotificationCategoryState(state.categories.promotions) &&
    isNotificationCategoryState(state.categories.transactions) &&
    isNotificationCategoryState(state.categories.system)
  )
}

const isLegacyNotificationListState = (value: unknown): value is LegacyNotificationListState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<LegacyNotificationListState>
  return (
    isNotificationCategory(state.activeTab) &&
    typeof state.showUnreadOnly === 'boolean' &&
    Array.isArray(state.notifications) &&
    Array.isArray(state.loadedCategories) &&
    state.loadedCategories.every(category => isNotificationCategory(category))
  )
}

const inferLegacyCategoryState = (
  items: NotificationItem[],
  loaded: boolean
): NotificationCategoryState => {
  const itemCount = items.length
  const finished = loaded && itemCount < PAGE_SIZE

  return {
    items,
    nextPage: loaded ? Math.floor(itemCount / PAGE_SIZE) + 1 : 1,
    finished,
    total: loaded ? itemCount : null,
    loaded
  }
}

const convertLegacyState = (
  state: LegacyNotificationListState
): Record<NotificationCategory, NotificationCategoryState> => {
  const nextCategories = createDefaultCategoryStates()

  ;(['promotions', 'transactions', 'system'] as NotificationCategory[]).forEach(category => {
    const categoryItems = state.notifications.filter(item => item.category === category)
    nextCategories[category] = inferLegacyCategoryState(
      categoryItems,
      state.loadedCategories.includes(category)
    )
  })

  return nextCategories
}

const restoreNotificationListState = (): NotificationListState | null => {
  const rawValue = sessionStorage.getItem(NOTIFICATION_LIST_STATE_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown

    if (isNotificationListState(parsedValue)) {
      return {
        activeTab: parsedValue.activeTab,
        showUnreadOnly: parsedValue.showUnreadOnly,
        categories: cloneCategoryStates(parsedValue.categories)
      }
    }

    if (isLegacyNotificationListState(parsedValue)) {
      return {
        activeTab: parsedValue.activeTab,
        showUnreadOnly: parsedValue.showUnreadOnly,
        categories: convertLegacyState(parsedValue)
      }
    }

    return null
  } catch (error) {
    console.error('restoreNotificationListState failed', error)
    return null
  }
}

const shouldRestoreNotificationListState =
  sessionStorage.getItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY) === '1'
const restoredNotificationListState = shouldRestoreNotificationListState
  ? restoreNotificationListState()
  : null

if (!shouldRestoreNotificationListState) {
  sessionStorage.removeItem(NOTIFICATION_LIST_STATE_STORAGE_KEY)
}

const activeTab = ref<NotificationCategory>(
  restoredNotificationListState?.activeTab ?? 'promotions'
)
const showUnreadOnly = ref(restoredNotificationListState?.showUnreadOnly ?? true)
const categoryStates = ref<Record<NotificationCategory, NotificationCategoryState>>(
  restoredNotificationListState?.categories ?? createDefaultCategoryStates()
)
const loadMoreSentinel = ref<HTMLElement | null>(null)

const updateCategoryState = (
  category: NotificationCategory,
  updater: (state: NotificationCategoryState) => NotificationCategoryState
) => {
  categoryStates.value = {
    ...categoryStates.value,
    [category]: updater(categoryStates.value[category])
  }
}

const mergeCategoryItems = (current: NotificationItem[], incoming: NotificationItem[]) => {
  const seenRowIds = new Set(current.map(item => item.rowId))
  const merged = [...current]

  for (const item of incoming) {
    if (seenRowIds.has(item.rowId)) {
      continue
    }

    seenRowIds.add(item.rowId)
    merged.push(item)
  }

  return merged
}

const notifications = computed(() =>
  (['promotions', 'transactions', 'system'] as NotificationCategory[]).flatMap(
    category => categoryStates.value[category].items
  )
)

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
const activeCategoryState = computed(() => categoryStates.value[activeTab.value])
const activeCategoryLoaded = computed(() => activeCategoryState.value.loaded)
const activeCategoryFinished = computed(() => activeCategoryState.value.finished)

// 按当前 tab + 未读开关过滤出页面实际展示的数据。
const filteredNotifications = computed(() => {
  return activeCategoryState.value.items.filter(item => (showUnreadOnly.value ? !item.read : true))
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
  return item.noticeTitle || tabLabelMap.value[item.category]
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
  const normalizedNoticeText = getNormalizedNoticeText(item)
  const textContent =
    normalizedIsImage === 2 ? stripHtml(normalizedNoticeText) : normalizedNoticeText

  if (textContent) {
    return textContent
  }

  if (normalizedIsImage === 0) {
    return item.linkUrl || t('notifications.tapToViewDetails')
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

const normalizeNoticeContent = (value: string) => {
  return value.replace(/\\n/g, '\n').trim()
}

const decodeHtmlEntities = (value: string) => {
  if (typeof document === 'undefined') {
    return value
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

const cleanupEncodedRichText = (value: string) => {
  return value
    .replace(/<p>\s*(<(?:h[1-6]|p|blockquote|ul|ol)[^>]*>)/gi, '$1')
    .replace(/(<\/(?:h[1-6]|p|blockquote|ul|ol)>)\s*<\/p>/gi, '$1')
    .replace(/<br\s*\/?>\s*(<\/?(?:h[1-6]|p|blockquote|ul|ol|li)\b)/gi, '$1')
    .replace(/(<\/(?:h[1-6]|p|blockquote|ul|ol|li)>)\s*<br\s*\/?>/gi, '$1')
    .trim()
}

const getNormalizedNoticeText = (item: NotificationItem) => {
  const rawContent = normalizeNoticeContent(item.noticeText || '')
  const decodedContent = decodeHtmlEntities(rawContent)

  if (decodedContent === rawContent) {
    return rawContent
  }

  return cleanupEncodedRichText(decodedContent)
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

// 持久化通知列表页状态，用于详情返回时直接恢复。
const persistNotificationListState = () => {
  const nextState: NotificationListState = {
    activeTab: activeTab.value,
    showUnreadOnly: showUnreadOnly.value,
    categories: cloneCategoryStates(categoryStates.value)
  }

  sessionStorage.setItem(NOTIFICATION_LIST_STATE_STORAGE_KEY, JSON.stringify(nextState))
}

// 清理通知列表页缓存和一次性恢复标记。
const clearNotificationListState = () => {
  sessionStorage.removeItem(NOTIFICATION_LIST_STATE_STORAGE_KEY)
  sessionStorage.removeItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY)
}

const fetchNotificationPage = async (
  category: NotificationCategory,
  page: number,
  pageSize: number
) => {
  const languageCode = getLanguageCode()

  const res = await Api.notifications.queryNoticeMsg({
    languageCode,
    msgType: msgTypeMap[category],
    channelId: 4,
    sysLevelId: '1',
    page: { current: page, size: pageSize }
  })

  return getQueryResult(res)
}

const syncCategoryPage = (
  category: NotificationCategory,
  appendedItems: NotificationItem[],
  currentPage: number,
  total: number
) => {
  updateCategoryState(category, state => {
    const mergedItems = mergeCategoryItems(state.items, appendedItems)
    const nextPage = currentPage + 1
    const finished = currentPage * PAGE_SIZE >= total

    return {
      ...state,
      items: mergedItems,
      nextPage,
      finished,
      total,
      loaded: true
    }
  })
}

const createCategoryLoader = (category: NotificationCategory) =>
  useInfiniteScroll<NotificationItem, QueryNoticeMsgResult>({
    sentinel: loadMoreSentinel,
    enabled: () => activeTab.value === category && !categoryStates.value[category].finished,
    initialPage: categoryStates.value[category].nextPage,
    pageSize: PAGE_SIZE,
    threshold: 0,
    rootMargin: '0px 0px 200px 0px',
    load: async ({ page, pageSize }) => fetchNotificationPage(category, page, pageSize),
    getItems: response =>
      applyNotificationCache(
        response.records.map(record => mapRecordToNotification(record, category))
      ),
    getTotal: response => response.total,
    getHasMore: (response, { page, pageSize }) => page * pageSize < response.total,
    dedupeBy: item => item.rowId,
    onSuccess: (response, { appended, page }) => {
      syncCategoryPage(category, appended, page, response.total)
    },
    onError: error => {
      console.error(`fetchNotificationsByCategory failed: ${category}`, error)
    }
  })

const categoryLoaders = {
  promotions: createCategoryLoader('promotions'),
  transactions: createCategoryLoader('transactions'),
  system: createCategoryLoader('system')
}

const activeCategoryLoading = computed(() => categoryLoaders[activeTab.value].loading.value)

const prefetchCategoryBadge = async (category: NotificationCategory) => {
  if (activeTab.value === category || categoryStates.value[category].loaded) {
    return
  }

  try {
    const result = await fetchNotificationPage(category, 1, PAGE_SIZE)
    const mappedItems = applyNotificationCache(
      result.records.map(record => mapRecordToNotification(record, category))
    )
    syncCategoryPage(category, mappedItems, 1, result.total)
  } catch (error) {
    console.error(`prefetchCategoryBadge failed: ${category}`, error)
  }
}

const initializeNotificationCategories = () => {
  void prefetchCategoryBadge('promotions')
  void prefetchCategoryBadge('system')
}

// 删除单条通知（通过 rowId + category 定位）。
const removeNotification = (rowId: number, category: NotificationCategory) => {
  pendingDelete.value = { rowId, category }
  showDeleteConfirm.value = true
}

// 打开通知详情页，并同步更新当前列表中的已读状态。
// TODO：后续可能细分跳转逻辑
// if (jumpType == 1) {
//   // URL跳转
//   if (linkType == 0) {
//     // 不跳转
//   } else if (linkType == 1) {
//     // 内部URL跳转
//     // H5/PC：嵌套打开
//     // APP：应用内打开
//     // 目标地址看 linkUrl
//   } else if (linkType == 2) {
//     // 外部URL跳转
//     // H5/PC：新窗口
//     // APP：浏览器打开
//     // 目标地址看 linkUrl
//   }
// } else if (jumpType == 2) {
//   // 内部页面跳转
//   if (linkType == 1) {
//     // 活动
//   } else if (linkType == 2) {
//     // 充值栏目
//   } else if (linkType == 3) {
//     // 分享转盘
//   } else if (linkType == 4) {
//     // 充值页面
//   } else if (linkType == 5) {
//     // 积分转盘
//   }
//   // 具体参数可能也看 linkUrl
// } else if (jumpType == 3) {
//   // 跳转游戏
//   // 具体目标可能看 linkUrl
// }
const openNotificationDetail = (item: NotificationItem) => {
  markNotificationAsRead(item.rowId)
  updateCategoryState(item.category, state => ({
    ...state,
    items: state.items.map(notification =>
      notification.rowId === item.rowId ? { ...notification, read: true } : notification
    )
  }))
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

    updateCategoryState(category, state => ({
      ...state,
      items: state.items.filter(item => item.rowId !== rowId)
    }))
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
  const currentTabIds = activeCategoryState.value.items.map(item => item.rowId)
  markNotificationsAsRead(currentTabIds)
  updateCategoryState(activeTab.value, state => ({
    ...state,
    items: state.items.map(item => ({ ...item, read: true }))
  }))
}

sessionStorage.removeItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY)

if (!restoredNotificationListState) {
  clearNotificationListState()
  initializeNotificationCategories()
}

// 监听页面状态变化，持续写入列表页缓存。
watch(
  [activeTab, showUnreadOnly, categoryStates],
  () => {
    persistNotificationListState()
  },
  { deep: true }
)
</script>
