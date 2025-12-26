<template>
  <div class="min-h-screen bg-gray-100">
    <router-view />
    <ReloadPrompt />
    <InstallPrompt />
  </div>
</template>

<script setup lang="ts">
import ReloadPrompt from '@/components/ReloadPrompt.vue'
import InstallPrompt from '@/components/InstallPrompt.vue'
</script>

