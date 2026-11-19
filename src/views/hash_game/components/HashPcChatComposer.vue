<template>
  <div ref="root" class="hash-pc-composer shrink-0" @keydown.esc="panel = null">
    <div class="flex items-end gap-[10px]">
      <div
        class="relative min-w-0 flex-1 rounded-[10px] bg-bg-3 px-[12px] py-[10px]"
        :class="config?.unlocked ? 'min-h-[44px]' : 'min-h-[89px]'"
      >
        <form v-if="config?.unlocked" class="flex items-center gap-2" @submit.prevent="sendDraft">
          <input
            v-model="draft"
            aria-label="Chat message"
            placeholder="Say something..."
            :maxlength="config.lengthLimit"
            class="min-w-0 flex-1 bg-transparent text-[14px] text-text-1 outline-none placeholder:text-text-3"
            @keydown.enter="onEnter"
          />
          <button
            type="button"
            aria-label="Emojis"
            :aria-expanded="panel === 'emoji'"
            @click="toggle('emoji')"
          >
            <img :src="emojiIcon" alt="" class="size-[24px]" />
          </button>
          <button
            type="submit"
            :disabled="!draft.trim() || busy"
            class="text-[12px] font-bold text-theme-primary disabled:opacity-40"
          >
            Send
          </button>
        </form>
        <template v-else>
          <div class="flex items-center gap-[10px] pr-[20px]">
            <img :src="lockIcon" alt="" class="size-[36px] shrink-0" />
            <div class="min-w-0">
              <p class="m-0 text-[14px] font-bold text-text-1">Bet to send custom content.</p>
              <p class="m-0 mt-1 text-[12px] leading-[15px] text-text-2">
                Bet to unlock custom messages.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="absolute bottom-[10px] right-[12px]"
            aria-label="Emojis"
            :aria-expanded="panel === 'emoji'"
            @click="toggle('emoji')"
          >
            <img :src="emojiIcon" alt="" class="size-[24px]" />
          </button>
        </template>
      </div>
      <button
        type="button"
        class="grid size-[44px] shrink-0 place-items-center rounded-[10px] bg-bg-3"
        aria-label="Common Expressions"
        :aria-expanded="panel === 'phrases'"
        @click="toggle('phrases')"
      >
        <img :src="phrasesIcon" alt="" class="size-[22px]" />
      </button>
    </div>
    <Transition name="hash-pc-panel" mode="out-in">
      <section
        v-if="panel === 'phrases'"
        class="mt-[12px] h-[288px] overflow-hidden rounded-[10px] bg-bg-3 px-[12px] pt-[12px]"
        aria-label="Common Expressions"
      >
        <p class="m-0 text-[12px] text-text-2">Common Expressions</p>
        <div
          class="mt-[12px] flex h-[249px] flex-col items-start gap-[12px] overflow-y-auto pb-[12px]"
        >
          <button
            v-for="(phrase, index) in config?.phrases ?? []"
            :key="index"
            type="button"
            :disabled="busy"
            class="max-w-full shrink-0 rounded-[24px] bg-bg-2 px-[15px] py-[4px] text-left text-[14px] leading-[20px] text-text-2 hover:text-text-1 disabled:opacity-50"
            @click="send(phrase, false)"
          >
            {{ phrase }}
          </button>
          <p v-if="!config?.phrases.length" class="text-[12px] text-text-2">
            No expressions available.
          </p>
        </div>
      </section>
      <EmojiPanel
        v-else-if="panel === 'emoji'"
        :has-emoji="false"
        display-mode="pc"
        :close-on-outside="false"
        picker-background="bg-3"
        class="mt-[12px] h-[288px] rounded-[10px] !bg-bg-3"
        @select="send($event, false)"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { sendHashChatMessage } from '@/api/modules/hash-game-chat'
import emojiIcon from '@/static/svg/hash_game/biaoqing.svg?url'
import lockIcon from '@/static/svg/hash_game/chat/lock.svg?url'
import phrasesIcon from '@/static/svg/hash_game/liaotian.svg?url'
import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import EmojiPanel from '@/views/chat/chat-public/components/emoji-panel.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { HashChatConfig } from '../chat/config'

const props = defineProps<{ gameCode: string; config: HashChatConfig | null }>()
const auth = useAuthModalStore()
const user = useUserStore()
const root = ref<HTMLElement | null>(null)
const draft = ref('')
const panel = ref<'emoji' | 'phrases' | null>(null)
const busy = ref(false)
let lastSentAt = 0
let roomGeneration = 0
function toggle(value: 'emoji' | 'phrases') {
  panel.value = panel.value === value ? null : value
}
async function send(content: string, custom: boolean) {
  content = content.trim()
  if (!content || !props.gameCode || busy.value || Date.now() - lastSentAt < 1000) return false
  if (!user.userInfo?.tradeToken && !user.acctInfo?.memberId) {
    auth.openLoginModal()
    return false
  }
  if (custom && (!props.config?.unlocked || content.length > props.config.lengthLimit)) return false
  const generation = roomGeneration
  busy.value = true
  lastSentAt = Date.now()
  try {
    const response = await sendHashChatMessage({ gameCode: props.gameCode, content, custom })
    return generation === roomGeneration && response.success
  } catch {
    return false
  } finally {
    busy.value = false
  }
}
async function sendDraft() {
  const content = draft.value
  if (await send(content, true)) {
    if (draft.value === content) draft.value = ''
  }
}
function onEnter(event: KeyboardEvent) {
  if (event.isComposing) event.preventDefault()
}
function closeOutside(event: PointerEvent) {
  if (root.value && !event.composedPath().includes(root.value)) panel.value = null
}
watch(
  () => props.gameCode,
  () => {
    roomGeneration++
    draft.value = ''
    panel.value = null
  }
)
onMounted(() => document.addEventListener('pointerdown', closeOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOutside))
</script>

<style scoped>
.hash-pc-panel-enter-active,
.hash-pc-panel-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.hash-pc-panel-enter-from,
.hash-pc-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .hash-pc-panel-enter-active,
  .hash-pc-panel-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
