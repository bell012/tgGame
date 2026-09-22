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
      <div class="flex h-[44px] min-w-0 flex-1 items-center rounded-[10px] bg-opacity-6 px-[12px]">
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
      <button
        type="button"
        class="flex size-[44px] shrink-0 items-center justify-center rounded-[10px] bg-opacity-6"
        @click="$emit('media')"
      >
        <MoreIcon class="size-[16px]" />
      </button>
    </div>

    <!-- H5 端紧凑输入与功能操作区。 -->
    <div v-else class="flex h-[48px] items-center gap-[11px] border-t border-opacity-10 px-[10px]">
      <input
        :value="modelValue"
        type="text"
        class="h-[36px] min-w-0 flex-1 rounded-[30px] border border-opacity-6 bg-bg-1 px-[12px] text-[14px] text-text-1 outline-none placeholder:text-text-3"
        :placeholder="t('chatPublic.inputPlaceholder')"
        @input="handleInput"
        @keyup.enter="$emit('send')"
      />
      <button type="button" class="shrink-0" @click="$emit('emoji')">
        <EmojiIcon class="size-[24px]" />
      </button>
      <button type="button" class="shrink-0" @click="$emit('media')">
        <MoreIcon class="size-[24px]" />
      </button>
    </div>

    <!-- H5 底部安全区域留白。 -->
    <div v-if="props.displayMode === 'h5'" class="h-[33px] bg-bg-2" />
  </div>
</template>

<script setup lang="ts">
import EmojiIcon from '@/static/svg/chat/public/emoji.svg?component'
import MoreIcon from '@/static/svg/chat/public/more.svg?component'
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

/** 将原生输入事件转换为组件的双向绑定值。 */
const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
