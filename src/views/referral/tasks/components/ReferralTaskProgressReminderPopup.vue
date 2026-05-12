<template>
  <!-- 任务页进度提醒弹窗挂载点 -->
  <Teleport to="body">
    <!-- 任务页进度提醒遮罩层 -->
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[10030] flex justify-center bg-mask-60-1"
      :class="props.mode === 'pc' ? 'items-center px-4' : 'items-center px-5'"
      @click.self="handleClose"
    >
      <!-- 任务页进度提醒弹窗主体 -->
      <section
        class="relative shadow-2xl"
        :class="
          props.mode === 'pc'
            ? 'flex h-[245px] w-[492px] flex-col gap-6 rounded-[24px] bg-bg-1 p-8'
            : 'h-[298px] w-full max-w-[300px] rounded-[14px] bg-bg-1'
        "
        style="font-family: Inter, avertastd, sans-serif"
        @click.stop
      >
        <template v-if="props.mode === 'pc'">
          <!-- PC 弹窗头部区域 -->
          <div class="flex h-6 w-full flex-col items-start gap-4">
            <!-- PC 弹窗标题和关闭按钮行 -->
            <div class="flex h-6 w-full items-start justify-between">
              <!-- PC 弹窗标题 -->
              <h3 class="flex h-6 items-center text-[20px] font-[700] leading-6 text-text-1">
                {{ props.title }}
              </h3>

              <!-- PC 关闭按钮 -->
              <button
                type="button"
                class="relative h-6 w-6 shrink-0 rounded-[4px] bg-opacity-10"
                @click="handleClose"
              >
                <span class="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2">
                  <span
                    class="absolute left-1/2 top-1/2 h-[1.5px] w-[14px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-text-1"
                  ></span>
                  <span
                    class="absolute left-1/2 top-1/2 h-[1.5px] w-[14px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-text-1"
                  ></span>
                </span>
              </button>
            </div>
          </div>

          <!-- PC 弹窗说明文案 -->
          <p
            class="h-[60px] w-[428px] font-['PingFang_SC'] text-[14px] font-[400] leading-[20px] text-text-2"
          >
            {{ props.description }}
          </p>

          <!-- PC 按钮区域 -->
          <div class="flex h-[49px] w-[428px] items-start gap-6">
            <!-- PC 次按钮 -->
            <button
              type="button"
              class="flex h-[49px] flex-1 items-center justify-center gap-[10px] rounded-[8px] bg-opacity-10 p-[8px] text-[14px] font-[700] leading-[17px] text-text-2"
              @click="handleSecondaryAction"
            >
              {{ props.secondaryButtonText }}
            </button>

            <!-- PC 主按钮 -->
            <button
              type="button"
              class="flex h-[49px] flex-1 items-center justify-center gap-[10px] rounded-[8px] bg-theme-primary p-[8px] text-[14px] font-[700] leading-[17px] text-text-4"
              @click="handlePrimaryAction"
            >
              {{ props.primaryButtonText }}
            </button>
          </div>
        </template>

        <template v-else>
          <!-- H5 关闭按钮 -->
          <button
            type="button"
            class="absolute right-[14px] top-[14px] flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-opacity-10"
            @click="handleClose"
          >
            <span class="relative h-[10px] w-[10px]">
              <span
                class="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-text-1"
              ></span>
              <span
                class="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-text-1"
              ></span>
            </span>
          </button>

          <!-- H5 内容区域 -->
          <div class="flex h-full flex-col px-5 pb-5 pt-5">
            <!-- H5 标题和说明区域 -->
            <div class="flex flex-col gap-[14px]">
              <!-- H5 标题 -->
              <h3 class="text-[16px] font-[700] leading-5 text-text-1">
                {{ props.title }}
              </h3>

              <!-- H5 说明文案 -->
              <p class="text-[14px] font-[400] leading-[17px] text-text-2">
                {{ props.description }}
              </p>
            </div>

            <!-- H5 按钮区域 -->
            <div class="mt-auto flex flex-col gap-[13px]">
              <!-- H5 主按钮 -->
              <button
                type="button"
                class="h-10 rounded-[8px] bg-theme-primary text-sm font-[700] leading-[17px] text-text-4"
                @click="handlePrimaryAction"
              >
                {{ props.primaryButtonText }}
              </button>

              <!-- H5 次按钮 -->
              <button
                type="button"
                class="h-10 rounded-[8px] bg-opacity-10 text-sm font-[400] leading-[17px] text-text-2"
                @click="handleSecondaryAction"
              >
                {{ props.secondaryButtonText }}
              </button>
            </div>
          </div>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  mode: 'mobile' | 'pc'
  title: string
  description: string
  primaryButtonText: string
  secondaryButtonText: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  primary: []
  secondary: []
}>()

/**
 * 处理关闭弹窗。
 */
function handleClose() {
  emit('update:modelValue', false)
}

/**
 * 处理主按钮点击。
 */
function handlePrimaryAction() {
  emit('primary')
  handleClose()
}

/**
 * 处理次按钮点击。
 */
function handleSecondaryAction() {
  emit('secondary')
  handleClose()
}
</script>
