<template>
  <div
    class="relative w-full max-w-[480px] h-auto overflow-visible rounded-tl-xl rounded-tr-xl sm:rounded-xl modal-container bg-bg-1 sm:max-h-[543px] sm:overflow-y-auto font-['Inter']"
  >
    <div class="flex items-center justify-between h-14 bg-bg-2 rounded-tl-xl rounded-tr-xl">
      <h2
        class="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg sm:font-semibold text-text-1 whitespace-nowrap"
      >
        {{ t('deposit.upload_proof_title') }}
      </h2>
      <button
        class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="h-2.5 w-2.5 text-text-1" />
      </button>
    </div>

    <div class="p-4">
      <div class="sm:p-7 sm:rounded-lg sm:bg-bg-2">
        <div class="flex items-start">
          <div class="w-1.5 h-1.5 mr-1 mt-1">
            <BulletDotIcon class="w-1.5 h-1.5" />
          </div>

          <div class="text-text-2 text-sm sm:font-bold sm:leading-normal">
            <span>{{ t('deposit.upload_proof_tips_1_1') }}</span>
            <span class="text-theme-primary">{{ t('deposit.upload_proof_tips_1_2') }}</span>
          </div>
        </div>

        <div class="mt-3 flex items-start">
          <div class="w-1.5 h-1.5 mr-1 mt-1">
            <BulletDotIcon class="w-1.5 h-1.5" />
          </div>

          <div class="text-text-2 text-sm sm:font-bold sm:leading-normal">
            <span>{{ t('deposit.upload_proof_tips_2') }}</span>
          </div>
        </div>

        <div
          class="mt-3 pl-3 text-sm font-normal leading-normal text-secondary-7 underline underline-offset-[4px] sm:mt-4 sm:pl-4"
          @click.stop="paymentReceiptSampleShow = true"
        >
          {{ t('deposit.upload_view_btn_text') }}
        </div>

        <div class="mt-5 sm:mt-6 pl-4 relative">
          <Uploader
            v-model="fileList"
            :max-count="1"
            :preview-full-image="true"
            :preview-size="uploadPreviewSize"
            :after-read="imageAfterRead"
            :before-delete="imageDelete"
            :preview-options="{ closeable: true }"
          >
            <!-- 区块：template -->
            <template #preview-delete>
              <div class="h-4 w-4 sm:h-6 sm:w-6 absolute -top-1.5 -right-1.5 sm:-top-3 sm:-right-3">
                <img :src="deleteIcon" :alt="t('deposit.delete_image_alt')" />
              </div>
            </template>
            <div
              class="box-border flex h-[100px] w-[100px] flex-col items-center justify-center gap-[7px] rounded-[8px] border border-dashed text-text-3 sm:h-[150px] sm:w-[150px]"
            >
              <div class="flex h-4 w-4 items-center justify-center">
                <PlusIcon class="h-4 w-4" />
              </div>
              <div class="w-[74px] text-center text-[12px] font-normal leading-[15px] text-text-3">
                {{ t('deposit.upload_btn_text') }}
              </div>
            </div>
          </Uploader>
        </div>
        <button
          class="mt-6 h-10 sm:h-12 w-full rounded-lg text-text-4 text-sm font-bold"
          :disabled="!canConfirmUpload"
          :class="[!canConfirmUpload ? 'bg-theme-2 cursor-not-allowed' : 'btn-primary']"
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
import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import deleteIcon from '@/static/img/payment/upload_delete.png'
import CloseIcon from '@/static/svg/close.svg?component'
import BulletDotIcon from '@/static/svg/deposit/bullet-dot.svg?component'
import PlusIcon from '@/static/svg/deposit/plus.svg?component'
import { resolveUploadErrorMessage } from '@/utils/upload-error'
import { globalShowToast } from '@/utils/toast'
import { Uploader, UploaderAfterRead, UploaderFileListItem } from 'vant'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import paymentReceiptSamplePop from '../paymentReceiptSample/paymentReceiptSamplePop.vue'

const { t } = useI18n()
const isMobile = useIsMobile()
interface Props {
  orderId?: string | number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  confirmUpload: [uploadedFilePath: string]
}>()

// 处理关闭事件
const handleClose = () => {
  emit('close')
}

const fileList = ref<UploaderFileListItem[]>([])
const paymentReceiptSampleShow = ref<boolean>(false)
const uploadedFilePath = ref('')
const isUploadingImage = ref(false)
const isBindingRemark = ref(false)
const canConfirmUpload = computed(
  () => !!uploadedFilePath.value && !isUploadingImage.value && !isBindingRemark.value
)
const uploadPreviewSize = computed(() => (isMobile.value ? 100 : 150))

const imageAfterRead: UploaderAfterRead = async items => {
  // 如果传入的 items 是单个文件对象，转换为数组处理
  const files = Array.isArray(items) ? items : [items]
  uploadedFilePath.value = ''

  for (const file of files) {
    const rawFile = file.file

    if (!rawFile) {
      file.status = 'failed'
      file.message = t('deposit.upload_status_failed')
      continue
    }

    file.status = 'uploading'
    file.message = t('deposit.upload_status_uploading')
    isUploadingImage.value = true

    try {
      const response = await Api.picture.upload({
        file: rawFile,
        fileName: sanitizeUploadFileName(rawFile.name)
      })

      if (!response?.success) {
        throw new Error(response?.message || t('common.error'))
      }

      const uploadedPath = getUploadedFilePath(response.result)

      if (!uploadedPath) {
        throw new Error(response?.message || t('common.error'))
      }

      uploadedFilePath.value = uploadedPath
      file.status = 'done'
      file.message = t('deposit.upload_status_success')
    } catch (error) {
      const errorMessage = resolveUploadErrorMessage(error, t, t('deposit.upload_status_failed'))
      file.status = 'failed'
      file.message = t('personalCenter.feedback.toast.uploadFailed')
      globalShowToast({
        message: errorMessage,
        type: 'fail'
      })
    } finally {
      isUploadingImage.value = false
    }
  }
}

// 删除图片
const imageDelete = () => {
  uploadedFilePath.value = ''
  return true
}

const getUploadedFilePath = (result: unknown) => {
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

const sanitizeUploadFileName = (fileName: string) => {
  const trimmedName = fileName.trim() || 'proof'
  return trimmedName.replace(/[\\/:*?"<>|\r\n]+/g, '_')
}

// 处理确认上传事件
const handleConfirmUpload = async () => {
  if (!canConfirmUpload.value) return

  const orderId = String(props.orderId ?? '').trim()
  if (!orderId) {
    globalShowToast({
      message: t('common.error'),
      type: 'fail'
    })
    return
  }

  if (!uploadedFilePath.value) {
    globalShowToast({
      message: t('common.error'),
      type: 'fail'
    })
    return
  }

  isBindingRemark.value = true

  try {
    const response = await Api.wallet.updatePayOrderRemark({
      orderId,
      orderRemark: uploadedFilePath.value
    })

    if (!response?.success) {
      throw new Error(response?.message || t('common.error'))
    }

    emit('confirmUpload', uploadedFilePath.value)
  } catch (error) {
    globalShowToast({
      message: error instanceof Error ? error.message : t('common.error'),
      type: 'fail'
    })
  } finally {
    isBindingRemark.value = false
  }
}
</script>
<style scoped lang="scss"></style>
