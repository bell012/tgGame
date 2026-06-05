<template>
  <div :class="feedbackPageContainerClass">
    <div class="flex h-full flex-col bg-bg-1">
      <H5Header
        :title="t('personalCenter.feedback.pageTitle')"
        :show-back="!isEmbeddedMode"
        :disable-default-back="isEmbeddedMode"
        :fixed-top="!isEmbeddedMode"
        @back="handleFeedbackPageBack"
      />

      <main
        class="feedback-page-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-8 pt-[16px]"
      >
        <FeedbackTabs
          :active-tab="activeTab"
          :is-pc-mode="isEmbeddedMode"
          @change="handleTabChange"
        />

        <FeedbackCreateTab
          v-if="activeTab === 'create'"
          v-model:selected-type="selectedType"
          v-model:feedback-content="feedbackContent"
          v-model:feedback-file-list="feedbackFileList"
          :feedback-type-options="feedbackTypeOptions"
          :placeholder-text="placeholderText"
          :feedback-upload-count="feedbackUploadCount"
          :feedback-upload-max-count="feedbackUploadMaxCount"
          :is-submitting-feedback="isSubmittingFeedback"
          :delete-icon="deleteIcon"
          :after-read="feedbackImageAfterRead"
          :before-delete="feedbackImageDelete"
          :on-submit="handleSubmitFeedback"
        />

        <FeedbackMyTab
          v-else
          :feedback-reward-icon="feedbackRewardIcon"
          :is-loading="isLoadingMyFeedbackList"
          :feedback-list="myFeedbackList"
          :reward-amount="feedbackRewardAmountText"
          :can-claim-reward="canClaimFeedbackReward"
          :is-claiming-reward="isReceivingAllFeedback"
          :status-text-map="statusTextMap"
          :status-class-map="statusClassMap"
          @claim="handleReceiveAllFeedback"
          @open-detail="goToFeedbackDetail"
        />
      </main>
    </div>

    <FeedbackClaimSuccessPopup
      :show="showClaimSuccessPopup"
      :claim-success-amount="claimSuccessAmount"
      :feedback-star-icon="feedbackStarIcon"
      :feedback-ellipse-icon="feedbackEllipseIcon"
      :feedback-bow-icon="feedbackBowIcon"
      @close="closeClaimSuccessPopup"
    />

    <FeedbackDetailPopup
      :show="showFeedbackDetailPopup"
      :record-id="selectedFeedbackDetailRecordId"
      @close="closeFeedbackDetailPopup"
    />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { QueryFeedbackItem } from '@/api/interface/user'
import feedbackRewardIcon from '@/static/svg/feedback/dl.svg?url'
import feedbackBowIcon from '@/static/svg/feedback/hdj.svg?url'
import feedbackStarIcon from '@/static/svg/feedback/star.svg?url'
import feedbackEllipseIcon from '@/static/svg/feedback/ellipse.svg?url'
import deleteIcon from '@/static/img/payment/upload_delete.png'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { showToast, type UploaderAfterRead, type UploaderFileListItem } from 'vant'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { getCurrencySymbol } from '@/utils/locale'
import {
  FEEDBACK_CLAIM_AMOUNT_ANIMATION_DURATION,
  FEEDBACK_UPLOAD_MAX_COUNT,
  extractClaimedFeedbackAmount,
  buildFeedbackCurrencyRequest,
  extractFeedbackClaimRewardAmount,
  extractFeedbackList,
  normalizeFeedbackCurrencyCode,
  sortFeedbackItemsByNewest,
  feedbackStatusClassMap,
  formatFeedbackRewardAmount,
  formatFeedbackSubmitTime,
  getFeedbackStatusTextMap,
  getFeedbackTypeLabel,
  getFeedbackTypeOptions,
  getFeedbackPlaceholderText,
  getFeedbackUploadFileName,
  getUploadedFeedbackPath,
  normalizeFeedbackStatus
} from './consts'
import FeedbackTabs from './components/feedback-tabs.vue'
import FeedbackCreateTab from './components/feedback-create-tab.vue'
import FeedbackMyTab from './components/feedback-my-tab.vue'
import FeedbackClaimSuccessPopup from './components/feedback-claim-success-popup.vue'
import FeedbackDetailPopup from './components/feedback-detail-popup.vue'
import type { FeedbackListItem, FeedbackTab } from './types'
import { navigateToName } from '@/utils/router'
import { prepareUploadImage } from '@/utils/compress-upload-image'
import { resolveUploadErrorMessage } from '@/utils/upload-error'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'

