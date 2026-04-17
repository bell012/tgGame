<template>
  <section class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header :title="t('personalCenter.rebate')" />

    <main class="p-3.5">
      <section class="rounded-[10px] bg-bg-2 px-3.5 py-4 text-center text-sm text-text-2">
        {{ t('referral.comingSoon') }}
      </section>
    </main>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'

const { t } = useI18n()
</script>
