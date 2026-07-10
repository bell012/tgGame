<template>
  <div
    class="golden-egg-game relative mx-auto flex flex-col items-center"
    data-game-id="golden_egg"
  >
    <div class="golden-egg-board">
      <div v-for="rowIndex in EGG_ROW_COUNT" :key="rowIndex" class="golden-egg-row">
        <button
          v-for="columnIndex in EGG_COLUMN_COUNT"
          :key="columnIndex"
          type="button"
          class="golden-egg-slot"
          :disabled="activeStage !== 'standby' || isPending"
          :aria-label="
            t('ticketPage.goldenEgg.smashEggAriaLabel', {
              index: getEggIndex(rowIndex, columnIndex) + 1
            })
          "
          @click="handleSmash(getEggIndex(rowIndex, columnIndex))"
        >
          <div
            :ref="el => setStandbyRef(getEggIndex(rowIndex, columnIndex), el)"
            class="golden-egg-lottie"
            :class="{ 'is-hidden': activeOpeningIndex === getEggIndex(rowIndex, columnIndex) }"
          />
          <div
            :ref="el => setOpenRef(getEggIndex(rowIndex, columnIndex), el)"
            class="golden-egg-lottie"
            :class="{ 'is-hidden': activeOpeningIndex !== getEggIndex(rowIndex, columnIndex) }"
          />
        </button>
        <img class="golden-egg-shelf" :src="baseImage" alt="" draggable="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { globalTicketToastState } from '../../shell/ticketToast'
import { useI18n } from 'vue-i18n'
import baseImage from './base.png'
import standbyAnimation from './standby/standby.json'
import openAnimation from './smaso-open/smaso-open.json'
import { useGoldenEggGame } from './useGoldenEggGame'
import { useGoldenEggLottieGrid } from './useGoldenEggLottieGrid'

const EGG_ROW_COUNT = 3
const EGG_COLUMN_COUNT = 3
const EGG_COUNT = EGG_ROW_COUNT * EGG_COLUMN_COUNT
const { t } = useI18n()

/** 当前选中票券（券种条切换时随 activeTicketRecord 更新） */
const ticketId = computed(() => globalTicketToastState.activeTicketRecord?.ticketId)

const standbyImages = import.meta.glob('./standby/images/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>
const openImages = import.meta.glob('./smaso-open/images/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const getEggIndex = (rowIndex: number, columnIndex: number) =>
  (rowIndex - 1) * EGG_COLUMN_COUNT + columnIndex - 1

let completeOpenAnimation: (index: number) => void = () => {}

const lottieGrid = useGoldenEggLottieGrid({
  eggCount: EGG_COUNT,
  standbyAnimation,
  standbyImages,
  openAnimation,
  openImages,
  onOpenComplete: index => completeOpenAnimation(index)
})

const goldenEggGame = useGoldenEggGame({
  onOpenAnimationStart: index => {
    lottieGrid.pauseStandbyPlayers()
    return lottieGrid.playOpenPlayer(index)
  },
  onResetAnimations: lottieGrid.resetPlayers
})

completeOpenAnimation = goldenEggGame.handleOpenComplete

const { activeStage, activeOpeningIndex, isPending, handleSmash } = goldenEggGame
const { setStandbyRef, setOpenRef } = lottieGrid

onMounted(() => {
  void lottieGrid.createAllPlayers()
})

watch(ticketId, () => {
  goldenEggGame.resetGame()
  void lottieGrid.refreshAnimations()
})

onUnmounted(lottieGrid.destroyAllPlayers)
</script>

<style scoped lang="scss">
.golden-egg-game {
  width: min(520px, 92vw);
}

.golden-egg-board {
  width: 100%;
  padding: 0 2.5%;
}

.golden-egg-row {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6%;
  min-height: 32%;
  padding: 0 7.5% 4.5%;
}

.golden-egg-row + .golden-egg-row {
  margin-top: 3.2%;
}

.golden-egg-row:nth-child(1) .golden-egg-slot {
  transform: translateY(7px);
}

.golden-egg-row:nth-child(2) .golden-egg-slot {
  transform: translateY(6px);
}

.golden-egg-row:nth-child(3) .golden-egg-slot {
  transform: translateY(5px);
}

.golden-egg-slot {
  position: relative;
  z-index: 2;
  aspect-ratio: 250 / 262;
  cursor: pointer;
  filter: drop-shadow(0 12px 18px rgb(0 0 0 / 28%));
}

.golden-egg-slot:disabled {
  cursor: default;
}

.golden-egg-lottie {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: opacity 0.12s ease;
}

.golden-egg-lottie.is-hidden {
  pointer-events: none;
  opacity: 0;
}

.golden-egg-shelf {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 0;
  width: 100%;
  height: auto;
  pointer-events: none;
  user-select: none;
  transform: translateX(-50%);
}

@media (min-width: 768px) {
  .golden-egg-game {
    width: 520px;
  }
}
</style>
