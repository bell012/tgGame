<template>
  <!-- 阶梯任务领取提醒挂载到 body，确保层级高于任务页内容与固定底栏。 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <!-- 蒙层沿用项目通用 Dialog 的遮罩色。 -->
      <div
        v-if="props.visible"
        class="fixed inset-0 z-[10040] flex items-center justify-center bg-mask-60-1"
        @click.self="handleClose"
      >
        <!-- PC 阶梯奖励领取提醒。 -->
        <section
          v-if="props.mode === 'pc'"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pc-tier-claim-reminder-title"
          class="box-border flex h-[229px] w-[492px] translate-y-[0.5px] flex-col items-start gap-6 rounded-3xl bg-bg-1 p-8 font-inter"
          @click.stop
        >
          <header class="flex h-6 w-[428px] shrink-0 items-start justify-between gap-[246px]">
            <h2
              id="pc-tier-claim-reminder-title"
              class="m-0 flex h-6 w-36 shrink-0 items-center text-[20px] font-[700] leading-6 capitalize text-text-1"
            >
              {{ t('taskCenter.tierClaimReminder.title') }}
            </h2>

            <!-- 关闭领取提醒。 -->
            <button
              type="button"
              :aria-label="t('taskCenter.close')"
              class="flex size-6 shrink-0 items-center justify-center rounded bg-opacity-10 p-1.5"
              @click="handleClose"
            >
              <span class="relative block size-3" aria-hidden="true">
                <span
                  class="absolute left-1/2 top-1/2 h-px w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-common-100"
                ></span>
                <span
                  class="absolute left-1/2 top-1/2 h-px w-2.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-common-100"
                ></span>
              </span>
            </button>
          </header>

          <p
            class="m-0 flex h-11 w-[428px] shrink-0 items-center text-[18px] font-[400] leading-[22px] text-text-2"
          >
            {{ t('taskCenter.tierClaimReminder.description') }}
          </p>

          <div class="flex h-[49px] w-[428px] shrink-0 items-start gap-6">
            <button
              type="button"
              class="flex h-[49px] min-w-0 flex-1 items-center justify-center gap-2.5 rounded-lg bg-opacity-10 p-2 text-center text-[14px] font-[700] leading-[17px] text-text-2"
              @click="handleClose"
            >
              {{ t('taskCenter.tierClaimReminder.notNow') }}
            </button>
            <button
              type="button"
              class="flex h-[49px] min-w-0 flex-1 items-center justify-center gap-2.5 rounded-lg bg-theme-primary p-2 text-center text-[14px] font-[700] leading-[17px] text-text-4"
              @click="handleConfirm"
            >
              {{ t('taskCenter.claimNow') }}
            </button>
          </div>
        </section>

        <!-- H5 阶梯奖励领取提醒。 -->
        <section
          v-else
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-tier-claim-reminder-title"
          class="relative h-[230.333px] w-[300px] -translate-x-[0.167px] overflow-hidden rounded-[14px] bg-bg-1 font-inter"
          @click.stop
        >
          <!-- H5 关闭领取提醒。 -->
          <button
            type="button"
            :aria-label="t('taskCenter.close')"
            class="absolute right-3.5 top-3.5 z-10 flex size-7 items-center justify-center rounded-md bg-opacity-10"
            @click="handleClose"
          >
            <span class="relative block size-2.5" aria-hidden="true">
              <span
                class="absolute left-1/2 top-1/2 h-[1.5px] w-[11.75px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-common-100"
              ></span>
              <span
                class="absolute left-1/2 top-1/2 h-[1.5px] w-[11.75px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-common-100"
              ></span>
            </span>
          </button>

          <div
            class="absolute left-5 top-5 flex h-[190.333px] w-[260px] flex-col items-start gap-[30px]"
          >
            <div class="flex h-[67.333px] w-[260px] shrink-0 flex-col items-start gap-3.5">
              <h2
                id="mobile-tier-claim-reminder-title"
                class="m-0 flex h-[19.333px] w-[260px] shrink-0 items-center text-[16px] font-[700] leading-[19.333px] text-text-1"
              >
                {{ t('taskCenter.tierClaimReminder.title') }}
              </h2>
              <p
                class="m-0 h-[34px] w-[260px] shrink-0 text-[14px] font-[400] leading-[17px] text-text-2"
              >
                {{ t('taskCenter.tierClaimReminder.description') }}
              </p>
            </div>

            <div class="flex h-[93px] w-[260px] shrink-0 flex-col items-start gap-[13px]">
              <button
                type="button"
                class="flex h-10 w-[260px] shrink-0 items-center justify-center rounded-lg bg-theme-primary text-center text-[14px] font-[700] leading-[17px] text-text-4"
                @click="handleConfirm"
              >
                {{ t('taskCenter.claimNow') }}
              </button>
              <button
                type="button"
                class="flex h-10 w-[260px] shrink-0 items-center justify-center rounded-lg bg-opacity-10 text-center text-[14px] font-[400] leading-[17px] text-text-2"
                @click="handleClose"
              >
                {{ t('taskCenter.tierClaimReminder.notNow') }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  mode: 'mobile' | 'pc'
}

const props = defineProps<Props>()
const { t } = useI18n()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()

/** 关闭阶梯任务领取提醒。 */
const handleClose = () => {
  emit('update:visible', false)
}

/** 确认领取意图；领取接口后续接入前仅关闭当前提醒。 */
const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>
