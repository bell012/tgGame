<template>
  <header class="top-nav">
    <div class="h-full flex items-center justify-between">
      <!-- 左侧 -->
      <div class="flex items-center px-4">
        <img src="@/static/svg/fold.svg" alt="fold" class="w-[40px] h-[40px] cursor-pointer" />
        <router-link to="/" class="w-[140px] h-[60px] ml-5 flex items-center">
          <img src="@/static/svg/logo.svg" alt="fold" />
        </router-link>
      </div>

      <!-- 右侧 -->
      <div class="flex-1 flex items-center justify-end px-3">
        <div class="cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3">
          <img src="@/static/svg/search.svg" alt="search" class="w-[24px] h-[24px]" />
        </div>
        <div class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center bg-transparent border-2 border-[#e4eaf019] mr-1">登入</div>
        <div class="cursor-pointer min-w-[96px] h-[40px] px-4 rounded-lg flex items-center justify-center btn-primary mr-3">注册</div>
        <div class="cursor-pointer search w-[40px] h-[40px] rounded-lg mr-3">
          <img src="@/static/svg/chat.svg" alt="message" class="w-[24px] h-[24px]" />
        </div>
        <div class="flex items-center justify-center w-auto h-[40px] rounded-lg overflow-hidden relative">
          <div class="cursor-pointer search w-[40px] h-[40px]">
            <img src="@/static/svg/language.svg" alt="search" class="w-[24px] h-[24px]" />
          </div>
          <div class="absolute left-10 top-2 h-6 w-[1px] line"></div>
          <div class="cursor-pointer search w-auto h-[40px] px-2">
            <span class="text">CNY</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">

</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--color-background-level-5);
  box-shadow:0px 4px 8px 0px rgba(0, 0, 0, 0.05);
  z-index: 50;
}
.search {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-level-3);
}
.text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-level-2);
}
.line {
  background-color: #e4eaf019;
}
</style>
