<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="props.visible"
        class="fixed inset-0 z-[9999] bg-mask-60-1"
        @click="handleClose"
      />
    </transition>

    <transition name="up-down">
      <div v-show="props.visible" class="fixed inset-x-0 bottom-0 z-[10000]">
        <section
          class="rounded-t-[36px] bg-bg-1 px-[14px] pt-[14px] pb-[50px]"
          style="padding-bottom: calc(50px + env(safe-area-inset-bottom))"
        >
          <!-- 头部块 -->
          <header class="relative flex h-[48px] items-center justify-center">
            <h2 class="text-[16px] font-[700] leading-[19px] text-text-1">
              {{ t('common.filter') }}
            </h2>

            <!-- 按钮块 -->
            <button
              type="button"
              class="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] font-[700] leading-[15px] text-theme-primary"
              @click="handleApply"
            >
              {{ t('common.apply') }}
            </button>
          </header>

          <div class="mt-[14px] max-h-[70vh] overflow-y-auto">
            <section class="flex flex-col gap-[10px]">
              <div class="text-[12px] font-[400] leading-[15px] text-text-1">
                {{ t('referral.detailsPage.friendsFilter.linkSource') }}
              </div>

              <div class="grid grid-cols-3 gap-[7px]">
                <!-- 按钮块 -->
                <button
                  v-for="option in props.linkSourceOptions"
                  :key="option.value"
                  type="button"
                  class="flex h-[40px] items-center justify-center rounded-[8px] px-[8px] text-center text-[12px] leading-[15px]"
                  :class="
                    selectedValues.linkSource === option.value
                      ? 'bg-theme-primary font-[700] text-black'
                      : 'bg-bg-2 font-[400] text-text-2'
                  "
                  @click="selectedValues.linkSource = option.value"
                >
                  <span class="truncate">{{ option.label }}</span>
                </button>
              </div>
            </section>

            <section class="mt-[20px] flex flex-col gap-[10px]">
              <div class="text-[12px] font-[400] leading-[15px] text-text-1">
                {{ t('referral.detailsPage.friendsFilter.registrationTime') }}
              </div>

              <div class="grid grid-cols-3 gap-[7px]">
                <!-- 按钮块 -->
                <button
                  v-for="option in props.registrationTimeOptions"
                  :key="option.value"
                  type="button"
                  class="flex h-[40px] items-center justify-center rounded-[8px] px-[8px] text-center text-[12px] leading-[15px]"
                  :class="
                    selectedValues.registrationTime === option.value
                      ? 'bg-theme-primary font-[700] text-black'
                      : 'bg-bg-2 font-[400] text-text-2'
                  "
                  @click="
                    selectedValues.registrationTime = option.value as ReferralDetailsDateFilterValue
                  "
                >
                  <span class="truncate">{{ option.label }}</span>
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ReferralDetailsDateFilterValue, ReferralDetailsFriendsFilterValues } from '../shared'

interface PopupOption {
  label: string
  value: string
}

interface Props {
  visible: boolean
  modelValue: ReferralDetailsFriendsFilterValues
  linkSourceOptions: PopupOption[]
  registrationTimeOptions: PopupOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:modelValue': [value: ReferralDetailsFriendsFilterValues]
  apply: [value: ReferralDetailsFriendsFilterValues]
}>()

const { t } = useI18n()

const selectedValues = reactive<ReferralDetailsFriendsFilterValues>({
  linkSource: 'all',
  registrationTime: 'all'
})

watch(
  [() => props.visible, () => props.modelValue],
  ([visible]) => {
    if (!visible) {
      return
    }

    selectedValues.linkSource = props.modelValue.linkSource
    selectedValues.registrationTime = props.modelValue.registrationTime
  },
  {
    immediate: true,
    deep: true
  }
)

/**
 * 处理handleClose方法。
 */
const handleClose = () => {
  emit('update:visible', false)
}

/**
 * 处理handleApply方法。
 */
const handleApply = () => {
  const nextValues = {
    linkSource: selectedValues.linkSource,
    registrationTime: selectedValues.registrationTime
  }

  emit('update:modelValue', nextValues)
  emit('apply', nextValues)
  handleClose()
}
</script>

<style scoped lang="scss">
@use '../../../../styles/mixins' as *;

@include popup-transition;
</style>
