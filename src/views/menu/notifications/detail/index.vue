<template>
  <section
    class="notification-detail-page min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]"
  >
    <div
      class="notification-detail-shell min-h-screen bg-bg-1"
      style="font-family: Inter, sans-serif"
    >
      <header
        class="detail-nav fixed left-0 right-0 top-[0px] z-20 grid h-[49px] grid-cols-[33px_1fr_33px] items-center bg-bg-2 px-[14px]"
      >
        <button
          type="button"
          class="inline-flex h-[33px] w-[33px] items-center justify-center rounded-[8px] bg-opacity-10"
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

        <h1 class="text-center text-[16px] font-[700] leading-[19px] text-text-1">Notifications</h1>
        <div class="h-[33px] w-[33px]"></div>
      </header>

      <main class="px-[14px] pb-[24px] pt-[6px]">
        <article v-if="detailItem" class="flex flex-col gap-[14px]">
          <h2 class="break-words text-[16px] font-[700] leading-[19px] text-text-1">
            {{ detailTitle }}
          </h2>
          <time class="text-[12px] font-[400] leading-[15px] text-text-2">{{ detailTime }}</time>

          <div
            v-if="hasDetailImage"
            class="h-[163px] w-full overflow-hidden rounded-[8px] bg-common-100"
          >
            <img :src="detailImageUrl" :alt="detailTitle" class="h-full w-full object-cover" />
          </div>

          <div
            v-if="isRichTextContent"
            class="detail-rich-text text-[14px] font-[400] leading-[17px] text-text-1"
            v-html="detailItem.noticeText || ''"
          ></div>
          <template v-else-if="!hasDetailImage">
            <p
              v-for="(paragraph, index) in contentParagraphs"
              :key="`paragraph-${index}`"
              class="break-words text-[14px] font-[400] leading-[17px] text-text-1"
            >
              {{ paragraph }}
            </p>
          </template>
        </article>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatNotificationTime } from '@/utils/notification'
import { markNotificationAsRead } from '@/utils/notification-cache'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const NOTIFICATION_DETAIL_STORAGE_KEY = 'menuNotificationDetail'

type NotificationCategory = 'promotions' | 'transactions' | 'system'

interface NotificationDetailItem {
  category: NotificationCategory
  createTime: number
  isImage: number
  linkUrl: string
  noticeText: string
  noticeTitle: string
  rowId: number
}

const route = useRoute()
const router = useRouter()
const detailItem = ref<NotificationDetailItem | null>(null)

// 归一化 isImage 值，非法值统一按普通文本处理。
const normalizeIsImage = (value: number) => {
  if (value === 1 || value === 2) {
    return value
  }

  return 0
}

// 将通知图片路径转换为完整资源地址。
const toGameImageUrl = (value: string) => {
  if (!value) {
    return 'placeholderImg.png'
  }
  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

// 从 sessionStorage 解析详情数据，并校验是否与当前路由参数一致。
const parseStoredDetail = (): NotificationDetailItem | null => {
  const rawValue = sessionStorage.getItem(NOTIFICATION_DETAIL_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as NotificationDetailItem
    const queryRowId = Number(route.query.rowId || 0)
    const queryCategory = String(route.query.category || '')

    if (queryRowId && queryCategory) {
      const sameNotification =
        parsedValue.rowId === queryRowId && parsedValue.category === queryCategory
      if (!sameNotification) {
        return null
      }
    }

    return parsedValue
  } catch (error) {
    console.error('parseStoredDetail failed', error)
    return null
  }
}

// 获取通知详情标题，缺失时使用默认标题。
const detailTitle = computed(() => detailItem.value?.noticeTitle || 'Notification')

// 格式化通知详情的展示时间。
const detailTime = computed(() => formatNotificationTime(detailItem.value?.createTime))

// 判断当前详情是否展示单张图片。
const hasDetailImage = computed(() => {
  return (
    normalizeIsImage(Number(detailItem.value?.isImage)) === 1 &&
    Boolean(detailItem.value?.noticeText)
  )
})

// 判断当前详情内容是否为富文本。
const isRichTextContent = computed(() => normalizeIsImage(Number(detailItem.value?.isImage)) === 2)

// 生成详情图的完整访问地址。
const detailImageUrl = computed(() => toGameImageUrl(detailItem.value?.noticeText || ''))

// 将纯文本内容拆分为段落，供普通文本详情渲染。
const contentParagraphs = computed(() => {
  const plainContent = detailItem.value?.noticeText || detailItem.value?.linkUrl || ''
  return plainContent
    .split(/\r?\n+/)
    .map(text => text.trim())
    .filter(Boolean)
})

// 返回通知列表页；无历史记录时使用兜底跳转。
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  navigateTo('/menu/notifications')
}

// 页面挂载后恢复详情数据，并同步当前通知的已读状态。
onMounted(() => {
  detailItem.value = parseStoredDetail()
  if (!detailItem.value) {
    navigateTo('/menu/notifications', { replace: true })
    return
  }

  markNotificationAsRead(detailItem.value.rowId)
})
</script>

<style scoped>
.detail-rich-text :deep(*) {
  color: var(--color-text-level-1);
  font-size: 14px;
  line-height: 17px;
}

.detail-rich-text :deep(p) {
  margin: 0 0 14px;
}

.detail-rich-text :deep(p:last-child) {
  margin-bottom: 0;
}

.detail-rich-text :deep(a) {
  color: var(--color-theme-level-1);
  word-break: break-all;
}

.detail-rich-text :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 0 0 14px;
}
</style>
