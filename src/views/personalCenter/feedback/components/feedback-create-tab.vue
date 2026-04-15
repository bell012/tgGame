<template>
  <div>
    <section class="rounded-[12px] bg-bg-2 p-3.5">
      <div class="flex items-center text-sm">
        <span class="font-[700] text-text-1">{{
          t('personalCenter.feedback.createTab.sectionTitle')
        }}</span>
        <span class="ml-1 text-xs text-text-3">
          ({{ t('personalCenter.feedback.createTab.requiredType') }})
        </span>
      </div>

      <div class="mt-3 rounded-[10px] bg-bg-3 p-2.5">
        <button
          v-for="item in feedbackTypeOptions"
          :key="item.value"
          type="button"
          class="mb-2 flex h-[42px] w-full items-center justify-between rounded-[8px] px-3 text-left text-[16px] last:mb-0"
          :class="
            selectedTypeModel === item.value
              ? 'bg-[rgba(43,177,112,0.28)] text-text-1'
              : 'bg-transparent text-text-1'
          "
          @click="selectedTypeModel = item.value"
        >
          <span>{{ item.label }}</span>
          <span
            class="feedback-radio-circle"
            :class="{ 'feedback-radio-circle-active': selectedTypeModel === item.value }"
          ></span>
        </button>
      </div>

      <textarea
        v-model.trim="feedbackContentModel"
        maxlength="500"
        :placeholder="placeholderText"
        class="mt-3 h-[112px] w-full resize-none rounded-[10px] bg-bg-3 px-3 py-2.5 text-[16px] leading-[22px] text-text-1 outline-none placeholder:text-text-3"
      ></textarea>

      <div class="mt-3">
        <div class="text-sm font-[700] text-text-1">
          {{ t('personalCenter.feedback.createTab.uploadPhotos') }}
          <span class="ml-1 text-xs font-[500] text-text-3">
            ({{ feedbackUploadCount }}/{{ feedbackUploadMaxCount }})
          </span>
        </div>

        <Uploader
          v-model="feedbackFileListModel"
          class="mt-2.5"
          :max-count="feedbackUploadMaxCount"
          :multiple="true"
          :preview-full-image="true"
          :preview-size="88"
          :after-read="afterRead"
          :before-delete="beforeDelete"
          :preview-options="{ closeable: true }"
        >
          <template #preview-delete>
            <div
              class="absolute -right-1.5 -top-1.5 h-4 w-4 overflow-hidden rounded-full sm:h-5 sm:w-5"
            >
              <img :src="deleteIcon" :alt="t('common.delete')" class="h-full w-full" />
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
        @click="onSubmit"
      >
        {{ t('personalCenter.feedback.createTab.submitFeedback') }}
      </button>
    </section>

    <section class="mt-3.5 rounded-[12px] bg-bg-2 p-3.5">
      <div class="text-[15px] font-[700] text-text-1">
        {{ t('personalCenter.feedback.createTab.rewardRulesTitle') }}
      </div>
      <div class="mt-2 text-sm leading-[22px] text-text-3">
        {{ t('personalCenter.feedback.createTab.rewardRulesDescription') }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackTypeOption } from '../types'
import { Uploader, type UploaderAfterRead, type UploaderFileListItem } from 'vant'
import { useI18n } from 'vue-i18n'

// 创建反馈模块：只负责表单 UI 渲染，接口请求由父组件处理。
const selectedTypeModel = defineModel<string>('selectedType', { required: true })
const feedbackContentModel = defineModel<string>('feedbackContent', { required: true })
const feedbackFileListModel = defineModel<UploaderFileListItem[]>('feedbackFileList', {
  required: true
})

defineProps<{
  feedbackTypeOptions: FeedbackTypeOption[]
  placeholderText: string
  feedbackUploadCount: number
  feedbackUploadMaxCount: number
  isSubmittingFeedback: boolean
  deleteIcon: string
  afterRead: UploaderAfterRead
  beforeDelete: (_file: UploaderFileListItem, detail: { index: number }) => boolean
  onSubmit: () => void
}>()

const { t } = useI18n()
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
</style>
