<template>
  <!-- 消息编辑器整体容器。 -->
  <div data-chat-composer class="shrink-0 bg-bg-2" @pointerdown="$emit('interact')">
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
          class="chat-composer-input chat-composer-input--pc h-[36px] min-w-0 flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap bg-transparent font-pingfang text-[14px] font-[400] text-text-1 outline-none empty:before:text-text-3 empty:before:content-[attr(data-placeholder)]"
          :data-placeholder="t('chatPublic.inputPlaceholder')"
          @input="handleInput"
          @compositionend="handleCompositionEnd"
          @compositionstart="handleCompositionStart"
          @pointerdown="handleInputPointerDown"
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
        class="chat-composer-input chat-composer-input--h5 h-[36px] min-w-0 flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-[30px] border bg-bg-1 px-[12px] text-[14px] text-text-1 outline-none empty:before:text-text-3 empty:before:content-[attr(data-placeholder)]"
        :class="hasDraft ? 'border-theme-primary' : 'border-opacity-6'"
        :data-placeholder="t('chatPublic.inputPlaceholder')"
        @input="handleInput"
        @compositionend="handleCompositionEnd"
        @compositionstart="handleCompositionStart"
        @pointerdown="handleInputPointerDown"
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
    <div
      ref="bottomSafeRef"
      v-if="props.displayMode === 'h5'"
      class="chat-composer-bottom-safe bg-bg-2"
      :class="`chat-composer-bottom-safe--${webRuntimeEnvironment}`"
      :style="bottomSafeStyle"
    />
  </div>
</template>

<script setup lang="ts">
import chatMoreH5Image from '@/static/svg/chat/public/more.svg?component'

import chatMoreImage from '@/static/img/chat/public/chat-more.png'
import chatSendButtonImage from '@/static/img/chat/public/chat-send-button.png'
import chatSendIconImage from '@/static/img/chat/public/chat-send-icon.png'
import EmojiIcon from '@/static/svg/chat/public/emoji.svg?component'
import { getWebRuntimeEnvironment } from '@/utils/runtime-environment'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatReplyTarget } from '../types'
import ReplyPreview from './reply-preview.vue'

const { t } = useI18n()
const webRuntimeEnvironment = getWebRuntimeEnvironment()

const props = withDefaults(
  defineProps<{
    modelValue: string
    replyTarget?: ChatReplyTarget | null
    displayMode?: 'h5' | 'pc'
    keyboardCoveredDistance?: number
  }>(),
  { displayMode: 'h5', keyboardCoveredDistance: 0 }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  emoji: []
  media: []
  focus: []
  'keyboard-intent': []
  interact: []
  'cancel-reply': []
}>()

/** H5 与 PC 当前渲染的单行富文本输入框，用于独立控制 emoji 视觉尺寸。 */
const inputRef = ref<HTMLElement | null>(null)
/** 键盘弹出前，按当前环境样式实际渲染出的安全区高度。 */
const bottomSafeRef = ref<HTMLElement | null>(null)
const bottomSafeBaseHeight = ref(0)
const isComposing = ref(false)
const isRestoringInputSelection = ref(false)

const emojiPattern =
  /(\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}\p{Emoji_Modifier}?(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}\p{Emoji_Modifier}?(?:\uFE0F)?)*)/gu

/** 判断输入框是否存在可发送的非空内容。 */
const hasDraft = computed(() => props.modelValue.trim().length > 0)

/**
 * 保留环境类和页面样式直接设置的 height：只在键盘开始前读取一次实际高度。
 * 键盘已展开时该元素可能已被压缩为 0，不能再用它覆盖本轮基线。
 */
const captureBottomSafeHeight = () => {
  if (props.displayMode !== 'h5' || props.keyboardCoveredDistance > 1) return

  const height = bottomSafeRef.value?.getBoundingClientRect().height ?? 0
  if (height > 0) bottomSafeBaseHeight.value = height
}

