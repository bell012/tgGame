<template>
  <picture v-if="webpSrc" v-bind="wrapperAttrs" class="smart-image">
    <source :srcset="webpSrc" type="image/webp" />
    <img v-bind="imgAttrs" :src="props.src" :alt="props.alt" />
  </picture>
  <img v-else v-bind="attrs" :src="props.src" :alt="props.alt" />
</template>

<script setup lang="ts">
import { computed, useAttrs, type HTMLAttributes } from 'vue'
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

const webpSrc = computed(() => resolveWebpUrl(props.src))

const wrapperAttrs = computed<HTMLAttributes>(() => ({
  class: attrs.class as HTMLAttributes['class'],
  style: attrs.style as HTMLAttributes['style']
}))

const imgAttrs = computed(() => {
  return attrs
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
