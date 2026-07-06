<template>
  <TicketDialogOverlay
    :visible="visible"
    :mask-z-index="TICKET_DIALOG_Z.resultMask"
    :panel-z-index="TICKET_DIALOG_Z.resultPanel"
    layout="result"
    :panel-class="isMobile ? 'max-w-[320px]' : 'max-w-[450px]'"
    :close-aria-label="t('common.cancel')"
    @close="close"
  >
    <div class="flex flex-col items-center">
      <h2 class="text-[20px] font-[700] text-[#F7D060]">{{ resolvedTitle }}</h2>
      <p class="mt-1 text-center text-[13px] font-[700] text-common-80">{{ resolvedSubtext }}</p>

      <div
        class="relative mt-6 w-full rounded-[16px] bg-[linear-gradient(123deg,#18884E_0%,#062917_100%)] px-6 pb-4 pt-8"
      >
        <div
          class="absolute left-1/2 top-[-28px] flex -translate-x-1/2 items-center justify-center"
        >
          <img
            :src="LUCKY_SPIN_ASSETS.modals.ribbonGift"
            alt=""
            class="h-[56px] w-auto object-contain"
          />
        </div>
        <div
          class="flex flex-col gap-2"
          :class="
            vouchers.length > 1
              ? isMobile
                ? 'max-h-[220px] overflow-y-auto pr-1'
                : 'max-h-[368px] overflow-y-auto pr-1'
              : ''
          "
        >
          <TicketVoucherCard
            v-for="item in vouchers"
            :key="item.id"
            :data="item"
            :class="isMobile ? '' : 'mx-auto h-[108px] w-[404px] shrink-0'"
          />
        </div>
        <button
          type="button"
          class="mx-auto mt-[22.67px] flex h-[44px] w-[240px] max-w-full items-center justify-center rounded-[10px] bg-theme-primary text-[15px] font-[700] text-text-4"
          @click="close"
        >
          {{ resolvedButtonText }}
        </button>
      </div>
    </div>
  </TicketDialogOverlay>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { LUCKY_SPIN_ASSETS, TICKET_DIALOG_Z } from '@/views/activity/ticket/shared/constants'
import TicketDialogOverlay from '../shared/TicketDialogOverlay.vue'
import TicketVoucherCard from './TicketVoucherCard.vue'
import { useTicketResultCardsCopy } from './useTicketResultCopy'
import { useTicketResultDialog } from './useTicketResultDialog'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = useIsMobile()
const { visible, result, close } = useTicketResultDialog('cards')
const { vouchers, resolvedTitle, resolvedSubtext, resolvedButtonText } = useTicketResultCardsCopy(
  result,
  t
)
</script>
