<template>
  <div :class="feedbackPageContainerClass">
    <H5Header
      title="意见反馈"
      :show-back="!isEmbeddedMode"
      :disable-default-back="isEmbeddedMode"
      :fixed-top="!isEmbeddedMode"
      @back="handleFeedbackPageBack"
    />

    <div class="px-3.5 pb-8 pt-[16px]">
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
        :status-text-map="statusTextMap"
        :status-class-map="statusClassMap"
        @claim="handleReceiveAllFeedback"
        @open-detail="goToFeedbackDetail"
      />
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
import feedbackRewardIcon from '@/static/svg/feedback/dl.svg?url'
import feedbackBowIcon from '@/static/svg/feedback/hdj.svg?url'
import feedbackStarIcon from '@/static/svg/feedback/star.svg?url'
import feedbackEllipseIcon from '@/static/svg/feedback/ellipse.svg?url'
import deleteIcon from '@/static/img/payment/upload_delete.png'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, type UploaderAfterRead, type UploaderFileListItem } from 'vant'
import H5Header from '@/components/common/H5Header.vue'
import { getCurrencySymbol } from '@/utils/locale'
import {
  FEEDBACK_CLAIM_AMOUNT_ANIMATION_DURATION,
  FEEDBACK_CLAIM_SUCCESS_TARGET_AMOUNT,
  FEEDBACK_UPLOAD_MAX_COUNT,
  feedbackStatusClassMap,
  feedbackStatusTextMap,
  feedbackTypeOptions,
  formatFeedbackSubmitTime,
  getFeedbackPlaceholderText,
  getFeedbackTypeLabel,
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

const router = useRouter()

// 页面基础状态
const activeTab = ref<FeedbackTab>('create')
const isEmbeddedMode = computed(() => Boolean(props.embedded))
const feedbackPageContainerClass = computed(() => {
  return isEmbeddedMode.value
    ? 'relative h-full overflow-y-auto bg-bg-1'
    : 'fixed inset-0 overflow-y-auto bg-bg-1'
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
const showFeedbackDetailPopup = ref(false)
const selectedFeedbackDetailRecordId = ref('')
const isReceivingAllFeedback = ref(false)

// 领取奖励弹窗状态
const showClaimSuccessPopup = ref(false)
const claimAmountCurrencySymbol = getCurrencySymbol()
const claimSuccessTargetAmount = FEEDBACK_CLAIM_SUCCESS_TARGET_AMOUNT
const claimAmountAnimationDuration = FEEDBACK_CLAIM_AMOUNT_ANIMATION_DURATION
const claimSuccessAmount = ref(`${claimAmountCurrencySymbol}0.00`)
let claimAmountAnimationFrame: number | null = null

const placeholderText = computed(() => getFeedbackPlaceholderText(selectedType.value))

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
    file.message = '上传中...'

    try {
      const response = await Api.picture.upload({
        file: rawFile,
        fileName: getFeedbackUploadFileName(rawFile, currentIndex)
      })

      if (!response?.success) {
        throw new Error(response?.message || '上传失败')
      }

      const uploadedPath = getUploadedFeedbackPath(response.result)
      if (!uploadedPath) {
        throw new Error(response?.message || '上传失败')
      }

      uploadedFeedbackUrls.value[currentIndex] = uploadedPath
      file.status = 'done'
      file.message = '上传成功'
    } catch (error) {
      file.status = 'failed'
      file.message = '上传失败'
      showToast({
        message: error instanceof Error ? error.message : '上传失败',
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
    showToast({ message: '请选择反馈类型', position: 'middle', type: 'fail' })
    return
  }

  const content = String(feedbackContent.value ?? '').trim()
  if (!content) {
    showToast({ message: '请输入反馈内容', position: 'middle', type: 'fail' })
    return
  }

  const hasUploadingFile = feedbackFileList.value.some(file => file.status === 'uploading')
  if (hasUploadingFile) {
    showToast({ message: '图片上传中，请稍后提交', position: 'middle', type: 'fail' })
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
      throw new Error(response?.message || '提交失败')
    }

    showToast({
      message: '提交成功',
      position: 'middle',
      type: 'success',
      zIndex: 100100
    })
    resetCreateFeedbackForm()
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '提交失败',
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
}

const handleTabChange = (tab: FeedbackTab) => {
  if (tab !== 'mine') {
    closeFeedbackDetailPopup()
  }

  activeTab.value = tab
  if (tab === 'mine') {
    void fetchMyFeedbackList()
  }
}

const fetchMyFeedbackList = async () => {
  if (isLoadingMyFeedbackList.value) {
    return
  }

  isLoadingMyFeedbackList.value = true
  try {
    const response = await Api.user.queryFeedbacks({})
    if (!response?.success) {
      throw new Error(response?.message || '获取反馈列表失败')
    }

    const responseList = Array.isArray(response.result) ? response.result : []
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
        feedbackType: getFeedbackTypeLabel(item?.feedbackType),
        screenshotImages: [],
        detailContent: String(item?.content ?? '').trim() || '--'
      }
    })
  } catch (error) {
    closeFeedbackDetailPopup()
    myFeedbackList.value = []
    showToast({
      message: error instanceof Error ? error.message : '获取反馈列表失败',
      position: 'middle',
      type: 'fail'
    })
  } finally {
    isLoadingMyFeedbackList.value = false
  }
}

const formatClaimAmount = (amount: number) => `${claimAmountCurrencySymbol}${amount.toFixed(2)}`

const stopClaimAmountAnimation = () => {
  if (claimAmountAnimationFrame !== null) {
    cancelAnimationFrame(claimAmountAnimationFrame)
    claimAmountAnimationFrame = null
  }
}

const startClaimAmountAnimation = () => {
  stopClaimAmountAnimation()
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

const openClaimSuccessPopup = () => {
  showClaimSuccessPopup.value = true
  startClaimAmountAnimation()
}

const handleReceiveAllFeedback = async () => {
  if (isReceivingAllFeedback.value) {
    return
  }

  isReceivingAllFeedback.value = true
  try {
    const response = await Api.user.receiveAllFeedback({})
    if (!response?.success) {
      throw new Error(response?.message || '领取失败')
    }

    openClaimSuccessPopup()
    showToast({
      message: '领取成功',
      position: 'middle',
      type: 'success',
      zIndex: 100100
    })
    void fetchMyFeedbackList()
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '领取失败',
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
}

const goToFeedbackDetail = (recordId: string) => {
  if (isEmbeddedMode.value) {
    selectedFeedbackDetailRecordId.value = recordId
    showFeedbackDetailPopup.value = true
    return
  }

  router.push({
    name: 'personal-center-feedback-detail',
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

const statusTextMap = feedbackStatusTextMap
const statusClassMap = feedbackStatusClassMap
</script>
