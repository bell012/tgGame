<template>
  <div
    class="recent-games-container w-full h-full p-[12px] bg-[var(--color-background-level-3)] rounded-[10px] mt-[12px]"
  >
    <top-toggle />
    <transition name="open-fade">
      <div v-if="isOpen">
        <!-- 面板信息 -->
        <rginfo />
        <!-- tab -->
        <div
          class="flex h-[50px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[20px] p-[4px] max-w-[500px]"
        >
          <div
            v-for="tab in tabList"
            class="flex-1 flex items-center justify-center cursor-pointer"
            :class="{ active: tabValue === tab.value }"
            @click="tabIndexClick(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        <winlist v-if="tabValue === 1 || tabValue === 2" />
        <review v-if="tabValue === 3" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import TopToggle from './top-toggle.vue'
import Winlist from './winlist.vue'
import Rginfo from './rginfo.vue'
import Review from './review/index.vue'

const tabValue = ref(1)
const isOpen = ref(false)
provide('isRgOpen', isOpen)
const tabList = ref([
  { value: 1, label: 'High win' },
  { value: 2, label: 'Lucky win' },
  { value: 3, label: 'Review' }
])

const tabIndexClick = (index: number) => {
  tabValue.value = index
}
</script>

<style scoped lang="scss">
.active {
  background-color: var(--color-input-level-2);
  height: 100%;
  border-radius: 10px;
}
.open-fade-enter-active,
.open-fade-leave-active {
  transition: all 0.2s ease;
}
.open-fade-enter-from,
.open-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
