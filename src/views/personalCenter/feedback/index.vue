<template>
  <div class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header title="意见反馈" />

    <div class="px-3.5 pb-8 pt-[16px]">
      <div class="mb-3.5 grid grid-cols-2 gap-0.5 rounded-[10px] bg-bg-2 p-0.5">
        <button
          type="button"
          class="h-[40px] rounded-[8px] text-[14px] font-[700] transition-all"
          :class="
            activeTab === 'create'
              ? 'bg-bg-3 text-text-1'
              : 'bg-transparent text-text-2 hover:text-text-1'
          "
          @click="handleTabChange('create')"
        >
          创建反馈
        </button>
        <button
          type="button"
          class="h-[40px] rounded-[8px] text-[14px] font-[700] transition-all"
          :class="
            activeTab === 'mine'
              ? 'bg-bg-3 text-text-1'
              : 'bg-transparent text-text-2 hover:text-text-1'
          "
          @click="handleTabChange('mine')"
        >
          我的反馈
        </button>
      </div>

      <div v-if="activeTab === 'create'">
        <section class="rounded-[12px] bg-bg-2 p-3.5">
          <div class="flex items-center text-sm">
            <span class="font-[700] text-text-1">意见反馈</span>
            <span class="ml-1 text-xs text-text-3">(必选反馈类型)</span>
          </div>

          <div class="mt-3 rounded-[10px] bg-bg-3 p-2.5">
            <button
              v-for="item in feedbackTypeOptions"
              :key="item.value"
              type="button"
              class="mb-2 flex h-[42px] w-full items-center justify-between rounded-[8px] px-3 text-left text-[16px] last:mb-0"
              :class="
                selectedType === item.value
                  ? 'bg-[rgba(43,177,112,0.28)] text-text-1'
                  : 'bg-transparent text-text-1'
              "
              @click="selectedType = item.value"
            >
              <span>{{ item.label }}</span>
              <span
                class="feedback-radio-circle"
                :class="{ 'feedback-radio-circle-active': selectedType === item.value }"
              ></span>
            </button>
          </div>

          <textarea
            v-model.trim="feedbackContent"
            maxlength="500"
            :placeholder="placeholderText"
            class="mt-3 h-[112px] w-full resize-none rounded-[10px] bg-bg-3 px-3 py-2.5 text-[16px] leading-[22px] text-text-1 outline-none placeholder:text-text-3"
          ></textarea>

          <div class="mt-3">
            <div class="text-sm font-[700] text-text-1">
              上传照片
              <span class="ml-1 text-xs font-[500] text-text-3">
                ({{ feedbackUploadCount }}/{{ feedbackUploadMaxCount }})
              </span>
            </div>

            <Uploader
              v-model="feedbackFileList"
              class="mt-2.5"
              :max-count="feedbackUploadMaxCount"
              :multiple="true"
              :preview-full-image="true"
              :preview-size="88"
              :after-read="feedbackImageAfterRead"
              :before-delete="feedbackImageDelete"
              :preview-options="{ closeable: true }"
            >
              <template #preview-delete>
                <div
                  class="absolute -right-1.5 -top-1.5 h-4 w-4 overflow-hidden rounded-full sm:h-5 sm:w-5"
                >
                  <img :src="deleteIcon" alt="delete" class="h-full w-full" />
                </div>
              </template>
              <div
                class="flex h-[88px] w-[88px] items-center justify-center rounded-[10px] border border-dashed border-[var(--color-text-level-3)] bg-bg-3"
              >
                <div class="feedback-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3.5"
                      y="7.5"
                      width="17"
                      height="11"
                      rx="2.5"
                      stroke="currentColor"
                      stroke-width="1.8"
                    />
                    <rect x="8" y="5" width="4" height="2.4" rx="1.2" fill="currentColor" />
                    <circle cx="9" cy="13" r="1.7" fill="currentColor" />
                    <path
                      d="M12 16.2L14.2 13.8C14.7 13.3 15.5 13.3 16 13.8L18.5 16.2"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span class="feedback-upload-plus">+</span>
                </div>
              </div>
            </Uploader>
          </div>

          <button
            type="button"
            class="mt-6 h-[46px] w-full rounded-[10px] bg-theme-primary text-base font-[700] text-text-4"
            :class="{ 'cursor-not-allowed opacity-70': isSubmittingFeedback }"
            :disabled="isSubmittingFeedback"
            @click="handleSubmitFeedback"
          >
            提交反馈
          </button>
        </section>

        <section class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5">
          <div class="text-[15px] font-[700] text-text-1">奖励规则</div>
          <div class="mt-2 text-sm leading-[22px] text-text-3">
            我们设立了丰厚的奖励来收集反馈，以优化系统和功能，为您提供更好的体验！一旦被接受，将根据有用性给予奖励（不包括那些未被接受的）。
          </div>
        </section>
      </div>

      <div v-else>
        <section class="rounded-[12px] bg-bg-2 p-3.5">
          <div class="flex items-center justify-between gap-2.5">
            <div class="flex items-center">
              <img :src="feedbackRewardIcon" alt="feedback reward" class="h-[48px] w-[48px]" />
              <div class="ml-2.5">
                <div class="text-sm text-text-1">反馈金额</div>
                <div class="text-[18px] font-[700] leading-[20px] text-text-1">9999.99</div>
              </div>
            </div>
            <button
              type="button"
              class="h-[36px] min-w-[114px] rounded-[12px] bg-theme-primary px-4 text-[16px] font-[700] text-text-4"
              @click="openClaimSuccessPopup"
            >
              领取
            </button>
          </div>
        </section>

        <div
          v-if="isLoadingMyFeedbackList"
          class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5 text-center text-[14px] text-text-3"
        >
          加载中...
        </div>

        <div
          v-else-if="!myFeedbackList.length"
          class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5 text-center text-[14px] text-text-3"
        >
          暂无反馈记录
        </div>

        <template v-else>
          <section
            v-for="item in myFeedbackList"
            :key="item.recordId"
            class="relative mt-3.5 cursor-pointer rounded-[12px] bg-bg-2 p-3.5"
            @click="goToFeedbackDetail(item.recordId)"
          >
            <span
              v-if="item.showDot"
              class="absolute right-4 top-4 block h-[10px] w-[10px] rounded-full bg-theme-primary"
            ></span>

            <div class="text-[18px] font-[400] text-text-1">反馈单号：{{ item.ticketNo }}</div>
            <div class="mt-2 line-clamp-2 text-[15px] leading-[22px] text-text-2">
              {{ item.content }}
            </div>

            <div class="mt-3 flex items-center justify-between">
              <span class="text-[36rpx] font-[400]" :class="statusClassMap[item.status]">
                {{ statusTextMap[item.status] }}
              </span>
              <div class="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bg-3">
                <ArrowRightIcon class="h-3 w-3 text-text-2" />
              </div>
            </div>
          </section>
        </template>
      </div>
    </div>

    <transition name="feedback-claim-popup">
      <div
        v-if="showClaimSuccessPopup"
        class="feedback-claim-popup-mask"
        @click.self="closeClaimSuccessPopup"
      >
        <div class="feedback-claim-popup-card">
          <img :src="feedbackStarIcon" alt="" class="feedback-claim-popup-star" />
          <img :src="feedbackEllipseIcon" alt="" class="feedback-claim-popup-ellipse" />
          <img :src="feedbackBowIcon" alt="bow" class="feedback-claim-popup-bow" />

          <p class="feedback-claim-popup-amount">{{ claimSuccessAmount }}</p>
          <p class="feedback-claim-popup-title">Claim Successful</p>
          <p class="feedback-claim-popup-description">
            The bonus has been credited to your wallet.
          </p>

          <button
            type="button"
            class="feedback-claim-popup-confirm"
            @click="closeClaimSuccessPopup"
          >
            OK
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import feedbackRewardIcon from '@/static/svg/feedback/dl.svg?url'
import feedbackBowIcon from '@/static/svg/feedback/hdj.svg?url'
import feedbackStarIcon from '@/static/svg/feedback/star.svg?url'
import feedbackEllipseIcon from '@/static/svg/feedback/ellipse.svg?url'
import deleteIcon from '@/static/img/payment/upload_delete.png'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, Uploader, type UploaderAfterRead, type UploaderFileListItem } from 'vant'
import H5Header from '@/components/common/H5Header.vue'
import { getCurrencySymbol } from '@/utils/locale'
import { feedbackStatusClassMap, feedbackStatusTextMap, type FeedbackStatus } from './mock'