/**
 * 静态状态不写内联高度，让 `.chat-composer-bottom-safe--*` 的页面配置正常生效；
 * 键盘运动期间才基于测得的安全区高度连续收缩，避免额外的跳跃。
 */
const bottomSafeStyle = computed(() => {
  if (props.keyboardCoveredDistance <= 0 || bottomSafeBaseHeight.value <= 0) return undefined

  return {
    height: `${Math.max(0, bottomSafeBaseHeight.value - props.keyboardCoveredDistance)}px`,
    minHeight: '0px'
  }
})

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

/** 重建表情与文字节点；只有用户已聚焦输入框时才恢复光标。 */
const renderInputValue = (value: string, caretOffset = value.length, restoreSelection = false) => {
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

  // iOS 会将 contenteditable 的程序化选区视作一次聚焦，导致刚进入会话便弹出键盘。
  if (!restoreSelection) return

  const selection = window.getSelection()
  if (!selection) return

  // 表情面板选择后会重建输入内容并恢复光标；该过程可能触发原生 focus，
  // 需避免被误判为用户主动点回输入框而关闭 EmojiPanel。
  isRestoringInputSelection.value = true
  try {
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
  } finally {
    requestAnimationFrame(() => {
      isRestoringInputSelection.value = false
    })
  }
}

/** 将原生可编辑区域转换为草稿，并在非输入法组合期间给 emoji 包裹独立样式。 */
const handleInput = (event: Event) => {
  if (isComposing.value) return
  const value = (event.currentTarget as HTMLElement).textContent ?? ''
  const caretOffset = getCaretOffset()
  emit('update:modelValue', value)
  renderInputValue(value, caretOffset, true)
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

/**
 * 在原生 focus 前记录键盘弹出基线。
 * Android 上用系统返回键收起键盘后，contenteditable 仍可能保持 focus；
 * 此时再次点击不会触发 focus，需借助 pointerdown 重新开启跟踪。
 */
const handleInputPointerDown = () => {
  if (props.displayMode === 'h5' && !isRestoringInputSelection.value) {
    captureBottomSafeHeight()
    emit('keyboard-intent')
  }
}

/** 用户重新点回输入框时通知上层关闭与键盘互斥的功能面板。 */
const handleInputFocus = () => {
  if (!isRestoringInputSelection.value) {
    captureBottomSafeHeight()
    emit('focus')
  }
}

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
    renderInputValue(
      props.modelValue,
      props.modelValue.length,
      document.activeElement === inputRef.value
    )
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
.chat-composer-input {
  /* 36px 外框中保留 1px 上下视觉留白，文字的行框保持稳定。 */
  line-height: 34px;
}

.chat-composer-input:empty::before {
  display: inline-block;
  line-height: 34px;
  pointer-events: none;
}

.chat-composer-input--pc :deep([data-chat-composer-emoji]) {
  display: inline-flex;
  height: 34px;
  align-items: center;
  font-size: 23px;
  line-height: 1;
  vertical-align: top;
}

.chat-composer-input--h5 :deep([data-chat-composer-emoji]) {
  display: inline-flex;
  height: 34px;
  align-items: center;
  font-size: 20px;
  line-height: 1;
  vertical-align: top;
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
  height: calc(1px + env(safe-area-inset-bottom, 0px));
  min-height: 1px;
  flex-shrink: 0;
}

.chat-composer-bottom-safe--android-web {
  height: calc(15px + env(safe-area-inset-bottom, 0px));
}

.chat-composer-bottom-safe--ios-web {
  height: calc(1px + env(safe-area-inset-bottom, 0px));
}

.chat-composer-bottom-safe--ios-bookmark {
  height: calc(10px + env(safe-area-inset-bottom, 0px));
}

.chat-composer-bottom-safe--desktop-web {
  height: calc(1px + env(safe-area-inset-bottom, 0px));
}
</style>
