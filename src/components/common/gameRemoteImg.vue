<template>
  <div
    class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[8px] bg-[var(--color-background-level-2)] sm:h-full"
  >
    <img
      :src="currentSrc"
      alt=""
      draggable="false"
      loading="lazy"
      decoding="async"
      class="game-remote-img"
      :class="{
        error: hasError,
        'object-contain': !hasError && props.img.fit === 'contain',
        'object-cover': !hasError && props.img.fit !== 'contain'
      }"
      @error="handleError"
      @dragstart.prevent
    />
    <div
      v-if="props.img.maintain"
      class="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-mask-60-1)] backdrop-blur-1"
    >
      <img :src="maintainImg" alt="" class="w-[31px]" loading="lazy" decoding="async" />
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

interface Props {
  img: {
    maintain: boolean
    conUrl?: string
    src?: string
    fit?: 'cover' | 'contain'
  }
}

const props = defineProps<Props>()

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const currentSrc = ref(props.img.conUrl ?? props.img.src ?? '')
const hasError = ref(false)

const updateSource = () => {
  hasError.value = false
  currentSrc.value = props.img.conUrl ?? props.img.src ?? ''
}

const handleError = () => {
  if (hasError.value) {
    return
  }

  hasError.value = true
  currentSrc.value = theme.value === 'dark' ? errorImg : errorImg1
}

watch(theme, () => {
  if (hasError.value) {
    currentSrc.value = theme.value === 'dark' ? errorImg : errorImg1
  }
})

watch(
  () => [props.img.conUrl, props.img.src],
  () => {
    updateSource()
  }
)
</script>

<style scoped lang="scss">
.game-remote-img {
  max-width: 100%;
  max-height: 100%;
}

.game-remote-img.error {
  width: 31px;
  object-fit: contain;
}
</style>
