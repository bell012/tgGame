<template>
  <!-- 弹窗挂载到 body -->
  <Teleport to="body">
    <!-- 弹窗遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[9999] flex items-end justify-center bg-mask-60-1"
      @click.self="handleClose"
    >
      <!-- 弹窗主体容器 -->
      <div
        class="w-full bg-bg-1 shadow-2xl"
        :class="
          props.mode === 'pc'
            ? 'max-w-[720px] rounded-t-[20px] px-5 pb-8 pt-5'
            : 'rounded-t-[12px] px-3.5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4'
        "
        style="font-family: Inter, avertastd, sans-serif"
        @click.stop
      >
        <!-- 弹窗标题区域 -->
        <div class="text-center">
          <!-- 弹窗标题 -->
          <h3
            class="font-[700] text-text-1"
            :class="props.mode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-base leading-[20px]'"
          >
            {{ props.title }}
          </h3>

          <!-- 弹窗说明文案 -->
          <p
            class="mx-auto mt-3 text-center font-[400] text-text-3"
            :class="
              props.mode === 'pc'
                ? 'max-w-[560px] text-sm leading-[20px]'
                : 'max-w-[300px] text-xs leading-[18px]'
            "
          >
            {{ props.description }}
          </p>
        </div>

        <!-- 文案输入区域 -->
        <div
          class="mt-5 rounded-[10px] border border-theme-primary bg-bg-2"
          :class="props.mode === 'pc' ? 'p-4' : 'p-3.5'"
        >
          <!-- 文案输入框 -->
          <textarea
            v-model="draftMessage"
            class="min-h-[96px] w-full resize-none border-0 bg-transparent p-0 font-[400] text-text-1 outline-none placeholder:text-text-3"
            :class="props.mode === 'pc' ? 'text-base leading-[24px]' : 'text-sm leading-[20px]'"
            :maxlength="props.maxLength"
          ></textarea>

          <!-- 字数统计 -->
          <div
            class="mt-3 text-right font-[400] text-text-3"
            :class="props.mode === 'pc' ? 'text-sm leading-[20px]' : 'text-xs leading-[15px]'"
          >
            {{ `${currentLength}/${props.maxLength}` }}
          </div>
        </div>

        <!-- 预设文案按钮区域 -->
        <div class="mt-5 flex flex-col" :class="props.mode === 'pc' ? 'gap-3' : 'gap-2.5'">
          <!-- 预设文案按钮 -->
          <button
            v-for="(preset, index) in props.presets"
            :key="`referral-message-preset-${index}`"
            type="button"
            class="rounded-[10px] bg-bg-2 px-4 text-center font-[400] text-theme-primary"
            :class="props.mode === 'pc' ? 'h-[52px] text-base' : 'h-10 text-sm'"
            @click="handleSelectPreset(preset)"
          >
            {{ preset }}
          </button>
        </div>

        <!-- 复制按钮区域 -->
        <button
          type="button"
          class="mt-5 w-full rounded-[10px] bg-theme-primary font-[700] text-text-4"
          :class="props.mode === 'pc' ? 'h-[52px] text-base' : 'h-10 text-sm'"
          @click="handleCopy"
        >
          {{ props.copyText }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
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