type FeedbackTab = 'create' | 'mine'

const activeTab = ref<FeedbackTab>('create')
const router = useRouter()
const selectedType = ref('1')
const feedbackContent = ref('')
const feedbackFileList = ref<UploaderFileListItem[]>([])
const uploadedFeedbackUrls = ref<string[]>([])
const isSubmittingFeedback = ref(false)
const isLoadingMyFeedbackList = ref(false)
const showClaimSuccessPopup = ref(false)
const claimAmountCurrencySymbol = getCurrencySymbol()
const claimSuccessTargetAmount = 100
const claimAmountAnimationDuration = 680
const claimSuccessAmount = ref(`${claimAmountCurrencySymbol}0.00`)
let claimAmountAnimationFrame: number | null = null
const feedbackUploadMaxCount = 4
const feedbackUploadCount = computed(() => uploadedFeedbackUrls.value.filter(Boolean).length)
const myFeedbackList = ref<
  Array<{
    recordId: string
    ticketNo: string
    content: string
    status: FeedbackStatus
    showDot?: boolean
  }>
>([])

const feedbackTypeOptions = [
  { label: '建议', value: '1' },
  { label: '游戏异常', value: '2' },
  { label: '充值问题', value: '3' },
  { label: '其他', value: '4' }
]

const placeholderText = computed(() => {
  return [
    '亲爱的玩家，请详细描述您在游戏中遇到的你认为需要改进的问题或者建议，方便我们能给您提供更好的服务',
    '请尽量提供问题发生的时间、操作、功能模块、截图等信息，我们会尽快为您处理。',
    '请详细描述您遇到的问题，如有支付单号请一并提供，我们会尽快为您处理。',
    '请详细描述您遇到的其他问题或需要咨询的事项。'
  ][+selectedType.value - 1]
})

