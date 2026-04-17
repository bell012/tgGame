<template>
  <div class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header :title="t('personalCenter.editProfile.title')" />

    <div class="px-3.5 pb-8 pt-[25px]">
      <section class="flex flex-col items-center">
        <div class="relative h-[120px] w-[120px] overflow-visible">
          <div class="absolute overflow-hidden rounded-full inset-0 border-4 border-opacity-15">
            <img :src="avatarUrl" alt="Avatar" class="h-full w-full rounded-full object-cover" />
          </div>

          <button
            type="button"
            class="absolute bottom-0 left-1/2 z-20 h-[28px] min-w-[84px] -translate-x-1/2 rounded-[6px] bg-theme-primary px-2 text-xs font-[700] text-text-4"
            @click="openAvatarActionSheet"
          >
            {{ t('personalCenter.editProfile.editAvatar') }}
          </button>
        </div>
      </section>

      <section class="mt-[25px]">
        <h3 class="text-sm font-[400] text-text-1">
          {{ t('personalCenter.editProfile.username') }}
        </h3>
        <input
          :value="nickName"
          type="text"
          maxlength="20"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          class="mt-[7px] h-[40px] w-full rounded-lg border border-input-2 bg-input-1 px-3 py-[13px] text-xs font-[700] text-text-1 outline-none placeholder:text-text-2"
          @input="handleNickNameChange"
        />
        <p class="mt-[7px] text-xs text-text-3">
          {{ t('personalCenter.editProfile.usernameHint') }}
        </p>
      </section>

      <button
        type="button"
        class="relative mt-5 flex h-[40px] w-full items-center justify-center overflow-hidden rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
        :class="canSave && !isSavingProfile ? '' : 'cursor-not-allowed'"
        :disabled="!canSave || isSavingProfile"
        @click="handleSave"
      >
        <span
          v-if="!canSave || isSavingProfile"
          class="absolute inset-0 z-10 rounded-lg bg-black/35"
        ></span>
        <span class="relative z-20">{{ t('personalCenter.editProfile.save') }}</span>
      </button>

      <input
        ref="cameraInputRef"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="handleFileInputChange"
      />
      <input
        ref="galleryInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileInputChange"
      />
    </div>

    <transition name="popup-fade">
      <div
        v-show="showAvatarActionSheet"
        class="fixed inset-0 z-[999] bg-mask-60-1"
        @click.self="closeAvatarActionSheet"
      />
    </transition>

    <transition name="up-down">
      <div v-show="showAvatarActionSheet" class="fixed bottom-0 left-0 z-[1000] w-full">
        <div class="rounded-t-xl bg-bg-1 pb-[max(env(safe-area-inset-bottom),30px)] pt-3.5">
          <div class="pb-2.5 text-center text-base font-bold text-text-1">
            {{ t('personalCenter.editProfile.editAvatar') }}
          </div>

          <div
            type="button"
            class="flex h-[50px] w-full items-center justify-center border-b border-t border-opacity-5 text-sm font-[700] text-text-1"
            @click="triggerAvatarInput('camera')"
          >
            {{ t('personalCenter.editProfile.takePhoto') }}
          </div>

          <div
            type="button"
            class="flex h-[50px] w-full items-center justify-center border-b border-opacity-5 text-sm font-[700] text-text-1"
            @click="triggerAvatarInput('gallery')"
          >
            {{ t('personalCenter.editProfile.chooseFromAlbum') }}
          </div>

          <div
            type="button"
            class="flex h-[50px] w-full items-center justify-center border-b border-opacity-5 text-sm font-[700] text-text-1"
            @click="closeAvatarActionSheet"
          >
            {{ t('personalCenter.editProfile.cancel') }}
          </div>
        </div>
      </div>
    </transition>

    <transition name="popup-fade">
      <div v-show="showAvatarCropper" class="fixed inset-0 z-[1001] bg-black">
        <div
          class="flex h-full flex-col px-3.5 pb-[max(env(safe-area-inset-bottom),30px)] pt-[max(env(safe-area-inset-top),30px)]"
        >
          <div class="text-center text-sm font-bold text-text-1">
            {{ t('personalCenter.editProfile.editAvatar') }}
          </div>

          <div class="flex flex-1 flex-col items-center justify-center">
            <div
              ref="cropViewportRef"
              class="crop-viewport relative h-[80vw] max-h-[340px] w-[80vw] max-w-[340px] overflow-hidden"
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

            <p class="mt-5 text-sm font-bold text-text-1">
              {{ t('personalCenter.editProfile.cropHint') }}
            </p>

            <div class="mt-5 w-full max-w-[340px]">
              <div class="flex items-center gap-3 text-sm font-bold text-text-1">
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

          <div class="flex items-center justify-between">
            <button type="button" class="text-sm font-bold text-text-1" @click="closeAvatarCropper">
              {{ t('personalCenter.editProfile.cancel') }}
            </button>
            <button
              type="button"
              class="text-sm font-bold text-text-1 disabled:opacity-60"
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
import H5Header from '@/components/common/H5Header.vue'
import { useEditProfile } from './shared'

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
} = useEditProfile()
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
