<template>
  <!-- 图片、视频与相机操作面板。 -->
  <section class="h-[239px] shrink-0 bg-bg-1 px-[12px] pt-[18px]">
    <!-- 本地相册和相机入口，均允许选择图片或视频。 -->
    <div class="flex gap-[36px]">
      <button
        type="button"
        class="flex w-[60px] flex-col items-center gap-[10px]"
        @click="openPhotoPicker"
      >
        <span class="flex size-[60px] items-center justify-center rounded-[10px] bg-bg-2">
          <AlbumIcon class="size-[26px]" />
        </span>
        <span class="text-[12px] text-text-1">{{ t('chatPublic.photo') }}</span>
      </button>
      <button
        type="button"
        class="flex w-[60px] flex-col items-center gap-[10px]"
        @click="openCamera"
      >
        <span class="flex size-[60px] items-center justify-center rounded-[10px] bg-bg-2">
          <CameraIcon class="size-[26px]" />
        </span>
        <span class="text-[12px] text-text-1">{{ t('chatPublic.takePhoto') }}</span>
      </button>
    </div>

    <!-- H5 端由系统相机或相册处理文件选择；桌面端不支持时也会回退到此入口。 -->
    <input
      ref="photoInputRef"
      class="hidden"
      type="file"
      accept="image/*,video/*"
      multiple
      @change="handlePhotoChange"
    />
    <input
      ref="cameraInputRef"
      class="hidden"
      type="file"
      accept="image/*,video/*"
      capture="environment"
      multiple
      @change="handleCameraChange"
    />
  </section>

  <!-- PC 端通过浏览器媒体设备接口展示实时相机画面并拍照。 -->
  <Teleport to="body">
    <div
      v-if="cameraPreviewVisible"
      class="fixed inset-0 z-[130] flex items-center justify-center bg-mask-60-1 px-4 py-6"
      @click.self="closeCameraPreview"
    >
      <section
        class="flex h-[420px] w-[640px] max-w-full flex-col overflow-hidden rounded-[8px] bg-bg-1"
        role="dialog"
        aria-modal="true"
        :aria-label="t('chatPublic.takePhoto')"
      >
        <header class="relative flex h-[56px] shrink-0 items-center justify-center bg-bg-2">
          <strong class="text-[18px] font-[700] leading-[22px] text-text-1">
            {{ t('chatPublic.takePhoto') }}
          </strong>
          <button
            type="button"
            class="absolute right-4 top-4 flex size-6 items-center justify-center rounded-[4px] bg-opacity-10 text-[20px] leading-none text-text-1"
            :aria-label="t('chatPublic.close')"
            @click="closeCameraPreview"
          >
            ×
          </button>
        </header>
        <div class="min-h-0 flex-1 bg-common-0">
          <video
            ref="cameraVideoRef"
            class="size-full object-contain"
            autoplay
            muted
            playsinline
            @loadedmetadata="cameraReady = true"
          ></video>
        </div>
        <footer class="flex h-[64px] shrink-0 items-center justify-end gap-3 bg-bg-1 px-4">
          <button
            type="button"
            class="h-8 min-w-[72px] rounded-[6px] border border-input-2 px-3 text-[14px] font-[700] text-text-1"
            @click="closeCameraPreview"
          >
            {{ t('chatPublic.close') }}
          </button>
          <button
            type="button"
            class="h-8 min-w-[88px] rounded-[6px] bg-theme-primary px-3 text-[14px] font-[700] text-text-4 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!cameraReady || cameraCapturing"
            @click="capturePhoto"
          >
            {{ t('chatPublic.takePhoto') }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import AlbumIcon from '@/static/svg/chat/public/album.svg?component'
import CameraIcon from '@/static/svg/chat/public/camera.svg?component'
import { globalShowToast } from '@/utils/toast'
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    displayMode?: 'h5' | 'pc'
  }>(),
  {
    displayMode: 'h5'
  }
)

const emit = defineEmits<{ photo: [files: File[]]; camera: [files: File[]] }>()

const MAX_MEDIA_COUNT = 9
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024

const photoInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const cameraVideoRef = ref<HTMLVideoElement | null>(null)
const cameraPreviewVisible = ref(false)
const cameraReady = ref(false)
const cameraStarting = ref(false)
const cameraCapturing = ref(false)

