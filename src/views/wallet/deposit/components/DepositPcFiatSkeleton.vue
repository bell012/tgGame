<template>
  <div class="w-full animate-pulse rounded-lg bg-bg-2 p-6 font-['Inter']">
    <div class="h-4 w-24 rounded bg-bg-4"></div>

    <div class="mt-2.5 flex gap-4 overflow-hidden">
      <div
        v-for="index in 4"
        :key="`method-${index}`"
        class="h-[58px] flex-1 rounded-xl bg-bg-4"
      ></div>
    </div>

    <div class="mt-4 h-4 w-24 rounded bg-bg-4"></div>
    <div class="mt-2 h-[50px] rounded-lg bg-bg-4"></div>

    <div class="mt-4">
      <div class="rounded-tl-lg rounded-tr-lg bg-bg-4 p-2">
        <div class="grid grid-cols-6 gap-2">
          <div v-for="index in 12" :key="`preset-${index}`" class="h-10 rounded-lg bg-bg-4"></div>
        </div>
      </div>
      <div class="rounded-bl-lg rounded-br-lg bg-bg-4 py-2">
        <div class="mx-auto h-4 w-20 rounded bg-bg-4"></div>
      </div>
    </div>

    <div class="mt-4 h-[54px] rounded-xl bg-bg-4"></div>
  </div>
</template>
