<template>
  <section :class="feedbackDetailPageContainerClass">
    <div class="flex h-full flex-col bg-bg-1">
      <H5Header
        :title="t('personalCenter.feedback.detailTitle')"
        :disable-default-back="isEmbeddedMode"
        :fixed-top="!isEmbeddedMode"
        show-sort
        left-icon-class="h-2.5 w-2.5 text-text-1"
        :right-icon="CustomerServiceIcon"
        @back="handleDetailBack"
        @sort="handleCustomerServiceClick"
      />

      <main
        class="feedback-detail-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-6 pt-3"
      >
        <section class="rounded-[12px] bg-bg-2 p-3.5">
          <div class="feedback-detail-row">
            <span>{{ t('personalCenter.feedback.detail.feedbackNo') }}</span>
            <span class="text-text-1">{{ feedbackDetail.ticketNo }}</span>
          </div>

          <div class="feedback-detail-row mt-2.5">
            <span>{{ t('personalCenter.feedback.detail.processingStatus') }}</span>
            <span
              :class="[
                isEmbeddedMode ? 'text-[14px] font-[400] leading-[20px]' : 'font-[700]',
                statusClassMap[feedbackDetail.status]
              ]"
            >
              {{ statusTextMap[feedbackDetail.status] }}
            </span>
          </div>

          <div class="feedback-detail-row mt-2.5">
            <span>{{ t('personalCenter.feedback.detail.submitTime') }}</span>
            <span class="text-text-1">{{ feedbackDetail.submitTime }}</span>
          </div>

          <div class="feedback-detail-row mt-2.5">
            <span>{{ t('personalCenter.feedback.detail.feedbackType') }}</span>
            <span class="text-text-1">{{ feedbackDetail.feedbackType }}</span>
          </div>

          <div
            class="mt-2.5"
            :class="
              isEmbeddedMode
                ? 'text-[16px] font-[400] leading-[20px] text-text-3'
                : 'feedback-detail-row'
            "
          >
            {{ t('personalCenter.feedback.detail.feedbackContent') }}
          </div>
          <div
            class="mt-2 whitespace-pre-wrap break-words rounded-[8px] bg-bg-4 px-3 py-2.5 text-[15px] leading-[20px] text-text-1"
          >
            {{ feedbackDetail.detailContent }}
          </div>

          <div v-if="feedbackDetail.screenshotImages.length" class="mt-2.5 grid grid-cols-4 gap-2">
            <button
              v-for="(image, index) in feedbackDetail.screenshotImages"
              :key="`${feedbackDetail.recordId}-screenshot-${index}`"
              type="button"
              class="feedback-screenshot-item overflow-hidden rounded-[8px] bg-bg-3"
              @click="openScreenshotPreview(index)"
            >
              <img
                :src="image"
                :alt="t('personalCenter.feedback.detail.screenshotAlt', { index: index + 1 })"
                class="h-full w-full object-cover"
              />
            </button>
          </div>
          <!-- 内容与状态的分割线 -->
          <div class="mt-3 h-px w-full bg-opacity-10"></div>

          <p
            class="mt-3 leading-[20px]"
            :class="isEmbeddedMode ? 'text-[16px] text-text-3' : 'text-[15px] text-text-2'"
          >
            {{ feedbackDetail.resultHint }}
          </p>
        </section>

        <section
          v-if="feedbackDetail.status !== 'pending'"
          class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-[16px] font-[700] text-theme-primary">{{
              feedbackDetail.replyTeam
            }}</span>
            <span class="shrink-0 text-[12px] text-text-3">{{ feedbackDetail.replyTime }}</span>
          </div>

          <p
            v-for="(paragraph, index) in feedbackDetail.replyContent"
            :key="`${feedbackDetail.recordId}-${index}`"
            class="mt-3 text-[15px] leading-[22px] text-text-1"
          >
            {{ paragraph }}
          </p>
        </section>
      </main>
    </div>
  </section>

  <teleport to="body">
    <transition name="feedback-desktop-preview">
      <div
        v-if="showDesktopPreview && currentPreviewImage"
        class="feedback-desktop-preview-mask"
        @click.self="closeDesktopPreview"
      >
        <button
          v-if="hasMultiplePreviewImages"
          type="button"
          class="feedback-desktop-preview-nav feedback-desktop-preview-nav-left"
          @click.stop="showPrevDesktopPreview"
        >
          <ArrowLeftIcon class="h-4 w-4 text-text-1" />
        </button>

        <div class="feedback-desktop-preview-image-wrap">
          <img
            :src="currentPreviewImage"
            :alt="t('personalCenter.feedback.detail.previewImageAlt')"
            class="feedback-desktop-preview-image"
          />
        </div>

        <button
          v-if="hasMultiplePreviewImages"
          type="button"
          class="feedback-desktop-preview-nav feedback-desktop-preview-nav-right"
          @click.stop="showNextDesktopPreview"
        >
