<template>
  <button
    v-if="option"
    type="button"
    class="relative flex h-[154px] w-[280px] shrink-0 flex-col justify-center overflow-hidden rounded-xl border border-transparent bg-transparent text-base font-bold text-common-100 transition-colors"
    @click.stop="doSelect"
  >
    <div
      v-if="isActive"
      class="pointer-events-none absolute inset-0 z-20 rounded-xl border-2 border-theme-primary"
    />
    <component
      v-if="option.customCardBackground"
      :is="option.customCardBackground"
      class="pointer-events-none absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)]"
    />
    <div
      v-else
      class="pointer-events-none absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] rounded-xl bg-bg-4"
    />
    <div class="relative z-10 h-full w-full px-3 py-2">
      <div class="flex items-center">
        <div
          class="mr-2 h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full border border-common-100"
        >
          <gameRemoteImg
            :img="{
              src: option.customRoundIcon,
              maintain: false,
              fit: 'contain'
            }"
            class="h-full w-full"
            :alt="option.label"
          />
        </div>
        <span class="truncate">{{ option.label }}</span>
      </div>
      <div class="mt-4 flex items-center justify-between text-xs">
        <div>
          {{ option.kind == 'crypto' ? t('withdraw.network_label') : t('withdraw.name') }}：
        </div>
        <div class="text-right font-bold capitalize">
          {{ option.accountName }}
        </div>
      </div>
      <div class="mt-2 flex items-start justify-between text-xs">
        <div class="mr-2 shrink-0">
          {{
            option.kind == 'crypto' ? t('withdraw.receiving_address_text') : t('withdraw.account')
          }}：
        </div>
        <div class="min-w-0 break-all text-right font-bold capitalize">
          {{ option.accountNo }}
        </div>
      </div>

      <div
        class="absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-xl bg-mask-20 px-3 py-2 text-xs"
      >
        <template v-if="showDelete">
          <button
            type="button"
            class="inline-flex h-5 w-5 items-center justify-center"
            :disabled="!enableDelete"
            @click.stop="doDelete"
          >
            <DeleteIcon class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-2">
            <div>{{ t('withdraw.default_wallet') }}</div>
            <button
              type="button"
              class="flex h-4 w-[30px] items-center rounded-full p-px transition-colors duration-200"
              :class="option.defaultCard === 1 ? 'bg-theme-primary' : 'bg-white/60'"
              @click.stop="setDefault"
            >
              <div
                class="h-[14px] w-[14px] rounded-full bg-common-100 transition-transform duration-200"
                :class="option.defaultCard === 1 ? 'translate-x-[14px]' : 'translate-x-0'"
              />
            </button>
          </div>
        </template>
        <template v-else>
          <div>{{ t('withdraw.default_wallet') }}</div>
          <button
            type="button"
            class="flex h-4 w-[30px] items-center rounded-full p-px transition-colors duration-200"
            :class="option.defaultCard === 1 ? 'bg-theme-primary' : 'bg-white/60'"
            @click.stop="setDefault"
          >
            <div
              class="h-[14px] w-[14px] rounded-full bg-common-100 transition-transform duration-200"
              :class="option.defaultCard === 1 ? 'translate-x-[14px]' : 'translate-x-0'"
            />
          </button>
        </template>
      </div>
    </div>
  </button>
</template>
<script setup lang="ts">
import { AccountCardOption } from './shared/usePaymentMethodsService'
import { useI18n } from 'vue-i18n'
import DeleteIcon from '@/static/svg/del.svg?component'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'

const props = withDefaults(
  defineProps<{
    option: AccountCardOption
    isActive: boolean
    enableDelete?: boolean
    showDelete?: boolean
  }>(),
  {
    isActive: false,
    enableDelete: true,
    showDelete: true
  }
)

const emit = defineEmits<{
  select: [value: AccountCardOption]
  delete: [value: AccountCardOption]
  setDefault: [value: AccountCardOption]
}>()

const { t } = useI18n()

const doSelect = () => {
  emit('select', props.option)
}

const doDelete = () => {
  emit('delete', props.option)
}

const setDefault = () => {
  emit('setDefault', props.option)
}
</script>
<style scoped lang="scss"></style>
