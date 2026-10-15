<template>
  <!-- 消息编辑器整体容器。 -->
  <div class="shrink-0 bg-bg-2">
    <!-- 引用回复预览区域。 -->
    <ReplyPreview v-if="replyTarget" :target="replyTarget" @close="$emit('cancel-reply')" />

    <!-- PC 端输入与功能操作区。 -->
    <div
      v-if="props.displayMode === 'pc'"
      class="flex h-[64px] items-center gap-[10px] px-[10px] py-[10px]"
    >
      <div
        class="flex h-[44px] min-w-0 flex-1 items-center rounded-[10px] border bg-opacity-6 px-[12px]"
        :class="hasDraft ? 'border-theme-primary' : 'border-transparent'"
      >
        <div
          ref="inputRef"
          data-chat-composer-input
          contenteditable="true"
          role="textbox"
          aria-multiline="false"
          class="chat-composer-input chat-composer-input--pc min-w-0 flex-1 overflow-x-auto whitespace-nowrap bg-transparent font-pingfang text-[14px] font-[400] leading-[20px] text-text-1 outline-none empty:before:text-text-3 empty:before:content-[attr(data-placeholder)]"
          :data-placeholder="t('chatPublic.inputPlaceholder')"
          @input="handleInput"
          @compositionend="handleCompositionEnd"
          @compositionstart="handleCompositionStart"
          @focus="handleInputFocus"
          @keydown.enter.prevent="$emit('send')"
        ></div>
        <button
          type="button"
          class="flex size-[24px] shrink-0 items-center justify-center"
          @click="openEmojiPanel"
        >
          <EmojiIcon class="size-[24px]" />
        </button>
      </div>
      <!-- PC 端按输入状态切换图片上传与发送操作。 -->
      <button
        type="button"
        class="flex size-[44px] shrink-0 items-center justify-center rounded-[10px]"
        :class="hasDraft ? 'bg-theme-primary' : 'bg-opacity-6'"
        @click="hasDraft ? $emit('send') : openMediaPanel()"
      >
        <img
          v-if="hasDraft"
          :src="chatSendIconImage"
          alt=""
          class="h-[16px] w-[19px] object-contain"
        />
        <img v-else :src="chatMoreImage" alt="" class="size-[16px] object-contain" />
      </button>
    </div>

    <!-- H5 端紧凑输入与功能操作区。 -->
    <div v-else class="flex h-[48px] items-center gap-[11px] border-t border-opacity-10 px-[10px]">
      <div
        ref="inputRef"
        data-chat-composer-input
        contenteditable="true"
        role="textbox"
        aria-multiline="false"
        class="chat-composer-input chat-composer-input--h5 h-[36px] min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-[30px] border bg-bg-1 px-[12px] text-[14px] leading-[36px] text-text-1 outline-none empty:before:text-text-3 empty:before:content-[attr(data-placeholder)]"
        :class="hasDraft ? 'border-theme-primary' : 'border-opacity-6'"
        :data-placeholder="t('chatPublic.inputPlaceholder')"
        @input="handleInput"
        @compositionend="handleCompositionEnd"
        @compositionstart="handleCompositionStart"
        @focus="handleInputFocus"
        @keydown.enter.prevent="$emit('send')"
      ></div>
      <button type="button" class="shrink-0" @click="openEmojiPanel">
        <EmojiIcon class="size-[24px]" />
      </button>
      <!-- H5 端有内容时显示发送按钮，否则保留图片上传入口。 -->
      <button
        type="button"
        class="flex size-[24px] shrink-0 items-center justify-center"
        @click="hasDraft ? $emit('send') : openMediaPanel()"
      >
        <img v-if="hasDraft" :src="chatSendButtonImage" alt="" class="size-[24px] object-contain" />
        <chatMoreH5Image v-else :src="chatMoreH5Image" alt="" class="size-[24px] object-contain" />
      </button>
    </div>

    <!-- H5 底部安全区域留白。 -->
    <div v-if="props.displayMode === 'h5'" class="chat-composer-bottom-safe bg-bg-2" />
  </div>
</template>

<script setup lang="ts">
import chatMoreH5Image from '@/static/svg/chat/public/more.svg?component'

import chatMoreImage from '@/static/img/chat/public/chat-more.png'
import chatSendButtonImage from '@/static/img/chat/public/chat-send-button.png'
import chatSendIconImage from '@/static/img/chat/public/chat-send-icon.png'
import EmojiIcon from '@/static/svg/chat/public/emoji.svg?component'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
  focus: []
  'cancel-reply': []
}>()

/** H5 与 PC 当前渲染的单行富文本输入框，用于独立控制 emoji 视觉尺寸。 */
const inputRef = ref<HTMLElement | null>(null)
const isComposing = ref(false)

const emojiPattern =
  /(\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}\p{Emoji_Modifier}?(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}\p{Emoji_Modifier}?(?:\uFE0F)?)*)/gu