<<<<<<< HEAD
          <ArrowLeftIcon class="h-5 w-5 rotate-180 text-text-1" />
=======
          <ArrowLeftIcon class="h-4 w-4 rotate-180 text-text-1" />
>>>>>>> ae4bf283 (fix : 意见反馈 pc端ui调整)
        </button>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { QueryFeedbackItem } from '@/api/interface/user'
import H5Header from '@/components/common/H5Header.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import CustomerServiceIcon from '@/static/svg/customer-service.svg?component'
import { globalShowToast } from '@/utils/toast'
import {
  type FeedbackRecord,
  type FeedbackStatus,
  buildFeedbackCurrencyRequest,
  extractFeedbackList,
  feedbackStatusClassMap,
  formatFeedbackSubmitTime,
  getFeedbackAcceptedReplyContent,
  getFeedbackDetailTemplates,
  getFeedbackItemRewardAmount,
  getFeedbackStatusTextMap,
  getFeedbackTypeLabel,
  normalizeFeedbackCurrencyCode,
  normalizeFeedbackStatus
} from '@/views/personalCenter/feedback/consts'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { showImagePreview } from 'vant'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const props = withDefaults(
  defineProps<{
    embedded?: boolean
    recordId?: string
  }>(),
  {
    embedded: false,
    recordId: ''
  }
)

const emit = defineEmits<{
  back: []
}>()

const route = useRoute()
const { t } = useI18n()
const { currentCurrencyCode } = useDisplayCurrency()
const feedbackCurrencyRequest = computed(() =>
  buildFeedbackCurrencyRequest(normalizeFeedbackCurrencyCode(currentCurrencyCode.value))
)
const isEmbeddedMode = computed(() => Boolean(props.embedded))
const feedbackDetailPageContainerClass = computed(() => {
  return isEmbeddedMode.value
    ? 'relative h-full overflow-hidden bg-bg-1'
    : 'fixed inset-0 overflow-hidden bg-bg-1'
})

const feedbackApiItem = ref<QueryFeedbackItem | null>(null)
const isLoadingFeedbackDetail = ref(false)
const currentRecordId = computed(() => {
  return isEmbeddedMode.value
    ? String(props.recordId ?? '').trim()
    : String(route.params.recordId ?? '').trim()
})

