<template>
  <!-- 游戏聊天室容器：只负责展示和滚动，不建立连接或请求接口。 -->
  <GameChatList
    :messages="messages"
    class="[--hash-chat-odd:#22a89a] [--hash-chat-even:#e63533]"
    :class="
      variant === 'pc' ? 'text-[14px] [&>div]:!top-1 [&>div>div]:!gap-[10px] [&>div>div]:!pt-0' : ''
    "
  >
    <template #default="{ message }">
      <!-- 房间公告。 -->
      <p
        v-if="message.kind === 'NOTICE'"
        class="m-0 text-text-2"
        :class="variant === 'pc' ? ' min-w-0' : 'max-w-[250px]'"
      >
        <span
          class="mr-[5px] inline-block rounded-[3px] bg-theme-3 px-[3px] py-0.5 text-theme-primary"
          >{{ t('hashGame.chatNotice') }}</span
        >
        <span>{{ message.content }}</span>
      </p>

      <!-- WS 用户文字消息。 -->
      <p
        v-else-if="message.kind === 'USER'"
        class="m-0 flex flex-wrap items-center gap-x-[5px] gap-y-0.5"
      >
        <span class="text-text-3">{{ message.nickname }}：</span>
        <span>{{ message.content }}</span>
      </p>

      <!-- WS 用户进入或离开提示。 -->
      <p v-else-if="message.kind === 'BROADCAST_BET'" class="m-0">{{ message.content }}</p>
      <p
        v-else-if="message.kind === 'TEXT_NOTICE'"
        class="m-0"
        :class="
          message.noticeKind === 'BIG_WIN' ? 'rounded-[5px] bg-hash-chat-win-frame px-2 py-1' : ''
        "
      >
        {{ message.content }}
      </p>
      <p v-else-if="message.kind === 'PRIVATE'" class="m-0">
        {{ message.content }}
      </p>
      <p v-else-if="message.kind === 'JOIN' || message.kind === 'LEAVE'" class="m-0 text-text-3">
        {{ message.nickname }}
        {{ t(message.kind === 'JOIN' ? 'hashGame.chatEntered' : 'hashGame.chatLeft') }}
      </p>

      <!-- 成功投注后由本地追加的消息。 -->
      <p
        v-else-if="message.kind === 'BET'"
        class="m-0 flex flex-wrap items-center gap-x-[5px] gap-y-0.5"
      >
        <span
          v-if="!message.privateText || message.revision || message.count !== undefined"
          :class="message.mergeKey ? 'text-text-3' : 'text-theme-primary'"
          >{{ message.mergeKey ? message.nickname : t('hashGame.chatMe') }}：</span
        >
        <span v-if="message.privateText && !message.revision && message.count === undefined">{{
          message.privateText
        }}</span>
        <template v-else>
          <span
            >{{ t('hashGame.chatBet') }}
            <strong
              :key="`${message.id}:${message.revision ?? 0}`"
              class="font-semibold"
              :class="
                message.revision && !message.history
                  ? 'animate-[hash-bet-amount_400ms_ease-out]'
                  : ''
              "
              >{{ formatAmount(message.bet.amount, message.bet.currency) }}</strong
            >
            {{ t('hashGame.chatOn') }}</span
          >
          <span
            class="inline-grid min-w-4 h-4 shrink-0 place-items-center rounded px-0.5 leading-none text-white"
            :class="optionColor(message.bet.betOption)"
            >{{ optionShortLabel(message.bet.betOption) }}</span
          >
          <span
            v-if="(message.count ?? 1) > 1"
            :key="`${message.id}:count:${message.revision ?? 0}`"
            class="rounded-full border border-secondary-7 px-[7px] text-[11px] text-secondary-7"
            :class="
              message.revision && !message.history ? 'animate-[hash-bet-count_400ms_ease-out]' : ''
            "
            >x{{ message.count }}</span
          >
        </template>
      </p>

      <!-- 历史与实时开奖采用同一张结果卡片。 -->
      <div
        v-else-if="message.kind === 'DRAW'"
        class="flex max-w-full flex-col gap-0.5 rounded-[5px] border border-secondary-7 bg-hash-chat-draw-frame p-2"
      >
        <!-- 开奖局号与开奖结果。 -->
        <p class="m-0 flex flex-wrap items-center gap-[5px]">
          {{ t('hashGame.chatBlock') }}
          <em class="not-italic font-semibold text-secondary-7">{{
            message.draw.anchorBlockNum
          }}</em>
          {{ t('hashGame.chatResult') }}：
          <strong class="text-base text-theme-primary">{{ resultValue(message.draw) }}</strong>
          <span
            v-for="option in resultBadges(message.draw)"
            :key="option"
            class="inline-grid min-w-4 h-4 place-items-center rounded px-0.5 leading-none text-white"
            :class="optionColor(option)"
            >{{ optionShortLabel(option) }}</span
          >
        </p>
        <!-- 后续 HTTP 若返回总中奖人数与派彩金额，则展示汇总行。 -->
        <p
          v-if="message.draw.winners !== undefined && message.draw.totalPayout !== undefined"
          class="m-0 flex flex-wrap items-center gap-[5px]"
        >
          <em class="not-italic font-semibold text-secondary-7">{{ message.draw.winners }}</em>
          {{ t('hashGame.chatWinnersPayout') }}
          <em class="not-italic font-semibold text-secondary-7">{{
            formatAmount(message.draw.totalPayout, message.draw.currency)
          }}</em>
        </p>
      </div>

      <!-- 仅 WIN 会生成的本人派彩消息。 -->
      <p
        v-else-if="message.kind === 'SELF_WIN'"
        class="m-0 flex flex-wrap items-center gap-[5px] rounded-[5px] bg-hash-chat-win-frame px-2 py-1"
      >
        <span>🎉</span><span class="text-theme-primary">{{ t('hashGame.chatMe') }}</span>
        <span
          >{{ t('hashGame.chatRoundPayout') }}：
          <strong class="font-semibold text-theme-primary">{{
            formatAmount(message.payoutAmount, message.currency)
          }}</strong></span
        >
      </p>
    </template>
    <template #overlay="{ scrollToBottom }">
      <div
        v-if="currentJoin"
        :key="currentJoin.id"
        class="absolute left-0 top-[8px] z-[2] flex max-w-full items-center gap-[3px] whitespace-nowrap rounded-[13px] bg-gradient-to-r from-[#e2a033] to-[#e2a033cc] py-[2px] pl-[2px] pr-[15px] text-[14px] text-white animate-[join-slide_3s_both]"
        @animationend="finishJoin"
      >
        <img
          :src="currentJoin.joinBatchAvatarUrl || currentJoin.avatarUrl || joinAvatar"
          alt=""
          class="size-[20px] rounded-full border border-white object-cover"
        />
        <span
          >{{ t('hashGame.chatWelcome') }}
          <strong class="text-yellow-300">{{
            currentJoin.joinBatchNickname || currentJoin.nickname
          }}</strong>
          {{ t('hashGame.chatToRoom')
          }}<span v-if="(currentJoin.joinBatchCount ?? 1) > 1">
            ×{{ currentJoin.joinBatchCount }}</span
          ></span
        >
      </div>
      <!-- 顶部渐隐蒙层。 -->
      <img
        v-if="variant !== 'pc'"
        :src="topFadeIcon"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 top-0 h-[50px] w-full"
      />
      <!-- 返回最新消息的浮动按钮。 -->
      <button
        type="button"
        class="absolute bottom-[21px] right-0 grid size-[34px] place-items-center rounded-full bg-bg-4"
        :aria-label="t('hashGame.chatScrollLatest')"
        @click="scrollToBottom"
      >
        <img :src="scrollBottomIcon" alt="" class="size-[18px]" />
      </button>
    </template>
  </GameChatList>
