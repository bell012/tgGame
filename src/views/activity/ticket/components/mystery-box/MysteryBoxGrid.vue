<!-- 开盲盒 -->
<template>
  <!-- H5：稿宽 985 @1125，÷3；PC：右栏 492×470（Figma） -->
  <div
    class="relative shrink-0 w-[328px] h-[314px] sm:w-[492px] sm:h-[470px]"
    data-game-id="mystery_box"
  >
    <!-- 3×3 盲盒网格 -->
    <div class="grid grid-cols-3 gap-[14px] sm:gap-[21px]">
      <button
        v-for="index in cellIndexes"
        :key="index"
        type="button"
        class="relative h-[100px] w-[100px] border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[150px] sm:w-[150px]"
        :disabled="isCellDisabled(index)"
        :aria-label="t('ticketPage.mysteryBox.title')"
        @click="handleCellClick(index)"
      >
        <div
          :ref="setCellContainerRef(index)"
          class="pointer-events-none h-full w-full [&_svg]:!h-full [&_svg]:!w-full"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import idleSource from '@/lottie/mystery-box/idle/idle.json'
import mangheImg from '@/lottie/mystery-box/idle/images/manghe.png'
import saoguang1Img from '@/lottie/mystery-box/idle/images/saoguang1.png'
import lottie, { type AnimationItem } from 'lottie-web'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildResultDialogFromUse } from '../../shared/mapWheelConfig'
import { useTicketUseAction } from '../../shared'
import { openTicketResultDialog } from '../../shell/ticketDialog'
import { globalTicketToastState } from '../../shell/ticketToast'

const CELL_COUNT = 9

type LottieAsset = { p?: string; u?: string; [key: string]: unknown }

/** 把 JSON 里的相对图片路径替换成打包后的 URL，避免 lottie-web 解析失败 */
const remapLottieAssets = (source: Record<string, unknown>, imageMap: Record<string, string>) => ({
  ...source,
  assets: ((source as { assets: LottieAsset[] }).assets ?? []).map(asset => {
    const fileName = asset.p
    if (fileName && imageMap[fileName]) {
      return { ...asset, u: '', p: imageMap[fileName] }
    }
    return asset
  })
})

/** 避免 lottie-web 解析失败 */
const idleAnimationData = JSON.parse(
  JSON.stringify(
    remapLottieAssets(idleSource as Record<string, unknown>, {
      'manghe.png': mangheImg,
      'saoguang1.png': saoguang1Img
    })
  )
)

const { t } = useI18n()
const { runUseTicket, isPending } = useTicketUseAction()

const cellIndexes = Array.from({ length: CELL_COUNT }, (_, index) => index)
const openedCellIndexes = ref<Set<number>>(new Set())
const cellContainers = ref<(HTMLElement | null)[]>(Array(CELL_COUNT).fill(null))

const idleAnimations: AnimationItem[] = []

const isCellDisabled = (index: number) => isPending.value || openedCellIndexes.value.has(index)

const setCellContainerRef = (index: number) => (el: unknown) => {
  cellContainers.value[index] = (el as HTMLElement | null) ?? null
}

/** 在指定容器加载单格待机动画 */
const mountIdleLottie = (container: HTMLElement) => {
  const instance = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: JSON.parse(JSON.stringify(idleAnimationData)),
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  })
  idleAnimations.push(instance)
}

const resetGridState = () => {
  openedCellIndexes.value = new Set()
}

/**
 * 点击某一格：useTicket → 结果弹窗（开箱 Lottie 在 TicketResultHeroPopup 内播放）
 */
const handleCellClick = async (index: number) => {
  if (isCellDisabled(index)) return

  await runUseTicket({
    voucherName: t('ticketPage.mysteryBox.title'),
    fallbackErrorMessage: t('luckySpinPage.loadFailed'),
    onSuccess: result => {
      openTicketResultDialog({
        ...buildResultDialogFromUse(result),
        heroLottie: 'mystery_box_open'
      })
      openedCellIndexes.value = new Set([...openedCellIndexes.value, index])
    }
  })
}

/** 切换到另一张盲盒票券时，恢复未开箱状态。 */
watch(
  () => [
    globalTicketToastState.activeTicketRecord?.rowId,
    globalTicketToastState.activeTicketRecord?.ticketId
  ],
  resetGridState
)

onMounted(() => {
  void nextTick(() => {
    cellContainers.value.forEach(container => {
      if (container) mountIdleLottie(container)
    })
  })
})

onBeforeUnmount(() => {
  idleAnimations.forEach(animation => animation.destroy())
  idleAnimations.length = 0
})
</script>
