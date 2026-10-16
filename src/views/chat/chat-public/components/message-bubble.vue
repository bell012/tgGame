<template>
  <!-- 文本或引用消息气泡。 -->
  <div
    class="group flex w-full"
    :class="message.direction === 'outgoing' ? 'justify-end' : 'justify-start'"
  >
    <div class="relative" :class="props.displayMode === 'pc' ? 'max-w-[249px]' : 'max-w-[82%]'">
      <div
        data-chat-message-bubble
        class="cursor-pointer text-left"
        :class="message.direction === 'outgoing' ? 'items-end' : 'items-start'"
        role="button"
        tabindex="0"
        @click="handleFocus"
        @contextmenu.prevent="handleFocus"
        @keydown.enter.prevent="handleKeyboardFocus"
        @keydown.space.prevent="handleKeyboardFocus"
      >
        <!-- 当前消息气泡，内部同时承载引用摘要、回复内容与发送时间。 -->
        <div
          class="relative"
          :class="[
            props.displayMode === 'pc'
              ? 'rounded-[10px] px-[10px] py-[6px]'
              : 'rounded-[6px] px-[11px] py-[7px]',
            'bg-bg-3'
          ]"
        >
          <!-- 被引用消息的简要预览。 -->
          <div
            v-if="message.reply"
            class="mb-[6px] flex min-w-[190px] items-center gap-[8px] rounded-[4px] border-l-[4px] border-theme-primary bg-bg-2 px-[8px] py-[2px]"
          >
            <!-- 图片或视频引用在摘要右侧展示 35px 缩略图。 -->
            <img
              v-if="replyMediaType === 'image'"
              :src="message.reply.mediaUrl"
              alt=""
              class="h-[35px] w-[35px] shrink-0 rounded-[3px] object-cover"
            />
            <video
              v-else-if="replyMediaType === 'video'"
              :src="message.reply.mediaUrl"
              aria-hidden="true"
              muted
              playsinline
              preload="metadata"
              class="h-[35px] w-[35px] shrink-0 rounded-[3px] bg-common-0 object-cover"
            ></video>
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-theme-primary"
                :class="
                  props.displayMode === 'pc'
                    ? 'h-[17px] text-[14px] font-[700] leading-[17px]'
                    : 'text-[11px] font-medium'
                "
              >
                {{ message.reply.author }}
              </p>

              <p
                class="truncate text-text-2"
                :class="
                  props.displayMode === 'pc'
                    ? 'h-[15px] text-[12px] font-[400] leading-[15px]'
                    : 'mt-[2px] text-[11px]'
                "
              >
                <template v-for="(part, index) in replyHighlightParts" :key="index">
                  <span :class="part.matched ? 'text-theme-primary' : ''">
                    {{ part.text }}
                  </span>
                </template>
              </p>
            </div>
          </div>

          <!-- 当前回复消息内容。 -->
          <i
            aria-hidden="true"
            class="absolute top-1/2 h-[13px] w-[8px] -translate-y-1/2"
            :class="
              message.direction === 'outgoing'
                ? '-right-[7px] bg-bg-3 [clip-path:polygon(0_0,100%_50%,0_100%)]'
                : '-left-[7px] bg-bg-3 [clip-path:polygon(100%_0,0_50%,100%_100%)]'
            "
          />
          <div
            class="whitespace-pre-wrap break-words text-text-1"
            :class="
              props.displayMode === 'pc'
                ? 'font-pingfang text-[14px] leading-[20px]'
                : 'text-[15px] leading-[20px]'
            "
          >
            <!-- 仅客服发来的消息按白名单富文本展示；用户消息始终作为纯文本插值。 -->
            <template v-if="shouldRenderRichText">
              <div class="chat-rich-text" v-html="richText"></div>
            </template>
            <template v-else>
              <template v-for="(part, index) in messageHighlightParts" :key="index">
                <span :class="part.matched ? 'text-theme-primary' : ''">{{ part.text }}</span>
              </template>
            </template>
          </div>
          <div
            class="flex items-center justify-end gap-[4px] text-text-3"
            :class="
              props.displayMode === 'pc'
                ? 'mt-[4px] text-[12px] leading-[15px]'
                : 'mt-[1px] text-[10px] leading-[12px]'
            "
          >
            <span>{{ message.time }}</span>
            <span v-if="message.period">{{ message.period }}</span>
            <img
              v-if="message.direction === 'outgoing'"
              :src="message.status === 'sent' ? messageReadStatusImage : messageSendingStatusImage"
              alt=""
              class="h-[10px] w-[15px] object-contain"
            />
          </div>
        </div>
      </div>

      <!-- 发送失败时显示在消息左侧中部的重发按钮。 -->
      <button
        v-if="message.direction === 'outgoing' && message.status === 'failed'"
        type="button"
        class="absolute -left-[40px] top-1/2 flex size-[26px] -translate-y-1/2 items-center justify-center"
        :aria-label="t('chatPublic.retry')"
        @click.stop="$emit('retry', message)"
      >
        <img :src="messageRetryIcon" alt="" class="size-[26px] object-contain" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import messageReadStatusImage from '@/static/img/chat/public/message-read-status.png'
import messageRetryIcon from '@/static/img/chat/public/message-retry.png'
import messageSendingStatusImage from '@/static/img/chat/public/message-sending-status.png'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getChatTextHighlightParts, sanitizeChatRichText } from '../shared'
import type { ChatMessage } from '../types'

const props = withDefaults(
  defineProps<{ message: ChatMessage; displayMode?: 'h5' | 'pc'; highlightKeyword?: string }>(),
  {
    displayMode: 'h5',
    highlightKeyword: ''
  }
)
const emit = defineEmits<{
  focus: [message: ChatMessage, event: MouseEvent, target: HTMLElement | null]
  retry: [message: ChatMessage]
}>()
const { t } = useI18n()

/** 生成当前消息正文的关键词高亮片段。 */
const messageHighlightParts = computed(() =>
  getChatTextHighlightParts(props.message.text, props.highlightKeyword)
)

/** 客服原始内容保存在 socketContent；搜索高亮时保留纯文本，确保命中词可见。 */
const shouldRenderRichText = computed(
  () => props.message.direction === 'incoming' && !props.highlightKeyword.trim()
)
const richText = computed(() =>
  sanitizeChatRichText(props.message.socketContent ?? props.message.text ?? '')
)

/** 生成引用摘要的关键词高亮片段。 */
const replyHighlightParts = computed(() =>
  getChatTextHighlightParts(props.message.reply?.preview, props.highlightKeyword)
)

/** 只有媒体地址存在时才渲染缩略图，旧引用记录继续使用文字摘要。 */
const replyMediaType = computed(() => {
  const reply = props.message.reply
  return reply?.mediaUrl && (reply.replyToType === 'image' || reply.replyToType === 'video')
    ? reply.replyToType
    : null
})

/** 将当前消息气泡的原生交互事件上抛，用于定位回复操作浮层。 */
const handleFocus = (event: MouseEvent) => {
  emit('focus', props.message, event, event.currentTarget as HTMLElement | null)
}

/** 键盘触发时沿用点击的回复操作，不影响富文本中的链接点击。 */
const handleKeyboardFocus = (event: KeyboardEvent) => {
  emit(
    'focus',
    props.message,
    event as unknown as MouseEvent,
    event.currentTarget as HTMLElement | null
  )
}
</script>

<style scoped>
.chat-rich-text :deep(p + p) {
  margin-top: 0.5em;
}

.chat-rich-text :deep(a) {
  color: var(--color-theme-level-1);
  text-decoration: underline;
}
</style>
