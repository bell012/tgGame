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

    <PcLayout v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useUserStore } from '@/stores/user'
import MobileLayout from './mobile-layout.vue'
import PcLayout from './pc-layout.vue'

const { t } = useI18n()
const isMobile = useIsMobile()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

userStore.syncStoredUserData()

const pageTitle = computed(() =>
  userInfo.value?.busiPwd
    ? t('common.changeTransactionPassword')
    : t('common.setTransactionPassword')
)
</script>

<style scoped lang="scss"></style>
