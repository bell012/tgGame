<template>
  <template v-if="src">
    <iframe
      :key="src"
      class="absolute inset-0 h-full w-full border-0"
      :src="src"
      title="Animation"
      allow="autoplay; fullscreen"
      data-testid="live-animation"
      @load="loading = false"
    />
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black text-white/80"
      data-testid="animation-loading"
      role="status"
    >
      <span
        class="size-6 animate-spin rounded-full border-2 border-white/30 border-t-white"
        aria-hidden="true"
      />
      <span class="text-xs">{{ t('sports.loadingAnimation') }}</span>
    </div>
  </template>
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
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import bgLayer1 from '../match-header/icon/bg-layer-1.png?url'
import bgLayer2 from '../match-header/icon/bg-layer-2.png?url'
import bgLayer3 from '../match-header/icon/bg-layer-3-34b3a2.png?url'

const props = defineProps<{
  src: string
}>()

const { t } = useI18n()
const loading = ref(true)

watch(
  () => props.src,
  () => {
    loading.value = true
  }
)
</script>
