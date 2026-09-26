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
        <input
          class="hidden"
          type="file"
          accept="image/*,video/*"
          multiple
          @change="handlePhotoChange"
        />
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
          multiple
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

const emit = defineEmits<{ photo: [files: File[]]; camera: [files: File[]] }>()

const MAX_MEDIA_COUNT = 9

/** 提取最多九个图片或视频文件，并在读取后重置选择控件。 */
const getSelectedMedia = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).slice(0, MAX_MEDIA_COUNT)
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
</script>
