<template>
  <div class="w-full animate-pulse font-['Inter']">
    <div class="flex items-center gap-2">
      <div
        v-for="index in 3"
        :key="`coin-${index}`"
        class="h-9 min-w-0 flex-1 rounded-full bg-bg-4"
      />
      <div class="h-9 w-[100px] shrink-0 rounded-full bg-bg-4" />
    </div>

    <div class="mt-3.5 rounded-[10px] bg-bg-2 p-3.5">
      <div>
        <div class="flex items-center justify-between gap-3">
          <div class="h-4 w-24 rounded bg-bg-4" />
          <div class="h-4 w-28 rounded bg-bg-4" />
        </div>
        <div class="mt-2 h-[45px] rounded-lg bg-bg-4" />
      </div>

      <div class="mt-5">
        <div class="flex items-center justify-between gap-3">
          <div class="h-4 w-24 rounded bg-bg-4" />
          <div class="h-4 w-28 rounded bg-bg-4" />
        </div>
        <div class="mt-2 h-[45px] rounded-lg bg-bg-4" />
      </div>

      <div class="mt-3.5 h-4 w-32 rounded bg-bg-4" />

      <div class="mt-3.5">
        <div class="rounded-2xl bg-bg-4 p-2.5">
          <div class="grid grid-cols-3 gap-2">
            <div v-for="index in 6" :key="`preset-${index}`" class="h-10 rounded-[5px] bg-bg-2" />
          </div>
          <div class="mt-2 flex justify-center">
            <div class="h-4 w-[52px] rounded-[5px] bg-bg-2" />
          </div>
        </div>
      </div>

      <div class="mt-3.5 h-4 w-40 rounded bg-bg-4" />
      <div class="mt-5 h-10 rounded-lg bg-bg-4" />
    </div>
  </div>
</template>
