<template>
  <!-- 图片查看与发送预览覆盖层。 -->
  <div class="fixed inset-0 z-[120] flex flex-col bg-mask-100-4">
    <!-- 图片预览顶部操作栏。 -->
    <header class="flex h-[49px] shrink-0 items-center justify-between bg-[#191717] px-[14px]">
      <button
        type="button"
        class="flex size-[33px] items-center justify-center rounded-[8px] bg-opacity-6"
        :aria-label="t('chatPublic.close')"
        @click="$emit('close')"
      >
        <ArrowLeftIcon class="size-[14px] text-common-100" />
      </button>

      <strong v-if="mode === 'compose'" class="text-[16px] font-bold leading-[19px] text-text-1">
        {{ t('chatPublic.imagePreview', { current: 4, total: 9 }) }}
      </strong>
      <span v-else />

      <span
        v-if="mode === 'compose'"
        class="flex size-[24px] items-center justify-center rounded-full bg-theme-primary text-[14px] font-bold text-text-4"
      >
        3
      </span>
      <button
        v-else
        type="button"
        class="flex size-[33px] items-center justify-center rounded-[8px] bg-common-100/[0.2] text-[25px] leading-none text-common-100"
        :aria-label="t('chatPublic.sendImage', { current: 4, total: 9 })"
      >
        ↓
      </button>
    </header>

    <!-- 居中显示的原图区域。 -->
    <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      <img :src="src" alt="" class="max-h-full w-full object-contain" />
    </div>

    <template v-if="mode === 'compose'">
      <!-- 待发送图片缩略图列表。 -->
      <div
        class="flex h-[81px] shrink-0 items-center gap-[8px] overflow-hidden border-t border-opacity-10 bg-text-4 px-[8px]"
      >
        <button
          v-for="index in 4"
          :key="index"
          type="button"
          class="size-[58px] shrink-0 overflow-hidden rounded-[2px]"
          :class="index === 3 ? 'ring-[2px] ring-theme-primary' : ''"
        >
          <img :src="src" alt="" class="size-full object-cover" />
        </button>
      </div>
      <!-- 发送图片底部操作栏。 -->
      <footer
        class="flex h-[58px] shrink-0 items-center justify-end border-t border-opacity-10 bg-[#191717] px-[14px]"
      >
        <button
          type="button"
          class="flex h-[34px] min-w-[90px] items-center justify-center gap-[8px] rounded-[6px] bg-theme-primary px-[12px] text-[14px] font-bold text-text-4"
          @click="$emit('send')"
        >
          {{ t('chatPublic.sendImage', { current: 4, total: 9 }) }}
          <span aria-hidden="true" class="text-[20px] leading-none">→</span>
        </button>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    src: string
    mode?: 'compose' | 'viewer'
  }>(),
  { mode: 'viewer' }
)

defineEmits<{ close: []; send: [] }>()

const { t } = useI18n()
</script>
