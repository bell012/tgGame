<template>
  <teleport to="body">
    <transition name="comment-popup-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1200] flex items-end justify-center lg:items-center"
      >
        <div
          class="comment-popup-mask absolute inset-0"
          :class="{ 'comment-popup-mask-light': isLightTheme }"
          @click="closePopup"
        ></div>

        <div
          class="comment-popup-panel relative hidden w-full max-w-[440px] lg:block"
          :class="{ 'is-light': isLightTheme }"
          @click.stop
        >
          <div class="comment-popup-shell comment-popup-shell-desktop rounded-[14px] p-[14px]">
            <div class="relative mb-[12px] flex items-center justify-center">
              <div class="comment-popup-title text-[16px] font-semibold">
                {{ t('gameDetail.leaveCommentsTitle') }}
              </div>
              <button
                class="comment-popup-close absolute right-0 top-[50%] flex size-[24px] -translate-y-[50%] items-center justify-center rounded-[6px] text-[18px] font-bold leading-none"
                type="button"
                @click="closePopup"
              >
                ×
              </button>
            </div>

            <textarea
              ref="desktopTextareaRef"
              v-model="commentText"
              class="comment-popup-textarea h-[150px] w-full resize-none rounded-[12px] p-[12px] text-[14px] font-semibold outline-none"
              :class="{ 'comment-popup-textarea-active': hasCommentContent }"
              maxlength="500"
              :placeholder="inputPlaceholder"
            ></textarea>

            <div class="mt-[10px] flex items-center justify-between gap-[12px]">
              <div ref="desktopEmojiRef" class="relative">
                <button
                  class="comment-emoji-trigger flex size-[24px] items-center justify-center opacity-90"
                  :class="{ 'comment-emoji-trigger-active': isEmojiPickerOpen }"
                  type="button"
                  @click.stop="toggleEmojiPicker"
                >
                  <EmoIconSvg
                    class="comment-emoji-trigger-icon size-[24px]"
                    :class="{ 'comment-emoji-trigger-icon-active': isEmojiPickerOpen }"
                  />
                </button>

                <div
                  v-if="isEmojiPickerOpen"
                  class="comment-emoji-panel absolute bottom-[calc(100%+10px)] left-0 z-20 w-[256px] rounded-[10px] p-[8px]"
                  @click.stop
                >
                  <div class="comment-emoji-divider grid grid-cols-8 gap-[6px] border-b pb-[8px]">
                    <button
                      v-for="emoji in currentEmojiList"
                      :key="emoji"
                      class="comment-emoji-item flex size-[24px] items-center justify-center rounded-[6px] text-[17px] transition-colors duration-150"
                      type="button"
                      @click="selectEmoji(emoji)"
                    >
                      {{ emoji }}
                    </button>
                  </div>

                  <div class="mt-[6px] grid grid-cols-6 gap-[6px]">
                    <button
                      v-for="item in emojiCategoryItems"
                      :key="item.value"
                      class="flex h-[20px] items-center justify-center rounded-[6px] text-[13px] transition-colors duration-150"
                      :class="
                        activeEmojiCategory === item.value
                          ? 'comment-emoji-category-active'
                          : 'comment-emoji-category'
                      "
                      type="button"
                      @click="activeEmojiCategory = item.value"
                    >
                      {{ item.icon }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                class="comment-popup-post-btn h-[40px] min-w-[166px] rounded-[10px] px-[24px] text-[16px] font-semibold disabled:cursor-not-allowed"
                type="button"
                :disabled="!commentText.trim()"
                @click="submitComment"
              >
                {{ t('gameDetail.post') }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="comment-popup-panel relative w-full lg:hidden"
          :class="{ 'is-light': isLightTheme }"
          @click.stop
        >
          <div
            class="comment-popup-shell comment-popup-shell-mobile rounded-t-[16px] px-[12px] pb-[14px] pt-[10px]"
          >
            <div class="grid grid-cols-[1fr_auto_1fr] items-center">
              <button
                class="justify-self-start text-[16px] font-semibold text-[var(--color-theme-level-1)]"
                type="button"
                @click="closePopup"
              >
                {{ t('common.cancel') }}
              </button>
              <div class="comment-popup-title text-[16px] font-semibold">
                {{ t('gameDetail.leaveCommentsTitle') }}
              </div>
              <button
                class="comment-popup-post-btn h-[40px] justify-self-end rounded-[12px] px-[14px] text-[14px] font-semibold disabled:cursor-not-allowed"
                type="button"
                :disabled="!commentText.trim()"
                @click="submitComment"
              >
                {{ t('gameDetail.post') }}
              </button>
            </div>

            <textarea
              ref="mobileTextareaRef"
              v-model="commentText"
              class="comment-popup-textarea mt-[10px] h-[190px] w-full resize-none rounded-[10px] p-[12px] text-[14px] outline-none"
              :class="{ 'comment-popup-textarea-active': hasCommentContent }"
              maxlength="500"
              :placeholder="inputPlaceholder"
            ></textarea>

            <div class="mt-[8px] flex justify-end">
              <div ref="mobileEmojiRef" class="relative">
                <button
                  class="comment-emoji-trigger flex size-[24px] items-center justify-center opacity-90"
                  :class="{ 'comment-emoji-trigger-active': isEmojiPickerOpen }"
                  type="button"
                  @click.stop="toggleEmojiPicker"
                >
                  <EmoIconSvg
                    class="comment-emoji-trigger-icon size-[24px]"
                    :class="{ 'comment-emoji-trigger-icon-active': isEmojiPickerOpen }"
                  />
                </button>

                <div
                  v-if="isEmojiPickerOpen"
                  class="comment-emoji-panel absolute bottom-[calc(100%+10px)] right-0 z-20 w-[256px] rounded-[10px] p-[8px]"
                  @click.stop
                >
                  <div class="comment-emoji-divider grid grid-cols-8 gap-[6px] border-b pb-[8px]">
                    <button
                      v-for="emoji in currentEmojiList"
                      :key="emoji"
                      class="comment-emoji-item flex size-[24px] items-center justify-center rounded-[6px] text-[17px] transition-colors duration-150"
                      type="button"
                      @click="selectEmoji(emoji)"
                    >
                      {{ emoji }}
                    </button>
                  </div>

                  <div class="mt-[6px] grid grid-cols-6 gap-[6px]">
                    <button
                      v-for="item in emojiCategoryItems"
                      :key="item.value"
                      class="flex h-[20px] items-center justify-center rounded-[6px] text-[13px] transition-colors duration-150"
                      :class="
                        activeEmojiCategory === item.value
                          ? 'comment-emoji-category-active'
                          : 'comment-emoji-category'
                      "
                      type="button"
                      @click="activeEmojiCategory = item.value"
                    >
                      {{ item.icon }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EmoIconSvg from '@/static/svg/game/detail/comment/emo.svg?component'

interface Props {
  modelValue: boolean
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', content: string): void
}>()
const { t } = useI18n()
const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.theme === 'light')

type EmojiCategory = 'recent' | 'smileys' | 'animals' | 'food' | 'objects' | 'flags'

const emojiCategoryItems: { value: EmojiCategory; icon: string }[] = [
  { value: 'recent', icon: '◷' },
  { value: 'smileys', icon: '🙂' },
  { value: 'animals', icon: '🐻' },
  { value: 'food', icon: '🍔' },
  { value: 'objects', icon: '💡' },
  { value: 'flags', icon: '🚩' }
]
const emojiGroups: Record<Exclude<EmojiCategory, 'recent'>, string[]> = {
  smileys: [
    '😀',
    '😅',
    '😍',
    '😡',
    '😗',
    '🤗',
    '😏',
    '😬',
    '😃',
    '🤣',
    '🙂',
    '😘',
    '😜',
    '🤓',
    '😫',
    '🙃',
    '😁',
    '😇',
    '😮',
    '😶',
    '😛',
    '🤡',
    '😂',
    '😣',
    '😆',
    '☺️',
    '😉',
    '🤔',
    '😜',
    '🤠',
    '😤',
    '😖'
  ],
  animals: [
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🦁',
    '🐸',
    '🐵',
    '🐧',
    '🐤',
    '🐯',
    '🦄'
  ],
  food: [
    '🍔',
    '🍕',
    '🍟',
    '🌭',
    '🍿',
    '🍩',
    '🍪',
    '🍫',
    '🍜',
    '🍣',
    '🍤',
    '🍦',
    '🍎',
    '🍉',
    '🍓',
    '🍺'
  ],
  objects: [
    '💡',
    '📱',
    '💻',
    '⌚',
    '📷',
    '🎧',
    '🎮',
    '🏆',
    '🎯',
    '⚽',
    '🏀',
    '🎵',
    '🧩',
    '🛎️',
    '🔔',
    '📌'
  ],
  flags: [
    '🚩',
    '🏳️',
    '🏴',
    '🏁',
    '🇺🇸',
    '🇬🇧',
    '🇹🇭',
    '🇸🇬',
    '🇲🇾',
    '🇮🇩',
    '🇯🇵',
    '🇰🇷',
    '🇫🇷',
    '🇩🇪',
    '🇪🇸',
    '🇮🇹'
  ]
}

const commentText = ref('')
const bodyOverflowCache = ref('')
const isEmojiPickerOpen = ref(false)
const activeEmojiCategory = ref<EmojiCategory>('smileys')
const recentEmojis = ref(['😀', '😅', '😍', '😡', '😗', '🤗', '😏', '😬'])
const desktopTextareaRef = ref<HTMLTextAreaElement | null>(null)
const mobileTextareaRef = ref<HTMLTextAreaElement | null>(null)
const desktopEmojiRef = ref<HTMLElement | null>(null)
const mobileEmojiRef = ref<HTMLElement | null>(null)

const currentEmojiList = computed(() => {
  if (activeEmojiCategory.value === 'recent') {
    return recentEmojis.value
  }
  return emojiGroups[activeEmojiCategory.value]
})

const inputPlaceholder = computed(() => {
  const placeholder = props.placeholder?.trim()
  return placeholder || t('gameDetail.commentDefaultPlaceholder')
})

const hasCommentContent = computed(() => Boolean(commentText.value.trim()))

const closePopup = () => {
  isEmojiPickerOpen.value = false
  emit('update:modelValue', false)
}

const submitComment = () => {
  const content = commentText.value.trim()
  if (!content) return
  isEmojiPickerOpen.value = false
  emit('submit', content)
  closePopup()
}

const toggleEmojiPicker = () => {
  isEmojiPickerOpen.value = !isEmojiPickerOpen.value
}

const selectEmoji = (emoji: string) => {
  const isDesktopFocused = document.activeElement === desktopTextareaRef.value
  const isMobileFocused = document.activeElement === mobileTextareaRef.value
  const activeTextarea = isDesktopFocused
    ? desktopTextareaRef.value
    : isMobileFocused
      ? mobileTextareaRef.value
      : desktopTextareaRef.value?.offsetParent
        ? desktopTextareaRef.value
        : mobileTextareaRef.value

  if (!activeTextarea) {
    commentText.value += emoji
  } else {
    const start = activeTextarea.selectionStart ?? commentText.value.length
    const end = activeTextarea.selectionEnd ?? commentText.value.length
    commentText.value =
      commentText.value.slice(0, start) +
      emoji +
      commentText.value.slice(end, commentText.value.length)
    const caret = start + emoji.length
    nextTick(() => {
      activeTextarea.focus()
      activeTextarea.setSelectionRange(caret, caret)
    })
  }

  recentEmojis.value = [emoji, ...recentEmojis.value.filter(item => item !== emoji)].slice(0, 32)
  isEmojiPickerOpen.value = false
}

const handleEscapeClose = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  if (isEmojiPickerOpen.value) {
    isEmojiPickerOpen.value = false
    return
  }
  if (props.modelValue) closePopup()
}

const handlePointerDown = (event: PointerEvent) => {
  if (!isEmojiPickerOpen.value) return
  const target = event.target as Node
  const inDesktopPicker = desktopEmojiRef.value?.contains(target)
  const inMobilePicker = mobileEmojiRef.value?.contains(target)
  if (!inDesktopPicker && !inMobilePicker) {
    isEmojiPickerOpen.value = false
  }
}

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      commentText.value = ''
      bodyOverflowCache.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return
    }
    isEmojiPickerOpen.value = false
    document.body.style.overflow = bodyOverflowCache.value
  }
)

