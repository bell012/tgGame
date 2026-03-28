<template>
  <!-- 通知详情页面 -->
  <section
    :class="
      props.panelMode
        ? 'notification-detail-page h-full bg-bg-1'
        : 'notification-detail-page min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]'
    "
  >
    <!-- 通知详情容器 -->
    <div
      :class="
        props.panelMode
          ? 'notification-detail-shell flex h-full min-h-0 flex-col bg-bg-1'
          : 'notification-detail-shell min-h-screen bg-bg-1'
      "
      style="font-family: Inter, sans-serif"
    >
      <!-- 页面头部 -->
      <H5Header
        :title="$t('notifications.detail')"
        :show-sort="props.panelMode"
        :right-icon="props.panelMode ? CloseIcon : undefined"
        :fixed-top="!props.panelMode"
        :disable-default-back="props.panelMode"
        @back="handleBack"
        @sort="handlePanelClose"
      />

      <!-- 页面主体 -->
      <main
        :class="
          props.panelMode
            ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-3'
            : 'px-[14px] pb-[24px] pt-[14px]'
        "
      >
        <!-- 详情内容 -->
        <article v-if="currentDetailItem" class="flex flex-col gap-[14px]">
          <!-- 详情标题 -->
          <h2 class="break-words text-[16px] font-[700] leading-[19px] text-text-1">
            {{ detailTitle }}
          </h2>

          <!-- 详情时间 -->
          <time class="text-[12px] font-[400] leading-[15px] text-text-2">{{ detailTime }}</time>

          <!-- 详情图片 -->
          <div v-if="hasDetailImage" class="h-[163px] w-full overflow-hidden rounded-[8px]">
            <img :src="detailImageUrl" :alt="detailTitle" class="h-full w-full object-cover" />
          </div>

          <!-- 富文本详情 -->
          <div
            v-if="isRichTextContent"
            class="detail-rich-text text-[14px] font-[400] leading-[17px] text-text-1"
            v-html="normalizedNoticeText"
          ></div>

          <!-- 纯文本详情 -->
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
import H5Header from '@/components/common/H5Header.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import { formatNotificationTime } from '@/utils/notification'
import { markNotificationAsRead } from '@/utils/notification-cache'
import { navigateTo } from '@/utils/router'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
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

const props = withDefaults(
  defineProps<{
    panelMode?: boolean
    detailData?: NotificationDetailItem | null
  }>(),
  {
    panelMode: false,
    detailData: null
  }
)

const emit = defineEmits<{
  back: []
  close: []
}>()

const route = useRoute()
const { t } = useI18n()
const detailItem = ref<NotificationDetailItem | null>(null)
const currentDetailItem = computed(() => props.detailData ?? detailItem.value)

// 归一化 isImage 值，非法值统一按普通文本处理。
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

// 判断正文中是否存在 HTML 标签。
const hasHtmlContent = (value: string) => {
  return /<\/?[a-z][\s\S]*>/i.test(value)
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

// 处理 PC 端面板详情返回。
const handleBack = () => {
  if (!props.panelMode) {
    return
  }

  emit('back')
}

// 处理 PC 端面板右侧关闭按钮。
const handlePanelClose = () => {
  if (!props.panelMode) {
    return
  }

  emit('close')
}

// 获取通知详情标题，缺失时使用默认标题。
const detailTitle = computed(() => currentDetailItem.value?.noticeTitle || t('notifications.item'))

// 格式化通知详情的展示时间。
const detailTime = computed(() => formatNotificationTime(currentDetailItem.value?.createTime))
const normalizedNoticeText = computed(() => {
  const rawContent = normalizeNoticeContent(currentDetailItem.value?.noticeText || '')
  const decodedContent = decodeHtmlEntities(rawContent)

  if (decodedContent === rawContent) {
    return rawContent
  }

  return cleanupEncodedRichText(decodedContent)
})

// 判断当前详情是否展示单张图片。
const hasDetailImage = computed(() => {
  return (
    normalizeIsImage(Number(currentDetailItem.value?.isImage)) === 1 &&
    Boolean(normalizedNoticeText.value)
  )
})

// 判断当前详情内容是否为富文本。
const isRichTextContent = computed(() => {
  const normalizedIsImage = normalizeIsImage(Number(currentDetailItem.value?.isImage))

  return normalizedIsImage === 2 || hasHtmlContent(normalizedNoticeText.value)
})

// 生成详情图的完整访问地址。
const detailImageUrl = computed(() => toGameImageUrl(normalizedNoticeText.value))

// 将纯文本内容拆分为段落，供普通文本详情渲染。
const contentParagraphs = computed(() => {
  const plainContent = normalizedNoticeText.value || currentDetailItem.value?.linkUrl || ''
  return plainContent
    .split(/\r?\n+/)
    .map(text => text.trim())
    .filter(Boolean)
})

// 页面挂载后恢复详情数据，并同步当前通知的已读状态。
onMounted(() => {
  if (props.panelMode) {
    return
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

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
