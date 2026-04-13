<template>
  <div>
    <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
      <div class="min-h-screen bg-bg-1">
        <H5Header :title="pageTitle" />

        <main class="px-3.5">
          <MobileLayout />
        </main>
      </div>
    </section>

    <SettingsLayout v-else current-tab="payment-methods">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <DesktopLayout />
      </div>
    </SettingsLayout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import MobileLayout from './mobile-layout.vue'
import DesktopLayout from './desktop-layout.vue'
import SettingsLayout from '../index.vue'

const { t } = useI18n()
const isMobile = useIsMobile()

const pageTitle = computed(() => t('payment_methods.title'))
</script>

<style scoped lang="scss"></style>
