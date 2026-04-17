<template>
  <!-- 通知列表页面 -->
  <section
    :class="
      props.panelMode
        ? 'notification-list-page h-full bg-bg-1'
        : 'notification-list-page fixed inset-0 z-[60] overflow-y-auto bg-bg-1'
    "
  >
    <!-- 通知列表容器 -->
    <div
      :class="
        props.panelMode
          ? 'notifications-shell flex h-full min-h-0 flex-col bg-bg-1'
          : 'notifications-shell min-h-screen bg-bg-1 sm:mx-auto sm:max-w-[420px]'
      "
      style="font-family: Inter, avertastd, sans-serif"
    >
      <!-- 页面头部 -->
      <H5Header
        :title="$t('notifications.title')"
        :show-sort="props.panelMode"
        :show-back="!props.panelMode"
        :right-icon="props.panelMode ? CloseIcon : undefined"
        :fixed-top="!props.panelMode"
        :disable-default-back="props.panelMode"
        @back="handleHeaderBack"
        @sort="handlePanelClose"
      />

      <!-- 页面主体 -->
      <main
        :class="
          props.panelMode
            ? 'page-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-3'
            : 'page-body px-[14px] pb-[calc(env(safe-area-inset-bottom)+74px)] pt-[14px]'
        "
      >
        <!-- 通知分类导航 -->
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

        <!-- 通知列表区域 -->
        <section
          v-if="filteredNotifications.length > 0"
          class="notice-stack mt-[14px] flex flex-col gap-[10px]"
        >
          <!-- 通知卡片 -->
          <article
            v-for="item in filteredNotifications"
            :key="item.localId"
            class="notice-card flex flex-col"
            :class="[
              isTransactionNotification(item)
                ? props.panelMode
                  ? 'min-h-[168px] gap-[14px] rounded-[18px] bg-bg-2 px-[16px] pb-0 pt-[16px]'
                  : 'min-h-[120px] gap-[10px] rounded-[10px] bg-bg-2 px-[14px] pb-0 pt-[14px]'
                : 'gap-[10px] rounded-[10px] bg-bg-2 px-[14px] pb-[10px] pt-[14px]',
              { 'notice-card-read opacity-[0.72]': item.read }
            ]"
          >
            <template v-if="isTransactionNotification(item)">
              <!-- 交易通知内容 -->
              <div
                class="notice-title-row flex w-full items-center"
                :class="props.panelMode ? 'min-h-[22px] gap-[8px]' : 'min-h-[17px] gap-[7px]'"
              >
                <h2
                  class="notice-title min-w-0 break-words font-[700] text-text-1"
                  :class="
                    props.panelMode
                      ? 'max-w-[220px] text-[16px] leading-[22px]'
                      : 'max-w-[159px] text-[14px] leading-[17px]'
                  "
                >
                  {{ getNoticeTitle(item) }}
                </h2>
                <span
                  class="notice-dot h-[8px] w-[8px] shrink-0 rounded-full bg-theme-primary"
                  :class="['h-[8px] w-[8px]', getTransactionStatusDotClass(item)]"
                ></span>
              </div>

              <!-- 交易通知正文 -->
              <p
                class="notice-message w-full break-words font-[400] text-text-1"
                :class="
                  props.panelMode
                    ? 'min-h-[54px] text-[13px] leading-[18px]'
                    : 'min-h-[30px] text-[12px] leading-[15px]'
                "
              >
                {{ getTransactionMessage(item) }}
              </p>

              <!-- 交易通知底部信息 -->
              <div
                class="notice-footer flex w-full items-center justify-between border-t border-t-white/[0.06]"
                :class="
                  props.panelMode ? 'min-h-[52px] gap-[12px] py-[12px]' : 'gap-[12px] py-[10px]'
                "
              >
                <time
                  class="notice-time font-[400] text-text-2"
                  :class="'text-[12px] leading-[15px]'"
                >
                  {{ getNoticeTime(item) }}
                </time>

                <button
                  type="button"
                  class="delete-button inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
                  :class="
                    props.panelMode
                      ? 'h-[24px] w-[24px] rounded-[8px]'
                      : 'h-[20px] w-[20px] rounded-[6px]'
                  "
                  @click.stop="removeNotification(item)"
                  :aria-label="$t('notifications.deleteAria')"
                >
                  <component :is="delIcon" class="h-[13px] w-[13px]" />
                </button>
              </div>
            </template>

            <template v-else>
              <!-- 普通通知点击区域 -->
              <div class="cursor-pointer" @click="openNotificationDetail(item)">
                <!-- 普通通知标题区域 -->
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

                <!-- 通知预览图片区 -->
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

                <!-- 通知预览文本区 -->
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

              <!-- 普通通知底部信息 -->
              <div
                class="notice-footer flex items-center justify-between gap-[12px]"
                :class="
                  !hasPreviewImage(item)
                    ? 'border-t border-t-[var(--color-opacity-6,#FFFFFF0F)] pt-[10px]'
                    : ''
                "
              >
                <time
                  class="notice-time cursor-pointer text-[12px] font-[400] leading-[1.2] text-text-2"
                  @click="openNotificationDetail(item)"
                >
                  {{ getNoticeTime(item) }}
                </time>

                <button
                  type="button"
                  class="delete-button inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
                  @click.stop="removeNotification(item)"
                  :aria-label="$t('notifications.deleteAria')"
                >
                  <component :is="delIcon" class="h-[13px] w-[13px]" />
                </button>
              </div>
            </template>
          </article>
        </section>

        <!-- 首次加载提示 -->
        <div
          v-else-if="activeCategoryLoading && !activeCategoryLoaded"
          class="mt-[14px] flex items-center justify-center py-[36px] text-[12px] text-text-2"
        >
          {{ $t('notifications.loading') }}
        </div>

        <!-- 空状态 -->
        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :image-alt="$t('notifications.title')"
          :message="$t('notifications.emptyMessage')"
          text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
        />

        <!-- 加载更多监听锚点 -->
        <div ref="loadMoreSentinel" class="h-px w-full"></div>

        <!-- 加载更多提示 -->
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

      <!-- 页面底部操作栏 -->
      <footer
        :class="
          props.panelMode
            ? 'bottom-bar shrink-0 flex h-[49px] items-center justify-between gap-[14px] bg-bg-2 px-[14px]'
            : 'bottom-bar fixed bottom-0 left-0 right-0 z-20 flex h-[calc(env(safe-area-inset-bottom)+49px)] items-center justify-between gap-[14px] bg-bg-2 px-[14px] pb-[calc(env(safe-area-inset-bottom)+10px)] pt-[10px]'
        "
      >
        <!-- 未读筛选按钮 -->
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
              class="toggle-thumb absolute left-[3px] top-[3px] h-[15px] w-[15px] rounded-full bg-common-60 shadow-sm transition-[transform,background-color] duration-200"
              :class="
                showUnreadOnly
                  ? 'toggle-thumb-active translate-x-[18px] bg-theme-primary'
                  : 'translate-x-0'
              "
            ></span>
          </span>
        </button>

        <!-- 全部标已读按钮 -->
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

      <!-- 删除确认弹窗遮罩 -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-30 flex items-center justify-center bg-mask-60-1 px-[14px]"
        @click.self="closeDeleteConfirm"
      >
        <!-- 删除确认弹窗 -->
        <section
          :class="
            props.panelMode
              ? 'w-full max-w-[492px] rounded-3xl bg-bg-5 p-8'
              : 'relative w-full max-w-[300px] rounded-[14px] bg-bg-1 p-[20px]'
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-notification-title"
          aria-describedby="delete-notification-description"
        >
          <template v-if="props.panelMode">
            <!-- PC 弹窗内容区 -->
            <div class="flex flex-col gap-6">
              <!-- PC 弹窗文案区 -->
              <div class="flex flex-col gap-4">
                <!-- PC 弹窗标题行 -->
                <div class="flex items-start justify-between gap-6">
                  <h2
                    id="delete-notification-title"
                    class="text-[20px] font-[700] leading-6 text-text-1 capitalize"
                  >
                    {{ $t('notifications.deleteDialog.title') }}
                  </h2>

                  <!-- PC 弹窗关闭按钮 -->
                  <button
                    type="button"
                    class="inline-flex h-6 w-6 items-center justify-center rounded bg-opacity-10"
                    @click="closeDeleteConfirm"
                    :aria-label="$t('notifications.closeDeleteDialogAria')"
                  >
                    <component :is="CloseIcon" class="h-3 w-3 text-text-1" />
                  </button>
                </div>

                <p
                  id="delete-notification-description"
                  class="text-sm font-[400] leading-5 text-text-2"
                >
                  {{ $t('notifications.deleteDialog.description') }}
                </p>
              </div>

              <!-- PC 弹窗操作区 -->
              <div class="flex gap-6">
                <button
                  type="button"
                  class="inline-flex h-12 flex-1 items-center justify-center rounded-lg bg-opacity-10 text-sm font-[700] leading-[17px] text-text-2"
                  :disabled="isDeletingNotification"
                  @click="closeDeleteConfirm"
                >
                  {{ $t('common.cancel') }}
                </button>

                <button
                  type="button"
                  class="inline-flex h-12 flex-1 items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] leading-[17px] text-text-4"
                  :disabled="isDeletingNotification"
                  @click="confirmRemoveNotification"
                >
                  {{
                    isDeletingNotification
                      ? $t('notifications.deleteDialog.confirmLoading')
                      : $t('notifications.deleteDialog.confirm')
                  }}
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <!-- H5 弹窗关闭按钮 -->
            <button
              type="button"
              class="absolute right-[14px] top-[14px] inline-flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-opacity-10"
              @click="closeDeleteConfirm"
              :aria-label="$t('notifications.closeDeleteDialogAria')"
            >
              <component :is="CloseIcon" class="h-2.5 w-2.5 text-icon-1" />
            </button>

            <!-- H5 弹窗内容区 -->
            <div class="flex flex-col gap-[30px]">
              <!-- H5 弹窗文案区 -->
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

              <!-- H5 弹窗操作区 -->
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
          </template>
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
import { useAuthModalStore } from '@/stores/authModal'
import { useTradeMessageSyncStore } from '@/stores/tradeMessageSync'
import { formatDisplayTime } from '@/utils/date'
import { getLanguageCode } from '@/utils/locale'
import {
  getDeletedNotificationIds,
  getReadNotificationIds,
  markNotificationAsDeleted,
  markNotificationAsRead,
  markNotificationsAsRead
} from '@/utils/notification-cache'
import type { TradeMessageStreamItem } from '@/utils/payOrderSync'
import { getPayOrderDisplayStatus, normalizePayOrderType } from '@/utils/payOrderSync'
import { navigateTo } from '@/utils/router'
import { closeToast, showLoadingToast, showToast } from 'vant'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

