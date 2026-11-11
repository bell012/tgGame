<template>
  <div class="flex min-h-0 flex-1 flex-col bg-bg-5">
    <RedPacketSubHeader :title="t('redPacketPanel.redemptionHistory')" @back="emit('back')">
      <template #right>
        <button
          type="button"
          aria-label="my redemptions"
          class="flex size-[30px] items-center justify-center rounded-[6px] bg-opacity-10"
          @click="emit('openMine')"
        >
          <MyRecordsIcon class="size-[16px]" />
        </button>
      </template>
    </RedPacketSubHeader>

    <div ref="listRef" class="red-packet-scrollbar min-h-0 flex-1 overflow-y-auto pb-[20px]">
      <div class="flex flex-col items-center gap-[30px] px-[16px] pt-[30px]">
        <div class="flex flex-col items-center gap-[8px]">
          <div
            class="flex size-[80px] items-center justify-center overflow-hidden rounded-full bg-opacity-15"
          >
            <img :src="userAvatar" alt="" class="size-[69px] rounded-full object-cover" />
          </div>
          <span class="text-[16px] font-[700] leading-[19px] text-text-1">{{ userName }}</span>
          <span class="text-[14px] leading-[20px] text-text-2">
            {{ claimedRecord ? packetDesc : t('redPacketPanel.comeBackTomorrow') }}
          </span>
        </div>
        <p
          v-if="!loading || list.length"
          class="text-center text-[24px] font-[700] leading-[29px] text-secondary-9"
        >
          {{
            claimedRecord
              ? t('redPacketPanel.wonTitle', { amount: wonAmountText, currency: wonCurrency })
              : t('redPacketPanel.allGoneTitle')
          }}
        </p>
      </div>

      <div class="mt-[30px] flex flex-col items-center gap-[16px]">
        <div class="flex w-full flex-col items-center gap-[8px]">
          <p class="w-[calc(100%-32px)] text-[12px] leading-[15px] text-text-3">
            {{
              t('redPacketPanel.claimedSummary', {
                claimedCount: total,
                claimedAmount: formatAmount(totalMoney, 4),
                currency: currencyText
              })
            }}
          </p>
          <div class="h-px w-full bg-opacity-5" />
        </div>

        <div class="flex w-[calc(100%-32px)] flex-col gap-[16px]">
          <div
            v-for="record in list"
            :key="record.orderNo ?? record.redEnvelopeId"
            class="flex flex-col items-end gap-[16px]"
          >
            <div class="flex w-full items-center gap-[10px]">
              <div class="size-[44px] shrink-0 overflow-hidden rounded-[7px] bg-common-100">
                <img :src="recordAvatar" alt="" class="size-full object-cover" />
              </div>
              <div class="flex min-w-0 flex-1 items-center justify-between gap-[8px]">
                <div class="flex min-w-0 flex-col gap-[4px]">
                  <span class="truncate text-[14px] leading-[20px] text-text-1">
                    {{ record.memberId }}
                  </span>
                  <span class="text-[12px] leading-[15px] text-text-3">
                    {{ formatFullDateTime(record.updateTime) }}
                  </span>
                </div>
                <span class="shrink-0 text-[14px] font-[700] leading-[17px] text-text-1">
                  {{ record.amount ?? 0 }} {{ record.currency ?? '' }}
                </span>
              </div>
            </div>
            <div class="h-px w-[calc(100%-54px)] bg-opacity-5" />
          </div>

          <RedPacketListStatus
            v-if="!loading && !list.length"
            class="py-[20px]"
            :error="!!error"
            :empty-text="t('redPacketPanel.noRecords')"
            @retry="retry"
          />
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
import MyRecordsIcon from '@/static/svg/red-packet/my-records.svg?component'
import recordAvatar from '@/static/svg/red-packet/record-avatar.png'
import { useUserStore } from '@/stores/user'
import { resolveProfileAvatarUrl } from '@/utils/profile-customization'
import { formatAmount, formatFullDateTime, localizedRedPacketType } from '../format'
import { useMemberRecords } from '../useMemberRecords'
import RedPacketListStatus from './RedPacketListStatus.vue'
import RedPacketSubHeader from './RedPacketSubHeader.vue'

const props = defineProps<{ item: RedEnvelopeItem }>()

const emit = defineEmits<{ back: []; openMine: [] }>()

const { t } = useI18n()
const userStore = useUserStore()

const listRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const { list, total, totalMoney, memberId, loading, error, retry } = useMemberRecords({
  filters: () => ({ redEnvelopeId: props.item.redEnvelopeId }),
  sentinel: sentinelRef,
  root: listRef
})

const userName = computed(() => userStore.userInfo?.nickName || memberId.value)
const userAvatar = computed(() => resolveProfileAvatarUrl(userStore.userInfo?.headPortrait))

const claimedRecord = computed(() =>
  list.value.find(record => record.receiveState === 1 && record.memberId === memberId.value)
)

const currencyText = computed(() => list.value[0]?.currency ?? props.item.currency ?? '')

const packetDesc = computed(() => {
  const type = localizedRedPacketType(props.item.redEnvelopeType)
  return type ? t(`redPacketPanel.desc.${type}`) : (props.item.redEnvelopeDesc ?? '')
})

const wonAmountText = computed(() => {
  const record = claimedRecord.value
  if (!record) return ''
  return formatAmount(record.amount ?? 0, 4)
})

const wonCurrency = computed(() => claimedRecord.value?.currency ?? props.item.currency ?? '')
</script>
