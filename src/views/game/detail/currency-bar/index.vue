<template>
  <div class="bg-[var(--color-background-level-6)] p-[12px] rounded-b-[10px]">
    <div class="flex justify-between items-center">
      <img alt="" class="size-[16px]" :src="LineIcon" />

      <div class="flex justify-end items-center gap-[10px]">
        <img
          alt=""
          class="size-[16px]"
          :src="starActived ? StarActiveIcon : StarIcon"
          @click="toggleStar"
        />
        <img
          alt=""
          class="size-[16px]"
          :src="loveActived ? LoveActiveIcon : LoveIcon"
          @click="toggleLove"
        />
        <img alt="" class="size-[16px]" :src="TgIcon" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import LineIcon from '@/static/svg/game/detail/lines.svg?url'
import StarIcon from '@/static/svg/game/detail/star.svg?url'
import LoveIcon from '@/static/svg/game/detail/love.svg?url'
import TgIcon from '@/static/svg/game/detail/tg.svg?url'
import StarActiveIcon from '@/static/svg/game/detail/star_active.svg?url'
import LoveActiveIcon from '@/static/svg/game/detail/love_active.svg?url'
import { ref } from 'vue'

const starActived = ref(false)
const loveActived = ref(false)

const toggleStar = () => {
  starActived.value = !starActived.value
}

const toggleLove = () => {
  loveActived.value = !loveActived.value
}
</script>
<style lang="sass" scoped></style>
