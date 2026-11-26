<template>
  <div class="relative bg-bg-2">
    <div class="absolute inset-0 overflow-hidden rounded-[inherit]">
      <SmartImage
        v-if="imageUrl"
        :src="imageUrl"
        :alt="name ?? ''"
        class="absolute inset-0 size-full object-cover object-[center_15%]"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <SmartImage :src="placeholder" alt="" class="size-[31px] object-contain opacity-[0.82]" />
      </div>
    </div>
    <slot />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import SmartImage from '@/components/common/SmartImage.vue'
import { useThemeStore } from '@/stores/theme'
import { resolveGameImageUrl } from '@/utils/image'
import errorImg from '@/static/img/home/errimg.png'
import errorImgLight from '@/static/img/home/errimg1.png'

const props = defineProps<{ name?: string; image?: string }>()
const themeStore = useThemeStore()
const placeholder = computed(() => (themeStore.theme === 'dark' ? errorImg : errorImgLight))
const imageUrl = computed(() => {
  const path = String(props.image ?? '').trim()
  return path ? (/^https?:\/\//i.test(path) ? path : resolveGameImageUrl(path)) : ''
})
</script>
