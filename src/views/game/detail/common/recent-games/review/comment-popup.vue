<template>
  <teleport to="body">
    <transition name="comment-popup-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1200] flex items-end justify-center lg:items-center"
      >
        <div class="absolute inset-0 bg-[rgba(0,0,0,0.72)]" @click="closePopup"></div>

        <div class="comment-popup-panel relative hidden w-full max-w-[440px] lg:block" @click.stop>
          <div
            class="rounded-[14px] bg-[linear-gradient(180deg,#2A2F35_0%,#23282E_100%)] p-[14px] shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
          >
            <div class="relative mb-[12px] flex items-center justify-center">
              <div class="text-[16px] font-semibold text-white">Leave Comments</div>
              <button
                class="absolute right-0 top-[50%] flex size-[24px] -translate-y-[50%] items-center justify-center rounded-[6px] bg-[#42474D] text-[18px] font-bold leading-none text-[#D4D8DD]"
                type="button"
                @click="closePopup"
              >
                ×
              </button>
            </div>

            <textarea
              ref="desktopTextareaRef"
              v-model="commentText"
              class="h-[150px] w-full resize-none rounded-[12px] border border-[var(--color-theme-level-1)] bg-[#353A3F] p-[12px] text-[14px] font-semibold text-white outline-none placeholder:text-[#DCE4EA]"
              maxlength="500"
              placeholder="This game is great, very exciting!"
            ></textarea>

            <div class="mt-[10px] flex items-center justify-between gap-[12px]">
              <div ref="desktopEmojiRef" class="relative">
                <button
                  class="flex size-[24px] items-center justify-center opacity-90"
                  type="button"
                  @click.stop="toggleEmojiPicker"
                >
                  <img alt="" :src="EmoIcon" class="size-[24px]" />
                </button>

                <div
                  v-if="isEmojiPickerOpen"
                  class="absolute bottom-[calc(100%+10px)] left-0 z-20 w-[256px] rounded-[10px] border border-[#3F4750] bg-[#252D35] p-[8px] shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
                  @click.stop
                >
                  <div class="grid grid-cols-8 gap-[6px] border-b border-[#3F4750] pb-[8px]">
                    <button
                      v-for="emoji in currentEmojiList"
                      :key="emoji"
                      class="flex size-[24px] items-center justify-center rounded-[6px] text-[17px] transition-colors duration-150 hover:bg-[#39424B]"
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
                          ? 'bg-[#39424B] text-white'
                          : 'text-[#B7C0CA] hover:bg-[#39424B] hover:text-white'
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
                class="h-[40px] min-w-[166px] rounded-[10px] bg-[var(--color-theme-level-1)] px-[24px] text-[16px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                :disabled="!commentText.trim()"
                @click="submitComment"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        <div class="comment-popup-panel relative w-full lg:hidden" @click.stop>
          <div
            class="rounded-t-[16px] bg-[linear-gradient(180deg,#2A2F35_0%,#23282E_100%)] px-[12px] pb-[14px] pt-[10px] shadow-[0_-12px_28px_rgba(0,0,0,0.45)]"
          >
            <div class="grid grid-cols-[1fr_auto_1fr] items-center">
              <button
                class="justify-self-start text-[16px] font-semibold text-[var(--color-theme-level-1)]"
                type="button"
                @click="closePopup"
              >
                Cancel
              </button>
              <div class="text-[16px] font-semibold text-white">Leave Comments</div>
              <button
                class="h-[40px] justify-self-end rounded-[12px] bg-[var(--color-theme-level-1)] px-[14px] text-[14px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                :disabled="!commentText.trim()"
                @click="submitComment"
              >
                Post
              </button>
            </div>

            <textarea
              ref="mobileTextareaRef"
              v-model="commentText"
              class="mt-[10px] h-[190px] w-full resize-none rounded-[10px] border border-[var(--color-theme-level-1)] bg-[#353A3F] p-[12px] text-[14px] text-white outline-none placeholder:text-[#DCE4EA]"
              maxlength="500"
              placeholder="This game is great, very exciting!"
            ></textarea>

            <div class="mt-[8px] flex justify-end">
              <div ref="mobileEmojiRef" class="relative">
                <button
                  class="flex size-[24px] items-center justify-center opacity-90"
                  type="button"
                  @click.stop="toggleEmojiPicker"
                >
                  <img alt="" :src="EmoIcon" class="size-[24px]" />
                </button>

                <div
                  v-if="isEmojiPickerOpen"
                  class="absolute bottom-[calc(100%+10px)] right-0 z-20 w-[256px] rounded-[10px] border border-[#3F4750] bg-[#252D35] p-[8px] shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
                  @click.stop
                >
                  <div class="grid grid-cols-8 gap-[6px] border-b border-[#3F4750] pb-[8px]">
                    <button
                      v-for="emoji in currentEmojiList"
                      :key="emoji"
                      class="flex size-[24px] items-center justify-center rounded-[6px] text-[17px] transition-colors duration-150 hover:bg-[#39424B]"
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
                          ? 'bg-[#39424B] text-white'
                          : 'text-[#B7C0CA] hover:bg-[#39424B] hover:text-white'
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import EmoIcon from '@/static/svg/game/detail/comment/emo.svg?url'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', content: string): void
}>()

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
