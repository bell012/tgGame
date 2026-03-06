<template>
  <div class="currency-info-container">
    <div class="image-content relative w-full h-[640px]">
      <img
        class="absolute top-0 left-0 w-full h-full object-cover rounded-t-[20px]"
        alt=""
        :src="gameImg"
      />
      <div
        v-if="isLogin"
        class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[var(--color-background-level-1)] p-[28px] rounded-lg"
      >
        <play-form></play-form>
      </div>
      <div
        v-else
        class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[var(--color-background-level-1)] p-[28px] rounded-lg"
      >
        <div class="text-[12px] text-center pb-[8px] text-[var(--color-text-level-2)]">
          Welcome to dragon-phoenix, please sign in to proceed .
        </div>
        <div class="play-btn w-[408px] h-[40px] cursor-pointer">
          <div class="w-[16px] h-[16px]">
            <play-icon class="w-full h-full" />
          </div>
          <div class="text-[15px] font-bold text-[#000]">Sign in</div>
        </div>
      </div>
    </div>
    <currency-bar></currency-bar>
  </div>
</template>
<script setup lang="ts">
import gameImg from '@/static/img/explore/game.png'
import PlayIcon from '@/static/svg/game/detail/play.svg'
import CurrencyBar from '../currency-bar/index.vue'
import PlayForm from './play-form.vue'

import { ref } from 'vue'

const isLogin = ref(true)
</script>
<style scoped lang="scss">
.play-btn {
  border-radius: 8px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
  box-shadow:
    0 0 12px 0 rgba(35, 238, 136, 0.3),
    0 -2px 0 0 #1dca6a inset;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}
</style>
