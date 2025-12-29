<template>
  <div class="home-page">
    {{ t('home.home') }}
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped lang="scss"></style>
