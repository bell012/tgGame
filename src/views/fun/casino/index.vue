<template>
  <div class="casino-page p-0 sm:p-4">
    <div class="banner bg-bg-3 relative aspect-[1.73] sm:aspect-[4.785] rounded-xl">
          <img class="absolute right-0 bottom-0 h-full" src="/src/static/img/casino/banner_bg.webp" alt="casino"/>
          <div class="absolute left-2 top-0 flex h-full origin-top flex-col py-4 sm:left-[14%] sm:top-[6%] sm:h-auto sm:items-center sm:py-0 sm:text-center">
            <h1 class="font-inter text-[20px] font-bold leading-normal text-[var(--color-text-level-1,#FFF)]">Stay Untamed</h1>
            <div>
              <h2 class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]">Sign Up & Get Up To</h2>
              <h2 class="font-inter text-[14px] font-bold leading-normal text-[var(--color-theme-level-1,#2AEE88)]">₱1,176,029.77</h2>
              <h2 class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]">in Casino or Sports</h2>
            </div>
            <button class="flex justify-center items-center mt-auto
              w-[94px] h-[35px] py-[9px] px-[15px] pl-[16px] 
              rounded-lg bg-[linear-gradient(90deg,#24EE89_0%,#9FE871_100%)]
              shadow-[0_0_12px_rgba(35,238,136,0.3),0_-2px_0_#1DCA6A_inset]
              font-inter text-[14px] font-bold leading-normal text-center text-[var(--color-text-level-4,#000)]" 
              type="button">{{ t('locales.home.join_now') }}</button>
          </div>
      </div>
      <div class="flex items-center self-stretch py-[10px] px-[10px] rounded-lg border mt-[10px]
      border-[var(--color-opacity-10,rgba(255,255,255,0.1))]
      bg-[var(--color-opacity-6,rgba(255,255,255,0.06))]
      focus-within:border-green-500
      focus-within:ring-2
      focus-within:ring-green-400/40
      transition
      ">
        <img class="w-[18px] h-[18px]" src="/src/static/img/casino/search.webp" alt="search"/>
        <input class="flex-1 ml-[10px] h-[18px] bg-transparent outline-none focus:outline-none focus:ring-0" placeholder="Search games">
      </div>

  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>
