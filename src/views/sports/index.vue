<template>
  <div class="sports-page mt-[60px]">
    体育
    <!-- 联赛tabs -->
    <Liansai_tabs />
    <!-- 赛事筛选和搜索 -->
    <Filter_search class="mt-[16px]" />
  </div>
</template>

<script setup lang="ts">
import Liansai_tabs from './components/liansai_tabs.vue'
import Filter_search from './components/filter_search.vue'
</script>

<style scoped lang="scss"></style>
