<template>
  <div class="w-full animate-pulse rounded-xl bg-bg-2 p-6 font-['Inter']">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-1 gap-4 overflow-hidden">
          <div
            v-for="index in 4"
            :key="`coin-${index}`"
            class="h-9 flex-1 rounded-full bg-bg-4"
          ></div>
        </div>
        <div class="h-9 w-36 rounded-full bg-bg-4"></div>
      </div>

      <div>
        <div class="h-4 w-28 rounded bg-bg-4"></div>
        <div class="mt-2 grid grid-cols-6 gap-4">
          <div v-for="index in 6" :key="`channel-${index}`" class="h-9 rounded-lg bg-bg-4"></div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-4">
            <div class="h-4 w-28 rounded bg-bg-4"></div>
            <div class="h-4 w-28 rounded bg-bg-4"></div>
          </div>
          <div class="h-12 rounded-lg bg-bg-4"></div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-6 pb-2">
            <div
              v-for="index in 3"
              :key="`wagering-${index}`"
              class="h-4 w-20 rounded bg-bg-4"
            ></div>
          </div>
          <div class="h-3 w-52 rounded bg-bg-4"></div>
        </div>

        <div class="rounded-2xl bg-bg-4 p-2">
          <div class="grid grid-cols-6 gap-2">
            <div v-for="index in 12" :key="`preset-${index}`" class="h-10 rounded-lg bg-bg-4"></div>
          </div>
          <div class="mt-2 flex justify-center">
            <div class="h-4 w-20 rounded bg-bg-2"></div>
          </div>
        </div>
      </div>

      <div class="h-12 rounded-lg bg-bg-4"></div>

      <div class="flex items-center justify-center gap-2">
        <div class="h-4 w-32 rounded bg-bg-4"></div>
        <div class="h-6 w-16 rounded bg-bg-4"></div>
      </div>
    </div>
  </div>
</template>
