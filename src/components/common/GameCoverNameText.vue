<template>
  <span
    ref="textRef"
    class="w-full min-w-0 break-words text-center uppercase text-common-100 transition-opacity duration-100 motion-reduce:transition-none"
    :class="isFontReady ? 'opacity-100' : 'opacity-0'"
    :style="textStyle"
  >
    {{ name ?? '' }}
  </span>
</template>

<script setup lang="ts">
import {
  useAdaptiveTextTypography,
  type AdaptiveTypographyDisplayMode,
  type AdaptiveTypographyPreset,
  type AdaptiveTypographyPresets
} from '@/composables/useAdaptiveTextTypography'
import { ref } from 'vue'

interface Props {
  name?: string | null
  mode?: AdaptiveTypographyDisplayMode
  maxLines?: number
  typography?: Partial<AdaptiveTypographyPreset>
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  mode: 'auto',
  maxLines: 2,
  typography: undefined
})

/** 游戏封面使用 H5 三倍设计稿换算值和 PC 最新设计稿字体值。 */
const GAME_COVER_NAME_PRESETS: AdaptiveTypographyPresets = {
  mobile: {
    zh: {
      fontFamily: '"Infoma Ultra", sans-serif',
      maxFontSize: 20,
      minFontSize: 16,
      maxLineHeight: 22,
      minLineHeight: 18,
      fontWeight: 900,
      letterSpacing: 0
    },
    eng: {
      fontFamily: 'Impact, sans-serif',
      maxFontSize: 24,
      minFontSize: 17,
      maxLineHeight: 70 / 3,
      minLineHeight: 18,
      fontWeight: 400,
      letterSpacing: 0
    }
  },
  pc: {
    zh: {
      fontFamily: '"Infoma Ultra", sans-serif',
      maxFontSize: 29,
      minFontSize: 23,
      maxLineHeight: 32,
      minLineHeight: 32,
      fontWeight: 900,
      letterSpacing: 0
    },
    eng: {
      fontFamily: 'Impact, sans-serif',
      maxFontSize: 35,
      minFontSize: 25,
      maxLineHeight: 34,
      minLineHeight: 26,
      fontWeight: 400,
      letterSpacing: 0
    }
  }
}

const textRef = ref<HTMLElement | null>(null)

/** 使用公共自适应排版逻辑生成当前游戏名称的最终样式。 */
const { textStyle, isFontReady } = useAdaptiveTextTypography({
  text: () => props.name,
  targetRef: textRef,
  presets: GAME_COVER_NAME_PRESETS,
  mode: () => props.mode,
  maxLines: () => props.maxLines,
  overrides: () => props.typography
})
</script>
