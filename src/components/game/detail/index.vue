<template>
  <div class="w-full h-full">
    <h5-header>Queen of Bounty</h5-header>
    <div class="mt-[12px] rounded-md overflow-hidden">
      <currency-info></currency-info>
      <currency-bar></currency-bar>
    </div>
  </div>
</template>
<script setup lang="ts">
import H5Header from './h5/header.vue'
import CurrencyInfo from './h5/currency-info/index.vue'
import CurrencyBar from './currency-bar/index.vue'
</script>
<style scoped lang="scss"></style>