const props = withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false
  }
)

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const { currentCurrencyCode } = useDisplayCurrency()

/** 与列表汇总、接口 languageCode 使用同一套币种规范化 */
const feedbackMemberCurrencyCode = computed(() =>
  normalizeFeedbackCurrencyCode(currentCurrencyCode.value)
)
const feedbackCurrencyRequest = computed(() =>
  buildFeedbackCurrencyRequest(feedbackMemberCurrencyCode.value)
)

// 页面基础状态
const activeTab = ref<FeedbackTab>('create')
const isEmbeddedMode = computed(() => Boolean(props.embedded))
const feedbackPageContainerClass = computed(() => {
  if (isEmbeddedMode.value) {
    return 'relative h-full overflow-hidden bg-bg-1'
  }

  return 'fixed inset-0 overflow-hidden bg-bg-1'
})

// 创建反馈表单状态
const selectedType = ref('1')
const feedbackContent = ref('')
const feedbackFileList = ref<UploaderFileListItem[]>([])
const uploadedFeedbackUrls = ref<string[]>([])
const isSubmittingFeedback = ref(false)
const feedbackUploadMaxCount = FEEDBACK_UPLOAD_MAX_COUNT
const feedbackUploadCount = computed(() => uploadedFeedbackUrls.value.filter(Boolean).length)

// 我的反馈状态
const isLoadingMyFeedbackList = ref(false)
const myFeedbackList = ref<FeedbackListItem[]>([])
const feedbackClaimRewardAmount = ref(0)
const showFeedbackDetailPopup = ref(false)
const selectedFeedbackDetailRecordId = ref('')
const isReceivingAllFeedback = ref(false)

// 领取奖励弹窗状态
const showClaimSuccessPopup = ref(false)
const claimAmountCurrencySymbol = computed(() =>
  getCurrencySymbol(feedbackMemberCurrencyCode.value || undefined)
)
const formatClaimAmount = (amount: number) =>
  `${claimAmountCurrencySymbol.value}${formatFeedbackRewardAmount(amount)}`
const claimAmountAnimationDuration = FEEDBACK_CLAIM_AMOUNT_ANIMATION_DURATION
const claimSuccessAmount = ref(formatClaimAmount(0))
let claimAmountAnimationFrame: number | null = null
let claimSuccessTargetAmount = 0

const feedbackRewardAmountText = computed(() => formatClaimAmount(feedbackClaimRewardAmount.value))
const canClaimFeedbackReward = computed(() => feedbackClaimRewardAmount.value > 0)

const feedbackTypeOptions = computed(() => getFeedbackTypeOptions(t))
const placeholderText = computed(() => getFeedbackPlaceholderText(selectedType.value, t))

// 图片上传：维持原有上传逻辑与状态提示
const feedbackImageAfterRead: UploaderAfterRead = async (items, detail) => {
  const files = Array.isArray(items) ? items : [items]
  const startIndex =
    typeof detail?.index === 'number'
      ? detail.index
      : Math.max(feedbackFileList.value.length - files.length, 0)

  for (const [offset, file] of files.entries()) {
    const currentIndex = startIndex + offset
    const rawFile = file.file
    if (!(rawFile instanceof Blob)) {
      continue
    }

    file.status = 'uploading'
    file.message = t('personalCenter.feedback.uploadStatus.uploading')

    try {
      const uploadFile = await prepareUploadImage(rawFile)
      const response = await Api.picture.upload({
        file: uploadFile,
        fileName: getFeedbackUploadFileName(uploadFile, currentIndex)
      })

      if (!response?.success) {
        throw new Error(response?.message || t('personalCenter.feedback.toast.uploadFailed'))
      }

      const uploadedPath = getUploadedFeedbackPath(response.result)
      if (!uploadedPath) {
        throw new Error(response?.message || t('personalCenter.feedback.toast.uploadFailed'))
      }

      uploadedFeedbackUrls.value[currentIndex] = uploadedPath
      file.status = 'done'
      file.message = t('personalCenter.feedback.uploadStatus.success')
    } catch (error) {
      file.status = 'failed'
      file.message = t('personalCenter.feedback.uploadStatus.failed')
      showToast({
        message: resolveUploadErrorMessage(
          error,
          t,
          t('personalCenter.feedback.toast.uploadFailed')
        ),
        position: 'middle',
        type: 'fail'
      })
    }
  }
}

