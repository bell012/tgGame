<template>
  <!-- PC 端图片与视频预览弹窗。 -->
  <div
    v-if="displayMode === 'pc'"
    class="fixed inset-0 z-[120] flex items-center justify-center bg-common-0/60"
  >
    <!-- PC 端 836 × 540 媒体预览主体。 -->
    <section
      class="relative flex h-[540px] w-[836px] flex-col overflow-hidden rounded-[8px] bg-bg-1"
    >
      <!-- PC 端弹窗标题栏。 -->
      <header class="relative flex h-[56px] shrink-0 items-center justify-center bg-bg-2">
        <strong class="text-[18px] font-[700] leading-[22px] text-text-1">
          {{ t('chatPublic.photoPreview') }}
        </strong>
        <button
          type="button"
          class="absolute right-4 top-4 flex size-6 items-center justify-center rounded-[4px] bg-common-100/10"
          :aria-label="t('chatPublic.close')"
          @click="$emit('close')"
        >
          <span class="text-[20px] leading-none text-text-1">×</span>
        </button>
      </header>

      <!-- PC 端当前媒体与底部缩略图区域。 -->
      <div class="relative m-4 h-[452px] overflow-hidden rounded-[8px] bg-bg-2">
        <video
          v-if="currentMedia?.type.startsWith('video/')"
          class="size-full bg-common-0 object-contain"
          :src="currentMediaUrl"
          controls
          playsinline
          preload="metadata"
        ></video>
        <img v-else :src="currentMediaUrl" alt="" class="size-full object-contain" />

        <!-- 当前序号与总数量。 -->
        <span
          class="absolute right-[14px] top-[14px] rounded-full bg-common-0/40 px-4 py-1 text-[12px] text-text-1"
        >
          {{ currentIndex + 1 }} / {{ previewCount }}
        </span>

        <!-- PC 端待发送媒体的确认按钮。 -->
        <button
          v-if="mode === 'compose'"
          type="button"
          class="absolute bottom-[16px] right-[14px] z-10 flex h-8 min-w-[88px] items-center justify-center rounded-[6px] bg-theme-primary px-3 text-[14px] font-[700] text-text-4"
          @click="$emit('send')"
        >
          {{ mediaFiles.length }} / 9
        </button>
        <!-- PC 端历史媒体的下载入口。 -->
        <button
          v-else
          type="button"
          class="absolute left-1/2 top-[322px] flex size-[32px] -translate-x-1/2 items-center justify-center rounded-[8px] bg-black/40"
          :aria-label="t('chatPublic.download')"
          @click="handleDownload"
        >
          <ChatMediaDownload class="size-[16px] text-text-1" />
        </button>

        <!-- PC 端缩略图横向列表。 -->
        <div
          v-if="mediaFiles.length"
          class="absolute inset-x-0 bottom-0 flex h-[82px] items-start justify-center gap-[10px] overflow-x-auto bg-common-0/60 px-4 pt-2"
        >
          <button
            v-for="(file, index) in mediaFiles"
            :key="`${file.name}-${file.lastModified}-${index}`"
            type="button"
            class="relative size-[66px] shrink-0 overflow-hidden"
            :class="index === currentIndex ? 'border-2 border-theme-primary' : ''"
            @click="currentIndex = index"
          >
            <video
              v-if="file.type.startsWith('video/')"
              :src="mediaUrls[index]"
              class="size-full object-cover"
              muted
              playsinline
              preload="metadata"
            ></video>
            <img v-else :src="mediaUrls[index]" alt="" class="size-full object-cover" />
            <span
              v-if="mode === 'compose'"
              class="absolute right-[2px] top-[2px] flex size-4 items-center justify-center rounded-full bg-common-0/70 text-[14px] leading-none text-text-1"
              @click.stop="removeMedia(index)"
            >
              ×
            </span>
          </button>
        </div>
      </div>
    </section>
  </div>

  <!-- H5 图片与视频的全屏预览覆盖层。 -->
  <div v-else class="fixed inset-0 z-[120] flex flex-col bg-mask-100-4">
    <!-- 预览顶部操作栏。 -->
    <header class="flex h-[49px] shrink-0 items-center justify-between bg-[#191717] px-[14px]">
      <button
        type="button"
        class="flex size-[33px] items-center justify-center rounded-[8px] bg-opacity-6"
        :aria-label="t('chatPublic.close')"
        @click="$emit('close')"
      >
        <ArrowLeftIcon class="size-[14px] text-common-100" />
      </button>
      <strong v-if="mode === 'compose'" class="text-[16px] font-bold leading-[19px] text-text-1"
        >{{ currentIndex + 1 }}/{{ mediaFiles.length }}</strong
      >
      <span v-else class="size-[33px]" />
      <span
        v-if="mode === 'compose'"
        class="flex size-[24px] items-center justify-center rounded-full bg-theme-primary text-[14px] font-bold text-text-4"
        >{{ mediaFiles.length }}</span
      >
      <span v-else class="size-[33px]" />
    </header>

    <!-- 当前选中图片或视频的原始预览区域。 -->
    <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      <video
        v-if="currentMedia?.type.startsWith('video/')"
        class="max-h-full w-full bg-common-0 object-contain"
        :src="currentMediaUrl"
        controls
        playsinline
        preload="metadata"
      ></video>
      <img v-else :src="currentMediaUrl" alt="" class="max-h-full w-full object-contain" />
    </div>

    <!-- 图片查看模式的下载按钮固定显示在页面右下角。 -->
    <button
      v-if="mode === 'viewer'"
      type="button"
      class="absolute bottom-[14px] right-[14px] z-10 flex size-[27px] items-center justify-center rounded-[8px] bg-black/40 p-[3px]"
      :aria-label="t('chatPublic.download')"
      @click="handleDownload"
    >
      <ChatMediaDownload class="size-[18px] text-text-1" />
    </button>

    <template v-if="mode === 'compose'">
      <!-- 待发送媒体缩略图列表，可切换当前预览项。 -->
      <div
        class="flex h-[81px] shrink-0 items-center gap-[8px] overflow-x-auto border-t border-opacity-10 bg-text-4 px-[8px]"
      >
        <button
          v-for="(file, index) in mediaFiles"
          :key="`${file.name}-${file.lastModified}-${index}`"
          type="button"
          class="relative size-[58px] shrink-0 overflow-hidden rounded-[2px]"
          :class="index === currentIndex ? 'ring-[2px] ring-theme-primary' : ''"
          @click="currentIndex = index"
        >
          <video
            v-if="file.type.startsWith('video/')"
            :src="mediaUrls[index]"
            class="size-full object-cover"
            muted
            playsinline
            preload="metadata"
          ></video>
          <img v-else :src="mediaUrls[index]" alt="" class="size-full object-cover" />
          <span
            class="absolute right-[2px] top-[2px] flex size-[16px] items-center justify-center rounded-full bg-common-0/70 text-[14px] leading-none text-common-100"
            @click.stop="removeMedia(index)"
            >×</span
          >
        </button>
      </div>
      <!-- 批量发送图片或视频的底部操作栏。 -->
      <footer
        class="flex h-[58px] shrink-0 items-center justify-end border-t border-opacity-10 bg-[#191717] px-[14px]"
      >
        <button
          type="button"
          class="flex h-[34px] min-w-[90px] items-center justify-center gap-[8px] rounded-[6px] bg-theme-primary px-[12px] text-[14px] font-bold text-text-4"
          :disabled="!mediaFiles.length"
          @click="$emit('send')"
        >
          {{ mediaFiles.length }} / 9
          <span aria-hidden="true" class="text-[20px] leading-none">→</span>
        </button>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import ChatMediaDownload from '@/static/svg/chat/public/download.svg?component'