let cameraStream: MediaStream | null = null
let disposed = false
let cameraSession = 0

/** 判断文件是否为可选视频，兼容部分设备不提供 MIME 类型的情况。 */
const isVideoFile = (file: File) =>
  file.type.startsWith('video/') || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(file.name)

/** 在进入预览前过滤超过聊天模块大小限制的媒体文件。 */
const filterSelectableMedia = (files: File[]) => {
  const validFiles = files.filter(file => {
    const maximumBytes = isVideoFile(file) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    return file.size <= maximumBytes
  })

  if (validFiles.length !== files.length) {
    globalShowToast({
      message: t('chatPublic.mediaSizeLimit'),
      type: 'fail'
    })
  }

  return validFiles
}

/** 提取最多九个图片或视频文件，并在读取后重置选择控件。 */
const getSelectedMedia = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = filterSelectableMedia(Array.from(input.files ?? [])).slice(0, MAX_MEDIA_COUNT)
  input.value = ''
  return files
}

/** 将本地相册选中的多张图片或视频向上交由预览页确认。 */
const handlePhotoChange = (event: Event) => {
  const files = getSelectedMedia(event)
  if (files.length) emit('photo', files)
}

/** 将相机拍摄或选择的多张图片或视频向上交由预览页确认。 */
const handleCameraChange = (event: Event) => {
  const files = getSelectedMedia(event)
  if (files.length) emit('camera', files)
}

/** 显式打开相册选择框，避免入口与隐藏 input 的关联依赖标签默认行为。 */
const openPhotoPicker = () => {
  photoInputRef.value?.click()
}

/** 在无法使用桌面摄像头接口时，使用浏览器原生拍照文件入口作为回退。 */
const openNativeCameraPicker = () => {
  cameraInputRef.value?.click()
}

/** 停止当前媒体流，确保关闭预览或离开会话后摄像头指示灯熄灭。 */
const stopCameraStream = () => {
  cameraStream?.getTracks().forEach(track => track.stop())
  cameraStream = null

  if (cameraVideoRef.value) {
    cameraVideoRef.value.srcObject = null
  }
}

/** 关闭 PC 摄像头预览并释放浏览器媒体设备。 */
const closeCameraPreview = () => {
  cameraSession += 1
  cameraPreviewVisible.value = false
  cameraReady.value = false
  stopCameraStream()
}

/**
 * H5 端交给系统相机拍摄；PC 端则通过 getUserMedia 打开实时预览。
 * 不支持 getUserMedia 的浏览器会退回原生文件选择器，以保证两个端都可继续上传图片或视频。
 */
const openCamera = async () => {
  if (props.displayMode !== 'pc') {
    openNativeCameraPicker()
    return
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    openNativeCameraPicker()
    return
  }

  if (cameraStarting.value || cameraPreviewVisible.value) return

  cameraStarting.value = true
  cameraReady.value = false

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: 'environment' }
      }
    })

    if (disposed) {
      stream.getTracks().forEach(track => track.stop())
      return
    }

    cameraStream = stream
    cameraSession += 1
    cameraPreviewVisible.value = true
    await nextTick()

    const video = cameraVideoRef.value
    if (!video) {
      closeCameraPreview()
      return
    }

    video.srcObject = stream
    await video.play().catch(() => undefined)
  } catch {
    // 未授予权限、没有摄像头或非安全上下文时，仍允许用户从本地选择媒体。
    closeCameraPreview()
    openNativeCameraPicker()
  } finally {
    cameraStarting.value = false
  }
}

/** 将 PC 摄像头当前帧转换为图片文件，并沿用既有的媒体大小校验与上传预览流程。 */
const capturePhoto = async () => {
  const video = cameraVideoRef.value
  if (!video || !video.videoWidth || !video.videoHeight || cameraCapturing.value) return

  const captureSession = cameraSession
  cameraCapturing.value = true

  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    })

    if (!blob || captureSession !== cameraSession) return

    const files = filterSelectableMedia([
      new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
    ])

    closeCameraPreview()
    if (files.length) emit('camera', files)
  } finally {
    cameraCapturing.value = false
  }
}

onBeforeUnmount(() => {
  disposed = true
  closeCameraPreview()
})
</script>
