<template>
  <teleport v-if="modelValue" to="body">
    <transition name="modal">
      <div class="fixed inset-0 flex items-center justify-center z-[999] overflow-hidden">
        <div
          class="mx-auto w-full sm:max-w-[480px] h-full sm:max-h-[684px] bg-mask-60-1 fixed inset-0 flex items-center justify-center"
        >
          <div
            class="p-5 sm:px-4 sm:py-6 w-[300px] sm:w-[368px] h-[327px] sm:h-[352px] rounded-xl modal-container bg-bg-1 dark:bg-bg-2"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-text-1 text-xl font-bold leading-normal capitalize">
                {{ t('deposit.cancel_order_title') }}
              </h2>
              <button
                class="w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center"
                @click="handleClose"
              >
                <CloseIcon class="w-4 h-4 fill-none" />
              </button>
            </div>
            <p class="mt-2.5 text-sm font-normal leading-normal text-text-2">
              {{ t('deposit.cancel_order_tips') }}
            </p>
            <div class="mt-4 h-[156px] w-full p-2.5 sm:p-3 rounded-lg bg-bg-6 overflow-y-auto">
              <div
                class="flex items-center justify-between p-3 text-text-1 text-[14px] rounded-lg"
                v-for="(item, index) in cancellations"
                :key="index"
                @click.stop="selectlation(item)"
                :class="[cancellationId === item.id ? 'bg-theme-3' : '']"
              >
                <p>{{ item.text }}</p>
                <RadioCheckedIcon class="w-4 h-4" v-show="cancellationId === item.id" />
                <RadioUncheckedIcon class="w-4 h-4" v-show="cancellationId !== item.id" />
              </div>
            </div>
            <button
              :disabled="disabledConfirm"
              class="mt-5 sm:mt-6 h-10 sm:h-12 w-full rounded-lg text-text-4 text-[14px] font-bold flex items-center justify-center"
              :class="[disabledConfirm ? 'btn-primary' : 'bg-theme-2 cursor-not-allowed']"
            >
              <CountDown v-if="!disabledConfirm" :time="countdownTime" @finish="onCountDownFinish">
                <template #default="timeData">
                  <span>
                    {{ t('deposit.cancel_order_confirm_cancel') }} ({{ timeData.seconds }})
                  </span>
                </template>
              </CountDown>
              <span v-else>{{ t('deposit.cancel_order_confirm_cancel') }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script setup lang="ts">
import { CountDown } from 'vant'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import { ref } from 'vue'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'

const { t } = useI18n()
interface Props {
  modelValue: boolean
}
defineProps<Props>()
interface cancellationType {
  id: string
  text: string
}

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const countdownTime = ref<number>(60 * 1000)
const disabledConfirm = ref<boolean>(false)
const cancellationId = ref<string>('')
const cancellations = ref<cancellationType[]>([
  { id: '1', text: 'I changed my mind' },
  { id: '2', text: 'Payment QR code expired' },
  { id: '3', text: 'I want to place a new order' },
  { id: '11', text: 'Copy I changed my mind' },
  { id: '22', text: 'Copy Payment QR code expired' },
  { id: '33', text: 'Copy I want to place a new order' }
])

const handleClose = () => {
  emit('update:modelValue', false)
}

const onCountDownFinish = () => {
  disabledConfirm.value = true
}

const selectlation = (lation: cancellationType) => {
  if (!lation || !lation.id) return
  cancellationId.value = lation.id
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