import { globalShowToast } from '@/utils/toast'
import { computed, onBeforeUnmount, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { downloadChatMedia } from '../shared'
const props = withDefaults(
  defineProps<{
    src?: string
    mediaFiles?: File[]
    mode?: 'compose' | 'viewer'
    displayMode?: 'h5' | 'pc'
  }>(),
  {
    src: '',
    mediaFiles: () => [],
    mode: 'viewer',
    displayMode: 'h5'
  }
)
const emit = defineEmits<{ close: []; send: []; remove: [index: number] }>()
const { t } = useI18n()
// 将模板使用的属性显式暴露，避免语言服务将其误判为不存在的 $props 字段。
const { displayMode, mediaFiles, mode } = toRefs(props)
const currentIndex = ref(0)
const mediaUrls = ref<string[]>([])

/** 为待发送的本地文件创建预览地址，并释放不再使用的旧地址。 */
const syncMediaUrls = (files: File[]) => {
  mediaUrls.value.forEach(url => URL.revokeObjectURL(url))
  mediaUrls.value = files.map(file => URL.createObjectURL(file))
  currentIndex.value = Math.min(currentIndex.value, Math.max(files.length - 1, 0))
}

/** 返回当前正在查看的媒体文件；查看历史图片时为空。 */
const currentMedia = computed(() => props.mediaFiles[currentIndex.value])

/** 返回当前媒体的本地预览地址或历史消息图片地址。 */
const currentMediaUrl = computed(() => mediaUrls.value[currentIndex.value] || props.src)

/** 返回预览内容总数，历史消息图片默认只有一张。 */
const previewCount = computed(() => props.mediaFiles.length || (props.src ? 1 : 0))

/** 删除当前缩略图中的媒体，并由父级同步更新待发送数组。 */
const removeMedia = (index: number) => emit('remove', index)

/** 下载当前正在预览的图片或视频，并在浏览器触发保存后给出提示。 */
const handleDownload = async () => {
  try {
    await downloadChatMedia(currentMediaUrl.value)
    // globalShowToast({ message: t('chatPublic.mediaDownloadHint'), type: 'success' })
  } catch {
    globalShowToast({ message: t('chatPublic.imageSaveHint'), type: 'success' })
  }
}

watch(
  () => props.mediaFiles,
  files => syncMediaUrls(files),
  { immediate: true, deep: false }
)

/** 组件销毁时释放 Blob URL，避免多次预览造成内存泄漏。 */
onBeforeUnmount(() => mediaUrls.value.forEach(url => URL.revokeObjectURL(url)))
</script>
