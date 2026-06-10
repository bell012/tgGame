<template>
  <div class="w-full animate-pulse rounded-lg bg-bg-2 p-6 font-['Inter']">
    <div class="flex flex-col gap-4">
      <div>
        <div class="h-5 w-[118px] rounded bg-bg-4" />
        <div class="mt-2 flex gap-4">
          <div
            v-for="index in 4"
            :key="`method-${index}`"
            class="h-[62px] min-w-0 flex-1 rounded-xl bg-bg-4"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between gap-4">
          <div class="h-5 w-[118px] shrink-0 rounded bg-bg-4" />
          <div class="h-5 min-w-0 flex-1 rounded bg-bg-4" />
        </div>
        <div class="mt-2 h-12 rounded-lg border border-opacity-10 bg-bg-4" />
      </div>

      <div>
        <div class="rounded-2xl bg-bg-4 p-2">
          <div class="flex flex-col gap-2">
            <div v-for="index in 2" :key="`preset-${index}`" class="h-10 rounded-lg bg-bg-2" />
          </div>
          <div class="mt-2 flex justify-center">
            <div class="h-5 w-[72px] rounded bg-bg-2" />
          </div>
        </div>
        <div class="mt-4 h-12 rounded bg-bg-4" />
      </div>
    </div>
  </div>
</template>
