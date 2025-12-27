<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>
    <router-view />
    <ReloadPrompt />
    <InstallPrompt />
  </div>
</template>

<script setup lang="ts">
import ReloadPrompt from '@/components/ReloadPrompt.vue'
import InstallPrompt from '@/components/InstallPrompt.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

