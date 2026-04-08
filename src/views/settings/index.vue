<template>
  <!-- H5布局 -->
  <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
    <div class="min-h-screen bg-bg-1">
      <H5Header :title="resolvedMobileTitle" />

      <main class="p-3.5">
        <section v-if="showMobileMenu" class="rounded-[16px] bg-bg-2 px-[12px]">
          <nav class="">
            <button
              v-for="item in H5MenuItems"
              :key="item.tab"
              type="button"
              class="flex w-full items-center text-left py-[14px]"
              @click="handleH5MenuClick(item.path)"
            >
              <component :is="item.icon" class="h-5 w-5 shrink-0 text-text-2" />
              <span class="min-w-0 flex-1 text-sm font-[400] text-text-1 ml-3">
                {{ item.label }}
              </span>

              <div class="flex shrink-0 items-center gap-[10px]">
                <span v-if="item.isRedDot" class="h-[7px] w-[7px] rounded-full bg-secondary-2" />

                <div
                  class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] bg-opacity-10"
                >
                  <component :is="item.rightIcon || ArrowRightIcon" class="h-3 w-3 text-text-2" />
                </div>
              </div>
            </button>
          </nav>
        </section>

        <main v-else-if="$slots.default" class="min-w-0">
          <slot />
        </main>
      </main>
    </div>
  </section>

  <!-- pc布局 -->
  <div v-else>
    <div class="mx-auto max-w-[1336px] pt-[14px]">
      <h2 class="mb-4 text-xl font-[700] text-text-1">{{ $t('common.globalSetting') }}</h2>
      <div class="flex justify-center gap-6">
        <aside class="w-[280px] flex-shrink-0">
          <div class="rounded-xl bg-bg-2 p-4">
            <nav class="space-y-2.5">
              <button
                v-for="item in PcMenuItems"
                :key="item.tab"
                type="button"
                :class="[
                  'flex w-full items-center gap-4 rounded-lg px-4 py-2 text-left text-base transition-all',
                  props.currentTab === item.tab
                    ? 'bg-theme-primary font-bold text-text-4'
                    : 'text-text-2'
                ]"
                @click="handlePcMenuClick(item.path)"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'h-6 w-6',
                    props.currentTab === item.tab ? 'text-text-4' : 'text-text-2'
                  ]"
                />
                <span>{{ item.label }}</span>
                <component v-if="item.rightIcon" :is="item.rightIcon" class="h-6 w-6" />
              </button>
            </nav>
          </div>
        </aside>

        <main class="min-w-0 flex-1">
          <slot />
        </main>
      </div>
    </div>

    <CommonFooter class="mt-[40px]" />
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateTo } from '@/utils/router'
import H5Header from '@/components/common/H5Header.vue'
import CommonFooter from '@/components/commonFooter.vue'
import SecuritySvg from '@/static/svg/settings/security.svg?component'
import GolbalSvg from '@/static/svg/settings/golbal.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import SetStateIcon from '@/static/svg/setState.svg?skipsvgo'
type SettingsTab = string

interface SettingsMenuItem {
  path: string
  tab: SettingsTab
  label: string
  icon: Component
  rightIcon?: Component
  isRedDot?: boolean
}

const props = withDefaults(
  defineProps<{
    currentTab?: SettingsTab
    showMobileMenu?: boolean
    mobileTitle?: string
  }>(),
  {
    currentTab: '',
    showMobileMenu: true,
    mobileTitle: ''
  }
)

const { t } = useI18n()
const isMobile = useIsMobile()

const resolvedMobileTitle = computed(() => props.mobileTitle || t('common.globalSetting'))

// pc列表
const PcMenuItems = computed<SettingsMenuItem[]>(() => [
  {
    path: '/security',
    tab: 'security' as SettingsTab,
    label: t('common.security'),
    icon: SecuritySvg,
    rightIcon: SetStateIcon
  },
  {
    path: '/preferences',
    tab: 'preferences' as SettingsTab,
    label: t('common.preferences'),
    icon: GolbalSvg
  }
])

// H5列表
const H5MenuItems = computed<SettingsMenuItem[]>(() => [
  {
    path: '/security',
    tab: 'security' as SettingsTab,
    label: t('common.security'),
    icon: SecuritySvg,
    rightIcon: ArrowRightIcon,
    isRedDot: true
  },
  {
    path: '/preferences',
    tab: 'preferences' as SettingsTab,
    label: t('common.preferences'),
    icon: GolbalSvg,
    rightIcon: ArrowRightIcon
  }
])

// H5点击并跳转到对应页面。
const handleH5MenuClick = (path: string) => {
  navigateTo(path)
}

// PC点击并跳转到对应页面。
const handlePcMenuClick = (path: string) => {
  navigateTo(path)
}
</script>

<style scoped lang="scss"></style>