const ABSOLUTE_URL_PATTERN = /^(data:|blob:|https?:\/\/|\/)/i
const resolveFeedbackImageUrl = (value: unknown) => {
  const imagePath = String(value ?? '').trim()
  if (!imagePath) {
    return ''
  }

  if (ABSOLUTE_URL_PATTERN.test(imagePath)) {
    return imagePath
  }

  const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL
  if (!baseUrl) {
    return imagePath
  }

  const normalizedBaseUrl = String(baseUrl).replace(/\/+$/, '')
  const normalizedImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${normalizedBaseUrl}${normalizedImagePath}`
}

const feedbackDetailTemplates = computed(() => getFeedbackDetailTemplates(t))

const getTemplateRecordByStatus = (status: FeedbackStatus) => {
  return feedbackDetailTemplates.value[status] ?? feedbackDetailTemplates.value.pending
}

const mapFeedbackApiItemToDetail = (
  item: QueryFeedbackItem | null,
  recordId: string
): FeedbackRecord => {
  const status = item ? normalizeFeedbackStatus(item.status) : 'pending'
  const templateRecord = getTemplateRecordByStatus(status)
  const screenshotImages = Array.isArray(item?.imgs)
    ? item.imgs.map(resolveFeedbackImageUrl).filter(Boolean)
    : []

  const rowIdText = String(item?.rowId ?? '').trim()
  const ticketNo = rowIdText || recordId || templateRecord.ticketNo
  const detailContent = String(item?.content ?? '').trim() || templateRecord.detailContent
  const feedbackType = getFeedbackTypeLabel(item?.feedbackType, t)
  const replyContent =
    status === 'accepted'
      ? getFeedbackAcceptedReplyContent(t, {
          topic: detailContent || feedbackType,
          rewardAmount: getFeedbackItemRewardAmount(item),
          currency: String(item?.memberCurrency ?? '').trim()
        })
      : templateRecord.replyContent

  return {
    ...templateRecord,
    recordId: ticketNo,
    ticketNo,
    status,
    submitTime: formatFeedbackSubmitTime(item?.createTime),
    feedbackType,
    detailContent,
    content: detailContent,
    screenshotImages,
    replyTime: formatFeedbackSubmitTime(item?.createTime),
    replyContent
  }
}

const feedbackDetail = computed(() => {
  return mapFeedbackApiItemToDetail(feedbackApiItem.value, currentRecordId.value)
})

const statusTextMap = computed(() => getFeedbackStatusTextMap(t))
const statusClassMap = feedbackStatusClassMap
const showDesktopPreview = ref(false)
const desktopPreviewIndex = ref(0)
const previewImages = computed(() => feedbackDetail.value.screenshotImages)
const hasMultiplePreviewImages = computed(() => previewImages.value.length > 1)
const currentPreviewImage = computed(() => previewImages.value[desktopPreviewIndex.value] || '')

const handleDetailBack = () => {
  if (isEmbeddedMode.value) {
    emit('back')
  }
}

const handleCustomerServiceClick = () => {
  globalShowToast({
    message: t('sidebar_menu.customer_service')
  })
}

const fetchFeedbackDetail = async (recordId: string) => {
  if (!recordId || isLoadingFeedbackDetail.value) {
    return
  }

  isLoadingFeedbackDetail.value = true
  try {
    const response = await Api.user.queryFeedbacks(feedbackCurrencyRequest.value)
    if (!response?.success) {
      throw new Error(
        response?.message || t('personalCenter.feedback.toast.fetchFeedbackDetailFailed')
      )
    }

    const feedbackList = extractFeedbackList(response.result) as QueryFeedbackItem[]
    feedbackApiItem.value =
      feedbackList.find(item => String(item?.rowId ?? '').trim() === recordId) ?? null
  } catch (error) {
    feedbackApiItem.value = null
    globalShowToast({
      message:
        error instanceof Error
          ? error.message
          : t('personalCenter.feedback.toast.fetchFeedbackDetailFailed'),
      type: 'fail'
    })
  } finally {
    isLoadingFeedbackDetail.value = false
  }
}

const closeDesktopPreview = () => {
  showDesktopPreview.value = false
}

const showPrevDesktopPreview = () => {
  const total = previewImages.value.length
  if (!total) {
    return
  }

  desktopPreviewIndex.value = (desktopPreviewIndex.value - 1 + total) % total
}

const showNextDesktopPreview = () => {
  const total = previewImages.value.length
  if (!total) {
    return
  }

  desktopPreviewIndex.value = (desktopPreviewIndex.value + 1) % total
}

const handleDesktopPreviewKeydown = (event: KeyboardEvent) => {
  if (!showDesktopPreview.value) {
    return
  }

  if (event.key === 'Escape') {
    closeDesktopPreview()
    return
  }

  if (event.key === 'ArrowLeft') {
    showPrevDesktopPreview()
    return
  }

  if (event.key === 'ArrowRight') {
    showNextDesktopPreview()
  }
}

const openScreenshotPreview = (startPosition: number) => {
  const screenshotImages = feedbackDetail.value.screenshotImages
  if (!screenshotImages.length) {
    return
  }

  if (isEmbeddedMode.value) {
    const maxIndex = screenshotImages.length - 1
    desktopPreviewIndex.value = Math.min(Math.max(startPosition, 0), maxIndex)
    showDesktopPreview.value = true
    return
  }

  showImagePreview({
    images: screenshotImages,
    startPosition,
    closeable: true,
    showIndex: false,
    closeOnPopstate: true
  })
}

watch(showDesktopPreview, visible => {
  if (visible) {
    window.addEventListener('keydown', handleDesktopPreviewKeydown)
    return
  }

  window.removeEventListener('keydown', handleDesktopPreviewKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleDesktopPreviewKeydown)
})

watch(
  currentRecordId,
  recordId => {
    if (!recordId) {
      feedbackApiItem.value = null
      return
    }

    void fetchFeedbackDetail(recordId)
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.feedback-detail-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}

.feedback-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  color: var(--color-text-level-3);
}

.feedback-screenshot-item {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.feedback-desktop-preview-enter-active,
.feedback-desktop-preview-leave-active {
  transition: opacity 0.2s ease;
}

.feedback-desktop-preview-enter-from,
.feedback-desktop-preview-leave-to {
  opacity: 0;
}

.feedback-desktop-preview-mask {
  position: fixed;
  inset: 0;
  z-index: 100010;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 8, 14, 0.75);
}

.feedback-desktop-preview-image-wrap {
  display: flex;
  max-height: min(80vh, 760px);
  max-width: min(70vw, 980px);
  align-items: center;
  justify-content: center;
}

.feedback-desktop-preview-image {
  max-height: min(80vh, 760px);
  max-width: min(70vw, 980px);
  object-fit: contain;
}

.feedback-desktop-preview-nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  height: 56px;
  width: 56px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  background: rgba(72, 82, 90, 0.9);
  transform: translateY(-50%);
}

.feedback-desktop-preview-nav-left {
  left: max(20px, calc(50% - min(35vw, 490px) - 76px));
}

.feedback-desktop-preview-nav-right {
  right: max(20px, calc(50% - min(35vw, 490px) - 76px));
}
</style>
