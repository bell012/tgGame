<template>
  <div class="w-full flex gap-[11px]">
    <button
      @click.stop="sortByShow = true"
      class="flex-1 flex items-center justify-between px-2.5 py-[11px] bg-[var(--color-opacity-5)] rounded-lg border border-solid border-[var(--color-opacity-10)] sm:max-w-72"
    >
      <div class="flex items-center flex-1 text-xs">
        <span class="mr-2.5 text-text-2">{{ t('locales.casino.sort') }}:</span>
        <span class="text-text-1">{{ sortBy }}</span>
      </div>
      <span
        class="fill-text-1 w-5 h-5 rounded-[6px] bg-[var(--color-opacity-10)] flex items-center justify-center"
      >
        <svg class="w-2 h-2" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>
    <button
      @click.stop="providerShow = true"
      class="flex-1 flex items-center justify-between px-2.5 py-[11px] bg-[var(--color-opacity-5)] rounded-lg border border-solid border-[var(--color-opacity-10)] sm:max-w-72"
    >
      <div class="flex items-center flex-1 text-xs">
        <span class="mr-2.5 text-text-2">{{ t('locales.casino.providers') }}:</span>
        <span class="text-text-1">{{ providerText }}</span>
      </div>
      <span
        class="fill-text-1 w-5 h-5 rounded-[6px] bg-[var(--color-opacity-10)] flex items-center justify-center"
      >
        <svg class="w-2 h-2" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>
  </div>
  <Teleport to="body">
    <transition name="popup-fade">
      <div
        v-show="isPopupVisible"
        class="fixed inset-0 z-[9998] bg-[var(--color-mask-60-1)]"
        @click.self="closePopup"
      />
    </transition>

    <transition name="up-down">
      <div v-show="isPopupVisible" class="fixed left-0 bottom-0 z-[9999] w-full">
        <div
          v-show="sortByShow"
          class="bg-[var(--color-background-level-1)] rounded-t-xl pt-2.5 px-3.5"
        >
          <div class="mb-2.5 flex items-center justify-between">
            <div class="w-7" />
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-opacity-10)]"
              @click.stop="closePopup"
            >
              <CloseIcon class="h-4 w-4 stroke-text-1" />
            </button>
          </div>
          <div class="flex flex-col">
            <div
              v-for="item in sortOptions"
              :key="item.value"
              class="mb-2.5 flex h-[42px] items-center justify-between rounded-lg px-2.5 cursor-pointer"
              :class="{
                'bg-[var(--color-opacity-10)]': sortBySelected(item)
              }"
              @click="confirmSortBy(item)"
            >
              <span>{{ item.label }}</span>
              <component
                :is="sortBySelected(item) ? RadioCheckedIcon : RadioUncheckedIcon"
                class="h-5 w-5"
              />
            </div>
          </div>
        </div>
        <div
          v-show="providerShow"
          class="bg-[var(--color-background-level-1)] rounded-t-xl pt-2.5 px-3.5 max-h-[75vh] flex flex-col"
        >
          <div class="flex items-center justify-between mb-2.5">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <div
              @click.stop="closePopup"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <div class="relative mb-2.5">
            <SearchIcon
              class="w-[18px] h-[18px] fill-none stroke-text-2 opacity-50 absolute left-2.5 top-1/2 -translate-y-1/2"
            />
            <input
              v-model="keyword"
              type="text"
              :placeholder="t('locales.home.search')"
              class="w-full h-[42px] pl-[38px] pr-11 rounded-lg bg-[var(--color-opacity-6)] border border-[var(--color-border-level-1)] text-text-1 text-xs font-[600] outline-none focus:border-theme-primary placeholder:text-text-2"
            />
          </div>
          <div class="flex-1 overflow-y-auto pb-[58px]">
            <div class="flex flex-col">
              <div
                v-for="(item, inx) in filteredProviders"
                :key="inx"
                class="tp-item px-2.5 flex items-center h-[42px] rounded-lg"
                :class="[
                  providerSelected(item) ? 'bg-[var(--color-opacity-10)]' : '',
                  inx === providerOptions.length - 1 ? 'mb-0' : 'mb-2.5'
                ]"
                @click="addProvider(item)"
              >
                <CubeChecedIcon v-if="providerSelected(item)" class="w-5 h-5" />
                <CubeUnchecedIcon v-else class="w-5 h-5" />
                <div class="ml-2.5 flex items-center w-[100px] h-[22px]">
                  <img class="w-full h-full object-contain" :src="item?.icon" />
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex items-center py-[15px] border-t border-[var(--color-opacity-10)] bg-[var(--color-background-level-2)] fixed left-0 bottom-0 w-full"
          >
            <button
              type="button"
              class="flex items-center justify-center w-full"
              @click="clearProviderAll"
            >
              <ClearIcon class="w-3.5 h-3.5" />
              <div class="ml-1.5 text-theme-primary text-xs font-[500]">
                {{ t('locales.search.botClear') }}
              </div>
            </button>
          </div>
          <div style="padding-bottom: env(safe-area-inset-bottom)"></div>
        </div>
      </div>
    </transition>
  </Teleport>

  <!-- 排序面板 -->
  <!-- 供应商面板 -->
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import wlImg from '@/static/img/supplier/wl.png'
import pgImg from '@/static/img/supplier/pg.png'
import fgImg from '@/static/img/supplier/fg.png'
import jlImg from '@/static/img/supplier/jl.png'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import CubeChecedIcon from '@/static/svg/cube-checked.svg?component'
import CubeUnchecedIcon from '@/static/svg/cube-unchecked.svg?component'
import ClearIcon from '@/static/svg/clear.svg?component'
import SearchIcon from '@/static/svg/search-icon.svg?component'

