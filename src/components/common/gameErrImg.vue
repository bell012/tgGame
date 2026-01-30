<template>
  <div
    class="w-full min-h-[140px] flex items-center justify-center overflow-hidden rounded-[8px] bg-[var(--color-background-level-2)] sm:h-full"
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
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import errorImg from '@/static/img/home/errImg.png'
import errorImg1 from '@/static/img/home/errImg1.png'
import maintainImg from '@/static/img/home/maintain.png'

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
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
    currentSrc.value = theme.value === 'dark' ? errorImg : errorImg1
  }
}

watch(theme, () => {
  if (hasError.value) {
    currentSrc.value = theme.value === 'dark' ? errorImg : errorImg1
  }
})
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
