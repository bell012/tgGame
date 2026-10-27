<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[#292D2E]">
    <RedPacketSubHeader :title="t('redPacketPanel.redemptionHistory')" @back="emit('back')">
      <template #right>
        <button
          type="button"
          aria-label="my redemptions"
          class="flex size-[30px] items-center justify-center rounded-[6px] bg-[rgba(255,255,255,0.1)]"
          @click="emit('openMine')"
        >
          <img :src="myRecordsIcon" alt="" class="size-[16px]" />
        </button>
      </template>
    </RedPacketSubHeader>

    <div ref="listRef" class="red-packet-scroll min-h-0 flex-1 overflow-y-auto pb-[20px]">
      <div class="flex flex-col items-center gap-[30px] px-[16px] pt-[30px]">
        <div class="flex flex-col items-center gap-[8px]">
          <div
            class="flex size-[80px] items-center justify-center overflow-hidden rounded-full bg-[rgba(255,255,255,0.15)]"
          >
            <img :src="userAvatar" alt="" class="size-[69px] rounded-full object-cover" />
          </div>
          <span class="text-[16px] font-[700] leading-[19px] text-white">{{ userName }}</span>
          <span class="text-[14px] leading-[20px] text-[#B3BEC1]">
            {{ t(claimedRecord ? 'redPacketPanel.goodLuck' : 'redPacketPanel.comeBackTomorrow') }}
          </span>
        </div>
        <p
          v-if="!loading || list.length"
          class="text-center text-[24px] font-[700] leading-[29px] text-[#FFD59E]"
        >
          {{
            claimedRecord
              ? t('redPacketPanel.wonTitle', { amount: wonAmountText })
              : t('redPacketPanel.allGoneTitle')
          }}
        </p>
      </div>

      <div class="mt-[30px] flex flex-col items-center gap-[16px]">
        <div class="flex w-full flex-col items-center gap-[8px]">
          <p class="w-[calc(100%-32px)] text-[12px] leading-[15px] text-[#7B7D7D]">
            {{
              t('redPacketPanel.claimedSummary', {
                count: total,
                amount: formatAmount(totalMoney),
                currency: currencyText
              })
            }}
          </p>
          <div class="h-px w-full bg-[rgba(255,255,255,0.06)]" />
        </div>

        <div class="flex w-[calc(100%-32px)] flex-col gap-[16px]">
          <div
            v-for="record in list"
            :key="record.orderNo ?? record.redEnvelopeId"
            class="flex flex-col items-end gap-[16px]"
          >
            <div class="flex w-full items-center gap-[10px]">
              <div class="size-[44px] shrink-0 overflow-hidden rounded-[7px] bg-white">
                <img :src="recordAvatar" alt="" class="size-full object-cover" />
              </div>
              <div class="flex min-w-0 flex-1 items-center justify-between gap-[8px]">
                <div class="flex min-w-0 flex-col gap-[4px]">
                  <span class="truncate text-[14px] leading-[20px] text-white">
                    {{ record.memberId }}
                  </span>
                  <span class="text-[12px] leading-[15px] text-[#7B7D7D]">
                    {{ formatFullDateTime(record.updateTime) }}
                  </span>
                </div>
                <span class="shrink-0 text-[14px] font-[700] leading-[17px] text-white">
                  {{ record.amount ?? 0 }} {{ record.currency ?? '' }}
                </span>
              </div>
            </div>
            <div class="h-px w-[calc(100%-54px)] bg-[rgba(255,255,255,0.06)]" />
          </div>

          <p
            v-if="!loading && !list.length"
            class="py-[20px] text-center text-[14px] leading-[20px] text-[#7B7D7D]"
          >
            <template v-if="error">
              {{ t('redPacketPanel.loadFailed') }}
              <button type="button" class="ml-[4px] text-[#FFD59E]" @click="retry">
                {{ t('redPacketPanel.retry') }}
              </button>
            </template>
            <template v-else>{{ t('redPacketPanel.noRecords') }}</template>
          </p>
        </div>
      </div>

      <div ref="sentinelRef" class="h-px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RedEnvelopeItem } from '@/api/interface/red-envelope'
import myRecordsIcon from '@/static/svg/red-packet/my-records.svg?url'
import recordAvatar from '@/static/svg/red-packet/record-avatar.png'
import { useUserStore } from '@/stores/user'
import { getCurrencySymbol } from '@/utils/locale'
import { resolveProfileAvatarUrl } from '@/utils/profile-customization'
import { useMemberRecords } from '../useMemberRecords'
import { formatFullDateTime } from '../useNow'
import RedPacketSubHeader from './RedPacketSubHeader.vue'

const props = defineProps<{ item: RedEnvelopeItem }>()

const emit = defineEmits<{ back: []; openMine: [] }>()

const { t } = useI18n()
const userStore = useUserStore()

const listRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const { list, total, totalMoney, loading, error, retry } = useMemberRecords({
  filters: () => ({ redEnvelopeId: props.item.redEnvelopeId }),
  sentinel: sentinelRef,
  root: listRef
})

const memberId = computed(() => userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId ?? '')
const userName = computed(() => userStore.userInfo?.nickName || memberId.value)
const userAvatar = computed(() => resolveProfileAvatarUrl(userStore.userInfo?.headPortrait))

const claimedRecord = computed(() =>
  list.value.find(record => record.receiveState === 1 && record.memberId === memberId.value)
)

const currencyText = computed(() => list.value[0]?.currency ?? props.item.currency ?? '')

const formatAmount = (value: number) => String(Number(value.toFixed(4)))

const wonAmountText = computed(() => {
  const record = claimedRecord.value
  if (!record) return ''
  return `${getCurrencySymbol(record.currency)}${formatAmount(record.amount ?? 0)}`
})
</script>

<style scoped>
.red-packet-scroll::-webkit-scrollbar {
  width: 6px;
}

.red-packet-scroll::-webkit-scrollbar-thumb {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}
</style>
