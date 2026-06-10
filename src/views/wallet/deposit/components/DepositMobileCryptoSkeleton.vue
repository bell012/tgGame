<template>
  <div class="w-full min-h-full animate-pulse font-['Inter']">
    <div class="flex items-center gap-2">
      <div v-for="index in 4" :key="`coin-${index}`" class="h-8 flex-1 rounded-full bg-bg-4"></div>
      <div class="h-8 w-24 rounded-full bg-bg-4"></div>
    </div>

    <div class="rounded-lg bg-bg-2 p-3 mt-3">
      <div class="mt-5">
        <div class="h-4 w-24 rounded bg-bg-4"></div>
        <div class="mt-4 flex gap-2 overflow-hidden">
          <div
            v-for="index in 4"
            :key="`channel-${index}`"
            class="h-12 w-24 shrink-0 rounded-lg bg-bg-4"
          ></div>
        </div>
      </div>

      <div class="mt-5">
        <div class="flex items-center justify-between gap-3">
          <div class="h-4 w-24 rounded bg-bg-4"></div>
          <div class="h-4 w-20 rounded bg-bg-4"></div>
        </div>
        <div class="mt-3 h-12 rounded-lg bg-bg-4"></div>
      </div>

      <div class="mt-4">
        <div class="flex items-center gap-5 pb-2.5">
          <div v-for="index in 3" :key="`wagering-${index}`" class="h-4 w-16 rounded bg-bg-4"></div>
        </div>
      </div>

      <div class="py-3">
        <div class="h-3 w-full rounded bg-bg-4"></div>
      </div>

      <div class="rounded-tl-lg rounded-tr-lg bg-bg-4 p-2.5 sm:p-5">
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div
            v-for="index in 6"
            :key="`preset-${index}`"
            class="h-10 rounded-lg bg-bg-2 sm:h-12"
          ></div>
        </div>
      </div>
      <div class="relative -mt-3 rounded-bl-lg rounded-br-lg bg-bg-4 p-1.5 sm:p-3">
        <div class="mx-auto h-4 w-20 rounded bg-bg-2"></div>
      </div>

      <div class="mt-4 h-10 rounded-lg bg-bg-4 sm:h-12"></div>
    </div>

    <div class="mt-3 rounded-lg bg-bg-2 p-4">
      <div class="flex items-center justify-between gap-4">
        <div class="h-4 w-24 rounded bg-bg-4"></div>
        <div class="h-6 w-16 rounded bg-bg-4"></div>
      </div>
    </div>
  </div>
</template>
