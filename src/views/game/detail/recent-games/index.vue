<template>
  <div
    class="recent-games-container w-full h-full p-[12px] bg-[var(--color-background-level-3)] rounded-[10px] mt-[12px]"
  >
    <div class="flex justify-between items-center" @click="toggleIsOpen">
      <div class="flex flex-col">
        <h3 class="text-[14px]">Queen of Bounty</h3>
        <div class="flex gap-[4px] text-[12px]">
          <div class="text-[var(--color-text-level-2)]">by</div>
          <div class="text-[var(--color-theme-level-1)]">PG Soft</div>
        </div>
        <div class="text-[var(--color-theme-level-1)] text-[12px]"># Slots</div>
      </div>
      <div class="bg-[var(--color-text-level-3)] rounded-md">
        <div class="icon" :class="{ 'is-open': isOpen }">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <transition name="open-fade">
      <div v-if="isOpen">
        <div class="flex border-b border-[var(--color-opacity-30)] mt-[12px] pb-[6px] text-[13px]">
          <div class="flex-1 flex flex-col gap-[6px]">
            <div class="text-[var(--color-text-level-2)]">House Edge</div>
            <div class="text-[var(--color-theme-level-1)]">1.00%</div>
          </div>
          <div class="flex-1 flex flex-col gap-[6px]">
            <div class="text-[var(--color-text-level-2)]">RTP (Return to Player)</div>
            <div class="text-[var(--color-theme-level-1)]">99.00%</div>
          </div>
        </div>
        <div class="flex border-b border-[var(--color-opacity-30)] mt-[12px] pb-[6px] text-[13px]">
          <div class="flex-1 flex flex-col gap-[6px]">
            <div class="text-[var(--color-text-level-2)]">Max Win</div>
            <div class="text-[var(--color-theme-level-1)]">50,000x</div>
          </div>
          <div class="flex-1 flex flex-col gap-[6px]">
            <div class="text-[var(--color-text-level-2)]">Stakes Range</div>
            <div class="text-[var(--color-text-level-1)]">$0.2 to $100</div>
          </div>
        </div>
        <!-- tab -->
        <div
          class="flex h-[50px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[20px] p-[4px] max-w-[500px]"
        >
          <div
            class="flex-1 flex items-center justify-center cursor-pointer"
            :class="{ active: tabIndex === 0 }"
            @click="tabIndexClick(0)"
          >
            High win
          </div>
          <div
            class="flex-1 flex items-center justify-center cursor-pointer"
            :class="{ active: tabIndex === 1 }"
            @click="tabIndexClick(1)"
          >
            Lucky win
          </div>
          <div
            class="flex-1 flex items-center justify-center cursor-pointer"
            :class="{ active: tabIndex === 2 }"
            @click="tabIndexClick(2)"
          >
            Review
          </div>
        </div>
        <div
          class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
        >
          <h3 class="flex gap-[8px] border-b border-[var(--color-opacity-30)] pb-[12px]">
            <img class="size-[20px]" alt="" :src="RackIcon" />
            <div class="text-[12px] font-bold">lucky6668</div>
          </h3>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Payout</div>
            <div class="flex items-center gap-[8px]">
              <section class="relative w-[20px] h-[20px] overflow-hidden">
                <img
                  class="w-[20px] min-w-[20px] absolute"
                  alt="countries"
                  src="@/static/img/explore/countries.png"
                  :style="`top: -20px`"
                />
              </section>
              <div class="text-[var(--color-theme-level-1)]">+15420.00</div>
            </div>
          </div>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Wager</div>
            <div class="flex items-center gap-[8px]">
              <section class="relative w-[20px] h-[20px] overflow-hidden">
                <img
                  class="w-[20px] min-w-[20px] absolute"
                  alt="countries"
                  src="@/static/img/explore/countries.png"
                  :style="`top: -20px`"
                />
              </section>
              <div>100.00</div>
            </div>
          </div>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Mult</div>
            <div class="flex items-center gap-[8px]">
              <div>154.20x</div>
            </div>
          </div>
        </div>
        <div
          class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
        >
          <h3 class="flex gap-[8px] border-b border-[var(--color-opacity-30)] pb-[12px]">
            <img class="size-[20px]" alt="" :src="RackIcon" />
            <div class="text-[12px] font-bold">lucky6668</div>
          </h3>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Payout</div>
            <div class="flex items-center gap-[8px]">
              <section class="relative w-[20px] h-[20px] overflow-hidden">
                <img
                  class="w-[20px] min-w-[20px] absolute"
                  alt="countries"
                  src="@/static/img/explore/countries.png"
                  :style="`top: -20px`"
                />
              </section>
              <div class="text-[var(--color-theme-level-1)]">+15420.00</div>
            </div>
          </div>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Wager</div>
            <div class="flex items-center gap-[8px]">
              <section class="relative w-[20px] h-[20px] overflow-hidden">
                <img
                  class="w-[20px] min-w-[20px] absolute"
                  alt="countries"
                  src="@/static/img/explore/countries.png"
                  :style="`top: -20px`"
                />
              </section>
              <div>100.00</div>
            </div>
          </div>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Mult</div>
            <div class="flex items-center gap-[8px]">
              <div>154.20x</div>
            </div>
          </div>
        </div>
        <div
          class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
        >
          <h3 class="flex gap-[8px] border-b border-[var(--color-opacity-30)] pb-[12px]">
            <img class="size-[20px]" alt="" :src="RackIcon" />
            <div class="text-[12px] font-bold">lucky6668</div>
          </h3>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Payout</div>
            <div class="flex items-center gap-[8px]">
              <section class="relative w-[20px] h-[20px] overflow-hidden">
                <img
                  class="w-[20px] min-w-[20px] absolute"
                  alt="countries"
                  src="@/static/img/explore/countries.png"
                  :style="`top: -20px`"
                />
              </section>
              <div class="text-[var(--color-theme-level-1)]">+15420.00</div>
            </div>
          </div>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Wager</div>
            <div class="flex items-center gap-[8px]">
              <section class="relative w-[20px] h-[20px] overflow-hidden">
                <img
                  class="w-[20px] min-w-[20px] absolute"
                  alt="countries"
                  src="@/static/img/explore/countries.png"
                  :style="`top: -20px`"
                />
              </section>
              <div>100.00</div>
            </div>
          </div>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">Mult</div>
            <div class="flex items-center gap-[8px]">
              <div>154.20x</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RackIcon from '@/static/svg/game/detail/rank1.svg?url'

const tabIndex = ref(0)

const isOpen = ref(true)

const tabIndexClick = (index: number) => {
  tabIndex.value = index
}

const toggleIsOpen = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped lang="scss">
.icon {
  width: 20px;
  height: 20px;
  padding: 2px;
  fill: currentColor;
  transition: transform 0.3s ease-in-out;
  transform: rotate(-270deg);
}

.icon.is-open {
  transform: rotate(-90deg);
}
.active {
  background-color: var(--color-input-level-2);
  height: 100%;
  border-radius: 10px;
}

.open-fade-enter-active,
.open-fade-leave-active {
  transition: all 0.2s ease;
}
.open-fade-enter-from,
.open-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
