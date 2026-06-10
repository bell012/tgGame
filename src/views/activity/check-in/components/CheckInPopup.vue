<template>
  <!-- 将签到弹窗挂载到 body，避免受页面层级影响 -->
  <Teleport to="body">
    <!-- 签到弹窗遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex h-[100dvh] w-screen items-start justify-center overflow-hidden bg-mask-60-1 sm:h-auto sm:w-auto sm:items-center sm:px-4 sm:py-8 sm:backdrop-blur-[2px]"
      :style="isMobile ? { backdropFilter: 'blur(5px)' } : undefined"
    >
      <!-- H5 签到弹窗布局 -->
      <CheckInMobileLayout
        v-if="isMobile"
        :view-data="viewData"
        :loading="isContentLoading"
        :action-loading="isClaiming"
        @close="handleClose"
        @rules="$emit('rules')"
        @action="handleAction"
        @reward-click="handleRewardClick"
        @hero-use-now="handleHeroUseNow"
      />
      <!-- PC 签到弹窗布局 -->
      <CheckInPcLayout
        v-else
        :view-data="viewData"
        :loading="isContentLoading"
        :action-loading="isClaiming"
        @close="handleClose"
        @rules="$emit('rules')"
        @action="handleAction"
        @reward-click="handleRewardClick"
        @hero-use-now="handleHeroUseNow"
      />

      <!-- 绑定手机号提示弹窗 -->
      <CheckInBindPhonePromptPopup
        v-model="bindPhonePromptVisible"
        :page-mode="isMobile ? 'mobile' : 'pc'"
        @close="closeBindPhonePrompt"
        @confirm="handleBindPhonePromptConfirm"
      />

      <!-- 签到条件提醒弹窗 -->
      <CheckInRequirementReminderPopup
        v-if="requirementReminderVisible"
        :visible="requirementReminderVisible"
        :mode="requirementReminderMode"
        :items="requirementReminderItems"
        :page-mode="isMobile ? 'mobile' : 'pc'"
        @close="closeRequirementReminder"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useUserStore } from '@/stores/user'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { getCurrentCurrency } from '@/utils/locale'
import { navigateToName } from '@/utils/router'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  loadActiveCheckInDataList,
  loadCheckInActivityData,
  type ActiveCheckInData
} from '../checkInData'
import CheckInMobileLayout from '../mobile-layout.vue'
import CheckInPcLayout from '../pc-layout.vue'
import {
  createCheckInHeroRewardsFromClaimResult,
  createCheckInRequirementReminderData,
  createDefaultCheckInViewData,
  type CheckInHeroActionReward,
  type CheckInRequirementReminderItem,
  type CheckInRequirementReminderMode,
  type CheckInRewardItem,
  type CheckInViewData
} from '../shared'
import CheckInBindPhonePromptPopup from './CheckInBindPhonePromptPopup.vue'
import CheckInRequirementReminderPopup from './CheckInRequirementReminderPopup.vue'

// 后端 channel 枚举：3 表示 PC，4 表示 H5。
const CHECK_IN_PC_CHANNEL_ID = '3'
const CHECK_IN_H5_CHANNEL_ID = '4'