const getUploadedFeedbackPath = (result: unknown) => {
  if (typeof result === 'string') {
    return result.trim()
  }

  if (!result || typeof result !== 'object') {
    return ''
  }

  const resultRecord = result as Record<string, unknown>
  const candidates = [
    resultRecord.headPortrait,
    resultRecord.url,
    resultRecord.path,
    resultRecord.fileName
  ]
  const target = candidates.find(value => typeof value === 'string' && value.trim())
  return typeof target === 'string' ? target.trim() : ''
}

const getFeedbackUploadFileName = (file: Blob | File, index: number) => {
  const fallbackName = `feedback_${Date.now()}_${index}`
  const originalFileName = file instanceof File ? file.name.trim() : fallbackName
  const sanitizedFileName = (originalFileName || fallbackName).replace(/[\\/:*?"<>|\r\n]+/g, '_')
  return sanitizedFileName || fallbackName
}

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

    showToast({ message: '提交成功', position: 'middle', type: 'success' })
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

const normalizeFeedbackStatus = (value: unknown): FeedbackStatus => {
  const normalizedText = String(value ?? '')
    .trim()
    .toLowerCase()
  if (normalizedText === 'accepted') {
    return 'accepted'
  }
  if (normalizedText === 'pending') {
    return 'pending'
  }
  if (normalizedText === 'rejected') {
    return 'rejected'
  }

  const normalizedNumber = Number(normalizedText)
  if (normalizedNumber === 1) {
    return 'accepted'
  }
  if (normalizedNumber === 0) {
    return 'pending'
  }
  return 'rejected'
}

const handleTabChange = (tab: FeedbackTab) => {
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
        showDot: false
      }
    })
  } catch (error) {
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

const formatClaimAmount = (amount: number) => {
  return `${claimAmountCurrencySymbol}${amount.toFixed(2)}`
}

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

const closeClaimSuccessPopup = () => {
  showClaimSuccessPopup.value = false
  stopClaimAmountAnimation()
}

const goToFeedbackDetail = (recordId: string) => {
  router.push({
    name: 'personal-center-feedback-detail',
    params: { recordId }
  })
}

onBeforeUnmount(() => {
  stopClaimAmountAnimation()
})

const statusTextMap = feedbackStatusTextMap
const statusClassMap = feedbackStatusClassMap
</script>

<style scoped>
.feedback-radio-circle {
  position: relative;
  box-sizing: border-box;
  height: 24px;
  width: 24px;
  border-radius: 9999px;
  border: 2px solid var(--color-text-level-3);
}

.feedback-radio-circle-active {
  border-color: var(--color-theme-level-1);
}

.feedback-radio-circle-active::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  height: 11px;
  width: 11px;
  border-radius: 9999px;
  background: var(--color-theme-level-1);
  transform: translate(-50%, -50%);
}

