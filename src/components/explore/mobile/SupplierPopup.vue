<template>
  <Teleport to="body">
    <!-- 遮罩淡入淡出 -->
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9998] inset-0 bg-[var(--color-mask-60)]"
        @click.self="confirm"
      />
    </transition>

    <!-- 面板 -->
    <transition name="up-down">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full">
        <div
          class="tp-panel bg-[var(--color-background-level-1)] rounded-t-xl pt-2.5 px-3.5 max-h-[602px] flex flex-col"
        >
          <div class="tp-header flex items-center justify-between mb-2.5">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <div
              @click="confirm"
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
          <!-- 选择的内容 -->
          <div class="flex-1 overflow-y-auto pb-[58px]">
            <div class="flex flex-col">
              <div
                v-for="(item, inx) in supplierList"
                :key="inx"
                class="tp-item px-2.5 flex items-center h-[42px] rounded-lg"
                :class="[
                  isSelected(item.id) ? 'bg-[var(--color-opacity-10)]' : '',
                  inx === supplierList.length - 1 ? 'mb-0' : 'mb-2.5'
                ]"
                @click="toggle(item.id)"
              >
                <ChecedIcon v-if="isSelected(item.id)" class="w-5 h-5" />
                <UnchecedIcon v-else class="w-5 h-5" />
                <div class="ml-2.5 flex items-center w-[100px] h-[22px]">
                  <img class="w-full h-full object-contain" :src="item?.url" />
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div
            class="flex items-center py-[15px] border-t border-[var(--color-opacity-10)] bg-[var(--color-background-level-2)] fixed left-0 bottom-0 w-full"
          >
            <button type="button" class="flex items-center justify-center w-full" @click="clearAll">
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import CloseIcon from '@/static/svg/close.svg?component'
import ChecedIcon from '@/static/svg/explore/cube-checked.svg?component'
import UnchecedIcon from '@/static/svg/explore/cube-unchecked.svg?component'
import ClearIcon from '@/static/svg/explore/clear.svg?component'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

/* ===================== 搜索输入 ===================== */
const keyword = ref('') // 搜索框输入值
/* ===================== end===================== */

type Id = number | string
type OptionItem = { id: Id; url: string }

const props = defineProps<{
  visible: boolean
  supplierList: OptionItem[]
  selectedIds: Id[] //  多选
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: [val: Id[]] // 返回选中的 id 列表
}>()

const localSelectedIds = ref<Id[]>([])

watch(
  () => [props.visible, props.selectedIds] as const,
  ([v]) => {
    if (v) localSelectedIds.value = [...props.selectedIds]
  },
  { immediate: true }
)

const close = () => emit('update:visible', false)

const isSelected = (id: Id) => localSelectedIds.value.includes(id)

const toggle = (id: Id) => {
  const idx = localSelectedIds.value.indexOf(id)
  if (idx >= 0) localSelectedIds.value.splice(idx, 1)
  else localSelectedIds.value.push(id)
}

const clearAll = () => {
  localSelectedIds.value = []
}

const confirm = () => {
  emit('confirm', [...localSelectedIds.value])
  close()
}

useLockBodyScroll(() => props.visible)
</script>

<style scoped lang="scss">
@use '../../../styles/mixins' as *;

/* 面板 */
.tp-panel {
  overflow: hidden;
}

@include popup-transition;
</style>