const feedbackImageDelete = (_file: UploaderFileListItem, detail: { index: number }) => {
  if (typeof detail?.index === 'number') {
    uploadedFeedbackUrls.value.splice(detail.index, 1)
  }
  return true
}

const getSubmitFeedbackImages = () => {
  return uploadedFeedbackUrls.value.map(item => String(item ?? '').trim()).filter(Boolean)
}

const resetCreateFeedbackForm = () => {
  selectedType.value = '1'
  feedbackContent.value = ''
  feedbackFileList.value = []
  uploadedFeedbackUrls.value = []
}

const handleSubmitFeedback = async () => {
  if (isSubmittingFeedback.value) {
    return
  }

  const feedbackType = String(selectedType.value ?? '').trim()
  if (!feedbackType) {
    showToast({
      message: t('personalCenter.feedback.toast.selectFeedbackType'),
      position: 'middle',
      type: 'fail'
    })
    return
  }

  const content = String(feedbackContent.value ?? '').trim()
  if (!content) {
    showToast({
      message: t('personalCenter.feedback.toast.enterFeedbackContent'),
      position: 'middle',
      type: 'fail'
    })
    return
  }

  const hasUploadingFile = feedbackFileList.value.some(file => file.status === 'uploading')
  if (hasUploadingFile) {
    showToast({
      message: t('personalCenter.feedback.toast.imageUploading'),
      position: 'middle',
      type: 'fail'
    })
    return
  }

  isSubmittingFeedback.value = true
  try {
    const response = await Api.user.sendFeedback({
      feedbackType,
      content,
      imgs: getSubmitFeedbackImages()
    })

    if (!response?.success) {
      throw new Error(response?.message || t('personalCenter.feedback.toast.submitFailed'))
    }

    showToast({
      message: t('personalCenter.feedback.toast.submitSuccess'),
      position: 'middle',
      type: 'success',
      zIndex: 100100
    })
    resetCreateFeedbackForm()
  } catch (error) {
    showToast({
      message:
        error instanceof Error ? error.message : t('personalCenter.feedback.toast.submitFailed'),
      position: 'middle',
      type: 'fail'
    })
  } finally {
    isSubmittingFeedback.value = false
  }
}

const closeFeedbackDetailPopup = () => {
  showFeedbackDetailPopup.value = false
  selectedFeedbackDetailRecordId.value = ''

  if (activeTab.value === 'mine') {
    void refreshMyFeedbackList({ force: true })
  }
}

const handleTabChange = (tab: FeedbackTab) => {
  if (tab !== 'mine') {
    closeFeedbackDetailPopup()
  }

  activeTab.value = tab
  if (tab === 'mine') {
    void refreshMyFeedbackList()
  }
}

type RefreshMyFeedbackListOptions = {
  force?: boolean
}

const refreshMyFeedbackList = async (options: RefreshMyFeedbackListOptions = {}) => {
  if (isLoadingMyFeedbackList.value && !options.force) {
    return
  }

  isLoadingMyFeedbackList.value = true
  feedbackClaimRewardAmount.value = 0

  try {
    const response = await Api.user.queryFeedbacks(feedbackCurrencyRequest.value)
    if (!response?.success) {
      throw new Error(
        response?.message || t('personalCenter.feedback.toast.fetchFeedbackListFailed')
      )
    }

    feedbackClaimRewardAmount.value = extractFeedbackClaimRewardAmount(
      response.result,
      feedbackMemberCurrencyCode.value
    )
    const responseList = sortFeedbackItemsByNewest(
      extractFeedbackList(response.result) as QueryFeedbackItem[]
    )
    myFeedbackList.value = responseList.map((item, index) => {
      const rowIdText = String(item?.rowId ?? '').trim()
      const fallbackRowId = `feedback-${Date.now()}-${index}`
      const recordId = rowIdText || fallbackRowId

      return {
        recordId,
        ticketNo: rowIdText || '--',
        content: String(item?.content ?? '').trim() || '--',
        status: normalizeFeedbackStatus(item?.status),
        showDot: false,
        submitTime: formatFeedbackSubmitTime(item?.createTime),
        feedbackType: getFeedbackTypeLabel(item?.feedbackType, t),
        screenshotImages: [],
        detailContent: String(item?.content ?? '').trim() || '--'
      }
    })
  } catch (error) {
    closeFeedbackDetailPopup()
    myFeedbackList.value = []
    feedbackClaimRewardAmount.value = 0
    showToast({
      message:
        error instanceof Error
          ? error.message
          : t('personalCenter.feedback.toast.fetchFeedbackListFailed'),
      position: 'middle',
      type: 'fail'
    })
  } finally {
    isLoadingMyFeedbackList.value = false
  }
}

