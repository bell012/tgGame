<template>
  <div class="fixed inset-0 overflow-y-auto bg-bg-1">
    <H5Header :title="t('personalCenter.editProfile.title')" />

    <div class="px-3.5 pb-8 pt-[25px]">
      <section class="flex flex-col items-center">
        <div class="relative h-[120px] w-[120px] overflow-visible">
          <div
            :class="[
              'absolute overflow-hidden rounded-full',
              selectedAvatarFrameImage ? 'inset-[14px]' : 'inset-[2px] border-2 border-icon-2'
            ]"
          >
            <img :src="avatarUrl" alt="Avatar" class="h-full w-full rounded-full object-cover" />
          </div>

          <img
            v-if="selectedAvatarFrameImage"
            :src="selectedAvatarFrameImage"
            alt="Avatar Frame"
            class="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
          />

          <button
            type="button"
            class="absolute bottom-0 left-1/2 z-20 h-[28px] min-w-[80px] -translate-x-1/2 rounded-[6px] bg-theme-primary px-2 text-xs font-[700] text-text-4"
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

      <section class="mt-5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-[400] text-text-1">
            {{ t('personalCenter.editProfile.avatarFrame') }}
          </h3>
          <p v-if="unlockHintText" class="text-xs text-text-2">{{ unlockHintText }}</p>
        </div>

        <div class="mt-5 grid grid-cols-4 gap-x-1.5 gap-y-4">
          <button
            v-for="item in avatarFrameOptions"
            :key="item.id"
            type="button"
            class="relative"
            :disabled="item.locked"
            @click="selectAvatarFrame(item.id)"
          >
            <div
              :class="[
                'relative flex h-[98px] items-center justify-center rounded-[10px] transition-all',
                item.id === selectedAvatarFrameId ? 'bg-bg-2' : 'bg-transparent',
                item.locked ? 'opacity-90' : ''
              ]"
            >
              <img :src="item.image" :alt="item.id" class="h-[80px] w-[80px] object-contain" />

              <LockIcon
                v-if="item.locked"
                class="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-text-1"
              />

              <span
                v-if="item.id === selectedAvatarFrameId"
                class="absolute bottom-2 left-1/2 flex h-[16px] min-w-[52px] -translate-x-1/2 items-center justify-center rounded-full bg-theme-primary px-1 text-[10px] font-[700] text-text-4"
              >
                {{ t('personalCenter.editProfile.inUse') }}
              </span>
            </div>
          </button>
        </div>
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import Api from '@/api'
import H5Header from '@/components/common/H5Header.vue'
import { useUserStore } from '@/stores/user'
import { useVipStore } from '@/stores/vip'
import {
  clearProfileAvatarPreviewState,
  DEFAULT_AVATAR_FRAME_ID,
  profileCustomizationState,
  resolveProfileAvatarUrl,
  saveProfileCustomization,
  setProfileAvatarPreviewState,
  setProfileCustomizationState,
  setProfileUserInfoState,
  type AvatarFrameId
} from '@/utils/profile-customization'
import {
  handleNicknameInput as handleNicknameInputEvent,
  isValidNickname
} from '@/utils/phone-input'
import { navigateTo } from '@/utils/router'
import LockIcon from '@/static/svg/lock.svg?component'
import border1Image from '@/static/img/personalCenter/border_1.png'
import border2Image from '@/static/img/personalCenter/border_2.png'
import border3Image from '@/static/img/personalCenter/border_3.png'
import border4Image from '@/static/img/personalCenter/border_4.png'
import border5Image from '@/static/img/personalCenter/border_5.png'
import borderNoneImage from '@/static/img/personalCenter/border_none.png'

const MAX_VIP_AVATAR_FRAME_LEVEL = 5

