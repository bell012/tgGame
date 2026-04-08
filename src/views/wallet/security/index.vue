<template>
  <div>
    <section
      v-if="isReady && isMobile"
      class="fixed inset-0 overflow-y-auto bg-bg-1 md:hidden flex flex-col"
    >
      <H5Header :title="t('personalCenter.globalSetting')" />

      <div class="flex-1 py-3.5 px-3.5">
        <H5Layout />
      </div>
    </section>

    <WalletLayout v-else-if="isReady" current-tab="security-situation">
      <div class="bg-bg-2 rounded-xl overflow-hidden">
        <PcLayout />
      </div>
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import WalletLayout from '../index.vue'
import PcLayout from './pc.vue'
import H5Layout from './h5.vue'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)

onMounted(() => {
  isReady.value = true
})
</script>

<style scoped lang="scss"></style>
