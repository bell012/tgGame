<template>
  <div class="currency-info-container">
    <div class="image-content relative w-full h-[640px]">
      <img
        class="absolute top-0 left-0 w-full h-full object-cover rounded-t-[20px]"
        alt=""
        :src="gameImg"
      />
    </div>
    <currency-bar></currency-bar>
  </div>
</template>
<script setup lang="ts">
import gameImg from '@/static/img/explore/game.png'
import CurrencyBar from '../currency-bar/index.vue'
</script>
<style scoped lang="scss"></style>