const { t } = useI18n()
const userStore = useUserStore()
const vipStore = useVipStore()
const { userInfo } = storeToRefs(userStore)
const { myVipInfo } = storeToRefs(vipStore)
const nickName = ref('')
const selectedAvatarFrameId = ref<AvatarFrameId>(DEFAULT_AVATAR_FRAME_ID)
const showAvatarActionSheet = ref(false)
const showAvatarCropper = ref(false)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const galleryInputRef = ref<HTMLInputElement | null>(null)
const cropViewportRef = ref<HTMLElement | null>(null)
const cropImageRef = ref<HTMLImageElement | null>(null)
const selectedAvatarFile = ref<File | null>(null)
const cropSourceUrl = ref('')
const cropViewportSize = ref(0)
const cropScale = ref(1)
const cropOffset = ref({ x: 0, y: 0 })
const cropBaseSize = ref({ width: 0, height: 0 })
const isDraggingCropImage = ref(false)
const isUploadingAvatar = ref(false)
const isSavingProfile = ref(false)
const pendingHeadPortrait = ref('')
const dragStartPoint = ref({ x: 0, y: 0 })
const dragStartOffset = ref({ x: 0, y: 0 })
const originalForm = ref({
  nickName: '',
  avatarFrameId: DEFAULT_AVATAR_FRAME_ID as AvatarFrameId,
  headPortrait: ''
})

const avatarFrameImageMap: Record<Exclude<AvatarFrameId, 'none'>, string> = {
  border_1: border1Image,
  border_2: border2Image,
  border_3: border3Image,
  border_4: border4Image,
  border_5: border5Image
}

const avatarUrl = computed(() => {
  return resolveProfileAvatarUrl(userInfo.value?.headPortrait)
})

const normalizeVipLevel = (vipId: unknown) => {
  const numericVipId = Number(vipId)

  if (!Number.isFinite(numericVipId)) {
    return 0
  }

  return Math.min(MAX_VIP_AVATAR_FRAME_LEVEL, Math.max(0, Math.trunc(numericVipId)))
}

const getDefaultAvatarFrameIdByVipLevel = (vipLevel: number): AvatarFrameId => {
  if (vipLevel <= 0) {
    return DEFAULT_AVATAR_FRAME_ID
  }

  return `border_${Math.min(vipLevel, MAX_VIP_AVATAR_FRAME_LEVEL)}` as AvatarFrameId
}

const getRequiredVipLevelForFrame = (frameId: AvatarFrameId) => {
  if (frameId === DEFAULT_AVATAR_FRAME_ID) {
    return 0
  }

  return normalizeVipLevel(frameId.replace('border_', ''))
}

const avatarFrameDefinitions: Array<{
  id: AvatarFrameId
  image: string
  requiredVipLevel: number
}> = [
  { id: 'none', image: borderNoneImage, requiredVipLevel: 0 },
  { id: 'border_1', image: border1Image, requiredVipLevel: 1 },
  { id: 'border_2', image: border2Image, requiredVipLevel: 2 },
  { id: 'border_3', image: border3Image, requiredVipLevel: 3 },
  { id: 'border_4', image: border4Image, requiredVipLevel: 4 },
  { id: 'border_5', image: border5Image, requiredVipLevel: 5 }
]

const vipLevel = computed(() =>
  normalizeVipLevel(myVipInfo.value?.vipId ?? userInfo.value?.vipId ?? 0)
)
const defaultAvatarFrameId = computed(() => getDefaultAvatarFrameIdByVipLevel(vipLevel.value))
const unlockHintText = computed(() => {
  if (vipLevel.value >= MAX_VIP_AVATAR_FRAME_LEVEL) {
    return t('personalCenter.editProfile.allUnlockedHint')
  }

  return t('personalCenter.editProfile.unlockHint', {
    level: vipLevel.value + 1
  })
})
const isNicknameValid = computed(() => isValidNickname(nickName.value))
const canSave = computed(() => {
  return (
    isNicknameValid.value &&
    (nickName.value !== originalForm.value.nickName ||
      selectedAvatarFrameId.value !== originalForm.value.avatarFrameId ||
      pendingHeadPortrait.value !== originalForm.value.headPortrait)
  )
})

