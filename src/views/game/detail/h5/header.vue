<template>
  <div class="game-detail-h5-header-spacer">
    <div
      class="game-detail-h5-header-bar fixed left-0 top-0 z-[99] flex w-full items-center bg-bg-2 px-[10px]"
    >
      <div class="size-[33px] flex items-center justify-center">
        <button
          type="button"
          class="size-[33px] bg-opacity-5 rounded-md flex items-center justify-center cursor-pointer"
          @click="router.back()"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5 text-text-1" />
        </button>
      </div>

      <div class="flex flex-1 justify-center items-center text-base font-extrabold text-text-1">
        <slot />
      </div>

      <div class="size-[33px]" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
<style scoped lang="scss">
.game-detail-h5-header-spacer {
  height: calc(49px + var(--app-shell-top-safe-offset));
}

.game-detail-h5-header-bar {
  height: calc(49px + var(--app-shell-top-safe-offset));
  padding-top: var(--app-shell-top-safe-offset);
}
</style>
