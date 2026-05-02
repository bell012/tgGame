<template>
  <Teleport to="body">
    <div>
      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10020] bg-mask-60-1"
          @click.self="handleClose"
        />
      </transition>

      <transition name="popup-fade">
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex items-center justify-center"
          @click.self="handleClose"
        >
          <section
            role="dialog"
            aria-modal="true"
            :aria-label="t('vipPage.levelUpConfirmPopup.title')"
            class="flex min-h-[335px] w-[300px] max-h-[445px] flex-col overflow-hidden rounded-[14px] bg-bg-1 p-[20px] sm:min-h-[468px] sm:w-[464px] sm:max-h-[608px] sm:rounded-[24px] sm:p-[32px]"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-base font-[700] text-text-1 sm:text-xl">
                {{ t('vipPage.levelUpConfirmPopup.title') }}
              </h3>

              <button
                type="button"
                class="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-opacity-10 sm:h-[24px] sm:w-[24px] sm:rounded-[4px]"
                @click="handleClose"
              >
                <CloseIcon class="h-4 w-4 text-text-1 sm:h-3 sm:w-3" />
              </button>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto mt-[14px] sm:mt-[24px]">
              <div
                class="rounded-[10px] bg-theme-3 px-[14px] py-[10px] sm:rounded-[16px] sm:px-[20px] sm:py-[16px]"
              >
                <div class="flex items-start justify-between gap-2">
                  <p class="text-xs font-[700] sm:text-base">
                    <span class="text-text-1">
                      {{ t('vipPage.levelUpConfirmPopup.rewardCountPrefix') }}
                    </span>
                    <span class="text-theme-primary">{{ rewardCount }}</span>
                    <span class="text-text-1">
                      {{ t('vipPage.levelUpConfirmPopup.rewardCountSuffix') }}
                    </span>
                  </p>
                  <p class="shrink-0 text-sm font-[700] text-theme-primary sm:text-xl">
                    {{ currencyBadge }}{{ totalAmount }}
                  </p>
                </div>
                <p class="mt-[7px] text-left text-xs text-text-2 sm:text-base sm:mt-[10px]">
                  {{ t('vipPage.levelUpConfirmPopup.description') }}
                </p>
              </div>

              <div
                v-if="items.length"
                class="mt-[10px] space-y-[10px] sm:mt-[16px] sm:space-y-[16px]"
              >
                <div
                  v-for="(item, index) in items"
                  :key="`${item.vipId}-${index}`"
                  class="rounded-[10px] bg-bg-2 px-[14px] py-[10px] sm:rounded-[16px] sm:px-[20px] sm:py-[16px]"
                >
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-xs font-[700] text-text-1 sm:text-base">
                      {{ t('vipPage.levelUpConfirmPopup.rewardItemTitle', { vipId: item.vipId }) }}
                    </p>
                    <p class="shrink-0 text-sm font-[700] text-text-1 sm:text-xl">
                      {{ currencyBadge }}{{ item.amount }}
                    </p>
                  </div>
                  <p class="mt-[7px] text-left text-xs text-text-2 sm:text-base sm:mt-[10px]">
                    {{ t('vipPage.levelUpConfirmPopup.balanceHint') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-[30px] sm:mt-[24px]">
              <button
                type="button"
                class="h-[40px] w-full rounded-[8px] bg-theme-primary text-sm font-[700] text-text-4 sm:h-[48px]"
                :disabled="claiming"
                @click="emit('confirm')"
              >
                {{ t('vipPage.levelUpConfirmPopup.claim') }}
              </button>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCurrencySymbol, getCurrentCurrency } from '@/utils/locale'
import CloseIcon from '@/static/svg/close.svg?component'
import type { VipLevelUpClaimRewardItem } from './shared'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    totalAmount: string
    rewardCount: number
    items: VipLevelUpClaimRewardItem[]
    claiming?: boolean
  }>(),
  {
    claiming: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const { t } = useI18n()

const visible = computed(() => props.modelValue)

// 当前站点币种符号。
const currencyBadge = computed(() => getCurrencySymbol(getCurrentCurrency()).trim())

// 关闭确认弹窗。
const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-fade-enter-to,
.popup-fade-leave-from {
  opacity: 1;
}
</style>
