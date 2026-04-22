<template>
  <popShell v-model="visible" transition-type="bottom-sheet" @close="handleClose">
    <div
      class="relative mx-auto flex max-h-[50vh] flex-col rounded-t-[12px] bg-bg-1 px-[14px] pb-5 pt-[14px] font-['Inter']"
    >
      <div class="flex items-center justify-between">
        <h2 class="mx-auto text-xl font-bold leading-normal text-text-1">
          {{ title }}
        </h2>
        <button
          type="button"
          class="absolute right-4 top-4 hidden h-6 w-6 items-center justify-center rounded-md text-text-1 sm:flex"
          @click="handleClose"
        >
          <CloseIcon class="size-4" />
        </button>
      </div>

      <div class="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <button
          v-for="(item, index) in accountOptions"
          :key="index"
          type="button"
          class="flex w-full items-center justify-between rounded-[10px] bg-bg-2 p-[14px] text-left"
          @click="handleSelect(item)"
        >
          <div class="flex min-w-0 items-center">
            <div class="mr-3 h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <gameRemoteImg
                :img="{ src: item.customRoundIcon, maintain: false, fit: 'contain' }"
                class="h-full w-full"
                :alt="item.label"
              />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm leading-normal text-text-2">
                {{
                  item.kind === 'crypto' ? `${item.label}-${item.accountName}` : item.accountName
                }}
              </p>
              <p class="truncate leading-normal text-text-1 text-sm font-semibold">
                {{ item.accountNo }}
              </p>
            </div>
          </div>
          <RadioCheckedIcon
            v-if="selectedAccountOption?.rowId === item.rowId"
            class="ml-1 h-5 w-5 shrink-0 text-theme-primary"
          />
          <RadioUncheckedIcon v-else class="ml-1 h-5 w-5 shrink-0 text-text-4" />
        </button>
      </div>

      <button
        v-if="canAddAccount"
        type="button"
        class="mt-6 flex h-10 min-h-10 w-full shrink-0 items-center justify-center rounded-lg btn-primary text-sm font-bold text-common-900"
        @click="emit('openAddAcountCard')"
      >
        <AddPlusIcon class="mr-2 h-4 w-4 text-current" />
        {{ addLabel }}
      </button>
    </div>
  </popShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import popShell from './popShell.vue'
import { AccountCardOption } from '@/components/paymentMethods/shared/usePaymentMethodsService'

interface Props {
  modelValue: boolean
  title: string
  addLabel: string
  accountOptions?: AccountCardOption[]
  selectedAccountOption?: AccountCardOption
  canAddAccount?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  openAddAcountCard: []
  handleSelectedAccountOption: [value: AccountCardOption]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const handleSelect = (value: AccountCardOption) => {
  emit('handleSelectedAccountOption', value)

  handleClose()
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped></style>
