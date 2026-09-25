<template>
  <!-- 消息编辑器整体容器。 -->
  <div class="shrink-0 bg-bg-2">
    <!-- 引用回复预览区域。 -->
    <ReplyPreview v-if="replyTarget" :target="replyTarget" @close="$emit('cancel-reply')" />

    <!-- PC 端输入与功能操作区。 -->
    <div
      v-if="props.displayMode === 'pc'"
      class="flex h-[64px] items-center gap-[10px] border-t border-opacity-10 px-[10px] py-[10px]"
    >
      <div
        class="flex h-[44px] min-w-0 flex-1 items-center rounded-[10px] border bg-opacity-6 px-[12px]"
        :class="hasDraft ? 'border-theme-primary' : 'border-transparent'"
      >
        <input
          :value="modelValue"
          type="text"
          class="min-w-0 flex-1 bg-transparent text-[14px] text-text-1 outline-none placeholder:text-text-3"
          :placeholder="t('chatPublic.inputPlaceholder')"
          @input="handleInput"
          @keyup.enter="$emit('send')"
        />
        <button
          type="button"
          class="flex size-[24px] shrink-0 items-center justify-center"
          @click="$emit('emoji')"
        >
          <EmojiIcon class="size-[24px]" />
        </button>
      </div>
      <!-- PC 端按输入状态切换图片上传与发送操作。 -->
      <button
        type="button"
        class="flex size-[44px] shrink-0 items-center justify-center rounded-[10px]"
        :class="hasDraft ? 'bg-theme-primary' : ''"
        @click="hasDraft ? $emit('send') : $emit('media')"
      >
        <img
          v-if="hasDraft"
          :src="chatSendIconImage"
          alt=""
          class="h-[15px] w-[18px] object-contain"
        />
        <img v-else :src="chatMoreImage" alt="" class="size-[16px] object-contain" />
      </button>
    </div>

    <!-- H5 端紧凑输入与功能操作区。 -->
    <div v-else class="flex h-[48px] items-center gap-[11px] border-t border-opacity-10 px-[10px]">
      <input
        :value="modelValue"
        type="text"
        class="h-[36px] min-w-0 flex-1 rounded-[30px] border bg-bg-1 px-[12px] text-[14px] text-text-1 outline-none placeholder:text-text-3"
        :class="hasDraft ? 'border-theme-primary' : 'border-common-100/6'"
        :placeholder="t('chatPublic.inputPlaceholder')"
        @input="handleInput"
        @keyup.enter="$emit('send')"
      />
      <button type="button" class="shrink-0" @click="$emit('emoji')">
        <EmojiIcon class="size-[24px]" />
      </button>
      <!-- H5 端有内容时显示发送按钮，否则保留图片上传入口。 -->
      <button
        type="button"
        class="flex size-[24px] shrink-0 items-center justify-center"
        @click="hasDraft ? $emit('send') : $emit('media')"
      >
        <img v-if="hasDraft" :src="chatSendButtonImage" alt="" class="size-[24px] object-contain" />
        <img v-else :src="chatMoreH5Image" alt="" class="size-[24px] object-contain" />
      </button>
    </div>

    <!-- H5 底部安全区域留白。 -->
    <div v-if="props.displayMode === 'h5'" class="h-[33px] bg-bg-2" />
  </div>
</template>

<script setup lang="ts">
import chatMoreH5Image from '@/static/img/chat/public/chat-more-h5.png'
import chatMoreImage from '@/static/img/chat/public/chat-more.png'
import chatSendButtonImage from '@/static/img/chat/public/chat-send-button.png'
import chatSendIconImage from '@/static/img/chat/public/chat-send-icon.png'
import EmojiIcon from '@/static/svg/chat/public/emoji.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatReplyTarget } from '../types'
import ReplyPreview from './reply-preview.vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: string
    replyTarget?: ChatReplyTarget | null
    displayMode?: 'h5' | 'pc'
  }>(),
  { displayMode: 'h5' }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  emoji: []
  media: []
  'cancel-reply': []
}>()

/** 判断输入框是否存在可发送的非空内容。 */
const hasDraft = computed(() => props.modelValue.trim().length > 0)

/** 将原生输入事件转换为组件的双向绑定值。 */
const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
