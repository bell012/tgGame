<template>
  <div class="flex w-full animate-pulse flex-col gap-4 rounded-[12px] bg-bg-2 p-6 font-['Inter']">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <div v-for="index in 3" :key="`type-${index}`" class="h-9 w-24 rounded-[8px] bg-bg-4"></div>
      </div>
      <div class="h-9 w-24 rounded-full bg-bg-4"></div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="h-5 w-32 rounded bg-bg-4"></div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="index in 6"
          :key="`method-${index}`"
          class="h-10 w-[120px] rounded-[8px] bg-bg-4"
        ></div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="h-5 w-32 rounded bg-bg-4"></div>
      <div class="h-12 rounded-[8px] bg-bg-4"></div>
    </div>

    <div class="flex flex-col gap-8">
      <div class="rounded-[16px] bg-bg-4 p-2">
        <div class="grid grid-cols-6 gap-2">
          <div
            v-for="index in 12"
            :key="`preset-${index}`"
            class="h-10 rounded-[8px] bg-bg-2"
          ></div>
        </div>
        <div class="mx-auto mt-2 h-5 w-16 rounded bg-bg-2"></div>
      </div>
      <div class="h-12 rounded-[8px] bg-bg-4"></div>
    </div>
  </div>
</template>