const selectedAvatarFrameImage = computed(() => {
  const avatarFrameId = selectedAvatarFrameId.value
  if (avatarFrameId === DEFAULT_AVATAR_FRAME_ID) return ''
  return avatarFrameImageMap[avatarFrameId as Exclude<AvatarFrameId, 'none'>]
})

const cropImageStyle = computed<CSSProperties>(() => {
  const width = cropBaseSize.value.width * cropScale.value
  const height = cropBaseSize.value.height * cropScale.value

  return {
    width: `${width}px`,
    height: `${height}px`,
    left: `calc(50% + ${cropOffset.value.x}px)`,
    top: `calc(50% + ${cropOffset.value.y}px)`,
    transform: 'translate(-50%, -50%)',
    cursor: isDraggingCropImage.value ? 'grabbing' : 'grab'
  }
})

const avatarFrameOptions = computed(() => {
  return avatarFrameDefinitions.map(item => ({
    ...item,
    locked: vipLevel.value < item.requiredVipLevel
  }))
})

const syncFormState = () => {
  const nextNickName = userInfo.value?.nickName || ''
  const nextAvatarFrameId = defaultAvatarFrameId.value
  const nextHeadPortrait = userInfo.value?.headPortrait?.trim() ?? ''

  nickName.value = nextNickName
  selectedAvatarFrameId.value = nextAvatarFrameId
  pendingHeadPortrait.value = nextHeadPortrait
  clearProfileAvatarPreviewState()
  originalForm.value = {
    nickName: nextNickName,
    avatarFrameId: nextAvatarFrameId,
    headPortrait: nextHeadPortrait
  }
}

const handleNickNameChange = (event: Event) => {
  handleNicknameInputEvent(event, value => {
    nickName.value = value
  })
}

const selectAvatarFrame = (frameId: AvatarFrameId) => {
  const targetFrame = avatarFrameOptions.value.find(item => item.id === frameId)
  if (!targetFrame || targetFrame.locked || vipLevel.value < getRequiredVipLevelForFrame(frameId))
    return

  selectedAvatarFrameId.value = frameId
  setProfileCustomizationState(
    {
      ...profileCustomizationState.value,
      avatarFrameId: frameId
    },
    false
  )
}

const clampValue = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const getClampedCropOffset = (offset = cropOffset.value) => {
  const maxOffsetX = Math.max(
    0,
    (cropBaseSize.value.width * cropScale.value - cropViewportSize.value) / 2
  )
  const maxOffsetY = Math.max(
    0,
    (cropBaseSize.value.height * cropScale.value - cropViewportSize.value) / 2
  )

  return {
    x: clampValue(offset.x, -maxOffsetX, maxOffsetX),
    y: clampValue(offset.y, -maxOffsetY, maxOffsetY)
  }
}

const syncCropViewportSize = () => {
  cropViewportSize.value = cropViewportRef.value?.clientWidth ?? 0
}

const initializeCropBounds = () => {
  const imageElement = cropImageRef.value
  syncCropViewportSize()

  if (
    !imageElement ||
    !cropViewportSize.value ||
    !imageElement.naturalWidth ||
    !imageElement.naturalHeight
  ) {
    return
  }

  const imageAspectRatio = imageElement.naturalWidth / imageElement.naturalHeight
  cropBaseSize.value =
    imageAspectRatio >= 1
      ? { width: cropViewportSize.value * imageAspectRatio, height: cropViewportSize.value }
      : { width: cropViewportSize.value, height: cropViewportSize.value / imageAspectRatio }

  cropScale.value = 1
  cropOffset.value = { x: 0, y: 0 }
}

const revokeCropSourceUrl = () => {
  if (cropSourceUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropSourceUrl.value)
  }

  cropSourceUrl.value = ''
}

const openAvatarActionSheet = () => {
  showAvatarActionSheet.value = true
}

const closeAvatarActionSheet = () => {
  showAvatarActionSheet.value = false
}

const triggerAvatarInput = (source: 'camera' | 'gallery') => {
  closeAvatarActionSheet()

  window.setTimeout(() => {
    if (source === 'camera') {
      cameraInputRef.value?.click()
      return
    }

    galleryInputRef.value?.click()
  }, 0)
}

