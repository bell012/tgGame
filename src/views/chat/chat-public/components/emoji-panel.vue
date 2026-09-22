<template>
  <!-- 表情选择面板。 -->
  <section class="h-[284px] shrink-0 bg-bg-1 px-[12px] pb-[16px] pt-[12px]">
    <p class="text-[13px] text-text-1">{{ t('chatPublic.allEmojis') }}</p>
    <!-- 表情网格。 -->
    <div class="mt-[12px] grid grid-cols-7 gap-x-[12px] gap-y-[10px]">
      <button
        v-for="emoji in EMOJI_OPTIONS"
        :key="emoji"
        type="button"
        class="flex h-[32px] items-center justify-center text-[24px]"
        @click="$emit('select', emoji)"
      >
        {{ emoji }}
      </button>
    </div>
    <!-- 删除与发送操作区。 -->
    <div class="mt-[14px] flex justify-end gap-[10px]">
      <button type="button" @click="$emit('delete')">
        <DeleteKeyIcon class="h-[43px] w-[63px]" />
      </button>
      <button
        type="button"
        class="h-[43px] w-[63px] rounded-[6px] bg-theme-primary text-[14px] font-bold text-text-4"
        @click="$emit('send')"
      >
        {{ t('chatPublic.send') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import DeleteKeyIcon from '@/static/svg/chat/public/delete-key.svg?component'
import { useI18n } from 'vue-i18n'
import { EMOJI_OPTIONS } from '../shared'

const { t } = useI18n()

defineEmits<{ select: [emoji: string]; delete: []; send: [] }>()
</script>