.feedback-upload-icon {
  position: relative;
  color: var(--color-text-level-3);
}

.feedback-upload-icon svg {
  height: 34px;
  width: 34px;
}

.feedback-upload-plus {
  position: absolute;
  right: -3px;
  top: -5px;
  display: block;
  min-width: 14px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.feedback-claim-popup-enter-active,
.feedback-claim-popup-leave-active {
  transition: opacity 0.24s ease;
}

.feedback-claim-popup-enter-from,
.feedback-claim-popup-leave-to {
  opacity: 0;
}

.feedback-claim-popup-enter-active .feedback-claim-popup-card,
.feedback-claim-popup-leave-active .feedback-claim-popup-card {
  transition:
    transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.2s ease;
}

.feedback-claim-popup-enter-from .feedback-claim-popup-card,
.feedback-claim-popup-leave-to .feedback-claim-popup-card {
  transform: translateY(16px) scale(0.92);
  opacity: 0;
}

.feedback-claim-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(2, 8, 14, 0.7);
  backdrop-filter: blur(2px);
}

.feedback-claim-popup-card {
  position: relative;
  overflow: visible;
  width: min(100%, 340px);
  border-radius: 30px;
  padding: 74px 22px 26px;
  background: linear-gradient(180deg, #24a35a 0%, #17753f 56%, #0d3e2a 100%);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.42),
    0 1px 0 rgba(255, 255, 255, 0.2) inset,
    0 -34px 42px rgba(4, 22, 14, 0.45) inset;
}

.feedback-claim-popup-star {
  pointer-events: none;
  position: absolute;
  z-index: 3;
  left: calc(50% - 66px);
  top: -20px;
  width: 18px;
  height: 18px;
}

.feedback-claim-popup-ellipse {
  pointer-events: none;
  position: absolute;
  z-index: 3;
  left: calc(50% + 54px);
  top: -14px;
  width: 14px;
  height: 14px;
}

.feedback-claim-popup-bow {
  pointer-events: none;
  position: absolute;
  z-index: 2;
  left: 50%;
  top: -20px;
  width: 166px;
  transform: translateX(-50%);
}

.feedback-claim-popup-amount {
  margin: 0;
  text-align: center;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  color: #fff;
}

.feedback-claim-popup-title {
  margin: 18px 0 0;
  text-align: center;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
  color: #fff;
}

.feedback-claim-popup-description {
  margin: 10px 0 0;
  text-align: center;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.68);
}

.feedback-claim-popup-confirm {
  margin-top: 24px;
  display: flex;
  height: 46px;
  width: 100%;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #2ef58f 0%, #68ee7d 100%);
  color: #00140b;
  font-size: 18px;
  font-weight: 700;
}
</style>
