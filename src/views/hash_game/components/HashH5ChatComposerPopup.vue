<template>
  <!-- H5 聊天输入弹窗及背景蒙层。 -->
  <Teleport to="body">
    <Transition name="hash-chat-popup">
      <div
        v-if="visible"
        class="fixed inset-0 z-[1100] flex items-end bg-mask-60-1"
        @click.self="emit('close')"
      >
        <!-- 弹窗主体。 -->
        <section
          class="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-bg-1 pt-[20px] pb-[40px] font-inter"
          role="dialog"
          aria-modal="true"
          :aria-label="t('hashGame.chatSendMessage')"
        >
          <!-- 标题与关闭按钮。 -->
          <header class="flex shrink-0 items-center justify-between px-[12px]">
            <h2 class="text-[16px] font-bold text-text-1">{{ t('hashGame.chatSendMessage') }}</h2>
            <button
              type="button"
              class="grid size-[28px] place-items-center rounded-[6px] bg-opacity-10 text-[24px] leading-none text-text-1"
              :aria-label="t('common.close')"
              @click="emit('close')"
            >
              ×
            </button>
          </header>

          <!-- 表情和常用语区域。 -->
          <div class="mt-[20px] min-h-0 overflow-y-auto px-[12px]">
            <p class="text-[14px] text-text-2">{{ t('hashGame.chatEmoji') }}</p>

            <!-- 固定两行，超出屏幕宽度后横向滑动。 -->
            <div
              class="hash-chat-emoji-scroll mt-[10px] w-full"
              :aria-label="t('hashGame.chatEmojiList')"
            >
              <div class="hash-chat-emoji-grid">
                <button
                  v-for="emoji in commonEmojis"
                  :key="emoji"
                  type="button"
                  class="grid size-[40px] place-items-center rounded-[8px] bg-transparent p-0 text-[30px] leading-none active:bg-bg-2"
                  :aria-label="emoji"
                  :disabled="busy"
                  @mousedown.prevent
                  @click="selectEmoji(emoji)"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>

            <!-- 常用语按聊天配置动态展示。 -->
            <p class="mt-[20px] text-[14px] text-text-2">
              {{ t('hashGame.chatCommonExpressions') }}
            </p>

            <div class="mt-[10px] flex max-h-[140px] flex-wrap gap-[10px] overflow-y-auto">
              <button
                v-for="phrase in config?.phrases ?? []"
                :key="phrase"
                type="button"
                class="rounded-full bg-bg-2 px-[10px] py-[8px] text-left text-[12px] text-text-2"
                :disabled="busy"
                @click="selectPhrase(phrase)"
              >
                {{ phrase }}
              </button>
            </div>
          </div>

          <!-- 解锁后输入消息。 -->
          <div
            v-if="config?.unlocked"
            class="mt-[24px] flex shrink-0 gap-[9px] px-[12px] py-[11px]"
          >
            <input
              ref="inputRef"
              v-model="draft"
              class="h-[42px] min-w-0 flex-1 rounded-[10px] border border-input-2 bg-bg-3 px-[12px] text-[13px] text-text-1 outline-none placeholder:text-text-3"
              :maxlength="config.lengthLimit"
              :placeholder="t('hashGame.chatInputPlaceholder')"
              @keydown.enter="send"
            />

            <button
              type="button"
              class="h-[42px] rounded-[10px] bg-theme-primary px-[18px] text-[16px] font-bold text-text-4"
              :disabled="busy || !draft.trim()"
              @click="send"
            >
              {{ t('hashGame.chatSend') }}
            </button>
          </div>

          <!-- 未解锁时显示下注提示。 -->
          <div
            v-else
            class="mx-[12px] mt-[24px] flex shrink-0 items-center gap-[12px] rounded-[10px] border-2 border-dashed border-bg-3 px-[12px] py-[10px]"
          >
            <img :src="lockIcon" alt="" class="size-[24px] shrink-0" />

            <div class="min-w-0 flex-1 text-[12px] text-text-2">
              <p class="text-[13px] text-text-1">{{ t('hashGame.chatUnlockCustom') }}</p>
              <p>
                {{
                  config?.unlockMode === 'amount'
                    ? t('hashGame.chatUnlockAmountHint', { amount: config.unlockAmount })
                    : t('hashGame.chatUnlockHint')
                }}
              </p>
            </div>

            <button
              type="button"
              class="shrink-0 rounded-full bg-theme-primary px-[10px] py-[6px] text-[11px] text-text-4"
              @click="emit('bet')"
            >
              {{ t('hashGame.chatBetNow') }}
            </button>
          </div>

          <!-- 底部安全区。 -->
          <div
            class="hash-chat-bottom-safe shrink-0 bg-bg-1"
            :class="`hash-chat-bottom-safe--${environment}`"
          />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import lockIcon from '@/static/svg/hash_game/chat/lock.svg?url'
