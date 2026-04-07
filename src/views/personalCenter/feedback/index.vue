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
          @click="activeTab = 'create'"
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
          @click="activeTab = 'mine'"
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
            placeholder="请输入反馈内容"
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
          >
            提交反馈
          </button>
        </section>

        <section class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5">
          <div class="text-[30rpx] font-[700] text-text-1">奖励规则</div>
          <div class="mt-2 text-sm leading-[22px] text-text-3">
            我们设立了丰厚的奖励来收集反馈，以优化系统和功能，为您提供更好的体验！一旦被接受，将根据有用性给予奖励（不包括那些未被接受的）。
          </div>
        </section>
      </div>

      <div v-else>
        <section class="rounded-[12px] bg-bg-2 p-3.5">
          <div class="flex items-center justify-between gap-2.5">
            <div class="flex items-center">
              <div class="feedback-coin-icon">$</div>
              <div class="ml-2.5">
                <div class="text-sm text-text-1">反馈金额</div>
                <div class="text-[18px] font-[700] leading-[20px] text-text-1">9999.99</div>
              </div>
            </div>
            <button
              type="button"
              class="h-[36px] min-w-[114px] rounded-[12px] bg-theme-primary px-4 text-[16px] font-[700] text-text-4"
            >
              领取
            </button>
          </div>
        </section>

        <section
          v-for="item in myFeedbackList"
          :key="item.id"
          class="relative mt-3.5 rounded-[12px] bg-bg-2 p-3.5"
        >
          <span
            v-if="item.showDot"
            class="absolute right-4 top-4 block h-[10px] w-[10px] rounded-full bg-theme-primary"
          ></span>

          <div class="text-[18px] font-[400] text-text-1">反馈单号：{{ item.id }}</div>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import deleteIcon from '@/static/img/payment/upload_delete.png'
import { computed, ref } from 'vue'
import { showToast, Uploader, type UploaderAfterRead, type UploaderFileListItem } from 'vant'
import H5Header from '@/components/common/H5Header.vue'

type FeedbackTab = 'create' | 'mine'
type FeedbackStatus = 'accepted' | 'pending' | 'rejected'

const activeTab = ref<FeedbackTab>('create')
const selectedType = ref('type-1')
const feedbackContent = ref('')
const feedbackFileList = ref<UploaderFileListItem[]>([])
const uploadedFeedbackUrls = ref<string[]>([])
const feedbackUploadMaxCount = 4
const feedbackUploadCount = computed(() => uploadedFeedbackUrls.value.filter(Boolean).length)

const feedbackTypeOptions = [
  { label: '建议文案1', value: 'type-1' },
  { label: '建议文案2', value: 'type-2' },
  { label: '建议文案3', value: 'type-3' }
]

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

const statusTextMap: Record<FeedbackStatus, string> = {
  accepted: '已采纳',
  pending: '待处理',
  rejected: '未采纳'
}

const statusClassMap: Record<FeedbackStatus, string> = {
  accepted: 'text-theme-primary',
  pending: 'text-[#F6AE2D]',
  rejected: 'text-[#FF4D4F]'
}

const myFeedbackList = computed<
  {
    id: string
    content: string
    status: FeedbackStatus
    showDot?: boolean
  }[]
>(() => [
  {
    id: '94880',
    content:
      '进一步加强反作弊措施，列如监控多开账号或者异常投注行为。进一步加强反作弊措施，列如监控多开账号或者异常投注行为。',
    status: 'accepted'
  },
  {
    id: '94880',
    content:
      '进一步加强反作弊措施，列如监控多开账号或者异常投注行为。进一步加强反作弊措施，列如监控多开账号或者异常投注行为。',
    status: 'pending'
  },
  {
    id: '94880',
    content:
      '进一步加强反作弊措施，列如监控多开账号或者异常投注行为。进一步加强反作弊措施，列如监控多开账号或者异常投注行为。',
    status: 'rejected',
    showDot: true
  }
])
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

.feedback-coin-icon {
  display: flex;
  height: 48px;
  width: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 2px solid #ffde7d;
  background: radial-gradient(circle at 30% 30%, #fff2b8 0%, #ffc247 42%, #f49d1a 100%);
  color: #ff7b00;
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.6),
    0 4px 12px rgba(244, 157, 26, 0.25);
}
</style>