// 通知分类类型。
type NotificationCategory = 'promotions' | 'transactions' | 'system'
// 通知分类常量列表，统一用于遍历所有通知 tab。
const NOTIFICATION_CATEGORIES: NotificationCategory[] = ['promotions', 'transactions', 'system']
// 通知列表单次分页拉取数量。
const PAGE_SIZE = 30
// 通知详情数据在 sessionStorage 中的缓存键。
const NOTIFICATION_DETAIL_STORAGE_KEY = 'menuNotificationDetail'
// 通知列表状态在 sessionStorage 中的缓存键。
const NOTIFICATION_LIST_STATE_STORAGE_KEY = 'menuNotificationListState'
// 通知列表恢复标记在 sessionStorage 中的缓存键。
const NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY = 'menuNotificationListRestoreFlag'
// 通知内部 URL 连通性校验的超时时间。
const NOTIFICATION_URL_OPEN_TIMEOUT_MS = 8000

interface NotificationItem extends NoticeRecord {
  category: NotificationCategory
  read: boolean
  localId: string
  transactionKey?: string
  tradeMessage?: TradeMessageStreamItem
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

const hashNotificationKey = (value: string) => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash) + 1
}

const props = withDefaults(
  defineProps<{
    panelMode?: boolean
  }>(),
  {
    panelMode: false
  }
)

