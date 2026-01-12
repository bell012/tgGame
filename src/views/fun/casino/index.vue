<template>
  <div class="casino-page p-0 sm:p-4 h-full h-screen">
    <div class="banner bg-bg-3 relative aspect-[1.73] sm:aspect-[4.785] rounded-xl">
      <img
        class="absolute right-0 bottom-0 h-full"
        src="/src/static/img/casino/banner_bg.webp"
        alt="casino"
      />
      <div
        class="absolute left-2 top-0 flex h-full origin-top flex-col py-4 sm:left-[14%] sm:top-[6%] sm:h-auto sm:items-center sm:py-0 sm:text-center"
      >
        <h1
          class="font-inter text-[20px] font-bold leading-normal text-[var(--color-text-level-1,#FFF)]"
        >
          Stay Untamed
        </h1>
        <div>
          <h2
            class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]"
          >
            Sign Up & Get Up To
          </h2>
          <h2
            class="font-inter text-[14px] font-bold leading-normal text-[var(--color-theme-level-1,#2AEE88)]"
          >
            ₱1,176,029.77
          </h2>
          <h2
            class="font-inter text-[12px] font-medium leading-[18px] text-[var(--color-text-level-1,#FFF)]"
          >
            in Casino or Sports
          </h2>
        </div>
        <button
          class="flex justify-center items-center mt-auto w-[94px] h-[35px] py-[9px] px-[15px] pl-[16px] rounded-lg bg-[linear-gradient(90deg,#24EE89_0%,#9FE871_100%)] shadow-[0_0_12px_rgba(35,238,136,0.3),0_-2px_0_#1DCA6A_inset] font-inter text-[14px] font-bold leading-normal text-center text-[var(--color-text-level-4,#000)]"
          type="button"
          @click.stop="showLoginModal = true"
        >
          {{ t('locales.home.join_now') }}
        </button>
      </div>
    </div>
    <div
      class="relative flex items-center self-stretch py-[10px] px-[10px] rounded-lg border mt-[10px] border-[var(--color-opacity-10,rgba(255,255,255,0.1))] bg-[var(--color-opacity-6,rgba(255,255,255,0.06))] focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-400/40 transition"
    >
      <img class="w-[18px] h-[18px]" src="/src/static/img/casino/search.webp" alt="search" />
      <input
        v-model="searchText"
        @focus="showHistoryPanel = true"
        @blur="showHistoryPanel = false"
        class="flex-1 ml-[10px] h-[18px] bg-transparent outline-none focus:outline-none focus:ring-0"
        placeholder="Search games"
      />
      <button
        v-show="searchText"
        class="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-1 rounded-lg flex items-center justify-center z-10"
        @click="searchText = ''"
      >
        <CloseIcon class="w-[18px] h-[18px] fill-text-1" />
      </button>
      <div
        v-show="showHistoryPanel && !searchText"
        class="absolute left-0 right-0 p-4 top-full w-full z-20 mt-4 shadow-lg rounded-lg border border-input"
      >
        <button
          class="absolute -right-2 -top-2 w-5 h-5 bg-bg-4 flex items-center justify-center z-10 rounded-full"
          @click="showHistoryPanel = false"
        >
          <CloseIcon class="w-[12px] h-[12px] fill-text-1" />
        </button>
        <div class="history">
          <div>历史</div>
        </div>
        <div class="suggested">
          <div>建议</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 注册弹窗 -->
  <LoginModal v-model="showLoginModal" default-tab="register" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LoginModal from '@/components/login_register/LoginModal.vue'
import CloseIcon from '@/static/svg/close.svg?component'

const { t } = useI18n()

const showLoginModal = ref(false)
const showHistoryPanel = ref(false)
const searchText = ref('')
</script>
