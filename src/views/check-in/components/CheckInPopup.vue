<template>
  <!-- 将签到弹窗挂载到 body，避免受页面层级影响 -->
  <Teleport to="body">
    <!-- 签到弹窗遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex items-start justify-center overflow-hidden sm:items-center sm:bg-mask-60-1 sm:px-4 sm:py-8 sm:backdrop-blur-[2px]"
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
        @close="handleClose"
        @rules="$emit('rules')"
        @action="$emit('action')"
      />
      <!-- PC 签到弹窗布局 -->
      <CheckInPcLayout
        v-else
        :view-data="viewData"
        @close="handleClose"
        @rules="$emit('rules')"
        @action="$emit('action')"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency } from '@/utils/locale'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createCheckInViewData,
  createDefaultCheckInViewData,
  type CheckInViewData
} from '../shared'
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

const isLoggedIn = computed(() => {
  return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
})

const loadCheckInData = async () => {
  if (!props.modelValue || !isLoggedIn.value || isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    const activityListResponse = await Api.activity.queryActivityList({
      size: 100,
      current: 1
    })
    const checkInActivity = activityListResponse.result?.records?.find(record => {
      return Number(record.type) === 5 && Number(record.status) === 2 && record.ended !== true
    })

    if (!checkInActivity?.rowId) {
      return
    }

    const checkInStatusResponse = await Api.activity.queryCheckInStatus({
      activityId: checkInActivity.rowId
    })

    viewData.value = createCheckInViewData(checkInActivity, checkInStatusResponse.result, {
      currencyCode: acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency(),
      languageCode: locale.value
    })
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 关闭签到弹窗并同步外层显示状态。
const handleClose = () => {
  emit('update:modelValue', false)
}

watch(
  [() => props.modelValue, isLoggedIn, () => locale.value],
  ([visible, loggedIn]) => {
    if (visible && loggedIn) {
      void loadCheckInData()
    }
  },
  { immediate: true }
)
</script>
