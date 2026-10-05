<template>
  <div>
    <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
      <div class="min-h-screen bg-bg-1">
        <H5Header :title="pageTitle" />

        <main class="px-3.5 pb-[30px]">
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
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import H5Header from '@/components/common/H5Header.vue'
import MobileLayout from './mobile-layout.vue'
import PcLayout from './pc-layout.vue'

const { t } = useI18n()
const isMobile = useIsMobile()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const pageTitle = computed(() => {
  const hasLoginMobile =
    String(userInfo.value?.areaCode ?? '').trim().length > 0 &&
    String(userInfo.value?.telephone ?? '').trim().length > 0

  return hasLoginMobile ? t('common.changeMobileNumber') : t('common.setMobileNumber')
})
</script>

<style scoped lang="scss"></style>
