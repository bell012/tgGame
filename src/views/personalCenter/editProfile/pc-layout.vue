<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[10011] flex items-center justify-center bg-mask-60-1"
    @click.self="handleClose"
  >
    <section
      class="modal-container flex max-h-[80vh] w-[480px] flex-col overflow-hidden rounded-[8px] bg-bg-1"
      @click.stop
    >
      <div class="relative flex h-[56px] items-center justify-center bg-bg-2">
        <h2 class="text-lg font-[700] text-text-1">{{ t('personalCenter.editProfile.title') }}</h2>
        <button
          type="button"
          class="absolute right-4 flex h-6 w-6 items-center justify-center rounded-[4px] bg-opacity-10"
          @click="handleClose"
        >
          <CloseIcon class="h-3 w-3 text-text-1" />
        </button>
      </div>

      <div class="overflow-y-auto px-4 pb-10 pt-[16px]">
        <section class="flex flex-col items-center">
          <div class="relative h-[160px] w-[160px] overflow-visible">
            <div
              class="absolute overflow-hidden rounded-full inset-[2px] border-4 border-opacity-15"
            >
              <img :src="avatarUrl" alt="Avatar" class="h-full w-full rounded-full object-cover" />
            </div>
            <button
              type="button"
              class="absolute bottom-0 left-1/2 z-20 h-[32px] min-w-[120px] -translate-x-1/2 rounded-[6px] bg-theme-primary px-2 text-sm font-[700] text-text-4"
              @click="openAvatarActionSheet"
            >
              {{ t('personalCenter.editProfile.editAvatar') }}
            </button>
          </div>
        </section>

        <section class="mt-[24px]">
          <h3 class="text-base font-[400] text-text-1">
            {{ t('personalCenter.editProfile.username') }}
          </h3>
          <input
            :value="nickName"
            type="text"
            maxlength="20"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            class="mt-[8px] h-[46px] w-full rounded-[10px] border border-input-2 bg-input-1 px-3.5 py-3.5 text-sm font-[700] text-text-1 outline-none placeholder:text-text-2"
            @input="handleNickNameChange"
          />
          <p class="mt-[8px] text-xs text-text-3">
            {{ t('personalCenter.editProfile.usernameHint') }}
          </p>
        </section>

        <button
          type="button"
          class="relative mt-[24px] flex h-[49px] w-full items-center justify-center overflow-hidden rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
          :class="canSave && !isSavingProfile ? '' : 'cursor-not-allowed'"
          :disabled="!canSave || isSavingProfile"
          @click="handleSave"
        >
          <span
            v-if="!canSave || isSavingProfile"
            class="absolute inset-0 z-10 rounded-lg bg-black/35"
          ></span
          ><span class="relative z-20">{{ t('personalCenter.editProfile.save') }}</span>
        </button>

        <input
          ref="cameraInputRef"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="handleFileInputChange"
        /><input
          ref="galleryInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileInputChange"
        />
      </div>
    </section>

    <!-- 点击编辑头像选择文件夹上传图片弹窗 -->
    <transition name="popup-fade">
      <div
        v-show="showAvatarActionSheet"
        class="fixed inset-0 z-[10020] flex items-center justify-center bg-mask-60-1 px-4"
        @click.self="closeAvatarActionSheet"
      >
        <div class="w-full max-w-[360px] rounded-[12px] bg-bg-1 p-4">
          <div class="text-center text-base font-[700] text-text-1">
            {{ t('personalCenter.editProfile.editAvatar') }}
          </div>

          <div class="mt-3 grid gap-3">
            <button
              type="button"
              class="flex h-[44px] items-center justify-center rounded-[10px] bg-bg-2 text-sm font-[700] text-text-1 transition-colors hover:bg-bg-3"
              @click="triggerAvatarInput('gallery')"
            >
              {{ t('personalCenter.editProfile.uploadFromLocal') }}
            </button>

            <button
              type="button"
              class="flex h-[44px] items-center justify-center rounded-[10px] border border-input-2 text-sm font-[700] text-text-2 transition-colors hover:bg-bg-2"
              @click="closeAvatarActionSheet"
            >
              {{ t('personalCenter.editProfile.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="popup-fade">
      <div
        v-show="showAvatarCropper"
        class="fixed inset-0 z-[10022] flex items-center justify-center bg-mask-60-1 px-4 py-6"
        @click.self="closeAvatarCropper"
      >
        <div class="flex w-full max-w-[440px] flex-col rounded-[12px] bg-bg-1 p-3.5">
          <div class="text-center text-base font-[700] text-text-1">
            {{ t('personalCenter.editProfile.editAvatar') }}
          </div>

          <div class="mt-5 flex flex-col items-center justify-center">
            <div
              ref="cropViewportRef"
              class="crop-viewport relative h-[300px] w-[300px] overflow-hidden rounded-full bg-black"
              @pointerdown="handleCropPointerDown"
            >
              <img
                v-if="cropSourceUrl"
                ref="cropImageRef"
                :src="cropSourceUrl"
                alt="Selected Avatar"
                :style="cropImageStyle"
                class="absolute max-w-none select-none"
                draggable="false"
                @load="handleCropImageLoad"
              />
              <div
                class="crop-mask pointer-events-none absolute inset-0 rounded-full border-2 border-white/90"
              ></div>
            </div>

            <p class="mt-3 text-sm font-[700] text-text-1">
              {{ t('personalCenter.editProfile.cropHint') }}
            </p>

            <div class="mt-3 w-full">
              <div class="flex items-center gap-3 text-sm font-[700] text-text-1">
                <span>{{ t('personalCenter.editProfile.zoom') }}</span>
                <input
                  v-model.number="cropScale"
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  class="avatar-zoom-slider h-1 flex-1"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              class="flex h-[44px] items-center justify-center rounded-[10px] border border-input-2 text-sm font-[700] text-text-2 transition-colors hover:bg-bg-2"
              @click="closeAvatarCropper"
            >
              {{ t('personalCenter.editProfile.cancel') }}
            </button>

            <button
              type="button"
              class="flex h-[44px] items-center justify-center rounded-[10px] bg-theme-primary text-sm font-[700] text-text-4 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isUploadingAvatar"
              @click="confirmCroppedAvatar"
            >
              {{ t('personalCenter.editProfile.select') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import { useEditProfile } from './shared'

defineProps<{ visible: boolean }>()

const emit = defineEmits<{ close: []; saved: [] }>()
const { t } = useI18n()
const {
  nickName,
  showAvatarActionSheet,
  showAvatarCropper,
  cameraInputRef,
  galleryInputRef,
  cropViewportRef,
  cropImageRef,
  cropSourceUrl,
  cropScale,
  isUploadingAvatar,
  isSavingProfile,
  avatarUrl,
  canSave,
  cropImageStyle,
  handleNickNameChange,
  openAvatarActionSheet,
  closeAvatarActionSheet,
  triggerAvatarInput,
  handleFileInputChange,
  handleCropImageLoad,
  handleCropPointerDown,
  closeAvatarCropper,
  confirmCroppedAvatar,
  handleSave
} = useEditProfile({ onSaved: () => emit('saved') })

const handleClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;

.crop-viewport {
  touch-action: none;
}

.crop-mask {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.48);
}

.avatar-zoom-slider {
  accent-color: var(--color-theme-primary);
}
</style>
