<template>
  <!-- 代理介绍页面 -->
  <section class="min-h-screen bg-bg-1 -mx-[14px] sm:mx-auto sm:max-w-[420px]">
    <!-- 页面容器 -->
    <div class="min-h-screen bg-bg-1" style="font-family: Inter, avertastd, sans-serif">
      <!-- 顶部导航栏 -->
      <H5Header :title="$t('referral.title')" />

      <!-- 页面主体（内容暂空） -->
      <main class="px-[14px] pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[14px]"></main>
    </div>
  </section>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
</script>