const emit = defineEmits<{
  'open-detail': [item: NotificationItem]
  close: []
}>()

// 登录弹窗状态管理。
const authModalStore = useAuthModalStore()
// 充提消息同步状态管理。
const tradeMessageSyncStore = useTradeMessageSyncStore()
// 当前页面的国际化方法。
const { t } = useI18n()

// 生成顶部分类 tabs 数据。
const tabs = computed<Array<{ key: NotificationCategory; label: string }>>(() => [
  { key: 'promotions', label: t('notifications.tabs.promotions') },
  { key: 'transactions', label: t('notifications.tabs.transactions') },
  { key: 'system', label: t('notifications.tabs.system') }
])

// 生成分类标题映射表，供回退标题使用。
const tabLabelMap = computed<Record<NotificationCategory, string>>(() => ({
  promotions: t('notifications.tabs.promotions'),
  transactions: t('notifications.tabs.transactions'),
  system: t('notifications.tabs.system')
}))

const showDeleteConfirm = ref(false)
const pendingDelete = ref<NotificationItem | null>(null)
const isDeletingNotification = ref(false)
// 页面分类和接口 msgType 的映射关系
const msgTypeMap: Record<NotificationCategory, number> = {
  promotions: 0,
  transactions: 999,
  system: 1
}

