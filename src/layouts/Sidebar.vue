<template>
  <aside class="sidebar">
    <nav class="p-4">
      <ul class="space-y-2">
        <li>
          <router-link
            :to="getLocalePath('/casino')"
            class="nav-item"
            :class="{ active: isActive('/casino') }"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">🎰</span>
              <span class="font-medium">娱乐城</span>
            </div>
          </router-link>
        </li>
        <li>
          <router-link
            :to="getLocalePath('/sports')"
            class="nav-item"
            :class="{ active: isActive('/sports') }"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">⚽</span>
              <span class="font-medium">体育</span>
            </div>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isActive = (path: string) => {
  const currentPath = route.path.replace(/^\/(zh|en)/, '')
  return computed(() => currentPath === path).value
}

const getLocalePath = (path: string) => {
  const locale = route.params.locale as string
  if (!locale || locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 4rem;
  bottom: 0;
  width: 16rem;
  background-color: var(--color-background-level-1);
  box-shadow: 2px 0 4px var(--color-mask-20);
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-text-level-2);
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: var(--color-opacity-8);
  color: var(--color-text-level-1);
}

.nav-item.active {
  background-color: var(--color-theme-level-1);
  color: var(--color-text-level-4);
}
</style>
