import { computed, nextTick, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import Api from '@/api'
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
import border1Image from '@/static/img/personalCenter/border_1.png'
import border2Image from '@/static/img/personalCenter/border_2.png'
import border3Image from '@/static/img/personalCenter/border_3.png'
import border4Image from '@/static/img/personalCenter/border_4.png'
import border5Image from '@/static/img/personalCenter/border_5.png'
import borderNoneImage from '@/static/img/personalCenter/border_none.png'

const MAX_VIP_AVATAR_FRAME_LEVEL = 5

/**
 * 提供编辑资料页面在 H5 与 PC 间复用的表单、头像与头像框逻辑。
 */
export const useEditProfile = (options?: { onSaved?: () => void }) => {
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
  const avatarFrameDefinitions = [
    { id: 'none' as AvatarFrameId, image: borderNoneImage, requiredVipLevel: 0 },
    { id: 'border_1' as AvatarFrameId, image: border1Image, requiredVipLevel: 1 },
    { id: 'border_2' as AvatarFrameId, image: border2Image, requiredVipLevel: 2 },
    { id: 'border_3' as AvatarFrameId, image: border3Image, requiredVipLevel: 3 },
    { id: 'border_4' as AvatarFrameId, image: border4Image, requiredVipLevel: 4 },
    { id: 'border_5' as AvatarFrameId, image: border5Image, requiredVipLevel: 5 }
  ]

  const avatarUrl = computed(() => resolveProfileAvatarUrl(userInfo.value?.headPortrait))

  /**
   * 将传入的 VIP 等级值规范化到可用范围内。
   */
  const normalizeVipLevel = (vipId: unknown) => {
    const numericVipId = Number(vipId)
    return Number.isFinite(numericVipId)
      ? Math.min(MAX_VIP_AVATAR_FRAME_LEVEL, Math.max(0, Math.trunc(numericVipId)))
      : 0
  }
  /**
   * 根据 VIP 等级返回默认可使用的头像框 ID。
   */
  const getDefaultAvatarFrameIdByVipLevel = (vipLevel: number): AvatarFrameId =>
    vipLevel <= 0
      ? DEFAULT_AVATAR_FRAME_ID
      : (`border_${Math.min(vipLevel, MAX_VIP_AVATAR_FRAME_LEVEL)}` as AvatarFrameId)

  /**
   * 获取指定头像框所需的 VIP 等级。
   */
  const getRequiredVipLevelForFrame = (frameId: AvatarFrameId) =>
    frameId === DEFAULT_AVATAR_FRAME_ID ? 0 : normalizeVipLevel(frameId.replace('border_', ''))

  const vipLevel = computed(() =>
    normalizeVipLevel(myVipInfo.value?.vipId ?? userInfo.value?.vipId ?? 0)
  )
  const defaultAvatarFrameId = computed(() => getDefaultAvatarFrameIdByVipLevel(vipLevel.value))
  const unlockHintText = computed(() =>
    vipLevel.value >= MAX_VIP_AVATAR_FRAME_LEVEL
      ? t('personalCenter.editProfile.allUnlockedHint')
      : t('personalCenter.editProfile.unlockHint', { level: vipLevel.value + 1 })
  )
  const isNicknameValid = computed(() => isValidNickname(nickName.value))
  const canSave = computed(
    () =>
      isNicknameValid.value &&
      (nickName.value !== originalForm.value.nickName ||
        selectedAvatarFrameId.value !== originalForm.value.avatarFrameId ||
        pendingHeadPortrait.value !== originalForm.value.headPortrait)
  )
  const selectedAvatarFrameImage = computed(() =>
    selectedAvatarFrameId.value === DEFAULT_AVATAR_FRAME_ID
      ? ''
      : avatarFrameImageMap[selectedAvatarFrameId.value as Exclude<AvatarFrameId, 'none'>]
  )
  const cropImageStyle = computed<CSSProperties>(() => ({
    width: `${cropBaseSize.value.width * cropScale.value}px`,
    height: `${cropBaseSize.value.height * cropScale.value}px`,
    left: `calc(50% + ${cropOffset.value.x}px)`,
    top: `calc(50% + ${cropOffset.value.y}px)`,
    transform: 'translate(-50%, -50%)',
    cursor: isDraggingCropImage.value ? 'grabbing' : 'grab'
  }))
  const avatarFrameOptions = computed(() =>
    avatarFrameDefinitions.map(item => ({
      ...item,
      locked: vipLevel.value < item.requiredVipLevel
    }))
  )

  /**
   * 将当前用户资料同步到编辑表单初始状态。
   */
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

  /**
   * 处理昵称输入
   */
  const handleNickNameChange = (event: Event) =>
    handleNicknameInputEvent(event, value => {
      nickName.value = value
    })

  /**
   * 选择头像框，未解锁的头像框不可选中。
   */
  const selectAvatarFrame = (frameId: AvatarFrameId) => {
    const targetFrame = avatarFrameOptions.value.find(item => item.id === frameId)
    if (!targetFrame || targetFrame.locked || vipLevel.value < getRequiredVipLevelForFrame(frameId))
      return
    selectedAvatarFrameId.value = frameId
    setProfileCustomizationState(
      { ...profileCustomizationState.value, avatarFrameId: frameId },
      false
    )
  }

  /**
   * 将数值限制在指定范围内。
   */
  const clampValue = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value))

  /**
   * 根据当前缩放尺寸限制裁剪图的可拖拽偏移量。
   */
  const getClampedCropOffset = (offset = cropOffset.value) => ({
    x: clampValue(
      offset.x,
      -Math.max(0, (cropBaseSize.value.width * cropScale.value - cropViewportSize.value) / 2),
      Math.max(0, (cropBaseSize.value.width * cropScale.value - cropViewportSize.value) / 2)
    ),
    y: clampValue(
      offset.y,
      -Math.max(0, (cropBaseSize.value.height * cropScale.value - cropViewportSize.value) / 2),
      Math.max(0, (cropBaseSize.value.height * cropScale.value - cropViewportSize.value) / 2)
    )
  })
  /**
   * 同步裁剪视口尺寸。
   */
  const syncCropViewportSize = () => {
    cropViewportSize.value = cropViewportRef.value?.clientWidth ?? 0
  }

  /**
   * 根据图片原始比例初始化裁剪区域边界。
   */
  const initializeCropBounds = () => {
    const imageElement = cropImageRef.value
    syncCropViewportSize()
    if (
      !imageElement ||
      !cropViewportSize.value ||
      !imageElement.naturalWidth ||
      !imageElement.naturalHeight
    )
      return
    const imageAspectRatio = imageElement.naturalWidth / imageElement.naturalHeight
    cropBaseSize.value =
      imageAspectRatio >= 1
        ? { width: cropViewportSize.value * imageAspectRatio, height: cropViewportSize.value }
        : { width: cropViewportSize.value, height: cropViewportSize.value / imageAspectRatio }
    cropScale.value = 1
    cropOffset.value = { x: 0, y: 0 }
  }
  /**
   * 释放裁剪预览用到的 Blob URL。
   */
  const revokeCropSourceUrl = () => {
    if (cropSourceUrl.value.startsWith('blob:')) URL.revokeObjectURL(cropSourceUrl.value)
    cropSourceUrl.value = ''
  }

  /**
   * 打开头像来源选择弹层。
   */
  const openAvatarActionSheet = () => {
    showAvatarActionSheet.value = true
  }

  /**
   * 关闭头像来源选择弹层。
   */
  const closeAvatarActionSheet = () => {
    showAvatarActionSheet.value = false
  }

  /**
   * 根据来源触发拍照或相册文件选择。
   */
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

  /**
   * 关闭头像裁剪弹层，并清理临时状态。
   */
  const closeAvatarCropper = () => {
    showAvatarCropper.value = false
    isDraggingCropImage.value = false
    selectedAvatarFile.value = null
    revokeCropSourceUrl()
  }
  /**
   * 处理头像文件选择，并打开裁剪弹层。
   */
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
  /**
   * 裁剪图片加载完成后初始化裁剪边界。
   */
  const handleCropImageLoad = () => initializeCropBounds()

  /**
   * 开始拖拽裁剪图片。
   */
  const handleCropPointerDown = (event: PointerEvent) => {
    if (!showAvatarCropper.value || !cropViewportSize.value) return
    event.preventDefault()
    isDraggingCropImage.value = true
    dragStartPoint.value = { x: event.clientX, y: event.clientY }
    dragStartOffset.value = { ...cropOffset.value }
  }
  /**
   * 全局监听拖拽移动，更新裁剪偏移量。
   */
  const handleGlobalPointerMove = (event: PointerEvent) => {
    if (!isDraggingCropImage.value) return
    event.preventDefault()
    cropOffset.value = getClampedCropOffset({
      x: dragStartOffset.value.x + (event.clientX - dragStartPoint.value.x),
      y: dragStartOffset.value.y + (event.clientY - dragStartPoint.value.y)
    })
  }
  /**
   * 结束裁剪图片拖拽状态。
   */
  const stopDraggingCropImage = () => {
    isDraggingCropImage.value = false
  }

  /**
   * 从上传接口返回值中提取头像地址字段。
   */
  const getUploadedHeadPortrait = (result: unknown) => {
    if (typeof result === 'string') return result.trim()
    if (!result || typeof result !== 'object') return ''
    const resultRecord = result as Record<string, unknown>
    const target = [
      resultRecord.headPortrait,
      resultRecord.url,
      resultRecord.path,
      resultRecord.fileName
    ].find(value => typeof value === 'string' && value.trim())
    return typeof target === 'string' ? target.trim() : ''
  }
  /**
   * 生成上传头像时使用的文件名。
   */
  const getAvatarUploadFileName = () => {
    const originalFileName = selectedAvatarFile.value?.name?.trim() || 'avatar'
    const sanitizedFileName = originalFileName.replace(/[\\/:*?"<>|\r\n]+/g, '_')
    const extensionIndex = sanitizedFileName.lastIndexOf('.')
    const baseName =
      extensionIndex > 0 ? sanitizedFileName.slice(0, extensionIndex) : sanitizedFileName
    return `${baseName || 'avatar'}.jpg`
  }
  /**
   * 根据当前裁剪区域生成头像画布。
   */
  const createCroppedAvatarCanvas = () => {
    const imageElement = cropImageRef.value
    if (
      !imageElement ||
      !cropViewportSize.value ||
      !cropBaseSize.value.width ||
      !cropBaseSize.value.height
    )
      return null
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
    if (!context) return null
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
  /**
   * 将裁剪画布转换为可上传的 Blob。
   */
  const canvasToBlob = (canvas: HTMLCanvasElement) =>
    new Promise<Blob | null>(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92)
    })

  /**
   * 确认当前裁剪结果并上传头像。
   */
  const confirmCroppedAvatar = async () => {
    if (isUploadingAvatar.value) return
    const croppedCanvas = createCroppedAvatarCanvas()
    if (!croppedCanvas) return
    const avatarPreview = croppedCanvas.toDataURL('image/jpeg', 0.92)
    const avatarBlob = await canvasToBlob(croppedCanvas)
    if (!avatarBlob) {
      showToast({ message: t('common.error'), position: 'middle', type: 'fail' })
      return
    }
    isUploadingAvatar.value = true
    try {
      const response = await Api.picture.upload({
        file: avatarBlob,
        fileName: getAvatarUploadFileName()
      })
      if (!response?.success) throw new Error(response?.message || t('common.error'))
      const uploadedHeadPortrait = getUploadedHeadPortrait(response.result)
      if (!uploadedHeadPortrait) throw new Error(response?.message || t('common.error'))
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

  /**
   * 提交编辑资料表单并保存头像框配置。
   */
  const handleSave = async () => {
    if (!canSave.value || isSavingProfile.value) return
    const payload: { nickName?: string; headPortrait?: string } = { nickName: nickName.value }
    if (pendingHeadPortrait.value) payload.headPortrait = pendingHeadPortrait.value
    isSavingProfile.value = true
    try {
      const response = await Api.user.modifyMemberInfo(payload)
      if (!response?.success) throw new Error(response?.message || t('common.error'))
      saveProfileCustomization({ avatarFrameId: selectedAvatarFrameId.value })
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
      if (options?.onSaved) options.onSaved()
      else navigateTo('/personal-center/my-profile', { replace: true })
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

  /**
   * 缩放变化后，重新限制裁剪偏移范围。
   */
  watch(cropScale, () => {
    cropOffset.value = getClampedCropOffset()
  })

  /**
   * 打开裁剪弹层后，在下一帧同步裁剪容器尺寸。
   */
  watch(showAvatarCropper, visible => {
    if (visible) void nextTick(() => syncCropViewportSize())
  })

  /**
   * 初始化编辑资料页需要的用户数据与全局事件监听。
   */
  onMounted(() => {
    userStore.syncStoredUserData()
    syncFormState()
    void Promise.all([userStore.refreshCurrentUserData(), vipStore.refreshMyVipInfo()]).then(
      syncFormState
    )
    window.addEventListener('pointermove', handleGlobalPointerMove)
    window.addEventListener('pointerup', stopDraggingCropImage)
    window.addEventListener('pointercancel', stopDraggingCropImage)
    window.addEventListener('resize', syncCropViewportSize)
  })
  /**
   * 页面卸载时清理预览状态与全局事件监听。
   */
  onUnmounted(() => {
    userStore.syncStoredUserData()
    clearProfileAvatarPreviewState()
    revokeCropSourceUrl()
    window.removeEventListener('pointermove', handleGlobalPointerMove)
    window.removeEventListener('pointerup', stopDraggingCropImage)
    window.removeEventListener('pointercancel', stopDraggingCropImage)
    window.removeEventListener('resize', syncCropViewportSize)
  })

  return {
    nickName,
    selectedAvatarFrameId,
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
    unlockHintText,
    canSave,
    selectedAvatarFrameImage,
    cropImageStyle,
    avatarFrameOptions,
    handleNickNameChange,
    selectAvatarFrame,
    openAvatarActionSheet,
    closeAvatarActionSheet,
    triggerAvatarInput,
    handleFileInputChange,
    handleCropImageLoad,
    handleCropPointerDown,
    closeAvatarCropper,
    confirmCroppedAvatar,
    handleSave
  }
}
