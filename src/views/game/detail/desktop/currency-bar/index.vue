<template>
  <div class="bg-[var(--color-background-level-6)] px-[20px] py-[12px] rounded-b-[20px] relative">
    <div class="flex justify-start items-center gap-[10px]">
      <img alt="" class="size-[16px] cursor-pointer" :src="LineIcon" @click="settingVisibleClick" />
      <div class="flex items-center gap-[10px] cursor-pointer">
        <div class="flex gap-[4px]" @click="toggleStar">
          <img alt="" class="size-[16px]" :src="starActived ? StarActiveIcon : StarIcon" />
          <div class="text-[var(--color-text-level-2)] text-[12px]">1177</div>
        </div>
        <img
          alt=""
          class="size-[16px] cursor-pointer"
          :src="LineIcon"
          @click="liveStateVisibleClick"
        />
        <div
          class="flex h-[36px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] w-[160px] p-[4px]"
        >
          <div
            v-for="tab in tabList"
            class="flex-1 flex items-center justify-center cursor-pointer text-[12px]"
            :class="{ active: tabValue === tab.value }"
            @click="tabIndexClick(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>
    </div>
    <!--Setting Popup-->
    <setting-popup
      v-model:visible="settingVisible"
      desktop
      class="desktop-popup"
      @share="shareClick"
    ></setting-popup>
    <!-- live-state -->
    <Teleport to="body" v-if="isMobile">
      <live-state-popup v-model:visible="liveStateVisible" />
    </Teleport>
    <live-state-popup
      v-else
      class="desktop-popup w-[320px]"
      v-model:visible="liveStateVisible"
      desktop
    />
    <!-- 分享-->
    <Teleport to="body" v-if="isMobile">
      <share-popup v-model:visible="shareVisible" />
    </Teleport>
    <share-popup v-else class="desktop-popup w-[480px]" v-model:visible="shareVisible" desktop />
  </div>
</template>
<script setup lang="ts">
import LineIcon from '@/static/svg/game/detail/lines.svg?url'
import StarIcon from '@/static/svg/game/detail/star.svg?url'
import StarActiveIcon from '@/static/svg/game/detail/star_active.svg?url'
import { ref } from 'vue'
import LiveStatePopup from './live-state-popup.vue'
import SharePopup from './share-popup.vue'
import SettingPopup from './setting-popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

const isMobile = useIsMobile()

const starActived = ref(false)

const settingVisible = ref(false)
const liveStateVisible = ref(false)
const shareVisible = ref(false)

const tabValue = ref(1)
const tabList = ref([
  { value: 1, label: 'Free Play' },
  { value: 2, label: 'Real Play' }
])

const tabIndexClick = (index: number) => {
  tabValue.value = index
}

const toggleStar = () => {
  starActived.value = !starActived.value
}

const settingVisibleClick = () => {
  settingVisible.value = true
}

const liveStateVisibleClick = () => {
  liveStateVisible.value = true
}

const shareClick = () => {
  shareVisible.value = true
}
</script>
<style lang="scss" scoped>
.desktop-popup {
  bottom: 100%;
  position: absolute;
  left: 20px;
}
.active {
  background-color: var(--color-input-level-2);
  height: 100%;
  border-radius: 10px;
}
</style>
