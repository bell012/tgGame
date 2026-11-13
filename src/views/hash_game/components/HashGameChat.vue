<template>
  <section
    class="relative h-full min-h-0 overflow-hidden text-[13px] leading-[1.35] text-text-1"
    aria-label="Game chat"
  >
    <div
      ref="messageList"
      class="absolute inset-x-0 top-1 bottom-[21px] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @scroll="updateScrollPosition"
    >
      <div class="flex min-h-full flex-col items-start justify-end gap-1.5 pt-6">
        <template v-for="message in displayedMessages" :key="message.id">
          <p v-if="message.type === 'notice'" class="m-0 max-w-[250px] text-text-2">
            <span
              class="mr-[5px] inline-block rounded-[3px] bg-theme-3 px-[3px] py-0.5 text-theme-primary"
              >Notice</span
            >
            <span>{{ message.text }}</span>
          </p>

          <p
            v-else-if="message.type === 'bet'"
            class="m-0 flex flex-wrap items-center gap-x-[5px] gap-y-0.5"
          >
            <span :class="message.mine ? 'text-theme-primary' : 'text-text-3'"
              >{{ message.name }}：</span
            >
            <span
              >Bet <strong class="font-semibold">{{ message.amount }}</strong> on</span
            >
            <span
              class="inline-grid size-4 shrink-0 place-items-center rounded text-[13px] leading-none text-white"
              :class="
                message.outcome === 'O' ? 'bg-[var(--hash-chat-odd)]' : 'bg-[var(--hash-chat-even)]'
              "
              >{{ message.outcome }}</span
            >
            <span
              class="rounded-xl border border-secondary-7 px-1.5 text-[11px] leading-[15px] text-secondary-7"
              >x{{ message.multiplier }}</span
            >
          </p>

          <p
            v-else-if="message.type === 'jackpot'"
            class="m-0 flex max-w-full flex-wrap items-center gap-[5px] rounded-[5px] border border-[var(--hash-chat-award-border)] [background-image:var(--hash-chat-award)] px-[7px] py-1"
          >
            <strong
              class="rounded [background-image:var(--hash-chat-award-label)] px-1 py-0.5 text-xs text-white"
              >Jackpot</strong
            >
            <span>{{ message.name }} has bet</span>
            <span
              class="inline-grid size-4 shrink-0 place-items-center rounded bg-[var(--hash-chat-even)] leading-none text-white"
              >E</span
            >
            <span
              >win <strong class="font-semibold">{{ message.amount }}</strong></span
            >
          </p>

          <p
            v-else-if="message.type === 'streak'"
            class="m-0 flex max-w-full flex-wrap items-center gap-[5px] rounded-[5px] border border-[var(--hash-chat-award-border)] [background-image:var(--hash-chat-award)] px-[7px] py-1"
          >
            <strong
              class="rounded [background-image:var(--hash-chat-award-label)] px-1 py-0.5 text-xs text-white"
              >{{ message.count }} in a Row</strong
            >
            <span
              >{{ message.name }} has hit
              <em class="not-italic text-[var(--hash-chat-streak)]">{{ message.count }}</em> draws
              in a row 🔥</span
            >
          </p>

          <div
            v-else-if="message.type === 'result'"
            class="flex max-w-full flex-col gap-0.5 rounded-[5px] border border-secondary-10 bg-hash-chat-draw-frame p-2"
          >
            <p class="m-0 flex flex-wrap items-center gap-[5px]">
              Block
              <em class="not-italic font-semibold text-secondary-7">{{ message.block }}</em>
              Result：
              <strong class="text-base text-theme-primary">{{ message.digit }}</strong>
              <span
                class="inline-grid size-4 shrink-0 place-items-center rounded bg-[var(--hash-chat-odd)] leading-none text-white"
                >O</span
              >
              <span
                class="inline-grid size-4 shrink-0 place-items-center rounded bg-[var(--hash-chat-even)] leading-none text-white"
                >E</span
              >
            </p>
            <p class="m-0 flex flex-wrap items-center gap-[5px]">
              <em class="not-italic font-semibold text-secondary-7">{{ message.winners }}</em>
              winners · Total payout:
              <em class="not-italic font-semibold text-secondary-7">{{ message.payout }}</em>
            </p>
          </div>

          <p
            v-else-if="message.type === 'payout'"
            class="m-0 flex flex-wrap items-center gap-[5px] rounded-[5px] bg-hash-chat-win-frame px-2 py-1"
          >
            <span>🎉</span><span class="text-theme-primary">Me</span>
            <span
              >Round payout:
              <strong class="font-semibold text-theme-primary">{{ message.amount }}</strong></span
            >
          </p>

          <p v-else-if="message.type === 'arrival'" class="m-0 text-text-3">
            {{ message.name }} is coming.
          </p>

          <p v-else class="m-0 flex flex-wrap items-center gap-x-[5px] gap-y-0.5">
            <span class="text-text-3">{{ message.name }}：</span>
            <span>{{ message.text }}</span>
          </p>
        </template>
      </div>
    </div>

    <img
      :src="topFadeIcon"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[50px] w-full"
    />

    <button
      type="button"
      class="absolute bottom-[21px] right-0 grid size-[34px] place-items-center rounded-full bg-bg-4"
      aria-label="Scroll to latest message"
      @click="scrollToBottom"
    >
      <img :src="scrollBottomIcon" alt="" class="size-[18px]" />
    </button>
  </section>
