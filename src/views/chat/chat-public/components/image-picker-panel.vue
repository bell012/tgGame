<template>
  <!-- 图片、视频与相机操作面板。 -->
  <section class="h-[239px] shrink-0 bg-bg-1 px-[12px] pt-[18px]">
    <!-- 本地相册和相机入口，均允许选择图片或视频。 -->
    <div class="flex gap-[36px]">
      <label class="flex w-[60px] flex-col items-center gap-[10px]">
        <span class="flex size-[60px] items-center justify-center rounded-[10px] bg-bg-2">
          <AlbumIcon class="size-[26px]" />
        </span>
        <span class="text-[12px] text-text-1">{{ t('chatPublic.photo') }}</span>
        <input class="hidden" type="file" accept="image/*,video/*" @change="handlePhotoChange" />
      </label>
      <label class="flex w-[60px] flex-col items-center gap-[10px]">
        <span class="flex size-[60px] items-center justify-center rounded-[10px] bg-bg-2">
          <CameraIcon class="size-[26px]" />
        </span>
        <span class="text-[12px] text-text-1">{{ t('chatPublic.takePhoto') }}</span>
        <input
          class="hidden"
          type="file"
          accept="image/*,video/*"
          capture="environment"
          @change="handleCameraChange"
        />
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import AlbumIcon from '@/static/svg/chat/public/album.svg?component'
import CameraIcon from '@/static/svg/chat/public/camera.svg?component'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{ photo: [file: File]; camera: [file: File] }>()

/** 提取文件选择控件中的首个图片或视频文件并重置控件值。 */
const getSelectedMedia = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  return file
}

/** 将本地相册选中的图片或视频向上交由运行时上传。 */
const handlePhotoChange = (event: Event) => {
  const file = getSelectedMedia(event)
  if (file) emit('photo', file)
}

/** 将相机拍摄的图片或视频向上交由运行时上传。 */
const handleCameraChange = (event: Event) => {
  const file = getSelectedMedia(event)
  if (file) emit('camera', file)
}
</script>
