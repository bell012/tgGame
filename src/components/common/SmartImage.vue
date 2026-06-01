<template>
  <picture v-if="webpSrc && !hasError" v-bind="wrapperAttrs" class="smart-image">
    <source :srcset="webpSrc" type="image/webp" />
    <img v-bind="imgAttrs" :src="displaySrc" :alt="props.alt" @error="handleError" />
  </picture>
  <img v-else v-bind="attrs" :src="displaySrc" :alt="props.alt" @error="handleError" />
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, watch, type HTMLAttributes } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import errorImg from '@/static/img/home/errImg.png'
import errorImg1 from '@/static/img/home/errImg1.png'
import { resolveWebpUrl } from '@/utils/image'

defineOptions({
  inheritAttrs: false
})

interface Props {
  src: string
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: ''
})

const attrs = useAttrs()
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)

const hasError = ref(false)
const displaySrc = ref(props.src)

const webpSrc = computed(() => resolveWebpUrl(props.src))

const wrapperAttrs = computed<HTMLAttributes>(() => ({
  class: attrs.class as HTMLAttributes['class'],
  style: attrs.style as HTMLAttributes['style']
}))

const imgAttrs = computed(() => {
  return attrs
})

const fallbackSrc = computed(() => (theme.value === 'dark' ? errorImg : errorImg1))

const resetSource = () => {
  hasError.value = false
  displaySrc.value = props.src
}

const handleError = () => {
  if (hasError.value || !props.src) {
    return
  }

  hasError.value = true
  displaySrc.value = fallbackSrc.value
}

watch(
  () => props.src,
  () => {
    resetSource()
  }
)

watch(theme, () => {
  if (hasError.value) {
    displaySrc.value = fallbackSrc.value
  }
})
</script>

<style scoped>
.smart-image {
  display: inline-block;
}

.smart-image > img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
