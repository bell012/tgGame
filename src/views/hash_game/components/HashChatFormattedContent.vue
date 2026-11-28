<template>
  <span class="inline-flex flex-wrap items-center gap-[5px]">
    <template v-for="(piece, index) in pieces" :key="index">
      <i
        v-if="piece.option"
        class="inline-grid min-w-4 h-4 shrink-0 place-items-center rounded px-0.5 leading-none text-white not-italic"
        :style="{ backgroundColor: chatOptionColor(piece.option) }"
        >{{ optionLabel(piece.text) }}</i
      >
      <span v-else>{{ piece.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { chatOptionCode, chatOptionColor, chatOptionMarkKey } from '../betOptions'

const props = defineProps<{ content: string }>()
const { t } = useI18n()
function optionLabel(value: string) {
  const markKey = chatOptionMarkKey(value)
  return /^[\u4e00-\u9fff]$/u.test(value) || !markKey ? value : t(`hashGame.${markKey}`)
}
type Piece = { text: string; option?: string }
const directionPattern =
  /\b(?:BANKER|PLAYER|SMALL|EVEN|ODD|BIG|WIN|LOSE|TIE)\b|[大小单双赢输庄闲和]/giu

/** 只将“押”后面的投注方向渲染为徽标，保留金额和其余文案。 */
const pieces = computed<Piece[]>(() => {
  const text = props.content
  const betAt = text.indexOf('押')
  if (betAt < 0) return [{ text }]
  const start = betAt + 1
  const following = text.slice(start)
  const boundary = /\d|本期|盈利|赢得/u.exec(following)
  const end = boundary ? start + boundary.index : text.length
  const prefix = text.slice(0, start)
  const directionText = text.slice(start, end)
  const pieces: Piece[] = [{ text: prefix }]
  let cursor = 0
  for (const match of directionText.matchAll(directionPattern)) {
    const index = match.index ?? 0
    if (index > cursor) pieces.push({ text: directionText.slice(cursor, index) })
    const option = chatOptionCode(match[0])
    pieces.push(option ? { text: match[0], option } : { text: match[0] })
    cursor = index + match[0].length
  }
  if (cursor < directionText.length) pieces.push({ text: directionText.slice(cursor) })
  if (end < text.length) pieces.push({ text: text.slice(end) })
  return pieces
})
</script>