const { t } = useI18n()

const props = defineProps({
  sortOptions: {
    type: Array as () => { label: string; value: string }[],
    default: () => [
      { label: '热门', value: '热门' },
      { label: '最新', value: '最新' },
      { label: 'A-Z', value: 'A-Z' },
      { label: 'Z-A', value: 'Z-A' }
    ]
  },
  providerOptions: {
    type: Array as () => { label: string; value: string; icon: string }[],
    default: () => [
      { label: 'P1', value: 'p1', icon: wlImg },
      { label: 'P2', value: 'p2', icon: pgImg },
      { label: 'P3', value: 'p3', icon: fgImg },
      { label: 'P4', value: 'p4', icon: jlImg },
      { label: 'A1', value: 'a1', icon: wlImg },
      { label: 'A2', value: 'a2', icon: pgImg },
      { label: 'A3', value: 'a3', icon: fgImg },
      { label: 'A4', value: 'a4', icon: jlImg },
      { label: 'C1', value: 'c1', icon: wlImg },
      { label: 'C2', value: 'c2', icon: pgImg },
      { label: 'C3', value: 'c3', icon: fgImg },
      { label: 'C4', value: 'c4', icon: jlImg },
      { label: 'D1', value: 'd1', icon: wlImg },
      { label: 'D2', value: 'd2', icon: pgImg },
      { label: 'D3', value: 'd3', icon: fgImg },
      { label: 'D4', value: 'd4', icon: jlImg },
      { label: 'EE', value: 'ee', icon: pgImg }
    ]
  }
})

const emit = defineEmits<{
  (e: 'update:sort', value: string): void
  (e: 'update:providers', value: string[]): void
}>()

const sortBy = ref(props.sortOptions[0].value)
const providers = ref<string[]>([])
const sortByShow = ref(false)
const providerShow = ref(false)
const keyword = ref('')
const isPopupVisible = computed(() => sortByShow.value || providerShow.value)
const providerText = computed(() => {
  return providers.value.length > 0 ? '+' + providers.value.length : 'All'
})
const filteredProviders = computed(() => {
  if (!keyword.value) return props.providerOptions
  const k = keyword.value.toLowerCase()
  return props.providerOptions.filter(
    item => item.label.toLowerCase().includes(k) || item.value.toLowerCase().includes(k)
  )
})

const closePopup = () => {
  sortByShow.value = false
  providerShow.value = false
}

const sortBySelected = (item: { label: string; value: string }) => item.value === sortBy.value
const providerSelected = (item: { label: string; value: string; icon: string }) => {
  return providers.value.includes(item.value)
}

const confirmSortBy = (item: { label: string; value: string }) => {
  sortBy.value = item.value
  closePopup()
}

const addProvider = (item: { label: string; value: string; icon: string }) => {
  const idx = providers.value.indexOf(item.value)
  if (idx >= 0) providers.value.splice(idx, 1)
  else providers.value.push(item.value)
}

const clearProviderAll = () => {
  providers.value = []
}

watch(sortBy, newVal => emit('update:sort', newVal))
watch(providers, newVal => emit('update:providers', newVal))
watch(isPopupVisible, newVal => {
  if (newVal) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})
onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden')
})
</script>
<style scoped lang="scss">
@use '../../../../styles/mixins' as *;
@include popup-transition;
</style>
