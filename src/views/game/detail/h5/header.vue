<template>
  <div>
    <div
      class="flex items-center fixed left-0 top-0 px-[10px] h-[48px] w-full bg-[var(--color-background-level-5)] z-[99]"
    >
      <div
        class="size-[28px] bg-[var(--color-background-level-2)] fill-[var(--color-icon-level-2)] rounded-md"
        @click.self="router.back()"
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
          ></path>
        </svg>
      </div>
      <div class="flex flex-1 justify-center items-center text-[16px]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
<style scoped lang="scss"></style>
