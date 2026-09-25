<template>
  <!-- 无客服可用时的主题空状态。 -->
  <ThemedEmptyState
    :dark-image="defaultImgDark"
    :light-image="defaultImgLight"
    :image-alt="t('chatPublic.customerServiceList')"
    :message="t('chatPublic.noAgentsOnline')"
    :container-class="
      props.displayMode === 'pc'
        ? 'flex flex-1 justify-center px-6 py-10'
        : 'flex flex-1 justify-center px-6 pb-[72px]'
    "
    image-class="h-[200px] w-[220px] object-contain"
    text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
  />
</template>

<script setup lang="ts">
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'

import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{ displayMode?: 'h5' | 'pc' }>(), {
  displayMode: 'h5'
})
const { t } = useI18n()
</script>
