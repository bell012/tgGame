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
          <p class="text-xs text-text-2">{{ t('personalCenter.editProfile.unlockHint') }}</p>
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
        :class="canSave ? '' : 'cursor-not-allowed'"
        :disabled="!canSave"
        @click="handleSave"
      >
        <span v-if="!canSave" class="absolute inset-0 z-10 rounded-lg bg-black/35"></span>
        <span class="relative z-20">{{ t('personalCenter.editProfile.save') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import Api from '@/api'
import type { QueryAcctInfoResult, SelectMemberResult } from '@/api/interface/user'
import H5Header from '@/components/common/H5Header.vue'
import {
  DEFAULT_AVATAR_FRAME_ID,
  profileCustomizationState,
  profileUserInfoState,
  saveProfileCustomization,
  setProfileCustomizationState,
  setProfileUserInfoState,
  syncProfileCustomizationState,
  syncProfileUserInfoState,
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

type EditProfileUserInfo = Partial<SelectMemberResult> & { headPortrait?: string }

const DEFAULT_EDIT_AVATAR_FRAME_ID: AvatarFrameId = 'border_2'

const { t } = useI18n()
const userInfo = profileUserInfoState
const acctInfo = ref<QueryAcctInfoResult | null>(null)
const nickName = ref('')
const selectedAvatarFrameId = ref<AvatarFrameId>(DEFAULT_EDIT_AVATAR_FRAME_ID)
const originalForm = ref({
  nickName: '',
  avatarFrameId: DEFAULT_EDIT_AVATAR_FRAME_ID as AvatarFrameId
})

const avatarFrameImageMap: Record<Exclude<AvatarFrameId, 'none'>, string> = {
  border_1: border1Image,
  border_2: border2Image,
  border_3: border3Image,
  border_4: border4Image,
  border_5: border5Image
}

const avatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL
  return userInfo.value?.headPortrait && baseUrl
    ? `${baseUrl}${userInfo.value.headPortrait}`
    : '/src/static/img/home/avatar.png'
})

const vipLevel = computed(() => userInfo.value?.vipId ?? 0)
const isNicknameValid = computed(() => isValidNickname(nickName.value))
const canSave = computed(() => {
  return (
    isNicknameValid.value &&
    (nickName.value !== originalForm.value.nickName ||
      selectedAvatarFrameId.value !== originalForm.value.avatarFrameId)
  )
})

const selectedAvatarFrameImage = computed(() => {
  const avatarFrameId = selectedAvatarFrameId.value
  if (avatarFrameId === DEFAULT_AVATAR_FRAME_ID) return ''
  return avatarFrameImageMap[avatarFrameId as Exclude<AvatarFrameId, 'none'>]
})

const avatarFrameOptions = computed(() => {
  const unlockedFrameIds = new Set<AvatarFrameId>(
    vipLevel.value >= 2
      ? ['none', 'border_1', 'border_2', 'border_3', 'border_4', 'border_5']
      : ['none', DEFAULT_EDIT_AVATAR_FRAME_ID, selectedAvatarFrameId.value]
  )

  return [
    { id: 'none' as AvatarFrameId, image: borderNoneImage },
    { id: 'border_1' as AvatarFrameId, image: border1Image },
    { id: 'border_2' as AvatarFrameId, image: border2Image },
    { id: 'border_3' as AvatarFrameId, image: border3Image },
    { id: 'border_4' as AvatarFrameId, image: border4Image },
    { id: 'border_5' as AvatarFrameId, image: border5Image }
  ].map(item => ({
    ...item,
    locked: !unlockedFrameIds.has(item.id)
  }))
})

const parseStoredItem = <T,>(key: string) => {
  const storedValue = localStorage.getItem(key)
  if (!storedValue) return null

  try {
    return JSON.parse(storedValue) as T
  } catch (error) {
    console.error(error)
    return null
  }
}

const syncFormState = () => {
  const customization = profileCustomizationState.value
  const nextNickName = userInfo.value?.nickName || ''
  const nextAvatarFrameId = customization.avatarFrameId ?? DEFAULT_EDIT_AVATAR_FRAME_ID

  nickName.value = nextNickName
  selectedAvatarFrameId.value = nextAvatarFrameId
  originalForm.value = {
    nickName: nextNickName,
    avatarFrameId: nextAvatarFrameId
  }
}

const loadStoredInfo = () => {
  syncProfileCustomizationState()
  syncProfileUserInfoState()
  acctInfo.value = parseStoredItem<QueryAcctInfoResult>('acctInfo')
}

const refreshAcctInfo = async () => {
  try {
    const response = await Api.user.queryAcctInfo({})
    if (response?.result) {
      acctInfo.value = response.result
      localStorage.setItem('acctInfo', JSON.stringify(response.result))
    }
    return response?.result
  } catch (error) {
    console.error(error)
    return null
  }
}

const refreshUserInfo = async (memberId: string) => {
  try {
    const response = await Api.user.selectMember({ memberId })
    if (response?.result) {
      setProfileUserInfoState({
        ...(userInfo.value ?? {}),
        ...response.result
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const handleNickNameChange = (event: Event) => {
  handleNicknameInputEvent(event, value => {
    nickName.value = value
  })
}

const selectAvatarFrame = (frameId: AvatarFrameId) => {
  const targetFrame = avatarFrameOptions.value.find(item => item.id === frameId)
  if (!targetFrame || targetFrame.locked) return

  selectedAvatarFrameId.value = frameId
  setProfileCustomizationState(
    {
      ...profileCustomizationState.value,
      avatarFrameId: frameId
    },
    false
  )
}

const handleSave = () => {
  if (!canSave.value) return

  saveProfileCustomization({
    avatarFrameId: selectedAvatarFrameId.value
  })

  const mergedUserInfo = setProfileUserInfoState({
    ...(userInfo.value ?? {}),
    nickName: nickName.value
  })

  if (mergedUserInfo) {
    userInfo.value = mergedUserInfo as EditProfileUserInfo
  }

  originalForm.value = {
    nickName: nickName.value,
    avatarFrameId: selectedAvatarFrameId.value
  }

  showToast({
    message: t('personalCenter.editProfile.saveSuccess'),
    position: 'middle',
    type: 'success'
  })

  navigateTo('/personal-center/my-profile', { replace: true })
}

const initializeEditProfile = async () => {
  loadStoredInfo()
  syncFormState()

  const storedMemberId = userInfo.value?.memberId || acctInfo.value?.memberId
  if (storedMemberId) {
    await refreshUserInfo(storedMemberId)
    syncFormState()
    return
  }

  const latestAcctInfo = await refreshAcctInfo()
  const memberId = latestAcctInfo?.memberId || acctInfo.value?.memberId
  if (memberId) {
    await refreshUserInfo(memberId)
    syncFormState()
  }
}

onMounted(() => {
  void initializeEditProfile()
})

onUnmounted(() => {
  syncProfileCustomizationState()
  syncProfileUserInfoState()
})
</script>

<style scoped></style>