interface Props {
  modelValue: boolean
  autoPopupOnly?: boolean
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
const checkInDataQueue = ref<ActiveCheckInData[]>([])
const activeQueueIndex = ref(0)
const isLoading = ref(false)
const isClaiming = ref(false)
const hasLoaded = ref(false)
const requirementReminderVisible = ref(false)
const requirementReminderMode = ref<CheckInRequirementReminderMode>('all')
const requirementReminderItems = ref<CheckInRequirementReminderItem[]>([])
const bindPhonePromptVisible = ref(false)

usePageScrollLock(() => props.modelValue)

// 判断当前是否登录，未登录时不请求会员签到状态。
const isLoggedIn = computed(() => {
  return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
})

// 根据当前设备映射后端 channel：H5 为 4，PC 为 3。
const currentChannelId = computed(() => {
  return isMobile.value ? CHECK_IN_H5_CHANNEL_ID : CHECK_IN_PC_CHANNEL_ID
})

// 弹窗首次加载接口期间展示骨架，避免默认文案闪烁。
const isContentLoading = computed(() => {
  return props.modelValue && isLoggedIn.value && !hasLoaded.value
})

// 当前签到请求使用的币种上下文。
const activeCurrencyCode = computed(() => {
  return acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
})

// 当前登录用户是否已经绑定手机号。
const hasBoundTelephone = computed(() => Boolean(String(userInfo.value?.telephone ?? '').trim()))

// 当前正在展示的签到活动队列项。
const activeCheckInData = computed(() => checkInDataQueue.value[activeQueueIndex.value] ?? null)

// 将队列指定项同步到页面，切换活动时清理上一个活动的条件提醒。
const showCheckInDataAt = (index: number) => {
  const targetData = checkInDataQueue.value[index]

  if (!targetData) {
    return false
  }

  activeQueueIndex.value = index
  viewData.value = targetData.viewData
  closeRequirementReminder()
  closeBindPhonePrompt()
  return true
}

// 加载签到活动队列和会员签到状态，并展示 sortNo 最小的第一个活动。
const loadCheckInData = async () => {
  if (!props.modelValue || !isLoggedIn.value || isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    const nextQueue = await loadActiveCheckInDataList({
      channelId: currentChannelId.value,
      currencyCode: activeCurrencyCode.value,
      languageCode: locale.value,
      isLoggedIn: true,
      requireAutoPopup: props.autoPopupOnly,
      excludeTodaySigned: props.autoPopupOnly
    })

    checkInDataQueue.value = nextQueue

    if (!showCheckInDataAt(0)) {
      viewData.value = createDefaultCheckInViewData()

      if (props.autoPopupOnly) {
        emit('update:modelValue', false)
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    hasLoaded.value = true
    isLoading.value = false
  }
}

// 点击签到按钮后领取奖励，成功后刷新奖励卡领取态，并用 receiveReward 结果更新主视觉。
const handleAction = async () => {
  if (
    isContentLoading.value ||
    isClaiming.value ||
    !viewData.value.canClaim ||
    !viewData.value.activityId
  ) {
    return
  }

  isClaiming.value = true

  try {
    const receiveRewardResponse = ensureApiBusinessSuccess(
      await Api.activity.receiveCheckInReward({
        activityId: viewData.value.activityId
      })
    )

    if (receiveRewardResponse.result?.success === false) {
      return
    }

    const claimHeroRewards = createCheckInHeroRewardsFromClaimResult(
      receiveRewardResponse.result,
      activeCurrencyCode.value
    )
    const currentCheckInData = activeCheckInData.value
    const refreshedCheckInData = currentCheckInData
      ? await loadCheckInActivityData(currentCheckInData.activity, {
          currencyCode: activeCurrencyCode.value,
          languageCode: locale.value
        })
      : null

    if (refreshedCheckInData?.viewData) {
      const refreshedViewData = {
        ...refreshedCheckInData.viewData,
        heroRewards:
          claimHeroRewards.length > 0 ? claimHeroRewards : refreshedCheckInData.viewData.heroRewards
      }

      checkInDataQueue.value[activeQueueIndex.value] = {
        ...refreshedCheckInData,
        viewData: refreshedViewData
      }
      viewData.value = refreshedViewData
    } else {
      viewData.value = {
        ...viewData.value,
        canClaim: false,
        todayIsSign: true,
        heroRewards: claimHeroRewards.length > 0 ? claimHeroRewards : viewData.value.heroRewards
      }
    }

    emit('action')
  } catch (error) {
    console.error(error)
  } finally {
    isClaiming.value = false
  }
}

// 关闭当前签到活动；队列中还有活动时切换下一项，最后一项关闭后才关闭全局弹窗。
const handleClose = () => {
  closeRequirementReminder()
  closeBindPhonePrompt()

  if (showCheckInDataAt(activeQueueIndex.value + 1)) {
    return
  }

  emit('update:modelValue', false)
}

// 关闭签到条件提醒弹窗。
const closeRequirementReminder = () => {
  requirementReminderVisible.value = false
}

// 关闭绑定手机号提示弹窗。
const closeBindPhonePrompt = () => {
  bindPhonePromptVisible.value = false
}

// 点击主视觉票券的 Use Now：若票券要求验证手机号且用户未绑定，则先提示绑定手机号。
const handleHeroUseNow = (reward: CheckInHeroActionReward) => {
  if (isContentLoading.value) {
    return
  }

  if (reward.requiresPhoneVerification && !hasBoundTelephone.value) {
    bindPhonePromptVisible.value = true
    return
  }
}

// 用户确认去绑定手机号：关闭签到弹窗后跳转到绑定手机号页。
const handleBindPhonePromptConfirm = () => {
  closeBindPhonePrompt()
  emit('update:modelValue', false)
  void navigateToName('changeMobileNumber')
}

// 点击未领取奖励卡片时，根据后端条件配置打开条件提醒弹窗。
const handleRewardClick = (reward: CheckInRewardItem) => {
  if (isContentLoading.value || reward.claimed) {
    return
  }

  const requirementReminderData = createCheckInRequirementReminderData(reward)

  if (!requirementReminderData) {
    return
  }

  requirementReminderMode.value = requirementReminderData.mode
  requirementReminderItems.value = requirementReminderData.items
  requirementReminderVisible.value = true
}

watch(
  [() => props.modelValue, isLoggedIn, () => locale.value, currentChannelId],
  ([visible, loggedIn]) => {
    if (!visible) {
      hasLoaded.value = false
      activeQueueIndex.value = 0
      checkInDataQueue.value = []
      closeRequirementReminder()
      closeBindPhonePrompt()
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
