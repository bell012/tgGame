<template>
  <div class="w-full animate-pulse rounded-lg bg-bg-2 p-4 font-['Inter']">
    <div class="h-4 w-24 rounded bg-bg-4"></div>

    <div class="mt-2.5 flex gap-2 overflow-hidden">
      <div
        v-for="index in 4"
        :key="`method-${index}`"
        class="h-[72px] w-24 shrink-0 rounded-xl bg-bg-4"
      ></div>
    </div>

    <div class="mt-4 h-4 w-24 rounded bg-bg-4"></div>
    <div class="mt-2 h-[50px] rounded-lg bg-bg-4"></div>

    <!-- <div class="mt-4 flex items-center gap-5 border-b border-white/10 pb-2.5">
      <div v-for="index in 3" :key="`wagering-${index}`" class="h-4 w-16 rounded bg-bg-4"></div>
    </div> -->

    <div class="py-3">
      <div class="h-1 w-48"></div>
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
</template>
