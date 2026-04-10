<template>
  <div>
    <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
      <div class="min-h-screen bg-bg-1">
        <H5Header :title="t('common.changeLoginPassword')" />

        <main class="px-3.5 py-[30px]">
          <MobileLayout />
        </main>
      </div>
    </section>

    <PcLayout v-else />
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import MobileLayout from './mobile-layout.vue'
import PcLayout from './pc-layout.vue'

const { t } = useI18n()
const isMobile = useIsMobile()
</script>

<style scoped lang="scss"></style>
