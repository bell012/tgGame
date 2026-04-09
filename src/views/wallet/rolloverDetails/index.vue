<template>
  <div class="fixed inset-0 bg-bg-1 overflow-y-auto">
    <H5Header :title="$t('wallet.rolloverDetails')" />

    <div class="py-3.5 px-3.5">
      <div class="bg-bg-2 rounded-lg px-3.5 pb-3.5 pt-[30px] flex flex-col items-center">
        <p
          :class="detail.direction === 'add' ? 'text-secondary-2' : 'text-secondary-4'"
          class="text-[25px] font-[700] mb-2.5"
        >
          {{ detail.amount }}
        </p>

        <h2 class="text-text-1 text-sm font-[700] mb-[30px]">{{ detail.gameName }}</h2>

        <!-- 详细信息列表 -->
        <div class="w-full space-y-5 bg-bg-4 rounded-lg p-3.5">
          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('betDetails.currency') }}</span>
            <span class="text-text-1 text-sm">{{ detail.currency }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('wallet.actualTurnover') }}</span>
            <span class="text-text-1 text-sm">{{ detail.actualTurnover }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('wallet.requiredTurnover') }}</span>
            <span class="text-text-1 text-sm">{{ detail.requiredTurnover }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('wallet.applicableGames') }}</span>
            <span class="text-text-1 text-sm">{{ detail.applicableGames }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('personalCenter.remarks') }}</span>
            <span
              class="text-sm"
              :class="detail.status ? 'text-secondary-4' : 'text-secondary-2'"
              >{{
                detail.status ? $t('transaction.completed') : $t('transaction.notCompleted')
              }}</span
            >
          </div>

          <div class="flex items-center justify-between">
            <span class="text-text-3 text-sm">{{ $t('betDetails.createdAt') }}</span>
            <span class="text-text-1 text-sm">{{ detail.createdAt }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { createEmptyRolloverItem, type Item } from '../rollover/shared'

const { t } = useI18n()
const router = useRouter()

const detail = ref<Item>(createEmptyRolloverItem(t))

onMounted(() => {
  const state = history.state as { data?: string }

  if (state?.data) {
    try {
      detail.value = JSON.parse(state.data) as Item
    } catch (error) {
      console.error(error)
      router.back()
    }
  } else {
    router.back()
  }
})
</script>

<style scoped lang="scss"></style>
