<template>
  <Teleport to="body">
    <div
      ref="overlayRoot"
      class="fixed inset-0 z-[10004] flex items-center justify-center bg-mask-60-1 sm:p-4"
      @keydown.esc.stop.prevent="handleBack"
    >
      <section
        role="dialog"
        aria-modal="true"
        :aria-label="t('deposit.title')"
        class="relative flex h-full w-full flex-col overflow-hidden bg-bg-1 text-text-1 sm:h-[min(760px,calc(100dvh-32px))] sm:max-w-[640px] sm:rounded-xl"
      >
        <template v-if="!hidden">
          <div
            class="relative flex h-12 shrink-0 items-center justify-between bg-bg-2 px-3.5 sm:h-14"
          >
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-md bg-opacity-10"
              :aria-label="t('common.cancel')"
              @click="handleBack"
            >
              <BackIcon class="size-4" />
            </button>
            <h2 class="text-base font-bold">{{ t('deposit.title') }}</h2>
            <span class="size-8" aria-hidden="true" />
          </div>
        </template>
        <DepositPageContent
          ref="content"
          v-show="!hidden"
          embedded
          :teleport-target="overlayRoot"
          :mode="isMobile ? 'mobile' : 'pc'"
          v-model="activeTab"
          :class="isMobile ? '' : 'p-4'"
          @hidden="hidden = $event"
        />
      </section>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import BackIcon from '@/static/svg/left-icon.svg?component'
import DepositPageContent from '@/views/wallet/deposit/components/DepositPageContent.vue'
import type { DepositTabType } from '@/views/wallet/deposit/shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const emit = defineEmits<{ close: [] }>()
const overlayRoot = ref<HTMLElement | null>(null)
const content = ref<InstanceType<typeof DepositPageContent>>()
const hidden = ref(false)
const activeTab = ref<DepositTabType>('Fiat')
// 先返回当前支付步骤，没有子弹窗时才关闭充值。
const back = () => content.value?.back() ?? false
const handleBack = () => {
  if (!back()) emit('close')
}
defineExpose({ back })
</script>
