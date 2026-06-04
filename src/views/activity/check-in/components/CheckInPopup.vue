<template>
  <!-- 将签到弹窗挂载到 body，避免受页面层级影响 -->
  <Teleport to="body">
    <!-- 签到弹窗遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex h-[100dvh] w-screen items-start justify-center overflow-hidden sm:h-auto sm:w-auto sm:items-center sm:bg-mask-60-1 sm:px-4 sm:py-8 sm:backdrop-blur-[2px]"
      :style="
        isMobile
          ? { background: 'var(--color-mask-60-1, #00000099)', backdropFilter: 'blur(5px)' }
          : undefined
      "
    >
      <!-- H5 签到弹窗布局 -->
      <CheckInMobileLayout
        v-if="isMobile"
        :view-data="viewData"
        :loading="isContentLoading"
        @close="handleClose"
        @rules="$emit('rules')"
        @action="$emit('action')"
      />
      <!-- PC 签到弹窗布局 -->
      <CheckInPcLayout
        v-else
        :view-data="viewData"
        :loading="isContentLoading"
        @close="handleClose"
        @rules="$emit('rules')"
        @action="$emit('action')"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency } from '@/utils/locale'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createDefaultCheckInViewData, type CheckInViewData } from '../shared'
import { loadActiveCheckInData } from '../checkInData'
import CheckInMobileLayout from '../mobile-layout.vue'
import CheckInPcLayout from '../pc-layout.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  rules: []
  action: []
}>()

const isMobile = useIsMobile()
const userStore = useUserStore()
const { acctInfo, userInfo } = storeToRefs(userStore)
const { locale } = useI18n()
const viewData = ref<CheckInViewData>(createDefaultCheckInViewData())
const isLoading = ref(false)
const hasLoaded = ref(false)

usePageScrollLock(() => props.modelValue)

const isLoggedIn = computed(() => {
  return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
})

const currentChannelId = computed(() => {
  return isMobile.value ? '4' : '3'
})

const isContentLoading = computed(() => {
  return props.modelValue && isLoggedIn.value && !hasLoaded.value
})

const loadCheckInData = async () => {
  if (!props.modelValue || !isLoggedIn.value || isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    const checkInData = await loadActiveCheckInData({
      channelId: currentChannelId.value,
      currencyCode: acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency(),
      languageCode: locale.value
    })

    viewData.value = checkInData?.viewData ?? createDefaultCheckInViewData()
  } catch (error) {
    console.error(error)
  } finally {
    hasLoaded.value = true
    isLoading.value = false
  }
}

// 关闭签到弹窗并同步外层显示状态。
const handleClose = () => {
  emit('update:modelValue', false)
}

watch(
  [() => props.modelValue, isLoggedIn, () => locale.value, currentChannelId],
  ([visible, loggedIn]) => {
    if (!visible) {
      hasLoaded.value = false
      return
    }

    if (visible && loggedIn) {
      hasLoaded.value = false
      void loadCheckInData()
      return
    }

    hasLoaded.value = true
  },
  { immediate: true }
)
</script>