const closeAvatarCropper = () => {
  showAvatarCropper.value = false
  isDraggingCropImage.value = false
  selectedAvatarFile.value = null
  revokeCropSourceUrl()
}

const handleFileInputChange = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  const file = inputElement.files?.[0]

  inputElement.value = ''

  if (!file) {
    selectedAvatarFile.value = null
    return
  }

  selectedAvatarFile.value = file
  revokeCropSourceUrl()
  cropSourceUrl.value = URL.createObjectURL(file)
  showAvatarCropper.value = true
}

const handleCropImageLoad = () => {
  initializeCropBounds()
}

const handleCropPointerDown = (event: PointerEvent) => {
  if (!showAvatarCropper.value || !cropViewportSize.value) {
    return
  }

  event.preventDefault()
  isDraggingCropImage.value = true
  dragStartPoint.value = { x: event.clientX, y: event.clientY }
  dragStartOffset.value = { ...cropOffset.value }
}

const handleGlobalPointerMove = (event: PointerEvent) => {
  if (!isDraggingCropImage.value) {
    return
  }

  event.preventDefault()
  cropOffset.value = getClampedCropOffset({
    x: dragStartOffset.value.x + (event.clientX - dragStartPoint.value.x),
    y: dragStartOffset.value.y + (event.clientY - dragStartPoint.value.y)
  })
}

const stopDraggingCropImage = () => {
  isDraggingCropImage.value = false
}

const getUploadedHeadPortrait = (result: unknown) => {
  if (typeof result === 'string') {
    return result.trim()
  }

  if (!result || typeof result !== 'object') {
    return ''
  }

  const resultRecord = result as Record<string, unknown>
  const candidates = [
    resultRecord.headPortrait,
    resultRecord.url,
    resultRecord.path,
    resultRecord.fileName
  ]

  const target = candidates.find(value => typeof value === 'string' && value.trim())
  return typeof target === 'string' ? target.trim() : ''
}

const getAvatarUploadFileName = () => {
  const originalFileName = selectedAvatarFile.value?.name?.trim() || 'avatar'
  const sanitizedFileName = originalFileName.replace(/[\\/:*?"<>|\r\n]+/g, '_')
  const extensionIndex = sanitizedFileName.lastIndexOf('.')
  const baseName =
    extensionIndex > 0 ? sanitizedFileName.slice(0, extensionIndex) : sanitizedFileName

  return `${baseName || 'avatar'}.jpg`
}

const createCroppedAvatarCanvas = () => {
  const imageElement = cropImageRef.value

  if (
    !imageElement ||
    !cropViewportSize.value ||
    !cropBaseSize.value.width ||
    !cropBaseSize.value.height
  ) {
    return ''
  }

  const displayedWidth = cropBaseSize.value.width * cropScale.value
  const displayedHeight = cropBaseSize.value.height * cropScale.value
  const imageLeft = cropViewportSize.value / 2 + cropOffset.value.x - displayedWidth / 2
  const imageTop = cropViewportSize.value / 2 + cropOffset.value.y - displayedHeight / 2
  const sourceScaleX = imageElement.naturalWidth / displayedWidth
  const sourceScaleY = imageElement.naturalHeight / displayedHeight
  const sourceX = Math.max(0, -imageLeft * sourceScaleX)
  const sourceY = Math.max(0, -imageTop * sourceScaleY)
  const sourceWidth = Math.min(
    imageElement.naturalWidth - sourceX,
    cropViewportSize.value * sourceScaleX
  )
  const sourceHeight = Math.min(
    imageElement.naturalHeight - sourceY,
    cropViewportSize.value * sourceScaleY
  )
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  canvas.width = 512
  canvas.height = 512
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    imageElement,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return canvas
}

const canvasToBlob = (canvas: HTMLCanvasElement) => {
  return new Promise<Blob | null>(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92)
  })
}

