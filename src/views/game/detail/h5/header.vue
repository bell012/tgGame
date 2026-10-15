<template>
  <div class="game-detail-h5-header">
    <div class="game-detail-h5-header-bar">
      <div class="size-[33px] flex items-center justify-center">
        <button
          type="button"
          class="size-[33px] bg-opacity-5 rounded-md flex items-center justify-center cursor-pointer"
          @click="router.back()"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5 text-text-1" />
        </button>
      </div>

      <div
        class="flex min-w-0 flex-1 items-center justify-center overflow-hidden px-1 text-base font-extrabold text-text-1"
      >
        <span class="truncate"><slot /></span>
      </div>

      <div class="size-[33px] shrink-0" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
<style scoped lang="scss">
.game-detail-h5-header {
  flex-shrink: 0;
  width: 100%;
  background: var(--color-background-level-2);
  padding-top: calc(constant(safe-area-inset-top) + var(--app-shell-top-safe-offset, 0px));
  padding-top: calc(env(safe-area-inset-top, 0px) + var(--app-shell-top-safe-offset, 0px));
  padding-right: constant(safe-area-inset-right);
  padding-right: env(safe-area-inset-right, 0px);
  padding-left: constant(safe-area-inset-left);
  padding-left: env(safe-area-inset-left, 0px);
}

.game-detail-h5-header-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 49px;
  padding-right: 10px;
  padding-left: 10px;
}
</style>
