<template>
  <div class="w-full animate-pulse rounded-lg bg-bg-2 p-6 font-['Inter']">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-1 gap-4 overflow-hidden">
          <div
            v-for="index in 6"
            :key="`coin-${index}`"
            class="h-9 min-w-0 flex-1 rounded-full bg-bg-4"
          />
        </div>
        <div class="h-9 w-[121px] shrink-0 rounded-full bg-bg-4" />
      </div>

      <div>
        <div class="h-[17px] w-[114px] rounded bg-bg-4" />
        <div class="mt-2 grid grid-cols-6 gap-4">
          <div v-for="index in 6" :key="`channel-${index}`" class="h-9 rounded-lg bg-bg-4" />
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-4">
            <div class="h-5 w-28 rounded bg-bg-4" />
            <div class="h-5 w-[122px] rounded bg-bg-4" />
          </div>
          <div class="h-12 rounded-lg bg-bg-4" />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-4 border-b border-opacity-10 pb-2">
            <div class="h-5 w-[89px] rounded bg-bg-4" />
            <div class="h-3.5 w-px shrink-0 bg-opacity-10" />
            <div class="h-5 w-20 rounded bg-bg-4" />
            <div class="h-3.5 w-px shrink-0 bg-opacity-10" />
            <div class="h-5 w-[82px] rounded bg-bg-4" />
            <div class="h-3.5 w-px shrink-0 bg-opacity-10" />
            <div class="h-5 w-[88px] rounded bg-bg-4" />
          </div>
          <div class="h-[15px] w-52 rounded bg-bg-4" />
        </div>

        <div class="rounded-2xl bg-bg-4 p-2">
          <div class="flex flex-col gap-2">
            <div v-for="index in 2" :key="`address-${index}`" class="h-10 rounded-lg bg-bg-2" />
          </div>
          <div class="mt-2 flex justify-center">
            <div class="h-5 w-[72px] rounded bg-bg-2" />
          </div>
        </div>
      </div>

      <div class="h-12 rounded bg-bg-4" />

      <div class="flex items-center justify-center gap-4">
        <div class="h-5 w-[143px] rounded bg-bg-4" />
        <div class="h-6 w-[121px] rounded bg-bg-4" />
      </div>
    </div>
  </div>
</template>
