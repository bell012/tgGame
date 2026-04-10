<template>
  <div>
    <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
      <div class="min-h-screen bg-bg-1">
        <H5Header :title="t('common.security')" />

        <main class="p-3.5">
          <MobileLayout />
        </main>
      </div>
    </section>

    <SettingsLayout v-else current-tab="security">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </SettingsLayout>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import H5Header from '@/components/common/H5Header.vue'
import MobileLayout from './mobile-layout.vue'
import PcLayout from './pc-layout.vue'
import SettingsLayout from '../index.vue'

const { t } = useI18n()
const isMobile = useIsMobile()
const userStore = useUserStore()

const refreshUserData = () => {
  void userStore.refreshCurrentUserData()
}

onMounted(refreshUserData)
onActivated(refreshUserData)
</script>

<style scoped lang="scss"></style>