</template>

<script setup lang="ts">
import scrollBottomIcon from '@/static/svg/hash_game/chat/scroll-bottom.svg?url'
import topFadeIcon from '@/static/svg/hash_game/chat/top-fade.svg?url'
import { nextTick, onMounted, ref, watch } from 'vue'

export type HashChatMessage =
  | { id: string; type: 'notice'; text: string }
  | {
      id: string
      type: 'bet'
      name: string
      amount: string
      outcome: 'O' | 'E'
      multiplier: number
      mine?: boolean
    }
  | { id: string; type: 'jackpot'; name: string; amount: string }
  | { id: string; type: 'streak'; name: string; count: number }
  | { id: string; type: 'result'; block: string; digit: string; winners: string; payout: string }
  | { id: string; type: 'payout'; amount: string }
  | { id: string; type: 'arrival'; name: string }
  | { id: string; type: 'text'; name: string; text: string }

const demoMessages: HashChatMessage[] = [
  {
    id: 'notice',
    type: 'notice',
    text: 'Welcome to the game room! We promote a fair, safe, and respectful environment. Illegal content, misconduct, false advertising, and private transactions are prohibited. Please protect your personal information and funds, play responsibly, and report any violations.'
  },
  { id: 'bet-1', type: 'bet', name: 'K*7', amount: '₱ 8,000', outcome: 'O', multiplier: 3 },
  { id: 'bet-2', type: 'bet', name: 'K*7', amount: '₱ 8,000', outcome: 'E', multiplier: 3 },
  { id: 'jackpot', type: 'jackpot', name: 'k***7', amount: '₱ 8,000' },
  { id: 'streak', type: 'streak', name: 'k***7', count: 4 },
  {
    id: 'result',
    type: 'result',
    block: '87878787',
    digit: '8',
    winners: '567',
    payout: '₱ 103,194'
  },
  { id: 'payout', type: 'payout', amount: '₱ 580.88' },
  { id: 'arrival-1', type: 'arrival', name: 'D*****h' },
  { id: 'arrival-2', type: 'arrival', name: 'r****8' },
  { id: 'text-1', type: 'text', name: 'W***0', text: 'Small this round.' },
  { id: 'text-2', type: 'text', name: 'W***0', text: 'Stay cool, guys.' },
  {
    id: 'bet-me',
    type: 'bet',
    name: 'Me',
    amount: '₱ 8,000',
    outcome: 'O',
    multiplier: 3,
    mine: true
  },
  { id: 'text-3', type: 'text', name: 'W***0', text: 'Big this round.' },
  { id: 'bet-3', type: 'bet', name: 'K*7', amount: '8,000 usdt', outcome: 'E', multiplier: 3 }
]

const props = defineProps<{ messages?: HashChatMessage[] }>()
const displayedMessages = ref<HashChatMessage[]>(props.messages ?? demoMessages)
const messageList = ref<HTMLElement | null>(null)
const atBottom = ref(true)

function scrollToBottom() {
  if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
  atBottom.value = true
}

function updateScrollPosition() {
  const list = messageList.value
  if (list) atBottom.value = list.scrollHeight - list.scrollTop - list.clientHeight < 12
}

watch(
  () => props.messages,
  async messages => {
    displayedMessages.value = messages ?? demoMessages
    await nextTick()
    if (atBottom.value) scrollToBottom()
  }
)

onMounted(async () => {
  await nextTick()
  scrollToBottom()
})
</script>

<style scoped>
.hash-game-chat {
  --hash-chat-odd: #22a89a;
  --hash-chat-even: #e63533;
  --hash-chat-award-border: #ff3c00;
  --hash-chat-streak: #ff6620;
  --hash-chat-award: linear-gradient(to right, rgba(255, 168, 80, 0.3), rgba(255, 60, 0, 0.09));
  --hash-chat-award-label: linear-gradient(to right, #ffa850, #ff3c00);
}
</style>