</template>

<script setup lang="ts">
import GameChatList from '@/components/game-chat/GameChatList.vue'
import joinAvatar from '@/static/img/hash_game/join-avatar.png'
import scrollBottomIcon from '@/static/svg/hash_game/chat/scroll-bottom.svg?url'
import topFadeIcon from '@/static/svg/hash_game/chat/top-fade.svg?url'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HashChatMessage, HashHttpDraw } from '../chat/types'

const props = defineProps<{
  messages: HashChatMessage[]
  parityOnly?: boolean
  sizeOnly?: boolean
  sumParityOnly?: boolean
  luckyOnly?: boolean
  variant?: 'pc' | 'h5'
}>()
const { t } = useI18n()
type JoinMessage = Extract<HashChatMessage, { kind: 'JOIN' | 'LEAVE' }>
const currentJoin = ref<JoinMessage | null>(null)
const joinQueue: JoinMessage[] = []
const seenJoins = new Set<string>()
const seenJoinBatches = new Set<string>()
function finishJoin() {
  currentJoin.value = joinQueue.shift() ?? null
}
watch(
  () => props.messages,
  messages => {
    if (!messages.length) {
      joinQueue.length = 0
      currentJoin.value = null
      seenJoins.clear()
      seenJoinBatches.clear()
    }
    for (const message of messages) {
      if (message.kind !== 'JOIN' || message.source !== 'ws' || seenJoins.has(message.id)) continue
      seenJoins.add(message.id)
      const batchId = message.joinBatchId || message.id
      if (seenJoinBatches.has(batchId)) continue
      seenJoinBatches.add(batchId)
      joinQueue.push(message)
    }
    if (!currentJoin.value) finishJoin()
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  joinQueue.length = 0
})
function resultValue(draw: HashHttpDraw) {
  if (props.luckyOnly) return draw.result.lastTwo ?? (draw.blockHash?.slice(-2) || '—')
  if (props.sumParityOnly)
    return (
      draw.result.sum ??
      (draw.blockHash
        ? [...draw.blockHash].reduce(
            (sum, digit) => sum + (/\d/.test(digit) ? Number(digit) : 0),
            0
          )
        : '—')
    )
  return draw.result.digit ?? '—'
}
function resultBadges(draw: HashHttpDraw) {
  if (props.luckyOnly) return draw.result.winner ? [draw.result.winner] : []
  return [
    !props.sizeOnly ? draw.result.oddEven : undefined,
    !props.parityOnly && !props.sumParityOnly ? draw.result.bigSmall : undefined
  ].filter((value): value is string => !!value)
}

/** 将金额与币种组合为可读的聊天文案。 */
function formatAmount(amount: number, currency?: string) {
  const number = amount.toLocaleString('en-US', { maximumFractionDigits: 8 })
  return currency ? `${number} ${currency}` : number
}

/** 将哈希游戏投注选项缩写为聊天里的标记。 */
function optionShortLabel(option: string) {
  const key = (
    { ODD: 'oddMark', EVEN: 'evenMark', BIG: 'bigMark', SMALL: 'smallMark' } as Record<
      string,
      string
    >
  )[option]
  return key ? t(`hashGame.${key}`) : option
}

/** 按当前投注选项选择大小或单双标记色。 */
function optionColor(option: string) {
  return option === 'ODD' || option === 'SMALL'
    ? 'bg-[var(--hash-chat-odd)]'
    : 'bg-[var(--hash-chat-even)]'
}
</script>

<style>
@keyframes join-slide {
  0% {
    transform: translateX(-110%);
    opacity: 0;
  }
  15%,
  85% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 0;
  }
}
@keyframes hash-bet-amount {
  0% {
    transform: translateY(4px);
    opacity: 0.5;
    color: var(--color-theme-primary);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes hash-bet-count {
  50% {
    transform: scale(1.2);
  }
}
</style>
