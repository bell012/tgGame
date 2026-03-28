import { ref } from 'vue'
import type { SelectMemberResult } from '@/api/interface/user'

export const PROFILE_CUSTOMIZATION_STORAGE_KEY = 'profileCustomization'
export const USER_INFO_STORAGE_KEY = 'userInfo'
const DEFAULT_AVATAR_IMAGE = '/src/static/img/home/avatar.png'
const ABSOLUTE_AVATAR_URL_PATTERN = /^(data:|blob:|https?:\/\/|\/)/i

export const AVATAR_FRAME_IDS = [
  'none',
  'border_1',
  'border_2',
  'border_3',
  'border_4',
  'border_5'
] as const

export type AvatarFrameId = (typeof AVATAR_FRAME_IDS)[number]

export interface ProfileCustomization {
  avatarFrameId?: AvatarFrameId
}

export type StoredProfileUserInfo = Partial<SelectMemberResult> & {
  headPortrait?: string
}

export const DEFAULT_AVATAR_FRAME_ID: AvatarFrameId = 'none'

export const isAvatarFrameId = (value: unknown): value is AvatarFrameId => {
  return typeof value === 'string' && AVATAR_FRAME_IDS.includes(value as AvatarFrameId)
}

const normalizeProfileCustomization = (
  customization: ProfileCustomization
): ProfileCustomization => {
  return {
    avatarFrameId: isAvatarFrameId(customization.avatarFrameId)
      ? customization.avatarFrameId
      : undefined
  }
}

export const getStoredProfileCustomization = (): ProfileCustomization => {
  if (typeof window === 'undefined') return {}

  const storedValue = localStorage.getItem(PROFILE_CUSTOMIZATION_STORAGE_KEY)
  if (!storedValue) return {}

  try {
    return normalizeProfileCustomization(JSON.parse(storedValue) as ProfileCustomization)
  } catch (error) {
    console.error(error)
    return {}
  }
}

export const applyProfileCustomization = <T extends Partial<SelectMemberResult>>(
  userInfo: T | null
) => {
  if (!userInfo) return userInfo

  return {
    ...userInfo
  }
}

export const getStoredUserInfo = (): StoredProfileUserInfo | null => {
  if (typeof window === 'undefined') return null

  const storedValue = localStorage.getItem(USER_INFO_STORAGE_KEY)
  if (!storedValue) return null

  try {
    return JSON.parse(storedValue) as StoredProfileUserInfo
  } catch (error) {
    console.error(error)
    return null
  }
}

export const profileCustomizationState = ref<ProfileCustomization>(getStoredProfileCustomization())
export const profileUserInfoState = ref<StoredProfileUserInfo | null>(
  applyProfileCustomization(getStoredUserInfo())
)
export const profileAvatarPreviewState = ref('')

export const setProfileAvatarPreviewState = (avatarUrl: string | null | undefined) => {
  profileAvatarPreviewState.value = avatarUrl?.trim() ?? ''
  return profileAvatarPreviewState.value
}

export const clearProfileAvatarPreviewState = () => {
  profileAvatarPreviewState.value = ''
  return profileAvatarPreviewState.value
}

export const resolveProfileAvatarUrl = (headPortrait?: string) => {
  if (profileAvatarPreviewState.value) {
    return profileAvatarPreviewState.value
  }

  if (!headPortrait) {
    return DEFAULT_AVATAR_IMAGE
  }

  if (ABSOLUTE_AVATAR_URL_PATTERN.test(headPortrait)) {
    return headPortrait
  }

  const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL
  return baseUrl ? `${baseUrl}${headPortrait}` : DEFAULT_AVATAR_IMAGE
}

export const syncProfileCustomizationState = () => {
  profileCustomizationState.value = getStoredProfileCustomization()
  return profileCustomizationState.value
}

export const setProfileCustomizationState = (
  customization: ProfileCustomization,
  persist = true
) => {
  const normalizedCustomization = normalizeProfileCustomization(customization)
  profileCustomizationState.value = normalizedCustomization

  if (persist && typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_CUSTOMIZATION_STORAGE_KEY, JSON.stringify(normalizedCustomization))
  }

  return normalizedCustomization
}

export const saveProfileCustomization = (customization: ProfileCustomization) => {
  return setProfileCustomizationState(customization, true)
}

export const syncProfileUserInfoState = () => {
  profileUserInfoState.value = applyProfileCustomization(getStoredUserInfo())
  return profileUserInfoState.value
}

export const setProfileUserInfoState = (userInfo: StoredProfileUserInfo | null, persist = true) => {
  const customizedUserInfo = applyProfileCustomization(userInfo)
  profileUserInfoState.value = customizedUserInfo

  if (persist && typeof window !== 'undefined') {
    if (customizedUserInfo) {
      localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(customizedUserInfo))
    } else {
      localStorage.removeItem(USER_INFO_STORAGE_KEY)
    }
  }

  return customizedUserInfo
}
