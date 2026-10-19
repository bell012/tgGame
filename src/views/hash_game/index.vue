<template>
  <HashGameH5 :page="page" />
</template>

<script setup lang="ts">
import HashGameH5 from './h5.vue'
import { useHashGamePage } from './index'

const page = useHashGamePage()
</script>
