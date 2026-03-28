<template>
  <div
    class="relative w-full max-w-[480px] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-xl modal-container bg-bg-1 sm:max-h-[543px]"
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
            <BulletDotIcon class="w-1.5 h-1.5" />
          </div>
          <div class="text-text-2 text-sm font-bold leading-normal">
            <span>{{ t('deposit.upload_proof_tips_1_1') }}</span>
            <span class="text-theme-primary">{{ t('deposit.upload_proof_tips_1_2') }}</span>
          </div>
        </div>
        <div class="mt-3 flex items-start">
          <div class="w-1.5 h-1.5 mr-1 mt-1">
            <BulletDotIcon class="w-1.5 h-1.5" />
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
                <PlusIcon class="w-6 h-6" />
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
          @click.stop="handleConfirmUpload"
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
import BulletDotIcon from '@/static/svg/deposit/bullet-dot.svg?component'
import PlusIcon from '@/static/svg/deposit/plus.svg?component'
import deleteIcon from '@/static/img/payment/upload_delete.png'
import paymentReceiptSamplePop from '../paymentReceiptSample/paymentReceiptSamplePop.vue'
import { ref } from 'vue'

const { t } = useI18n()
const emit = defineEmits(['close', 'confirmUpload'])

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

const handleConfirmUpload = () => {
  emit('confirmUpload')
}
</script>
<style scoped lang="scss"></style>
