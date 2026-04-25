<template>
  <section class="fixed inset-0 overflow-y-auto bg-bg-1">
    <div class="min-h-screen bg-bg-1" style="font-family: Inter, avertastd, sans-serif">
      <H5Header
        title="Rebate Records"
        :show-sort="true"
        :right-icon="supportHeaderIcon"
        @sort="handleSupportClick"
      />

      <main class="px-[14px] pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[14px]">
        <RebateRecordsContent />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import H5Header from '@/components/common/H5Header.vue'
import { sideIcons } from '@/static/svg/side'
import RebateRecordsContent from '../components/records/RebateRecordsContent.vue'

const { side } = sideIcons
const supportHeaderIcon = side.helpIcon

const handleSupportClick = () => {
  console.log('open live support')
}
</script>

<style scoped lang="scss"></style>