// 创建单个分类的初始状态。
const createEmptyCategoryState = (): NotificationCategoryState => ({
  items: [],
  nextPage: 1,
  finished: false,
  total: null,
  loaded: false
})

// 创建全部分类的默认状态集合。
const createDefaultCategoryStates = (): Record<
  NotificationCategory,
  NotificationCategoryState
> => ({
  promotions: createEmptyCategoryState(),
  transactions: createEmptyCategoryState(),
  system: createEmptyCategoryState()
})

// 深拷贝分类状态，避免直接复用响应式对象引用。
const cloneCategoryStates = (
  categories: Record<NotificationCategory, NotificationCategoryState>
): Record<NotificationCategory, NotificationCategoryState> => ({
  promotions: { ...categories.promotions, items: [...categories.promotions.items] },
  transactions: { ...categories.transactions, items: [...categories.transactions.items] },
  system: { ...categories.system, items: [...categories.system.items] }
})

// 判断值是否为合法的通知分类。
const isNotificationCategory = (value: unknown): value is NotificationCategory => {
  return value === 'promotions' || value === 'transactions' || value === 'system'
}

// 判断值是否为合法的分类状态对象。
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

// 判断值是否为当前通知列表缓存结构。
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

// 从 sessionStorage 恢复通知列表缓存状态。
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
const showUnreadOnly = ref(restoredNotificationListState?.showUnreadOnly ?? false)
const categoryStates = ref<Record<NotificationCategory, NotificationCategoryState>>(
  restoredNotificationListState?.categories ?? createDefaultCategoryStates()
)
const loadMoreSentinel = ref<HTMLElement | null>(null)

// 以不可变方式更新指定分类的状态。
const updateCategoryState = (
  category: NotificationCategory,
  updater: (state: NotificationCategoryState) => NotificationCategoryState
) => {
  categoryStates.value = {
    ...categoryStates.value,
    [category]: updater(categoryStates.value[category])
  }
}

// 合并分类数据并按 rowId 去重。
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

// 将充提消息金额格式化为文案中的展示形式。
const formatTransactionAmountText = (item: TradeMessageStreamItem) => {
  const rawAmount = item.busiAmount ?? item.amount
  const normalizedAmount = Number(rawAmount)
  const amountText = Number.isFinite(normalizedAmount)
    ? Number.isInteger(normalizedAmount)
      ? String(normalizedAmount)
      : String(normalizedAmount)
    : String(rawAmount ?? '').trim()
  const currencyText = String(item.currency ?? '').trim()

  return [amountText, currencyText].filter(Boolean).join(' ')
}

// 将充提消息转换为交易通知卡片数据。
const mapTradeMessageToNotification = (item: TradeMessageStreamItem): NotificationItem => {
  const transactionKey = item.key
  const rowId = hashNotificationKey(transactionKey)

  return {
    channelId: [],
    createTime: item.messageTime,
    enable: 1,
    isImage: 0,
    jumpType: undefined,
    languageCode: getLanguageCode(),
    linkUrl: '',
    linkType: undefined,
    loginAfterPopWay: 0,
    loginBeforePopWay: 0,
    msgType: 'transactions',
    noticeText: '',
    noticeTitle: '',
    noticeType: '0',
    pushChannel: '',
    recipientObj: 0,
    rowId,
    site: '',
    sort: 0,
    category: 'transactions',
    read: tradeMessageSyncStore.readMessageKeys.includes(transactionKey),
    localId: `transactions-${transactionKey}`,
    transactionKey,
    tradeMessage: item
  }
}

// 生成交易通知列表，删除后的消息不会继续展示。
const transactionNotifications = computed(() =>
  tradeMessageSyncStore.messageStream
    .filter(item => !tradeMessageSyncStore.deletedMessageKeys.includes(item.key))
    .map(item => mapTradeMessageToNotification(item))
)