import { getWebRuntimeEnvironment } from '@/utils/runtime-environment'
import { useI18n } from 'vue-i18n'
import { nextTick, ref } from 'vue'
import type { HashChatConfig } from '../chat/config'

const props = defineProps<{
  visible: boolean
  config: HashChatConfig | null
  busy: boolean
}>()

const emit = defineEmits<{
  close: []
  send: [text: string, custom: boolean]
  bet: []
}>()

const environment = getWebRuntimeEnvironment()
const { t } = useI18n()
const draft = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function selectEmoji(emoji: string) {
  if (props.busy) return
  if (props.config?.unlocked) {
    void appendEmoji(emoji)
    return
  }
  emit('send', emoji, false)
  emit('close')
}

function selectPhrase(phrase: string) {
  if (props.busy) return
  if (props.config?.unlocked) {
    appendText(phrase)
    return
  }
  emit('send', phrase, false)
  emit('close')
}

/**
 * 50 个常用 Emoji。
 * CSS Grid 自动按照两行排列。
 * 不再依赖 emoji-picker-element。
 */
const commonEmojis = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '🙂',
  '😉',
  '😍',
  '🥰',
  '😘',
  '😋',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😔',
  '😢',
  '😭',
  '😤',
  '😡',
  '🤯',
  '😳',
  '🥺',
  '😴',
  '🤔',
  '🙄',
  '😬',
  '🤗',
  '🤭',
  '🤫',
  '😱',
  '👍',
  '👎',
  '👏',
  '🙌',
  '🙏',
  '💪',
  '👌',
  '✌️',
  '👀',
  '❤️',
  '💔',
  '🔥',
  '🎉',
  '💯'
] as const

/** 在光标位置插入完整表情，不截断 Unicode。 */
async function appendEmoji(emoji: string) {
  if (!props.config?.unlocked) return

  const input = inputRef.value

  // 未获得过焦点时，默认追加到末尾。
  const start = input ? (input.selectionStart ?? draft.value.length) : draft.value.length

  const end = input ? (input.selectionEnd ?? draft.value.length) : draft.value.length

  const text = draft.value.slice(0, start) + emoji + draft.value.slice(end)

  // 超出长度限制则不插入，避免 Emoji 被截断。
  if (text.length > props.config.lengthLimit) return

  draft.value = text

  await nextTick()

  // 更新光标位置，不主动 focus，避免 H5 弹出键盘。
  const cursor = start + emoji.length
  inputRef.value?.setSelectionRange(cursor, cursor)
}

/** 在文本长度限制内追加常用语。 */
function appendText(value: string) {
  if (!props.config?.unlocked) return

  draft.value = `${draft.value}${value}`.slice(0, props.config.lengthLimit)
}

/** 提交非空内容并收起输入弹窗。 */
function send() {
  if (props.busy) return
  const text = draft.value.trim()

  if (!props.config?.unlocked || !text) return

  emit('send', text, true)
  draft.value = ''
  emit('close')
}
</script>

<style scoped>
.hash-chat-popup-enter-active,
.hash-chat-popup-leave-active {
  transition: opacity 220ms ease;
}

.hash-chat-popup-enter-from,
.hash-chat-popup-leave-to {
  opacity: 0;
}

.hash-chat-popup-enter-active > section,
.hash-chat-popup-leave-active > section {
  transition: transform 220ms ease;
}

.hash-chat-popup-enter-from > section,
.hash-chat-popup-leave-to > section {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .hash-chat-popup-enter-active,
  .hash-chat-popup-leave-active,
  .hash-chat-popup-enter-active > section,
  .hash-chat-popup-leave-active > section {
    transition-duration: 0.01ms;
  }
}

.hash-chat-bottom-safe {
  height: calc(1px + env(safe-area-inset-bottom, 0px));
}

.hash-chat-bottom-safe--android-web {
  height: calc(15px + env(safe-area-inset-bottom, 0px));
}

.hash-chat-bottom-safe--ios-bookmark {
  height: calc(10px + env(safe-area-inset-bottom, 0px));
}

/* 表情容器只允许横向滚动。 */
.hash-chat-emoji-scroll {
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

/* 隐藏横向滚动条。 */
.hash-chat-emoji-scroll::-webkit-scrollbar {
  display: none;
}

/* 固定两行，列数根据内容自动增加。 */
.hash-chat-emoji-grid {
  display: grid;

  /* 固定两行，每行高度 40px。 */
  grid-template-rows: repeat(2, 40px);

  /* 按列填充：先上下，再向右排列。 */
  grid-auto-flow: column;

  /* 每列宽度固定为 40px。 */
  grid-auto-columns: 40px;

  /* 表情之间留 6px 间距。 */
  gap: 6px;

  /* 容器宽度由内容决定，不强制换行。 */
  width: max-content;
}
</style>
