<template>
  <div>
    <div
      v-if="isReady && isMobile"
      class="myVouchers-mobile-page fixed inset-0 bg-bg-1 sm:hidden flex flex-col overflow-hidden"
    >
      <H5Header
        :title="$t('vouchers.myVouchers')"
        :show-sort="true"
        :right-icon="VoucherHistoryIcon"
        @sort="handleVoucherHistoryClick"
      />

      <div class="flex-1 min-h-0 overflow-y-auto px-3.5 py-3.5">
        <div
          v-if="error && dataList.length === 0"
          class="flex flex-col items-center justify-center mt-[100px] gap-3"
        >
          <p class="text-secondary-4 text-xs font-[500]" @click="fetchData">
            {{ $t('common.requestError') }}
          </p>
        </div>

        <div
          v-else-if="!loading && dataList.length === 0"
          class="flex flex-col items-center justify-center mt-[100px]"
        >
          <ThemedEmptyState
            :dark-image="defaultImgDark"
            :light-image="defaultImgLight"
            :image-alt="$t('common.noData')"
            :message="$t('common.noData')"
            container-class="mt-0"
            image-class="h-[200px] w-auto mb-2.5"
            text-class="text-text-1 text-xs font-[500]"
          />
        </div>

        <div v-else class="flex flex-col pb-[10px]">
          <div
            v-for="item in dataList"
            :key="item.id"
            class="overflow-hidden rounded-[10px] bg-bg-2"
          >
            <!-- 顶部信息区 -->
            <div class="flex items-center gap-[10px] px-[14px] py-[10px]">
              <img :src="item.icon" :alt="item.title" class="h-[56px] w-[50px] object-contain" />
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-[700] text-text-1">
                  {{ item.title }}
                </h3>
                <p class="mt-[3px] truncate text-xs text-text-2">{{ item.description }}</p>
                <p class="mt-[10px] truncate text-[10px] text-text-2">
                  {{ $t('vouchers.validFrom') }}:{{ item.validFromText }}
                </p>
              </div>

              <button
                type="button"
                class="h-[30px] shrink-0 rounded-[8px] bg-theme-primary px-[14px] py-[7px] text-xs font-[500] text-text-4"
                @click="handleUseNow(item)"
              >
                {{ $t('vouchers.useNow') }}
              </button>
            </div>

            <!-- 底部倒计时区 -->
            <div class="flex items-center bg-opacity-6 px-[14px] py-[10px]">
              <Countdown class="w-3 h-3 text-text-2 mr-[3px]" />
              <span class="text-xs text-text-2 mr-[4px]">{{ $t('vouchers.expiresIn') }} :</span>
              <div class="flex items-center gap-0.5">
                <template v-for="(char, idx) in item.expiresInText.split('')" :key="idx">
                  <span v-if="char === ':'" class="text-xs font-[700] text-text-2">:</span>
                  <span
                    v-else
                    class="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-opacity-10 text-xs font-[700] text-text-2"
                  >
                    {{ char }}
                  </span>
                </template>
              </div>
            </div>
          </div>

          <p v-if="loading" class="py-3 text-center text-xs text-text-2">
            {{ $t('common.loading') }}
          </p>
        </div>
      </div>
    </div>

    <WalletLayout v-else-if="isReady" current-tab="myVouchers">
      <PcLayout />
    </WalletLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import H5Header from '@/components/common/H5Header.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import Countdown from '@/static/svg/countdown.svg?component'
import VoucherHistoryIcon from '@/static/svg/voucher_History.svg?component'
import WalletLayout from '../index.vue'
import PcLayout from './pc-layout.vue'
import { useMyVouchersPage } from './shared'
import { navigateTo } from '@/utils/router'

const isMobile = useIsMobile()
const isReady = ref(false)
const { loading, error, dataList, fetchData, handleUseNow } = useMyVouchersPage()

// 跳转到票卷记录
const handleVoucherHistoryClick = () => {
  navigateTo('/voucherHistory')
}

onMounted(() => {
  isReady.value = true
})
</script>

<style scoped lang="scss">
.myVouchers-mobile-page {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
}
</style>
