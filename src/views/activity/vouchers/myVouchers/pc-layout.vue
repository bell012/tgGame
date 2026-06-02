<template>
  <div class="w-[1032px]">
    <div v-if="error && dataList.length === 0" class="flex h-[520px] items-center justify-center">
      <p class="cursor-pointer text-sm font-[700] text-secondary-4" @click="fetchData">
        {{ $t('common.requestError') }}
      </p>
    </div>
    <!-- 空状态 -->
    <ThemedEmptyState
      v-else-if="!loading && dataList.length === 0"
      :dark-image="defaultImgDark"
      :light-image="defaultImgLight"
      :image-alt="$t('common.noData')"
      :message="$t('common.noData')"
      container-class="h-[520px] justify-center"
      image-class="mb-2.5 h-[200px] w-auto"
      text-class="text-text-1 text-sm font-[700]"
    />

    <div v-else class="max-h-[720px] overflow-y-auto">
      <div class="grid grid-cols-2 gap-4">
        <div v-for="item in dataList" :key="item.id" class="overflow-hidden rounded-2xl bg-bg-2">
          <div class="flex items-center gap-[20px] p-[20px]">
            <img :src="item.icon" :alt="item.title" class="h-[85px] w-[75px] object-contain" />
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-xl font-[700] text-text-1">
                {{ item.title }}
              </h3>
              <p class="mt-1 truncate text-base text-text-2">{{ item.description }}</p>
              <p class="mt-1 truncate text-sm text-text-2">
                {{ $t('vouchers.validFrom') }}:{{ item.validFromText }}
              </p>
            </div>

            <button
              type="button"
              class="h-[36px] shrink-0 rounded-[8px] bg-theme-primary px-[24px] py-[8px] text-sm font-[700] text-text-4"
              @click="handleUseNow(item)"
            >
              {{ $t('vouchers.useNow') }}
            </button>
          </div>

          <!-- 底部倒计时区 -->
          <div class="flex items-center bg-opacity-6 px-[32px] py-[8px]">
            <Countdown class="w-5 h-5 text-text-2 mr-[8px]" />
            <span class="text-base text-text-2 mr-[8px]">{{ $t('vouchers.expiresIn') }} :</span>
            <div class="flex items-center gap-1">
              <template v-for="(char, idx) in item.expiresInText.split('')" :key="idx">
                <span v-if="char === ':'" class="text-xl font-[400] text-text-2">:</span>
                <span
                  v-else
                  class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-opacity-10 text-lg font-[700] text-text-2"
                >
                  {{ char }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <p v-if="loading" class="py-6 text-center text-sm text-text-2">
        {{ $t('common.loading') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import Countdown from '@/static/svg/countdown.svg?component'
import { useMyVouchersPage } from './shared'

const { loading, error, dataList, fetchData, handleUseNow } = useMyVouchersPage()
</script>

<style scoped></style>
