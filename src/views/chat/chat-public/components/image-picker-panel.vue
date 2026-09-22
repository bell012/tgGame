<template>
  <!-- 图片与相机操作面板。 -->
  <section class="h-[239px] shrink-0 bg-bg-1 px-[12px] pt-[18px]">
    <!-- 本地相册和相机入口。 -->
    <div class="flex gap-[36px]">
      <button
        type="button"
        class="flex w-[60px] flex-col items-center gap-[10px]"
        @click="$emit('photo')"
      >
        <span class="flex size-[60px] items-center justify-center rounded-[10px] bg-bg-2">
          <AlbumIcon class="size-[26px]" />
        </span>
        <span class="text-[12px] text-text-1">{{ t('chatPublic.photo') }}</span>
      </button>
      <button
        type="button"
        class="flex w-[60px] flex-col items-center gap-[10px]"
        @click="$emit('camera')"
      >
        <span class="flex size-[60px] items-center justify-center rounded-[10px] bg-bg-2">
          <CameraIcon class="size-[26px]" />
        </span>
        <span class="text-[12px] text-text-1">{{ t('chatPublic.takePhoto') }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import AlbumIcon from '@/static/svg/chat/public/album.svg?component'
import CameraIcon from '@/static/svg/chat/public/camera.svg?component'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineEmits<{ photo: []; camera: [] }>()
</script>