const stopClaimAmountAnimation = () => {
  if (claimAmountAnimationFrame !== null) {
    cancelAnimationFrame(claimAmountAnimationFrame)
    claimAmountAnimationFrame = null
  }
}

const startClaimAmountAnimation = (targetAmount: number) => {
  stopClaimAmountAnimation()
  claimSuccessTargetAmount = Math.max(targetAmount, 0)
  claimSuccessAmount.value = formatClaimAmount(0)
  const animationStartTime = performance.now()

  const animate = (currentTime: number) => {
    const progress = Math.min((currentTime - animationStartTime) / claimAmountAnimationDuration, 1)
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    claimSuccessAmount.value = formatClaimAmount(claimSuccessTargetAmount * easedProgress)

    if (progress >= 1) {
      claimAmountAnimationFrame = null
      claimSuccessAmount.value = formatClaimAmount(claimSuccessTargetAmount)
      return
    }

    claimAmountAnimationFrame = requestAnimationFrame(animate)
  }

  claimAmountAnimationFrame = requestAnimationFrame(animate)
}

const openClaimSuccessPopup = (targetAmount: number) => {
  showClaimSuccessPopup.value = true
  startClaimAmountAnimation(targetAmount)
}

const handleReceiveAllFeedback = async () => {
  if (isReceivingAllFeedback.value) {
    return
  }

  if (!canClaimFeedbackReward.value) {
    showToast({
      message: t('personalCenter.feedback.toast.noClaimableReward'),
      position: 'middle',
      type: 'fail'
    })
    return
  }

  if (!feedbackMemberCurrencyCode.value) {
    showToast({
      message: t('personalCenter.feedback.toast.claimFailed'),
      position: 'middle',
      type: 'fail'
    })
    return
  }

  isReceivingAllFeedback.value = true
  let claimSucceeded = false
  let claimedAmount = 0

  try {
    const response = await Api.user.receiveAllFeedback(feedbackCurrencyRequest.value)
    if (!response?.success) {
      throw new Error(response?.message || t('personalCenter.feedback.toast.claimFailed'))
    }

    claimSucceeded = true
    claimedAmount = extractClaimedFeedbackAmount(response.result) || feedbackClaimRewardAmount.value

    feedbackClaimRewardAmount.value = 0
    await refreshMyFeedbackList({ force: true })
    openClaimSuccessPopup(claimedAmount)
  } catch (error) {
    if (claimSucceeded) {
      try {
        await refreshMyFeedbackList({ force: true })
      } catch {
        // 领取已成功，二次刷新失败时保持当前列表状态
      }
      openClaimSuccessPopup(claimedAmount)
      return
    }

    showToast({
      message:
        error instanceof Error ? error.message : t('personalCenter.feedback.toast.claimFailed'),
      position: 'middle',
      type: 'fail'
    })
  } finally {
    isReceivingAllFeedback.value = false
  }
}

const closeClaimSuccessPopup = () => {
  showClaimSuccessPopup.value = false
  stopClaimAmountAnimation()
  void refreshMyFeedbackList({ force: true })
}

watch(feedbackMemberCurrencyCode, () => {
  if (activeTab.value === 'mine') {
    void refreshMyFeedbackList({ force: true })
  }
})

const goToFeedbackDetail = (recordId: string) => {
  if (isEmbeddedMode.value) {
    selectedFeedbackDetailRecordId.value = recordId
    showFeedbackDetailPopup.value = true
    return
  }

  navigateToName('personal-center-feedback-detail', {
    params: { recordId }
  })
}

const handleFeedbackPageBack = () => {
  if (showFeedbackDetailPopup.value) {
    closeFeedbackDetailPopup()
    return
  }

  if (!isEmbeddedMode.value) {
    return
  }

  emit('close')
}

onBeforeUnmount(() => {
  stopClaimAmountAnimation()
})

const statusClassMap = feedbackStatusClassMap
const statusTextMap = computed(() => getFeedbackStatusTextMap(t))
</script>

<style scoped lang="scss">
.feedback-page-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}
</style>
