<template>
  <div class="w-full space-y-2.5 animate-pulse font-['Inter']">
    <div class="rounded-[10px] bg-bg-2 p-3.5">
      <div class="h-4 w-24 rounded bg-bg-4" />
      <div class="mt-2.5 flex gap-2 overflow-hidden">
        <div
          v-for="index in 4"
          :key="`method-${index}`"
          class="h-[60px] w-[93px] shrink-0 rounded-xl bg-bg-4"
        />
      </div>
    </div>

    <div class="rounded-[10px] bg-bg-2 p-3.5">
      <div class="flex items-center justify-between gap-3">
        <div class="h-4 w-24 rounded bg-bg-4" />
        <div class="h-4 w-28 rounded bg-bg-4" />
      </div>
      <div class="mt-2 h-[45px] rounded-lg bg-bg-4" />
    </div>

    <div class="rounded-[10px] bg-bg-2 p-3.5">
      <div class="flex items-center justify-between gap-3">
        <div class="h-4 w-24 rounded bg-bg-4" />
        <div class="h-4 flex-1 max-w-28 rounded bg-bg-4" />
      </div>
      <div class="mt-2 h-[45px] rounded-lg border border-opacity-10 bg-bg-4" />

      <div class="mt-3.5">
        <div class="rounded-tl-lg rounded-tr-lg bg-bg-4 p-2.5">
          <div class="grid grid-cols-3 gap-2">
            <div v-for="index in 6" :key="`preset-${index}`" class="h-10 rounded-[5px] bg-bg-2" />
          </div>
        </div>
        <div class="relative -mt-3 rounded-bl-lg rounded-br-lg bg-bg-4 p-1.5">
          <div class="mx-auto h-4 w-[52px] rounded-[5px] bg-bg-2" />
        </div>
      </div>

      <div class="mt-5 h-10 rounded-lg bg-bg-4" />
    </div>
  </div>
</template>
