<template>
  <div>
    <transition name="popup-fade">
      <div v-show="visible" class="fixed inset-0 z-[99] bg-mask-60-1" @click.self="close" />
    </transition>
    <transition name="up-down">
      <div v-show="visible" class="fixed left-0 bottom-0 z-[99] w-full">
        <div class="rounded-t-xl bg-bg-1 px-3 pb-10 pt-2.5">
          <div class="mb-3.5 flex items-center justify-between">
            <div></div>
            <div class="text-base font-bold text-text-1">
              {{ t('personalCenter.inviteFriends') }}
            </div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-md bg-opacity-10"
              @click="close"
            >
              <CloseIcon class="h-3 w-3 text-text-1" />
            </button>
          </div>

          <div class="mb-5 rounded-xl bg-bg-6 p-3.5">
            <div class="flex items-center gap-3.5">
              <img
                :src="inviteImage"
                alt="invite"
                class="h-[100px] w-[95px] shrink-0 object-contain"
              />
              <div class="min-w-0 flex-1">
                <div class="mb-1 text-base font-[700] text-text-1">
                  {{ t('personalCenter.inviteFriendsAndGet') }}
                </div>
                <div class="mb-1 text-xl font-[700]">
                  <span class="text-secondary-7">{{ rewardText }}</span>
                  <span class="text-text-1 mx-[5px]">+</span>
                  <span class="text-theme-primary">{{ rewardText2 }}</span>
                </div>
                <div class="mb-1 text-base font-[700] text-text-1">
                  {{ t('personalCenter.commission') }}
                </div>
                <div class="text-xs font-[400] text-theme-primary">
                  {{ t('personalCenter.inviteFriendsEarnBonus') }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-2 text-sm text-text-2 font-[500]">
            {{ t('personalCenter.shareViaWebLink') }}
          </div>

          <div
            class="mb-5 flex w-full h-[40px] items-center rounded-lg border border-input-2 bg-input-1 px-2"
          >
            <span class="flex-1 truncate text-left text-xs text-theme-primary font-[500]">{{
              link
            }}</span>
          </div>

          <button
            class="flex h-[40px] w-full items-center justify-center rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
            @click="emit('copy')"
          >
            {{ t('personalCenter.copyLink') }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import inviteImage from '@/static/img/personalCenter/yaoqing2.png'

defineProps<{
  visible: boolean
  rewardText: string
  rewardText2: string
  link: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  copy: []
}>()

const { t } = useI18n()

const close = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;
</style>
