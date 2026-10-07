<template>
  <div class="min-h-full bg-bg-1">
    <template v-if="isMobile">
      <H5Header :title="t('aboutPage.title')" />
      <main class="h-[calc(100dvh-49px)] overflow-y-auto p-3.5">
        <section class="rounded-[10px] bg-bg-2 p-3.5">
          <AboutContent :mobile="true" />
        </section>
      </main>
    </template>

    <template v-else>
      <main class="mx-auto max-w-[1336px] p-[24px]">
        <section class="rounded-[16px] bg-bg-2 p-[24px]">
          <AboutContent />
        </section>
      </main>
      <CommonFooter />
    </template>
  </div>
</template>

<script setup lang="ts">
import CommonFooter from '@/components/commonFooter.vue'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import AboutContent from './components/AboutContent.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
</script>
