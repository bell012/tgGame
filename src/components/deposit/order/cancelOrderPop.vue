<template>
  <!-- 传送到 body 的弹窗容器 -->
  <teleport v-if="modelValue" to="body">
    <!-- 弹窗过渡动画 -->
    <transition name="modal">
      <!-- 弹窗遮罩层 -->
      <div class="fixed inset-0 flex items-center justify-center z-[999] overflow-hidden">
        <!-- 弹窗居中容器 -->
        <div
          class="mx-auto w-full sm:max-w-[480px] h-full sm:max-h-[684px] bg-mask-60-1 fixed inset-0 flex items-center justify-center"
        >
          <!-- 取消订单弹窗主体 -->
          <div
            class="relative p-5 sm:px-4 sm:py-6 w-[300px] sm:w-[368px] h-[327px] sm:h-[352px] rounded-xl modal-container bg-bg-1 dark:bg-bg-2 font-['Inter']"
          >
            <!-- 标题栏 -->
            <div class="flex items-center justify-between">
              <h2 class="text-text-1 text-xl font-bold leading-normal capitalize font-['Inter']">
                {{ t('deposit.cancel_order_title') }}
              </h2>
            </div>
            <!-- 关闭按钮 -->
            <button
              class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center"
              @click="handleClose"
            >
              <CloseIcon class="w-4 h-4 fill-none" />
            </button>
            <!-- 取消提示文案 -->
            <p class="mt-2.5 text-sm font-normal leading-normal text-text-2 font-['Inter']">
              {{ t('deposit.cancel_order_tips') }}
            </p>
            <!-- 取消原因列表容器 -->
            <div class="mt-4 h-[156px] w-full p-2.5 sm:p-3 rounded-lg bg-bg-6 overflow-y-auto">
              <!-- 取消原因选项 -->
              <div
                class="flex items-center justify-between p-2.5 sm:p-3 text-text-1 text-[14px] rounded-lg"
                v-for="item in cancellations"
                :key="item.id"
                @click.stop="selectlation(item)"
                :class="[cancellationId === item.id ? 'bg-theme-3' : '']"
              >
                <p class="font-['Inter']">{{ item.text }}</p>
                <RadioCheckedIcon class="w-4 h-4" v-show="cancellationId === item.id" />
                <RadioUncheckedIcon class="w-4 h-4" v-show="cancellationId !== item.id" />
              </div>
            </div>
            <!-- 确认取消按钮 -->
            <button
              :disabled="!canSubmitCancel"
              class="mt-5 sm:mt-6 h-10 sm:h-12 w-full rounded-lg text-text-4 text-sm font-bold flex items-center justify-center"
              :class="[canSubmitCancel ? 'btn-primary' : 'bg-theme-2 cursor-not-allowed']"
              @click="handleConfirmCancel"
            >
              <!-- 倒计时插槽 -->
              <CountDown v-if="!disabledConfirm" :time="countdownTime" @finish="onCountDownFinish">
                <!-- 区块：template -->
                <template #default="timeData">
                  <span>
                    {{ t('deposit.cancel_order_confirm_cancel') }} ({{ timeData.seconds }})
                  </span>
                </template>
              </CountDown>
              <span v-else class="font-['Inter']">{{
                t('deposit.cancel_order_confirm_cancel')
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script setup lang="ts">
import Api from '@/api'
import type { QueryPayOrderByOrderIdResult } from '@/api/interface/wallet'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import { CountDown, showToast } from 'vant'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
interface Props {
  modelValue: boolean
  orderId?: string | number
}
const props = defineProps<Props>()
interface cancellationType {
  id: string
  text: string
}

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'cancel-success': [detail: QueryPayOrderByOrderIdResult]
}>()

const countdownTime = ref<number>(4 * 1000)
const disabledConfirm = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const cancellations = computed<cancellationType[]>(() => [
  { id: '1', text: t('deposit.cancel_order_reason_1') },
  { id: '2', text: t('deposit.cancel_order_reason_2') },
  { id: '3', text: t('deposit.cancel_order_reason_3') }
])
const cancellationId = ref<string>('1')
const selectedCancellationText = computed(
  () => cancellations.value.find(item => item.id === cancellationId.value)?.text ?? ''
)
const canSubmitCancel = computed(
  () =>
    disabledConfirm.value &&
    !!selectedCancellationText.value &&
    !!props.orderId &&
    !isSubmitting.value
)

// 关闭取消订单弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}

// 倒计时结束后启用确认按钮
const onCountDownFinish = () => {
  disabledConfirm.value = true
}

// 选择取消原因
const selectlation = (lation: cancellationType) => {
  if (!lation || !lation.id) return
  cancellationId.value = lation.id
}

// 确认取消订单并查询最新订单结果
const handleConfirmCancel = async () => {
  if (!canSubmitCancel.value) return

  const orderId = props.orderId
  if (!orderId) return

  isSubmitting.value = true
  try {
    const cancelResponse = await Api.wallet.cancelPayOrderStatus({
      orderId,
      backNote: selectedCancellationText.value
    })

    if (!cancelResponse?.success) {
      showToast({
        message: cancelResponse?.message || t('deposit.cancel_failed'),
        type: 'fail'
      })
      return
    }

    const queryResponse = await Api.wallet.queryPayOrderByOrderId({ orderId })
    const detail = queryResponse?.success ? queryResponse.result : undefined
    if (!detail) {
      showToast({
        message: queryResponse?.message || t('deposit.query_order_failed'),
        type: 'fail'
      })
      return
    }

    emit('cancel-success', detail)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('cancelPayOrderStatus failed', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
<style scoped lang="scss">
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: scale(0.9);
  }
}
</style>
