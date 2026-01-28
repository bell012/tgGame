<template>
  <div
    class="w-full min-h-[140px] flex items-center justify-center overflow-hidden rounded-[8px] bg-[var(--color-background-level-2)]"
  >
    <img
      :src="currentSrc"
      alt=""
      class="game-err-img"
      :class="{ error: hasError }"
      @error="handleError"
    />
    <div
      v-if="props.img.maintain"
      class="z-10 absolute inset-0 bg-[var(--color-mask-60-1)] backdrop-blur-1 flex justify-center items-center"
    >
      <img class="w-[31px]" :src="maintainImg" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import errorImg from '@/static/img/home/errImg.png'
import maintainImg from '@/static/img/home/maintain.png'
// src: string
// maintain?: boolean
interface Props {
  img: {
    maintain: boolean
    src: string
  }
}
const props = defineProps<Props>()
const currentSrc = ref(props.img.src)
const hasError = ref(false)

const handleError = () => {
  if (!hasError.value) {
    hasError.value = true
    currentSrc.value = errorImg
  }
}
</script>

<style scoped lang="scss">
.game-err-img {
  width: 100%;
  object-fit: cover;
}

.game-err-img.error {
  width: 31px;
  object-fit: contain;
}
</style>
