<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-[var(--color-mask-60)]"
        @click.self="close"
      />
    </transition>
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div
          class="setting-popup-panel rounded-lg rounded-t-xl bg-[var(--color-background-level-2)] p-[16px] text-[14px]"
        >
          <div class="flex flex-col gap-[16px]">
            <div class="setting-item" @click="toggleLove">
              <LikeIcon
                class="setting-item-icon"
                :class="{ 'setting-item-icon--active': loveActived }"
              />
              <div class="setting-item-label">
                {{ t('gameDetail.settingLike') }}
              </div>
            </div>
            <div class="setting-item" @click="shareClick">
              <TgIcon class="setting-item-icon" />
              <div class="setting-item-label">{{ t('gameDetail.settingShare') }}</div>
            </div>
            <div class="setting-item">
              <MovieIcon class="setting-item-icon" />
              <div class="setting-item-label">{{ t('gameDetail.settingMovieMode') }}</div>
            </div>
            <div class="setting-item">
              <FloatIcon class="setting-item-icon" />
              <div class="setting-item-label">{{ t('gameDetail.settingFloatMode') }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useGameLike } from '@/composables/useGameLike'
import TgIcon from '@/static/svg/game/detail/tg.svg?component'
import LikeIcon from '@/static/svg/game/detail/like_hand.svg?component'
import FloatIcon from '@/static/svg/game/detail/float.svg?component'
import MovieIcon from '@/static/svg/game/detail/movie.svg?component'
import { useI18n } from 'vue-i18n'

defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const { isLiked: loveActived, toggleLike: toggleLove } = useGameLike()
const { t } = useI18n()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  share: []
}>()

const close = () => {
  emit('update:visible', false)
}

const shareClick = () => {
  close()
  emit('share')
}
</script>
<style scoped lang="scss">
@use '@/styles/mixins' as *;

.setting-popup-panel {
  color: var(--color-text-level-1);
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.setting-item-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-icon-level-2);
  transition: color 0.2s ease;
}

.setting-item-icon :deep(path) {
  fill: currentColor;
}

.setting-item-icon--active {
  color: var(--color-theme-level-1);
}

.setting-item-label {
  color: var(--color-text-level-2);
  transition: color 0.2s ease;
}

@media (min-width: 768px) {
  .setting-item:hover .setting-item-icon:not(.setting-item-icon--active),
  .setting-item:focus-visible .setting-item-icon:not(.setting-item-icon--active) {
    color: var(--color-theme-level-1);
  }

  .setting-item:hover .setting-item-label,
  .setting-item:focus-visible .setting-item-label {
    color: var(--color-text-level-1);
  }
}

@include popup-transition;

.desktop-up-down-enter-active,
.desktop-up-down-leave-active {
  transition: all 0.2s ease;
}

.desktop-up-down-enter-from,
.desktop-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
