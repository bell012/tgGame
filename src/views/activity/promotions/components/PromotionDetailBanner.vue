<template>
  <section
    class="promotion-banner relative overflow-hidden"
    :class="isDesktop ? 'aspect-[1032/240] rounded-[20px]' : 'min-h-[168px] rounded-[16px]'"
  >
    <img
      :src="background"
      alt=""
      class="absolute inset-0 h-full w-full object-cover object-right"
    />
    <div
      class="absolute left-0 top-0 z-[1] inline-flex h-[12.5%] min-h-[28px] w-fit max-w-[46%] items-center"
    >
      <img :src="stateLogo" alt="" class="absolute inset-0 h-full w-full" />
      <span
        class="relative z-[1] flex items-center gap-1 pl-2.5 pr-7 text-[clamp(11px,1.15cqw,14px)] font-[500] text-white"
      >
        <component :is="icon" class="h-[1.1em] w-[1.1em] shrink-0" />
        {{ badge }}
      </span>
    </div>
    <div
      class="absolute z-[1]"
      :class="isDesktop ? 'left-[13.7%] top-[27%] w-[40%]' : 'left-4 top-11 w-[62%]'"
    >
      <h2
        class="font-[700] leading-[1.2] text-white"
        :class="isDesktop ? 'text-[3.1cqw]' : 'text-xl'"
      >
        {{ title }}
      </h2>
      <p
        class="text-white/90"
        :class="isDesktop ? 'mt-[1.6cqw] text-[1.55cqw] leading-[1.5]' : 'mt-1.5 text-xs leading-5'"
      >
        {{ subtitle }}
      </p>
      <p v-if="extra" class="mt-1 text-white/70" :class="isDesktop ? 'text-[1.2cqw]' : 'text-xs'">
        {{ extra }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import stateLogo from '@/static/svg/promotions/state-logo.svg?url'

defineProps<{
  background: string
  icon: Component
  badge: string
  title: string
  subtitle: string
  extra?: string
  isDesktop: boolean
}>()
</script>

<style scoped>
.promotion-banner {
  container-type: inline-size;
}
</style>