onMounted(() => {
  document.addEventListener('keydown', handleEscapeClose)
  document.addEventListener('pointerdown', handlePointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscapeClose)
  document.removeEventListener('pointerdown', handlePointerDown, true)
  document.body.style.overflow = bodyOverflowCache.value
})
</script>

<style scoped>
.comment-popup-mask {
  background: rgba(0, 0, 0, 0.72);
}

.comment-popup-mask-light {
  background: rgba(16, 24, 40, 0.48);
}

.comment-popup-shell {
  background: linear-gradient(180deg, #2a2f35 0%, #23282e 100%);
}

.comment-popup-shell-desktop {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.comment-popup-shell-mobile {
  box-shadow: 0 -12px 28px rgba(0, 0, 0, 0.45);
}

.comment-popup-title {
  color: #fff;
}

.comment-popup-close {
  background: #42474d;
  color: #d4d8dd;
}

.comment-popup-textarea {
  border: 1px solid var(--color-theme-level-1);
  background: #353a3f;
  color: #fff;
}

.comment-popup-textarea.comment-popup-textarea-active {
  border-color: var(--color-theme-level-1);
}

.comment-popup-textarea::placeholder {
  color: #dce4ea;
}

.comment-popup-post-btn {
  border: 1px solid #20c56d;
  background: linear-gradient(135deg, #2ddf80 0%, #95e969 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
  color: #061a10;
  transition:
    filter 0.2s ease,
    opacity 0.2s ease;
}

.comment-popup-post-btn:not(:disabled):active {
  filter: brightness(0.96);
}

.comment-popup-post-btn:disabled {
  border-color: rgba(107, 121, 136, 0.45);
  background: #4f5a65;
  box-shadow: none;
  color: #9cabbc;
}

.comment-emoji-panel {
  border: 1px solid #3f4750;
  background: #252d35;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

:deep(.comment-emoji-trigger-icon path) {
  fill: #b3bec1;
  transition: fill 0.2s ease;
}

:deep(.comment-emoji-trigger-icon.comment-emoji-trigger-icon-active path) {
  fill: var(--color-theme-level-1);
}

.comment-emoji-divider {
  border-bottom-color: #3f4750;
}

.comment-emoji-item:hover {
  background: #39424b;
}

.comment-emoji-category {
  color: #b7c0ca;
}

.comment-emoji-category:hover {
  background: #39424b;
  color: #fff;
}

.comment-emoji-category-active {
  background: #39424b;
  color: #fff;
}

.comment-popup-panel.is-light .comment-popup-shell {
  background: linear-gradient(180deg, #f9fcff 0%, #ecf2fa 100%);
}

.comment-popup-panel.is-light .comment-popup-shell-desktop {
  box-shadow: 0 16px 36px rgba(24, 38, 64, 0.24);
}

.comment-popup-panel.is-light .comment-popup-shell-mobile {
  box-shadow: 0 -12px 28px rgba(24, 38, 64, 0.2);
}

.comment-popup-panel.is-light .comment-popup-title {
  color: #1d2a3d;
}

.comment-popup-panel.is-light .comment-popup-close {
  background: #dfe7f2;
  color: #52647f;
}

.comment-popup-panel.is-light .comment-popup-textarea {
  border-color: #c7d4e6;
  background: #fff;
  color: #1d2a3d;
}

.comment-popup-panel.is-light .comment-popup-textarea.comment-popup-textarea-active {
  border-color: var(--color-theme-level-1);
}

.comment-popup-panel.is-light .comment-popup-textarea::placeholder {
  color: #8a9ab1;
}

.comment-popup-panel.is-light .comment-popup-post-btn:disabled {
  border-color: #c8d4e3;
  background: #e9eff6;
  color: #90a0b2;
}

.comment-popup-panel.is-light .comment-emoji-panel {
  border-color: #ced9e8;
  background: #f8fbff;
  box-shadow: 0 10px 24px rgba(24, 38, 64, 0.2);
}

.comment-popup-panel.is-light .comment-emoji-divider {
  border-bottom-color: #d4dfed;
}

.comment-popup-panel.is-light .comment-emoji-item:hover {
  background: #e8f0fa;
}

.comment-popup-panel.is-light .comment-emoji-category {
  color: #6a7d99;
}

.comment-popup-panel.is-light .comment-emoji-category:hover {
  background: #e8f0fa;
  color: #20314b;
}

.comment-popup-panel.is-light .comment-emoji-category-active {
  background: #dce8f7;
  color: #20314b;
}

.comment-popup-fade-enter-active,
.comment-popup-fade-leave-active {
  transition: opacity 0.22s ease;
}

.comment-popup-fade-enter-active .comment-popup-panel,
.comment-popup-fade-leave-active .comment-popup-panel {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.comment-popup-fade-enter-from,
.comment-popup-fade-leave-to {
  opacity: 0;
}

.comment-popup-fade-enter-from .comment-popup-panel,
.comment-popup-fade-leave-to .comment-popup-panel {
  opacity: 0;
  transform: translateY(16px);
}

@media (min-width: 1024px) {
  .comment-popup-fade-enter-from .comment-popup-panel,
  .comment-popup-fade-leave-to .comment-popup-panel {
    transform: scale(0.96);
  }
}
</style>
