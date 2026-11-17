<template>
  <div class="w-full animate-pulse">
    <div class="flex w-full flex-col gap-[15px] rounded-[10px] bg-bg-2 p-[14px]">
      <div class="h-9 rounded-[8px] bg-bg-4"></div>

      <div class="flex flex-col gap-[10px]">
        <div class="h-4 w-24 rounded bg-bg-4"></div>
        <div class="flex gap-[5px]">
          <div
            v-for="index in 3"
            :key="`type-${index}`"
            class="h-9 flex-1 rounded-[8px] bg-bg-4"
          ></div>
        </div>
      </div>

      <div class="flex flex-col gap-[10px]">
        <div class="h-4 w-28 rounded bg-bg-4"></div>
        <div class="grid grid-cols-3 gap-[7px]">
          <div
            v-for="index in 6"
            :key="`method-${index}`"
            class="h-[58px] rounded-[8px] bg-bg-4"
          ></div>
        </div>
      </div>

      <div class="flex flex-col gap-[10px]">
        <div class="h-4 w-24 rounded bg-bg-4"></div>
        <div class="h-[45px] rounded-[8px] bg-bg-4"></div>
      </div>

      <div class="rounded-[8px] bg-bg-4 p-[10px]">
        <div class="grid grid-cols-3 gap-[6px]">
          <div v-for="index in 6" :key="`preset-${index}`" class="h-10 rounded-[7px] bg-bg-2"></div>
        </div>
      </div>
    </div>

    <div class="mt-5 h-[47px] rounded-[8px] bg-bg-4"></div>
  </div>
</template>