/** 判断输入框是否存在可发送的非空内容。 */
const hasDraft = computed(() => props.modelValue.trim().length > 0)

/** 取得光标在可编辑文本中的 Unicode 代码单元偏移量。 */
const getCaretOffset = () => {
  const element = inputRef.value
  const selection = window.getSelection()
  if (!element || !selection?.rangeCount) return element?.textContent?.length ?? 0

  const range = selection.getRangeAt(0)
  if (!element.contains(range.endContainer)) return element.textContent?.length ?? 0

  const beforeRange = document.createRange()
  beforeRange.selectNodeContents(element)
  beforeRange.setEnd(range.endContainer, range.endOffset)
  return beforeRange.toString().length
}

/** 重建表情与文字节点，并把光标放回指定的文本偏移处。 */
const renderInputValue = (value: string, caretOffset = value.length) => {
  const element = inputRef.value
  if (!element) return

  const fragment = document.createDocumentFragment()
  value.split(emojiPattern).forEach(part => {
    if (!part) return
    if (emojiPattern.test(part)) {
      const emoji = document.createElement('span')
      emoji.dataset.chatComposerEmoji = ''
      emoji.textContent = part
      fragment.appendChild(emoji)
      emojiPattern.lastIndex = 0
      return
    }
    fragment.appendChild(document.createTextNode(part))
  })
  emojiPattern.lastIndex = 0

  element.replaceChildren(fragment)

  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let remaining = Math.max(0, Math.min(caretOffset, value.length))
  let textNode = walker.nextNode() as Text | null
  while (textNode) {
    if (remaining <= textNode.data.length) {
      const emojiElement = textNode.parentElement?.closest<HTMLElement>(
        '[data-chat-composer-emoji]'
      )
      // 光标位于表情末尾时放到 emoji 元素之后，使右侧预留间距真实参与光标定位。
      if (remaining === textNode.data.length && emojiElement?.parentElement === element) {
        range.setStartAfter(emojiElement)
      } else {
        range.setStart(textNode, remaining)
      }
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      return
    }
    remaining -= textNode.data.length
    textNode = walker.nextNode() as Text | null
  }

  range.selectNodeContents(element)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

/** 将原生可编辑区域转换为草稿，并在非输入法组合期间给 emoji 包裹独立样式。 */
const handleInput = (event: Event) => {
  if (isComposing.value) return
  const value = (event.currentTarget as HTMLElement).textContent ?? ''
  const caretOffset = getCaretOffset()
  emit('update:modelValue', value)
  renderInputValue(value, caretOffset)
}

/** 输入法组合结束后再格式化，避免打断中文等组合输入。 */
const handleCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false
  handleInput(event)
}

/** 组合输入期间不重建 DOM，避免干扰系统输入法候选词。 */
const handleCompositionStart = () => {
  isComposing.value = true
}

/** 用户重新点回输入框时通知上层关闭与键盘互斥的功能面板。 */
const handleInputFocus = () => emit('focus')

/** 打开表情面板前收起原生键盘，避免键盘与面板同时占用屏幕。 */
const openEmojiPanel = () => {
  inputRef.value?.blur()
  emit('emoji')
}

/** 打开图片选择面板前收起原生键盘，避免 H5 两个面板同时展示。 */
const openMediaPanel = () => {
  inputRef.value?.blur()
  emit('media')
}

/** 草稿由表情面板程序化追加时，主动滚动到末尾以保证光标始终可见。 */
const scrollInputToEnd = async () => {
  await nextTick()

  if (!inputRef.value) {
    return
  }

  if (inputRef.value.textContent !== props.modelValue) {
    renderInputValue(props.modelValue)
  }
  inputRef.value.scrollLeft = inputRef.value.scrollWidth
}

/** 监听草稿更新，统一处理键盘输入、表情插入和删除后的横向滚动。 */
watch(
  () => props.modelValue,
  () => {
    void scrollInputToEnd()
  }
)

onMounted(() => {
  renderInputValue(props.modelValue)
})
</script>

<style scoped>
.chat-composer-input:empty::before {
  pointer-events: none;
}

.chat-composer-input--pc :deep([data-chat-composer-emoji]) {
  display: inline-block;
  font-size: 23px;
  line-height: 23px;
  vertical-align: middle;
}

.chat-composer-input--h5 :deep([data-chat-composer-emoji]) {
  display: inline-block;
  font-size: 20px;
  line-height: 20px;
  vertical-align: middle;
}

/* 仅在连续 emoji 之间留白；文字与 emoji 相邻时不改变原有字距。 */
.chat-composer-input :deep([data-chat-composer-emoji] + [data-chat-composer-emoji]) {
  margin-left: 2px;
  margin-right: 2px;
}

/* 末尾表情与原生光标之间保留空间，避免视觉上发生重叠。 */
.chat-composer-input :deep([data-chat-composer-emoji]:last-child) {
  margin-right: 3px;
}

.chat-composer-bottom-safe {
  height: calc(33px + var(--app-shell-bottom-safe-offset));
}
</style>
