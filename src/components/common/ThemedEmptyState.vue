<template>
  <section :class="['empty-state flex flex-col items-center', containerClass]">
    <img :src="resolvedImage" :alt="imageAlt" :class="imageClass" />
    <p v-if="message" :class="textClass">
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

interface Props {
  darkImage: string
  lightImage?: string
  imageAlt?: string
  message?: string
  containerClass?: string
  imageClass?: string
  textClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  lightImage: '',
  imageAlt: 'empty',
  message: '',
  containerClass: 'mt-[40px]',
  imageClass: 'h-[200px] w-[220px] object-contain',
  textClass: 'mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1'
})

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)

const resolvedImage = computed(() => {
  if (theme.value === 'light' && props.lightImage) {
    return props.lightImage
  }

  return props.darkImage
})
</script>
