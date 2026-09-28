<template>
  <iframe
    v-if="src"
    :key="src"
    class="absolute inset-0 h-full w-full border-0"
    :src="src"
    title="Animation"
    allow="autoplay; fullscreen"
    data-testid="live-animation"
  />
  <template v-else>
    <img
      class="absolute inset-0 h-full w-full object-cover"
      :src="bgLayer1"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
    <img
      class="absolute inset-0 h-full w-full object-cover"
      :src="bgLayer2"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
    <img
      class="absolute inset-0 h-full w-full object-cover"
      :src="bgLayer3"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
    <div
      class="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-normal text-white/70"
      data-testid="no-animation"
    >
      {{ t('sports.noAnimation') }}
    </div>
  </template>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import bgLayer1 from '../match-header/icon/bg-layer-1.png?url'
import bgLayer2 from '../match-header/icon/bg-layer-2.png?url'
import bgLayer3 from '../match-header/icon/bg-layer-3-34b3a2.png?url'

defineProps<{
  src: string
}>()

const { t } = useI18n()
</script>
