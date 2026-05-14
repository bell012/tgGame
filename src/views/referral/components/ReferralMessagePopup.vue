<template>
  <!-- 弹窗挂载到 body -->
  <Teleport to="body">
    <!-- 弹窗遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex justify-center bg-mask-60-1"
      :class="props.mode === 'pc' ? 'items-center px-4' : 'items-end'"
      @click.self="handleClose"
    >
      <!-- PC 弹窗主体 -->
      <section
        v-if="props.mode === 'pc'"
        class="flex h-[582px] w-[464px] flex-col rounded-[24px] bg-bg-1 p-8 shadow-2xl"
        style="font-family: Inter, avertastd, sans-serif"
        @click.stop
      >
        <!-- PC 弹窗内容容器 -->
        <div class="flex h-full w-full flex-col items-start gap-6">
          <!-- PC 弹窗标题说明区域 -->
          <div class="flex w-full flex-col items-start gap-2">
            <!-- PC 弹窗标题和关闭按钮 -->
            <div class="flex w-full items-start justify-between gap-4">
              <!-- PC 弹窗标题 -->
              <h3
                class="flex min-h-6 items-center text-[20px] font-bold leading-6 capitalize text-text-1"
              >
                {{ props.title }}
              </h3>

              <!-- PC 关闭按钮 -->
              <button
                type="button"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-bg-2"
                @click="handleClose"
              >
                <CloseIcon class="h-2.5 w-2.5 text-text-1" />
              </button>
            </div>

            <!-- PC 弹窗说明文案 -->
            <p class="w-full text-center text-sm font-normal leading-5 text-text-3">
              {{ props.description }}
            </p>
          </div>

          <!-- PC 文案输入区域 -->
          <div
            class="box-border flex w-full flex-col items-end gap-[30px] rounded-[16px] border border-theme-primary bg-bg-2 p-5"
          >
            <!-- PC 文案输入框 -->
            <textarea
              v-model="draftMessage"
              class="h-[68px] w-full resize-none border-0 bg-transparent p-0 text-sm font-normal leading-5 text-text-1 outline-none placeholder:text-text-3"
              :maxlength="props.maxLength"
              :placeholder="props.initialMessage"
            ></textarea>

            <!-- PC 字数统计 -->
            <span class="text-sm font-normal leading-5 text-text-3">
              {{ `${currentLength}/${props.maxLength}` }}
            </span>
          </div>

          <!-- PC 预设文案按钮区域 -->
          <div class="flex w-full flex-col gap-3">
            <!-- PC 预设文案按钮 -->
            <button
              v-for="(preset, index) in props.presets"
              :key="`referral-message-preset-${index}`"
              type="button"
              class="flex h-12 w-full items-center justify-center rounded-[8px] bg-bg-2 px-4 text-center text-sm font-normal leading-5 text-theme-primary"
              @click="handleSelectPreset(preset)"
            >
              {{ preset }}
            </button>
          </div>

          <!-- PC 复制按钮 -->
          <button
            type="button"
            class="mt-auto flex h-12 w-full items-center justify-center rounded-[8px] bg-theme-primary text-center text-sm font-bold leading-[17px] text-text-4"
            @click="handleCopy"
          >
            {{ props.copyText }}
          </button>
        </div>
      </section>

      <!-- H5 弹窗主体容器 -->
      <div
        v-else
        class="w-full rounded-t-[12px] bg-bg-1 px-3.5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4 shadow-2xl"
        style="font-family: Inter, avertastd, sans-serif"
        @click.stop
      >
        <!-- H5 弹窗标题区域 -->
        <div class="text-center">
          <!-- H5 弹窗标题 -->
          <h3 class="text-base leading-[20px] font-[700] text-text-1">
            {{ props.title }}
          </h3>

          <!-- H5 弹窗说明文案 -->
          <p
            class="mx-auto mt-3 max-w-[300px] text-center text-xs leading-[18px] font-[400] text-text-3"
          >
            {{ props.description }}
          </p>
        </div>

        <!-- H5 文案输入区域 -->
        <div class="mt-5 rounded-[10px] border border-theme-primary bg-bg-2 p-3.5">
          <!-- H5 文案输入框 -->
          <textarea
            v-model="draftMessage"
            class="min-h-[96px] w-full resize-none border-0 bg-transparent p-0 text-sm leading-[20px] font-[400] text-text-1 outline-none placeholder:text-text-3"
            :maxlength="props.maxLength"
          ></textarea>

          <!-- H5 字数统计 -->
          <div class="mt-3 text-right text-xs leading-[15px] font-[400] text-text-3">
            {{ `${currentLength}/${props.maxLength}` }}
          </div>
        </div>

        <!-- H5 预设文案按钮区域 -->
        <div class="mt-5 flex flex-col gap-2.5">
          <!-- H5 预设文案按钮 -->
          <button
            v-for="(preset, index) in props.presets"
            :key="`referral-message-preset-${index}`"
            type="button"
            class="h-10 rounded-[10px] bg-bg-2 px-4 text-center text-sm font-[400] text-theme-primary"
            @click="handleSelectPreset(preset)"
          >
            {{ preset }}
          </button>
        </div>

        <!-- H5 复制按钮区域 -->
        <button
          type="button"
          class="mt-5 h-10 w-full rounded-[10px] bg-theme-primary text-sm font-[700] text-text-4"
          @click="handleCopy"
        >
          {{ props.copyText }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { computed, ref, watch } from 'vue'
interface Props {
  modelValue: boolean
  mode: 'mobile' | 'pc'
  title: string
  description: string
  copyText: string
  presets: string[]
  initialMessage: string
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 200
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  copy: [value: string]
}>()

const draftMessage = ref('')

/**
 * 计算当前输入字数。
 */
const currentLength = computed(() => draftMessage.value.length)

watch(
  () => props.modelValue,
  visible => {
    if (!visible) {
      return
    }

    draftMessage.value = normalizeMessage(props.initialMessage)
  },
  {
    immediate: true
  }
)

/**
 * 规范化推荐文案内容。
 */
function normalizeMessage(value: string) {
  return String(value ?? '').slice(0, props.maxLength)
}

/**
 * 处理关闭弹窗。
 */
function handleClose() {
  emit('update:modelValue', false)
}

/**
 * 处理选择预设文案。
 */
function handleSelectPreset(preset: string) {
  draftMessage.value = normalizeMessage(preset)
}

/**
 * 处理确认复制文案。
 */
function handleCopy() {
  emit('copy', draftMessage.value)
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;
</style>
