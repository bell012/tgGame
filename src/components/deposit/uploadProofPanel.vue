<template>
  <div
    class="relative w-full max-w-[480px] h-1/2 sm:h-full sm:max-h-[543px] rounded-xl modal-container bg-bg-1"
  >
    <div class="flex items-center justify-between h-14 bg-bg-2 rounded-tl-xl rounded-tr-xl">
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.upload_proof_title') }}
      </h2>
      <button
        class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="w-4 h-4 fill-none" />
      </button>
    </div>
    <div class="p-4">
      <div class="p-7 rounded-lg bg-bg-2">
        <div class="flex items-start">
          <div class="w-1.5 h-1.5 mr-1 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="6"
              height="6"
              viewBox="0 0 6 6"
              fill="none"
            >
              <circle cx="3" cy="3" r="3" fill="#B3BEC1" />
            </svg>
          </div>
          <div class="text-text-2 text-sm font-bold leading-normal">
            <span>{{ t('deposit.upload_proof_tips_1_1') }}</span>
            <span class="text-theme-primary">{{ t('deposit.upload_proof_tips_1_2') }}</span>
          </div>
        </div>
        <div class="mt-3 flex items-start">
          <div class="w-1.5 h-1.5 mr-1 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="6"
              height="6"
              viewBox="0 0 6 6"
              fill="none"
            >
              <circle cx="3" cy="3" r="3" fill="#B3BEC1" />
            </svg>
          </div>
          <div class="text-text-2 text-sm font-bold leading-normal">
            <span>{{ t('deposit.upload_proof_tips_2') }}</span>
          </div>
        </div>
        <div
          class="mt-4 pl-4 text-sm font-normal leading-normal text-secondary-7"
          @click.stop="paymentReceiptSampleShow = true"
        >
          {{ t('deposit.upload_view_btn_text') }}
        </div>
        <div class="mt-6 pl-4 relative">
          <Uploader
            v-model="fileList"
            :max-count="1"
            :preview-full-image="false"
            preview-size="150"
            :after-read="imageAfterRead"
            :before-delete="imageDelete"
          >
            <template #preview-delete>
              <div class="h-6 w-6 absolute -top-3 -right-3">
                <img :src="deleteIcon" alt="delete" />
              </div>
            </template>
            <div
              class="w-[150px] h-[150px] flex flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed border-fill-icon-2"
            >
              <div class="w-6 h-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 0C12.8284 0 13.5 0.671573 13.5 1.5V10.5H22.5C23.3284 10.5 24 11.1716 24 12C24 12.8284 23.3284 13.5 22.5 13.5H13.5V22.5C13.5 23.3284 12.8284 24 12 24C11.1716 24 10.5 23.3284 10.5 22.5V13.5H1.5C0.671573 13.5 5.30754e-07 12.8284 0 12C3.62117e-08 11.1716 0.671573 10.5 1.5 10.5H10.5V1.5C10.5 0.671573 11.1716 0 12 0Z"
                    fill="#B3BEC1"
                  />
                </svg>
              </div>
              <div class="mt-3 text-base font-bold leading-normal text-text-2">
                {{ t('deposit.upload_btn_text') }}
              </div>
            </div>
          </Uploader>
        </div>
        <button
          class="mt-6 h-12 w-full rounded-lg text-text-4 text-[14px] font-bold"
          :disabled="!(uploadUrls && uploadUrls.length > 0)"
          :class="[
            !(uploadUrls && uploadUrls.length > 0) ? 'bg-theme-2 cursor-not-allowed' : 'btn-primary'
          ]"
        >
          {{ t('deposit.upload_proof_confirm_btn_text') }}
        </button>
      </div>
    </div>
  </div>
  <paymentReceiptSamplePop v-model="paymentReceiptSampleShow" />
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Uploader, UploaderAfterRead, UploaderFileListItem } from 'vant'
import CloseIcon from '@/static/svg/close.svg?component'
import deleteIcon from '@/static/img/payment/upload_delete.png'
import paymentReceiptSamplePop from './paymentReceiptSamplePop.vue'
import { ref } from 'vue'

const { t } = useI18n()
const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

const fileList = ref<UploaderFileListItem[]>()
const uploadUrls = ref<string[]>([])
const paymentReceiptSampleShow = ref<boolean>(false)

const imageAfterRead: UploaderAfterRead = async (items, detail) => {
  // 如果传入的 items 是单个文件对象，转换为数组处理
  const files = Array.isArray(items) ? items : [items]

  for (const file of files) {
    file.status = 'uploading'
    file.message = '上传中...'
    file.status = 'done'
    file.message = '上传成功'
    if (file.objectUrl) uploadUrls.value.push(file.objectUrl)
  }

  console.log(detail.index)
  console.log(detail.name)
}

const imageDelete = () => {
  uploadUrls.value = []
}
</script>
<style scoped lang="scss"></style>
