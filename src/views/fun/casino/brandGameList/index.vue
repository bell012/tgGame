<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="pageTitle" />
      <div
        ref="mobileScrollRef"
        class="casino-fullpage-scroll-y flex-1 min-h-0 overflow-y-auto px-[14px] pt-2.5 pb-4"
      >
        <pageStyle2 :query-options="queryOptions" />
      </div>
    </div>

    <div v-else class="w-full p-4">
      <div class="mb-4 flex items-center gap-3">
        <button
          type="button"
          class="flex size-[33px] items-center justify-center rounded-md bg-opacity-5"
          @click="handleBack"
        >
          <ArrowLeftIcon class="h-3.5 w-3.5 text-text-1" />
        </button>
        <h1 class="font-inter text-2xl font-extrabold text-text-1">
          {{ pageTitle }}
        </h1>
      </div>

      <pageStyle2 :query-options="queryOptions" />
      <CommonFooter class="mt-[40px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import H5Header from '@/components/common/H5Header.vue'
import CommonFooter from '@/components/commonFooter.vue'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import { useIsMobile } from '@/composables/useMediaQuery'
import pageStyle2 from '../components/pageStyle2.vue'

interface Props {
  brandCode: string
  brandName?: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const mobileScrollRef = ref<HTMLElement | null>(null)

const brandCode = computed(() => String(props.brandCode || '').trim())
const pageTitle = computed(() => {
  const normalizedBrandName = String(props.brandName || '').trim()

  if (normalizedBrandName) {
    return normalizedBrandName
  }

  return t('sidebar_menu.casino.children.game_providers')
})
const queryOptions = computed(() => ({
  rowType: 3,
  pageSize: isMobile.value ? 27 : 32,
  brandCodes: brandCode.value ? [brandCode.value] : []
}))

const handleBack = () => {
  router.back()
}

const scrollPageToTop = () => {
  nextTick(() => {
    mobileScrollRef.value?.scrollTo({
      top: 0,
      behavior: 'auto'
    })

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  })
}

onMounted(() => {
  scrollPageToTop()
})

watch(
  () => route.fullPath,
  () => {
    scrollPageToTop()
  }
)
</script>

<style scoped lang="scss">
/* 仅本页：抵消 _base 全局隐藏滚动条；样式与 _base 中轨道/滑块变量一致 */
.casino-fullpage-scroll-y {
  scrollbar-width: thin;
  scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track);
}

.casino-fullpage-scroll-y::-webkit-scrollbar {
  display: block !important;
  width: 4px;
  height: 4px;
}

.casino-fullpage-scroll-y::-webkit-scrollbar-track {
  background-color: var(--color-scrollbar-track);
}

.casino-fullpage-scroll-y::-webkit-scrollbar-thumb {
  background-color: var(--color-scrollbar-thumb);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-scrollbar-thumb-hover);
  }
}
</style>