// 构造交易分类的运行时状态，便于和普通通知共用列表逻辑。
const transactionCategoryState = computed<NotificationCategoryState>(() => ({
  items: transactionNotifications.value,
  nextPage: 1,
  finished: true,
  total: transactionNotifications.value.length,
  loaded: tradeMessageSyncStore.isInitialized
}))

// 聚合所有分类通知，供未读数量统计使用。
const notifications = computed(() =>
  NOTIFICATION_CATEGORIES.flatMap(category =>
    category === 'transactions'
      ? transactionCategoryState.value.items
      : categoryStates.value[category].items
  )
)

// 按分类统计未读数量，用于顶部 tab 徽标显示。
const unreadCountByCategory = computed<Record<NotificationCategory, number>>(() => {
  return notifications.value.reduce(
    (acc, item) => {
      if (item.category === 'transactions') {
        if (
          !item.read &&
          item.transactionKey &&
          !tradeMessageSyncStore.clearedBadgeMessageKeys.includes(item.transactionKey)
        ) {
          acc.transactions += 1
        }

        return acc
      }

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
const activeCategoryState = computed(() =>
  activeTab.value === 'transactions'
    ? transactionCategoryState.value
    : categoryStates.value[activeTab.value]
)
const activeCategoryLoaded = computed(() => activeCategoryState.value.loaded)
const activeCategoryFinished = computed(() => activeCategoryState.value.finished)

// 按当前 tab + 未读开关过滤出页面实际展示的数据。
const filteredNotifications = computed(() => {
  return activeCategoryState.value.items.filter(item => (showUnreadOnly.value ? !item.read : true))
})

// 判断是否为交易通知，用于切换交易卡片样式。
const isTransactionNotification = (item: NotificationItem) => {
  return item.category === 'transactions'
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
  if (isTransactionNotification(item) && item.tradeMessage) {
    const orderType = normalizePayOrderType(item.tradeMessage.orderType)
    const displayStatus = getPayOrderDisplayStatus(orderType, item.tradeMessage.status)

    if (orderType === '0') {
      return displayStatus === 'success'
        ? 'Deposit Successful'
        : displayStatus === 'failed'
          ? 'Deposit Failed'
          : 'Deposit in Progress'
    }

    return displayStatus === 'success'
      ? 'Withdrawal Successful'
      : displayStatus === 'failed'
        ? 'Withdrawal Failed'
        : 'Withdrawal in Progress'
  }

  return item.noticeTitle || tabLabelMap.value[item.category]
}

// 获取交易卡片正文内容。
const getTransactionMessage = (item: NotificationItem) => {
  if (!item.tradeMessage) {
    return item.noticeText || getNoticeTitle(item)
  }

  const orderType = normalizePayOrderType(item.tradeMessage.orderType)
  const displayStatus = getPayOrderDisplayStatus(orderType, item.tradeMessage.status)
  const amountText = formatTransactionAmountText(item.tradeMessage)

  if (orderType === '0') {
    if (displayStatus === 'success') {
      return `Your ${amountText} deposit has been completed successfully. Enjoy your game!`
    }

    if (displayStatus === 'failed') {
      return `Your ${amountText} deposit could not be completed. Please try again or contact support.`
    }

    return `Your ${amountText} deposit proof has been submitted successfully and is currently under review.`
  }

  if (displayStatus === 'success') {
    return `Your withdrawal of ${amountText} has been completed successfully.`
  }

  if (displayStatus === 'failed') {
    return `Your withdrawal of ${amountText} could not be completed. Please try again or contact support.`
  }

  return `Your withdrawal request for ${amountText} is being processed. Please wait patiently.`
}

// 返回交易通知圆点颜色。
const getTransactionStatusDotClass = (item: NotificationItem) => {
  if (!item.tradeMessage) {
    return 'bg-theme-primary'
  }

  const orderType = normalizePayOrderType(item.tradeMessage.orderType)
  const displayStatus = getPayOrderDisplayStatus(orderType, item.tradeMessage.status)

  if (displayStatus === 'success') {
    return 'bg-[#2AEE88]'
  }

  if (displayStatus === 'failed') {
    return 'bg-[#FF6B6B]'
  }

  return 'bg-[#FFB020]'
}

// 将 createTime 格式化为页面展示时间。
const getNoticeTime = (item: NotificationItem) => {
  return formatDisplayTime(item.createTime)
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

// 规整通知正文中的换行与首尾空白。
const normalizeNoticeContent = (value: string) => {
  return value.replace(/\\n/g, '\n').trim()
}

// 解码正文中的 HTML 实体字符。
const decodeHtmlEntities = (value: string) => {
  if (typeof document === 'undefined') {
    return value
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

// 清理被错误包裹的富文本标签结构。
const cleanupEncodedRichText = (value: string) => {
  return value
    .replace(/<p>\s*(<(?:h[1-6]|p|blockquote|ul|ol)[^>]*>)/gi, '$1')
    .replace(/(<\/(?:h[1-6]|p|blockquote|ul|ol)>)\s*<\/p>/gi, '$1')
    .replace(/<br\s*\/?>\s*(<\/?(?:h[1-6]|p|blockquote|ul|ol|li)\b)/gi, '$1')
    .replace(/(<\/(?:h[1-6]|p|blockquote|ul|ol|li)>)\s*<br\s*\/?>/gi, '$1')
    .trim()
}

// 获取通知正文的规范化内容。
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
    localId: `${category}-${record.rowId}`,
    msgType: record.msgType || category,
    read: Number(record.readStatus) === 1
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
      read: item.read || readIds.has(item.rowId)
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

// 为离开通知列表的同 tab 跳转保存恢复现场。
const prepareNotificationListRestore = () => {
  persistNotificationListState()
  sessionStorage.setItem(NOTIFICATION_LIST_RESTORE_FLAG_STORAGE_KEY, '1')
}

// 请求指定分类的通知分页数据。
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

// 将新分页数据同步到指定分类状态中。
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

// 为指定分类创建独立的无限滚动加载器。
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
  transactions: {
    loading: computed(() => activeTab.value === 'transactions' && tradeMessageSyncStore.isSyncing)
  },
  system: createCategoryLoader('system')
}

const activeCategoryLoading = computed(() => categoryLoaders[activeTab.value].loading.value)

// 当用户停留在交易通知 tab 时，将当前交易消息标记为已读。
const markTransactionsAsReadOnView = () => {
  if (activeTab.value !== 'transactions') {
    return
  }

  // // 清空 Transactions 提示角标，但不改动消息已读状态。
  // tradeMessageSyncStore.clearTradeMessageBadges(
  //   transactionNotifications.value
  //     .map(item => item.transactionKey)
  //     .filter((item): item is string => Boolean(item))
  // )
}

// 预取非当前分类的第一页数据，用于提前展示未读徽标。
const prefetchCategoryBadge = async (category: NotificationCategory) => {
  if (category === 'transactions') {
    return
  }

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

// 初始化通知分类数据。
const initializeNotificationCategories = () => {
  NOTIFICATION_CATEGORIES.forEach(category => {
    void prefetchCategoryBadge(category)
  })
}

// 删除单条通知（通过 rowId + category 定位）。
const removeNotification = (item: NotificationItem) => {
  pendingDelete.value = item
  showDeleteConfirm.value = true
}

// 处理页面头部返回按钮：PC 面板模式返回改为关闭面板。
const handleHeaderBack = () => {
  if (!props.panelMode) {
    return
  }

  emit('close')
}

// 处理页面头部右侧关闭按钮。
const handlePanelClose = () => {
  if (!props.panelMode) {
    return
  }

  emit('close')
}

// promotions/system 执行 URL 跳转前展示加载提示。
const showNotificationJumpLoading = () => {
  showLoadingToast({
    message: t('common.loading'),
    duration: 0,
    forbidClick: true,
    loadingType: 'spinner'
  })
}

// 关闭通知跳转中的加载提示。
const hideNotificationJumpLoading = () => {
  closeToast()
}

// 通知跳转失败时弹出提示。
const showNotificationJumpFailedToast = () => {
  showToast({
    message: t('notifications.jumpOpenFailed'),
    position: 'middle',
    type: 'fail'
  })
}

// 页面卸载时兜底关闭跳转中的加载提示，避免残留到新页面。
onUnmounted(() => {
  hideNotificationJumpLoading()
})

// 将通知标记为已读，并同步本地列表状态。
const markNotificationAsReadInState = (item: NotificationItem) => {
  if (item.transactionKey) {
    tradeMessageSyncStore.markTradeMessageAsRead(item.transactionKey)
    return
  }

  markNotificationAsRead(item.rowId)
  updateCategoryState(item.category, state => ({
    ...state,
    items: state.items.map(notification =>
      notification.rowId === item.rowId ? { ...notification, read: true } : notification
    )
  }))
}

// 打开通知详情页。
const openNotificationDetailPage = (item: NotificationItem) => {
  if (props.panelMode) {
    emit('open-detail', item)
    return
  }

  prepareNotificationListRestore()
  sessionStorage.setItem(NOTIFICATION_DETAIL_STORAGE_KEY, JSON.stringify(item))
  navigateTo('/menu/notifications/detail', {
    query: {
      rowId: String(item.rowId),
      category: item.category
    }
  })
}

// 将 jumpType 规整为数字，值含义：
// 0 不跳转
// 1 URL 跳转
// 2 跳转内部页面
// 3 跳转游戏
const getNormalizedJumpType = (value: number | undefined) => Number(value) || 0

// 将 linkType 规整为数字。
// jumpType = 1 时：0 不跳转、1 内部 URL、2 外部 URL。
// jumpType = 2 时：0 不跳转、1 活动、2 充值栏目、3 分享转盘、4 充值页面、5 积分转盘、6 邀请好友、7 登录注册页。
const getNormalizedLinkType = (value: number | undefined) => Number(value) || 0

// 将 linkUrl 规整为去除首尾空白的字符串。
const getNormalizedLinkUrl = (value: string | undefined) => String(value ?? '').trim()

// 判断链接是否为 http/https 绝对地址。
const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value)

// 判断链接是否为项目内部可识别的路由路径。
const isInternalRoutePath = (value: string) =>
  /^\/?[A-Za-z0-9/_-]+(?:\?[A-Za-z0-9\-._~%!$&'()*+,;=:@/?]*)?(?:#[^\s]*)?$/.test(value)

// 在同页打开内部 URL 前，先做一次连通性校验。
const verifyNotificationInternalUrl = async (linkUrl: string) => {
  if (!isAbsoluteHttpUrl(linkUrl)) {
    return true
  }

  const abortController = new AbortController()
  const timeoutId = window.setTimeout(
    () => abortController.abort(),
    NOTIFICATION_URL_OPEN_TIMEOUT_MS
  )

  try {
    await fetch(linkUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: abortController.signal
    })
    return true
  } catch (error) {
    console.error('verifyNotificationInternalUrl failed', error)
    return false
  } finally {
    window.clearTimeout(timeoutId)
  }
}

// 判断通知是否配置了列表页直接跳转行为。
const isJumpNotification = (item: NotificationItem) => {
  // jumpType：0 不跳转、1 URL 跳转、2 跳转内部页面、3 跳转游戏。
  const jumpType = getNormalizedJumpType(item.jumpType)
  // linkType：在不同 jumpType 下代表不同子类型，具体含义见上方注释。
  const linkType = getNormalizedLinkType(item.linkType)
  const linkUrl = getNormalizedLinkUrl(item.linkUrl)

  if (jumpType === 1) {
    return (linkType === 1 || linkType === 2) && Boolean(linkUrl)
  }

  if (jumpType === 2) {
    return linkType > 0 || Boolean(linkUrl)
  }

  if (jumpType === 3) {
    return Boolean(linkUrl)
  }

  return false
}

// 处理通知配置的内部 URL 跳转。
const openNotificationInternalUrl = async (linkUrl: string) => {
  if (!linkUrl) {
    return false
  }

  if (isAbsoluteHttpUrl(linkUrl)) {
    const canOpen = await verifyNotificationInternalUrl(linkUrl)
    if (!canOpen) {
      return false
    }

    prepareNotificationListRestore()
    return Boolean(window.open(linkUrl, '_self'))
  }

  if (!isInternalRoutePath(linkUrl)) {
    return false
  }

  prepareNotificationListRestore()
  const navigationResult = await navigateTo(linkUrl)

  if (
    navigationResult &&
    (isNavigationFailure(navigationResult, NavigationFailureType.aborted) ||
      isNavigationFailure(navigationResult, NavigationFailureType.cancelled))
  ) {
    return false
  }

  return true
}

// 处理“跳转内部页面”类型的通知点击。
const handleInternalPageJump = async (item: NotificationItem) => {
  // linkType：1 活动、2 充值栏目、3 分享转盘、4 充值页面、5 积分转盘、6 邀请好友、7 登录注册页。
  const linkType = getNormalizedLinkType(item.linkType)
  const linkUrl = getNormalizedLinkUrl(item.linkUrl)

  if (await openNotificationInternalUrl(linkUrl)) {
    return true
  }

  if (linkType === 2 || linkType === 4) {
    prepareNotificationListRestore()
    await navigateTo('/deposit')
    return true
  }

  if (linkType === 6) {
    prepareNotificationListRestore()
    await navigateTo('/menu/referral')
    return true
  }

  if (linkType === 7) {
    authModalStore.openLoginModal()
    return true
  }

  return false
}

// 处理“跳转游戏”类型的通知点击。
const handleGameJump = async (item: NotificationItem) => {
  const [pgType, platformCode, gameCode] = getNormalizedLinkUrl(item.linkUrl)
    .split('|')
    .map(value => value.trim())

  if (!pgType || !platformCode || !gameCode) {
    console.warn('notification game jump payload invalid', item)
    return false
  }

  prepareNotificationListRestore()

  try {
    const response = await Api.game.getloginPlatform({
      pgType,
      platformCode,
      gameCode
    })

    const platformLink = String(response?.result?.platformLink ?? '').trim()
    if (!platformLink) {
      console.warn('notification game jump missing platformLink', response)
      return false
    }

    window.open(platformLink, '_self')
    return true
  } catch (error) {
    console.error('handleGameJump failed', error)
    return false
  }
}

// 点击通知：跳转型直接执行跳转，其余进入详情。
const openNotificationDetail = async (item: NotificationItem) => {
  markNotificationAsReadInState(item)

  if (!isJumpNotification(item)) {
    openNotificationDetailPage(item)
    return
  }

  // jumpType：0 不跳转、1 URL 跳转、2 跳转内部页面、3 跳转游戏。
  const jumpType = getNormalizedJumpType(item.jumpType)
  // linkType：jumpType = 1 时表示 URL 类型；jumpType = 2 时表示内部页面类型。
  const linkType = getNormalizedLinkType(item.linkType)
  const linkUrl = getNormalizedLinkUrl(item.linkUrl)
  const shouldShowUrlJumpLoading = item.category !== 'transactions' && jumpType === 1

  if (jumpType === 1) {
    try {
      if (shouldShowUrlJumpLoading) {
        showNotificationJumpLoading()
      }

      if (linkType === 2 && isAbsoluteHttpUrl(linkUrl)) {
        window.open(linkUrl, '_blank', 'noopener,noreferrer')
        return
      }

      if (linkType === 1 && (await openNotificationInternalUrl(linkUrl))) {
        return
      }
    } finally {
      if (shouldShowUrlJumpLoading) {
        hideNotificationJumpLoading()
      }
    }

    if (linkType === 1) {
      showNotificationJumpFailedToast()
    }

    console.warn('notification url jump skipped', item)
    return
  }

  if (jumpType === 2) {
    if (await handleInternalPageJump(item)) {
      return
    }

    console.warn('notification internal page jump skipped', item)
    return
  }

  if (jumpType === 3) {
    await handleGameJump(item)
  }
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

  const pendingItem = pendingDelete.value
  isDeletingNotification.value = true

  try {
    if (pendingItem.transactionKey) {
      tradeMessageSyncStore.markTradeMessageAsDeleted(pendingItem.transactionKey)
    } else {
      markNotificationAsDeleted(pendingItem.rowId)
      updateCategoryState(pendingItem.category, state => ({
        ...state,
        items: state.items.filter(item => item.rowId !== pendingItem.rowId)
      }))
    }

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
  if (activeTab.value === 'transactions') {
    tradeMessageSyncStore.markTradeMessagesAsRead(
      activeCategoryState.value.items
        .map(item => item.transactionKey)
        .filter((item): item is string => Boolean(item))
    )
    return
  }

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

// 切换到交易通知 tab 后，当前交易消息立即标记为已读。
watch(activeTab, () => {
  markTransactionsAsReadOnView()
})

// 停留在交易通知 tab 时，新收到的交易消息也自动标记为已读。
watch(transactionNotifications, () => {
  markTransactionsAsReadOnView()
})
</script>
