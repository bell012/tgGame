<template>
  <section v-if="match" class="w-full min-w-0 font-inter text-text-1" data-testid="match-header">
    <div
      v-if="view === 'info'"
      class="relative h-[calc(782px/3+env(safe-area-inset-top))] overflow-hidden rounded-b-2xl text-white shadow-[0_1px_4px_rgba(24,64,106,0.06)]"
      :data-phase="match.phase"
    >
      <img
        class="absolute inset-0 h-full w-full object-cover"
        :src="bgLayer1"
        alt=""
        draggable="false"
        aria-hidden="true"
      />
      <div class="absolute inset-x-0 top-0 pt-[env(safe-area-inset-top)]">
        <div class="relative h-[49px]">
          <button
            type="button"
            class="absolute left-[14px] top-1/2 z-10 flex h-[33px] w-[33px] -translate-y-1/2 items-center justify-center rounded-lg bg-white/[0.06]"
            aria-label="Back"
            @click="emit('back')"
          >
            <img
              class="h-4 w-4 object-contain"
              :src="backIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
          </button>
          <h2
            class="flex h-full items-center justify-center px-12 text-center text-base font-bold leading-none"
          >
            {{ match.league }}
          </h2>
        </div>
      </div>

      <div
        class="absolute inset-x-0 top-[calc(49px+env(safe-area-inset-top))] bottom-[39px] flex flex-col"
      >
        <div v-if="isLive" class="flex justify-center">
          <span
            class="rounded-full bg-theme-primary px-[5px] py-[2px] text-[10px] font-normal leading-none text-black"
          >
            Live
          </span>
        </div>

        <div
          class="mt-[14px] grid w-full grid-cols-[minmax(0,1fr)_126.67px_minmax(0,1fr)] items-start px-[14px]"
        >
          <div class="flex min-w-0 flex-col items-center gap-[10px]">
            <div class="relative">
              <img
                class="h-10 w-10 object-contain"
                :src="match.home.logo"
                :alt="match.home.name"
                draggable="false"
              />
              <div v-if="isLive" class="absolute left-full top-0 flex items-center gap-[3px]">
                <span
                  class="inline-flex h-3 w-3 items-center justify-center rounded-[2px] bg-secondary-2 text-[10px] font-bold leading-none text-white"
                >
                  {{ match.home.cards.red }}
                </span>
                <span
                  class="inline-flex h-3 w-3 items-center justify-center rounded-[2px] bg-assistOrange text-[10px] font-bold leading-none text-white"
                >
                  {{ match.home.cards.yellow }}
                </span>
              </div>
            </div>
            <p
              class="line-clamp-2 w-full text-center text-[13px] font-bold leading-none"
              :title="match.home.name"
            >
              {{ match.home.name }}
            </p>
          </div>

          <div class="flex flex-col items-center gap-[10px]">
            <template v-if="isLive">
              <p class="flex h-10 items-center gap-[5px] leading-none">
                <span class="text-[30px] font-semibold">{{ match.homeScore }}</span>
                <span class="text-[25px] font-bold text-theme-primary">VS</span>
                <span class="text-[30px] font-semibold">{{ match.awayScore }}</span>
              </p>
              <div class="flex flex-col items-center gap-[10px]">
                <p
                  class="flex items-center gap-[3px] rounded bg-secondary-2 px-[6.67px] py-[2.33px] text-[10px] font-medium leading-none text-white"
                >
                  <span>{{ match.phaseText }}</span>
                  <span>{{ match.clockText }}</span>
                </p>
                <div class="flex items-center gap-[14px] text-xs font-normal leading-4">
                  <span class="inline-flex items-center gap-1.5">
                    <img
                      class="h-[14px] w-[14px] shrink-0 object-contain"
                      :src="cornerIcon"
                      alt=""
                      draggable="false"
                      aria-hidden="true"
                    />
                    {{ match.cornerScore }}
                  </span>
                  <span class="inline-flex items-center gap-[3px]">
                    <img
                      class="h-[14px] w-[14px] shrink-0 object-contain"
                      :src="htIcon"
                      alt=""
                      draggable="false"
                      aria-hidden="true"
                    />
                    {{ match.halfTimeScore }}
                  </span>
                </div>
              </div>
            </template>
            <template v-else>
              <p class="text-[22px] font-bold leading-none">VS</p>
              <p class="text-xs leading-4 text-text-2">{{ match.kickoffText }}</p>
              <p class="text-xs leading-4 text-text-2">{{ match.durationText }}</p>
            </template>
          </div>

          <div class="flex min-w-0 flex-col items-center gap-[10px]">
            <div class="relative">
              <img
                class="h-10 w-10 object-contain"
                :src="match.away.logo"
                :alt="match.away.name"
                draggable="false"
              />
              <div v-if="isLive" class="absolute right-full top-0 flex items-center gap-[3px]">
                <span
                  class="inline-flex h-3 w-3 items-center justify-center rounded-[2px] bg-secondary-2 text-[10px] font-bold leading-none text-white"
                >
                  {{ match.away.cards.red }}
                </span>
                <span
                  class="inline-flex h-3 w-3 items-center justify-center rounded-[2px] bg-assistOrange text-[10px] font-bold leading-none text-white"
                >
                  {{ match.away.cards.yellow }}
                </span>
              </div>
            </div>
            <p
              class="line-clamp-2 w-full text-center text-[13px] font-bold leading-none"
              :title="match.away.name"
            >
              {{ match.away.name }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="absolute inset-x-0 bottom-0 flex h-[39px] items-center bg-white/10 backdrop-blur-[20px]"
        data-testid="match-header-media-switch"
      >
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center justify-center gap-[5px] text-sm font-normal leading-5 text-white"
          @click="view = 'video'"
        >
          <img
            class="h-[14px] w-[19px] shrink-0 object-contain"
            :src="videoIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          Video
        </button>
        <span class="h-[13px] w-px shrink-0 bg-[#E7E7E7]" aria-hidden="true"></span>
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center justify-center gap-[5px] text-sm font-normal leading-5 text-white"
          @click="view = 'animation'"
        >
          <img
            class="h-[14px] w-[19px] shrink-0 object-contain"
            :src="animationIcon"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          Animation
        </button>
      </div>
    </div>

    <div
      v-else
      class="relative h-[calc(782px/3+env(safe-area-inset-top))] overflow-hidden rounded-b-2xl shadow-[0_1px_4px_rgba(24,64,106,0.06)]"
      :data-view="view"
      data-testid="match-header-media"
    >
      <div
        class="absolute inset-0"
        :class="
          view === 'animation' && isLoggedIn
            ? 'bg-[linear-gradient(180deg,#F97600_42%,#EE4700_91%)]'
            : 'bg-bg-5'
        "
        aria-hidden="true"
      ></div>

      <div
        v-if="!isLoggedIn"
        class="absolute inset-x-0 bottom-0 top-[calc(49px+env(safe-area-inset-top))] flex items-center justify-center"
      >
        <LiveLoginGate />
      </div>
      <template v-else-if="view === 'animation'">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          :src="bgLayer1"
          alt=""
          draggable="false"
          aria-hidden="true"
        />
        <img
          class="absolute inset-0 h-full w-full object-cover"
          :src="bgLayer2"
          alt=""
          draggable="false"
          aria-hidden="true"
        />
        <img
          class="absolute inset-0 h-full w-full object-cover"
          :src="bgLayer3"
          alt=""
          draggable="false"
          aria-hidden="true"
        />
      </template>
      <div v-else-if="liveStreamUrl" class="absolute inset-0">
        <LivePlayer :src="liveStreamUrl" />
      </div>
      <template v-else>
        <img
          class="absolute inset-0 h-full w-full object-cover"
          :src="bgLayer1"
          alt=""
          draggable="false"
          aria-hidden="true"
        />
        <div
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-normal text-white/70"
          data-testid="no-video"
        >
          {{ t('sports.noVideo') }}
        </div>
      </template>

      <div
        class="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,#000000_24%,rgba(0,0,0,0)_100%)] pt-[env(safe-area-inset-top)]"
      >
        <div class="relative h-[49px]">
          <button
            type="button"
            class="absolute left-[14px] top-1/2 z-10 flex h-[33px] w-[33px] -translate-y-1/2 items-center justify-center rounded-lg bg-opacity-5"
            aria-label="Back"
            @click="returnToInfo"
          >
            <img
              class="h-4 w-4 object-contain"
              :src="backIcon"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import LiveLoginGate from '../match-media-panel/live-login-gate.vue'
import LivePlayer from '../match-media-panel/live-player.vue'
import animationIcon from './icon/animation.svg?url'
import backIcon from './icon/back.svg?url'
import bgLayer1 from './icon/bg-layer-1.png?url'
import bgLayer2 from './icon/bg-layer-2.png?url'
import bgLayer3 from './icon/bg-layer-3-34b3a2.png?url'
import cornerIcon from './icon/corner.svg?url'
import htIcon from './icon/ht.svg?url'
import videoIcon from './icon/video.svg?url'
import type { MatchHeaderView, MatchHeaderViewModel } from './types'

const props = defineProps<{
  model?: MatchHeaderViewModel
  liveStreamUrl?: string
}>()

const emit = defineEmits<{
  back: []
}>()

const { t } = useI18n()
const { isLoggedIn } = useRequireLoginAction()
const match = computed(() => props.model)
const isLive = computed(() => match.value?.phase === 'live')

const view = ref<MatchHeaderView>('info')

const returnToInfo = () => {
  view.value = 'info'
}
</script>