const confirmCroppedAvatar = async () => {
  if (isUploadingAvatar.value) {
    return
  }

  const croppedCanvas = createCroppedAvatarCanvas()

  if (!croppedCanvas) {
    return
  }

  const avatarPreview = croppedCanvas.toDataURL('image/jpeg', 0.92)
  const avatarBlob = await canvasToBlob(croppedCanvas)

  if (!avatarBlob) {
    showToast({
      message: t('common.error'),
      position: 'middle',
      type: 'fail'
    })
    return
  }

  isUploadingAvatar.value = true

  try {
    const response = await Api.picture.upload({
      file: avatarBlob,
      fileName: getAvatarUploadFileName()
    })

    if (!response?.success) {
      throw new Error(response?.message || t('common.error'))
    }

    const uploadedHeadPortrait = getUploadedHeadPortrait(response.result)

    if (!uploadedHeadPortrait) {
      throw new Error(response?.message || t('common.error'))
    }

    pendingHeadPortrait.value = uploadedHeadPortrait
    setProfileAvatarPreviewState(avatarPreview)
    closeAvatarCropper()
  } catch (error) {
    console.error(error)
    showToast({
      message: error instanceof Error ? error.message : t('common.error'),
      position: 'middle',
      type: 'fail'
    })
  } finally {
    isUploadingAvatar.value = false
  }
}

const handleSave = async () => {
  if (!canSave.value || isSavingProfile.value) return

  const payload: {
    nickName?: string
    headPortrait?: string
  } = {
    nickName: nickName.value
  }

  if (pendingHeadPortrait.value) {
    payload.headPortrait = pendingHeadPortrait.value
  }

  isSavingProfile.value = true

  try {
    const response = await Api.user.modifyMemberInfo(payload)

    if (!response?.success) {
      throw new Error(response?.message || t('common.error'))
    }

    saveProfileCustomization({
      avatarFrameId: selectedAvatarFrameId.value
    })

    const nextHeadPortrait = pendingHeadPortrait.value || userInfo.value?.headPortrait || ''

    setProfileUserInfoState({
      ...(userInfo.value ?? {}),
      nickName: nickName.value,
      headPortrait: nextHeadPortrait || undefined
    })
    clearProfileAvatarPreviewState()
    pendingHeadPortrait.value = nextHeadPortrait

    originalForm.value = {
      nickName: nickName.value,
      avatarFrameId: selectedAvatarFrameId.value,
      headPortrait: nextHeadPortrait
    }

    showToast({
      message: t('personalCenter.editProfile.saveSuccess'),
      position: 'middle',
      type: 'success'
    })

    navigateTo('/personal-center/my-profile', { replace: true })
  } catch (error) {
    console.error(error)
    showToast({
      message: error instanceof Error ? error.message : t('common.error'),
      position: 'middle',
      type: 'fail'
    })
  } finally {
    isSavingProfile.value = false
  }
}

const initializeEditProfile = async () => {
  userStore.syncStoredUserData()
  syncFormState()
  await Promise.all([userStore.refreshCurrentUserData(), vipStore.refreshMyVipInfo()])
  syncFormState()
}

watch(cropScale, () => {
  cropOffset.value = getClampedCropOffset()
})

watch(showAvatarCropper, visible => {
  if (!visible) {
    return
  }

  void nextTick(() => {
    syncCropViewportSize()
  })
})

onMounted(() => {
  void initializeEditProfile()
  window.addEventListener('pointermove', handleGlobalPointerMove)
  window.addEventListener('pointerup', stopDraggingCropImage)
  window.addEventListener('pointercancel', stopDraggingCropImage)
  window.addEventListener('resize', syncCropViewportSize)
})

onUnmounted(() => {
  userStore.syncStoredUserData()
  clearProfileAvatarPreviewState()
  revokeCropSourceUrl()
  window.removeEventListener('pointermove', handleGlobalPointerMove)
  window.removeEventListener('pointerup', stopDraggingCropImage)
  window.removeEventListener('pointercancel', stopDraggingCropImage)
  window.removeEventListener('resize', syncCropViewportSize)
})
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
