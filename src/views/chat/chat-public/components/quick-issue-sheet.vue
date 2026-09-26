<template>
  <!-- 快捷问题弹层与遮罩。 -->
  <div
    v-if="visible"
    class="z-[100] flex items-end"
    :class="
      props.displayMode === 'pc'
        ? 'absolute inset-x-0 bottom-0 bg-bg-5'
        : 'fixed inset-0 bg-black/70'
    "
    @click.self="$emit('close')"
  >
    <!-- 快捷问题内容面板。 -->
    <section
      class="w-full bg-bg-1"
      :class="
        props.displayMode === 'pc'
          ? 'max-h-[500px] px-[12px] pb-[28px] pt-[12px]'
          : 'rounded-t-[12px] px-[14px] pb-[40px] pt-[14px]'
      "
    >
      <!-- 弹层标题与关闭按钮。 -->
      <div
        class="relative flex items-center justify-center"
        :class="props.displayMode === 'pc' ? 'h-[30px]' : 'h-[38px]'"
      >
        <h2
          class="font-bold text-text-1"
          :class="props.displayMode === 'pc' ? 'text-[16px] leading-[19px]' : 'text-[16px]'"
        >
          {{ props.activeIssue?.typeName || t('chatPublic.customerServiceList') }}
        </h2>
        <button
          type="button"
          class="absolute right-0 flex items-center justify-center rounded-[6px] bg-opacity-10"
          :class="props.displayMode === 'pc' ? 'size-[24px]' : 'size-[28px]'"
          @click="$emit('close')"
        >
          <CloseIcon class="size-[12px] text-text-1" />
        </button>
      </div>

      <!-- 可发送的后台自动回复问题列表。 -->
      <div
        class="flex flex-col overflow-y-auto"
        :class="
          props.displayMode === 'pc'
            ? 'mt-[20px] max-h-[460px] gap-[20px]'
            : 'mt-[16px] max-h-[360px] gap-[18px]'
        "
      >
        <!-- 单条自动回复问题与发送操作。 -->
        <div
          v-for="item in props.items"
          :key="item.id"
          class="flex items-center gap-[12px]"
          :class="props.displayMode === 'pc' ? 'min-h-[40px]' : 'min-h-[60px]'"
        >
          <p
            class="min-w-0 flex-1 text-[14px] leading-[17px] text-text-1"
            :class="props.displayMode === 'pc' ? 'max-w-[248px]' : ''"
          >
            {{ item.questionTitle }}
          </p>
          <button
            type="button"
            class="shrink-0 rounded-[7px] bg-theme-primary text-[14px] font-bold text-text-4"
            :class="props.displayMode === 'pc' ? 'h-[30px] w-[60px]' : 'h-[40px] w-[101px]'"
            @click="$emit('send', item)"
          >
            {{ t('chatPublic.send') }}
          </button>
        </div>
      </div>
      <!-- 自动回复接口请求中的加载状态。 -->
      <p v-if="props.loading" class="mt-4 text-center text-[13px] text-text-2">
        {{ t('common.loading') }}
      </p>
      <!-- 自动回复接口没有返回问题时的空状态。 -->
      <p v-else-if="!props.items.length" class="mt-4 text-center text-[13px] text-text-2">
        {{ t('common.noData') }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { useI18n } from 'vue-i18n'
import type { AutoReplyItem } from '@/api/interface/chat'
import type { QuickIssue } from '../types'

const props = defineProps<{
  visible: boolean
  activeIssue: QuickIssue | null
  items: AutoReplyItem[]
  loading?: boolean
  displayMode?: 'h5' | 'pc'
}>()

defineEmits<{ close: []; send: [item: AutoReplyItem] }>()

const { t } = useI18n()
</script>
