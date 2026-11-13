<template>
  <div
    class="fixed inset-0 z-[60] h-screen overflow-hidden bg-bg-1 text-text-1"
    @keydown.esc.stop.prevent="handleEscape"
    @pointerdown.capture="handleOutsidePointerDown"
  >
    <div class="relative w-full h-full flex flex-col">
      <header
        class="relative w-full h-[49px] z-[22] flex items-center justify-between bg-bg-2 px-[14px]"
      >
        <button
          type="button"
          class="flex items-center justify-center w-[33px] h-[33px] bg-opacity-6 rounded-[8px] mr-[10px]"
          :aria-label="t('hashGame.back')"
          @click="handleBack"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5 text-icon-1" />
        </button>

        <button
          ref="periodTriggerRef"
          type="button"
          class="flex min-w-0 flex-col gap-[1px] text-left mr-[28px]"
          :aria-expanded="periodsOpen"
          aria-controls="hash-game-periods"
          @click="periodsOpen = !periodsOpen"
        >
          <span
            class="flex items-center gap-[3px] whitespace-nowrap text-base font-bold text-text-1"
          >
            {{ selectedPeriod }}s hash <ArrowDownIcon class="w-[10px] h-[10px] text-icon-1" />
          </span>
          <span class="flex items-center gap-[2px] whitespace-nowrap text-[11px] text-text-2">
            <i class="size-1.5 rounded-full bg-theme-primary" />{{ mockRound.online }}
            {{ t('hashGame.online') }}
          </span>
        </button>

        <div
          class="flex h-[33px] max-w-[149px] w-full items-center gap-1 rounded-[8px] border border-opacity-10 bg-opacity-6 px-[3px] py-[2px]"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-[4px] text-left"
            :aria-label="t('hashGame.selectCurrency')"
            @click="openCurrencyPopup"
          >
            <img
              :src="currentCurrencyIcon"
              :alt="currentCurrencyCode"
              class="size-5 shrink-0 object-contain"
            />
            <span class="truncate text-[14px] font-[700] text-text-1">{{
              currentBalanceText
            }}</span>
          </button>
          <button
            type="button"
            class="btn-primary flex size-[26px] shrink-0 items-center justify-center rounded-[8px]"
            :disabled="isRefreshingBalance"
            :aria-label="t('hashGame.refreshBalance')"
            :aria-busy="isRefreshingBalance"
            @click.stop="refreshBalance"
          >
            <RefreshIcon
              class="w-[14px] h-[14px] text-icon-4"
              :class="{ 'animate-spin': isRefreshingBalance }"
            />
          </button>
        </div>
        <button
          type="button"
          ref="recordsTriggerRef"
          class="flex size-[33px] items-center justify-center rounded-lg bg-opacity-6"
          :aria-label="t('hashGame.records')"
          :aria-expanded="recordsMenuOpen"
          aria-controls="hash-game-records-menu"
          @click.stop="recordsMenuOpen = !recordsMenuOpen"
        >
          <RecordsIcon class="w-[14px] h-[14px] text-icon-1" />
        </button>

        <!-- 投注记录和游戏规则弹窗 -->
        <Transition name="records-menu">
          <section
            v-if="recordsMenuOpen"
            id="hash-game-records-menu"
            ref="recordsMenuRef"
            class="absolute right-[12px] top-full z-[30] mt-[0px] p-[18px] overflow-hidden rounded-[10px] border border-opacity-10 bg-bg-3"
            :aria-label="t('hashGame.recordsMenu')"
            @pointerdown.stop
          >
            <button
              type="button"
              class="flex w-full items-center gap-[6px] text-left text-[14px] text-text-1 mb-[18px]"
              @click="openRecentBets"
            >
              <RecentIcon class="size-[17px] text-icon-1" />
              <span>{{ t('hashGame.recentBets') }}</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-[6px] text-left text-[14px] text-text-1"
              @click="openGameRules"
            >
              <RulesIcon class="size-[17px] text-icon-1" />
              <span>{{ t('hashGame.gameRules') }}</span>
            </button>
          </section>
        </Transition>
      </header>

      <!-- 展开游戏类型 -->
      <div class="absolute inset-x-0 top-[48px] z-[21]">
        <Transition name="fade-accordion">
          <section
            v-if="periodsOpen"
            ref="periodMenuRef"
            id="hash-game-periods"
            class="overflow-hidden rounded-b-[12px] bg-bg-2"
            :aria-label="t('hashGame.games')"
          >
            <div class="p-3">
              <h2 class="relative mb-2.5 text-base font-bold text-text-1 pl-[7px]">
                <span
                  class="absolute left-0 top-1/2 -translate-y-1/2 z-[22] w-[2px] h-[14px] bg-theme-primary"
                ></span>
                {{ t('hashGame.games') }}
              </h2>
              <div class="grid grid-cols-2 gap-[5px] gap-y-[8px]">
                <button
                  v-for="seconds in periodOptions"
                  :key="seconds"
                  type="button"
                  class="rounded-[8px] px-[12px] py-[9px] text-[13px]"
                  :class="
                    selectedPeriod === seconds
                      ? 'bg-theme-3 text-theme-primary'
                      : 'bg-bg-3 text-text-2'
                  "
                  :aria-pressed="selectedPeriod === seconds"
                  @click="selectPeriod(seconds)"
                >
                  {{ seconds }}s Hash
                </button>
              </div>
              <button
                type="button"
                class="mt-[12px] flex w-full items-center justify-center text-xs text-theme-primary"
                @click="periodsOpen = false"
              >
                {{ t('hashGame.collapse')
                }}<CollapseIcon class="w-[8px] h-[8px] text-theme-primary ml-[4px]" />
              </button>
            </div>
          </section>
        </Transition>
      </div>

      <main
        class="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-3 pt-3"
      >
        <!-- 上期区块和当前区块 -->
        <section
          class="shrink-0 flex flex-col rounded-[8px] bg-bg-2 px-[10px] pb-[10px] pt-[18px]"
          :aria-label="t('hashGame.currentBlock')"
        >
          <div class="flex items-center justify-between">
            <div class="flex min-w-0 flex-1 flex-col items-center gap-[6px]">
              <span class="text-[13px] text-text-1">{{ t('hashGame.lastBlock') }}</span>
              <div class="flex items-center justify-center gap-[4px]">
                <span class="text-[18px] font-bold text-text-1 border-b border-text-1">{{
                  mockRound.lastBlock
                }}</span>
                <span
                  class="rounded-[3px] px-[4px] py-[1px] bg-theme-primary text-[10px] text-text-4"
                  >{{ t('hashGame.verify') }}</span
                >
              </div>
            </div>

            <div
              class="relative flex w-[42px] h-[42px] mx-[5px] shrink-0"
              :aria-label="String(mockRound.countdown)"
            >
              <svg
                viewBox="0 0 48 48"
                aria-hidden="true"
                class="block size-full fill-none [stroke-width:4]"
              >
                <circle cx="24" cy="24" r="20" class="stroke-bg-1" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke-linecap="round"
                  class="origin-center -rotate-90 stroke-secondary-10 [stroke-dasharray:63_126]"
                />
              </svg>
              <strong
                class="absolute inset-0 grid place-items-center text-[20px] font-[600] text-text-1"
                >{{ mockRound.countdown }}</strong
              >
            </div>

            <div class="flex min-w-0 flex-1 flex-col items-center gap-[6px] text-secondary-10">
              <span class="text-[13px]">{{ t('hashGame.currentBlock') }}</span>
              <span class="text-[18px] font-[700] border-b border-secondary-10">{{
                mockRound.currentBlock
              }}</span>
            </div>
          </div>

          <!-- 指向箭头 -->
          <div class="flex mt-[6px] mb-[8px] min-w-0 items-center">
            <ResultArrowIcon class="ml-[20px] h-[20px] w-[16px] text-theme-primary" />
            <span class="whitespace-nowrap text-[13px] text-text-2"
              >{{ hashParts.before }}<span class="text-theme-primary">{{ hashParts.digit }}</span
              >{{ hashParts.after }}</span
            >
            <span class="whitespace-nowrap text-[13px] text-text-2 mx-[10px]"
              >(<span class="text-theme-primary"
                >{{ t('hashGame.odd') }}、{{ t('hashGame.big') }}</span
              >)</span
            >
            <button
              type="button"
              class="flex items-center whitespace-nowrap text-[13px] text-theme-primary"
              @click="openRecords"
            >
              {{ t('hashGame.history') }}
              <HistoryArrowIcon class="w-[14px] h-[14px] text-theme-primary" />
            </button>
            <button
              type="button"
              class="ml-auto flex items-center gap-[4px] whitespace-nowrap text-[11px] text-text-2"
              :aria-expanded="roadmapVisible"
              aria-controls="hash-game-roadmap"
              @click="roadmapVisible = !roadmapVisible"
            >
              {{ t(roadmapVisible ? 'hashGame.hide' : 'hashGame.show') }}
              <HideArrowIcon
                class="w-[8px] h-[8px] text-icon-2 transition-transform duration-200 motion-reduce:transition-none"
                :class="{ 'rotate-180': !roadmapVisible }"
              />
            </button>
          </div>

          <!-- 大小单双 -->
          <Transition name="fade-accordion">
            <div v-if="roadmapVisible" id="hash-game-roadmap">
              <div class="mb-[10px] flex min-w-0 items-center gap-[10px]">
                <div
                  class="flex shrink-0 rounded-[12px] bg-bg-1 p-[2px]"
                  role="group"
                  :aria-label="t('hashGame.history')"
                >
                  <button
                    type="button"
                    class="whitespace-nowrap rounded-[12px] px-[10px] py-[5px] text-[11px]"
                    :class="roadmapMode === 'size' ? 'bg-bg-2 text-text-1' : 'text-text-3'"
                    :aria-pressed="roadmapMode === 'size'"
                    @click="roadmapMode = 'size'"
                  >
                    {{ t('hashGame.bigSmall') }}
                  </button>
                  <button
                    type="button"
                    class="whitespace-nowrap rounded-[12px] px-[10px] py-[5px] text-[11px]"
                    :class="roadmapMode === 'parity' ? 'bg-bg-2 text-text-1' : 'text-text-3'"
                    :aria-pressed="roadmapMode === 'parity'"
                    @click="roadmapMode = 'parity'"
                  >
                    {{ t('hashGame.oddEven') }}
                  </button>
                </div>
                <div class="flex items-center gap-[7px]">
                  <span class="flex items-center gap-[3px] text-[12px] font-[500] text-text-2">
                    <i
                      class="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#22A89A] text-[11px] not-italic text-text-1"
                      >{{ resultLabels.positive }}</i
                    >{{ mockRound.positiveCount }}
                  </span>
                  <span class="flex items-center gap-[3px] text-[12px] font-[500] text-text-2">
                    <i
                      class="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#E63533] text-[11px] not-italic text-text-1"
                      >{{ resultLabels.negative }}</i
                    >{{ mockRound.negativeCount }}
                  </span>
                </div>
                <span class="ml-auto min-w-0 whitespace-nowrap text-[11px] text-secondary-8">{{
                  resultLabels.streak
                }}</span>
              </div>
              <div
                class="overflow-x-auto overscroll-x-contain"
                tabindex="0"
                :aria-label="t('hashGame.history')"
              >
                <div class="flex w-max gap-[5px]">
                  <div
                    v-for="(column, columnIndex) in resultColumns"
                    :key="columnIndex"
                    class="grid gap-[5px]"
                  >
                    <span
                      v-for="cell in column"
                      :key="cell.id"
                      class="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] text-text-1"
                      :class="[
                        cell.positive ? 'bg-[#22A89A]' : 'bg-[#E63533]',
                        { invisible: !cell.filled }
                      ]"
                      :aria-hidden="!cell.filled"
                      >{{ cell.positive ? resultLabels.positive : resultLabels.negative }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </section>

        <!-- 哈希投注 -->
        <section class="mt-3 shrink-0" :aria-label="t('hashGame.betting')">
          <div class="mb-1.5 flex items-center gap-[6px]">
            <h1 class="shrink-0 text-[15px] font-bold text-text-1">{{ t('hashGame.betting') }}</h1>
            <span
              class="min-w-0 rounded-[3px] bg-[linear-gradient(90deg,#0090FF_0%,#6200FF_100%)] px-[4px] py-[2px] text-center text-[10px] font-bold text-text-1"
              >{{ t('hashGame.fairness') }}</span
            >
          </div>
          <div class="grid grid-cols-4 gap-x-[5px]">
            <div
              v-for="option in betOptions"
              :key="option.key"
              type="button"
              class="relative min-w-0 rounded-[8px] bg-bg-2 px-[6px] py-[10px]"
              :class="
                selectedBet == option.key ? 'border border-theme-primary' : 'border border-input-1'
              "
              :style="{ '--bet-color': option.color }"
              :aria-pressed="selectedBet === option.key"
              @click="selectBet(option.key)"
            >
              <span class="flex items-baseline gap-[5px] whitespace-nowrap">
                <strong class="text-[15px] font-bold text-[color:var(--bet-color)]">{{
                  option.label
                }}</strong>
                <span class="text-xs font-[500] text-text-2">{{ mockBet.odds }}</span>
              </span>
              <span class="mt-[4px] flex items-center justify-between gap-[5px]">
                <span class="flex items-center gap-0.5 whitespace-nowrap text-[10px] text-text-3"
                  ><PeopleIcon class="w-[10px] h-[10px] text-icon-3" />{{ mockBet.people }}</span
                >
                <span class="flex items-center gap-0.5 whitespace-nowrap text-[10px] text-text-3"
                  ><AmountIcon class="w-[10px] h-[10px] text-icon-3" />{{ mockBet.amount }}</span
                >
              </span>
              <span class="mt-[7px] block h-[3px] overflow-hidden rounded bg-bg-9">
                <i
                  class="block h-full rounded-[inherit] bg-[var(--bet-color)]"
                  :style="{ width: mockBet.progress + '%' }"
                />
              </span>
            </div>
          </div>
        </section>

        <!-- 聊天区域 -->
        <div class="min-h-[150px] flex-1 pt-6">
          <div v-if="chatVisible" class="text-sm text-text-3">聊天</div>
        </div>
      </main>

      <!-- 投注区 -->
      <footer class="shrink-0 rounded-t-[13px] bg-bg-2 px-[12px] pt-[11px] pb-[24px]">
        <div class="flex items-center gap-[20px]">
          <button
            type="button"
            class="relative flex size-[34px] shrink-0 items-center justify-center rounded-full bg-bg-3"
            :aria-label="t('hashGame.editChips')"
            @click="openChipEditor"
          >
            <img :src="chipEditorImage" alt="" class="size-full object-contain" />
            <span
              class="absolute inset-0 grid place-items-center pt-[1px] text-[9px] font-bold text-text-1"
              >{{ t('hashGame.edit') }}</span
            >
          </button>
          <div
            class="flex h-[45px] min-w-0 flex-1 items-center gap-[13px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            :aria-label="t('hashGame.editChips')"
          >
            <button
              v-for="chip in chipOptions"
              :key="chip.id"
              type="button"
              class="relative shrink-0 transition-[width,height] duration-[180ms] motion-reduce:transition-none"
              :class="selectedChip === chip.value ? 'h-[45px] w-[45px]' : 'h-[35px] w-[35px]'"
              :aria-pressed="selectedChip === chip.value"
              @click="chooseChip(chip.value)"
            >
              <img
                :src="chipImage"
                alt=""
                class="block size-full object-contain"
                :style="{ filter: 'hue-rotate(' + chip.hue + 'deg)' }"
              />
              <span
                class="absolute inset-x-0 bottom-[3px] top-0 grid place-items-center text-text-1 font-[700]"
                :class="
                  chip.value >= 1000
                    ? selectedChip === chip.value
                      ? 'text-[13px]'
                      : 'text-[10px]'
                    : selectedChip === chip.value
                      ? 'text-[24px]'
                      : 'text-[16px]'
                "
                >{{ formatChipAmount(chip.value) }}</span
              >
            </button>
          </div>
        </div>
        <div class="mt-[7px] flex items-center justify-between">
          <button
            type="button"
            class="flex h-[34px] shrink-0 items-center justify-center rounded-[8px] px-[9px] bg-bg-3 mr-[10px]"
            :aria-label="t('hashGame.chat')"
            :aria-pressed="chatVisible"
            @click="chatVisible = !chatVisible"
          >
            <ChatIcon class="w-[16px] h-[16px] text-icon-2" />
          </button>
          <div class="flex w-full items-center gap-[7px]">
            <button
              type="button"
              class="flex h-[34px] flex-1 items-center justify-center gap-[5px] rounded-[8px] bg-bg-3 text-xs font-[500] text-text-1"
              @click="cancelSelection"
            >
              <CancelIcon class="size-[14px] text-icon-2" />{{ t('hashGame.cancel') }}
            </button>
            <button
              type="button"
              class="flex h-[34px] flex-1 items-center justify-center gap-[5px] rounded-[8px] bg-bg-3 text-xs font-[500] text-text-1"
              @click="repeatSelection"
            >
              <RepeatIcon class="size-[14px] text-icon-2" />{{ t('hashGame.repeat') }}
            </button>
            <div
              class="flex h-[34px] flex-1 items-center justify-center gap-[5px] rounded-[8px] bg-bg-3 text-xs font-[500] text-text-1"
            >
              <ConfirmIcon class="size-[14px] text-icon-2" />{{ t('hashGame.confirmBet') }}
            </div>
          </div>
          <button
            type="button"
            class="flex h-[34px] shrink-0 items-center justify-center rounded-[8px] px-[9px] bg-bg-3 ml-[10px]"
            :aria-label="t('hashGame.chipSettings')"
            @click="openChipEditor"
          >
            <SettingsIcon class="size-[16px] text-icon-2" />
          </button>
        </div>
      </footer>
    </div>

    <!-- 选择货币 -->
    <CurrencyPopup
      v-model:visible="currencyPopupOpen"
      :selected-currency="currentCurrencyCode"
      :options="currencyOptions"
      @select="selectCurrency"
    />

    <!-- 投注记录弹窗 -->
    <RecentBetsPopup
      v-model:visible="recentBetsOpen"
      :currency-code="currentCurrencyCode"
      :currency-icon="currentCurrencyIcon"
      :balance-text="currentBalanceText"
      :period="selectedPeriod"
      :bets="recentBets"
      :summary="recentBetSummary"
    />

    <!-- 历史投注 -->
    <HistoryPopup v-model:visible="historyPopupOpen" :records="historyRecords" />

    <!-- 筹码设置 -->
    <Teleport to="body">
      <Transition name="bottom-sheet">
        <div
          v-if="chipEditorOpen"
          class="fixed inset-0 z-[1000] flex items-end justify-center bg-mask-60-1"
          @click.self="chipEditorOpen = false"
          @keydown.esc.stop.prevent="chipEditorOpen = false"
        >
          <form
            class="bottom-sheet-panel w-full overflow-y-auto overscroll-contain rounded-t-[12px] bg-bg-1 px-[12px] pb-[30px] pt-[16px] text-text-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hash-chip-settings-title"
            @submit.prevent="saveChipEditor"
          >
            <h2 id="hash-chip-settings-title" class="text-[18px] font-[600] text-text-1">
              {{ t('hashGame.chipSettings') }}
            </h2>
            <div
              class="mt-[20px] grid grid-cols-5 gap-x-[8px] gap-y-[7px]"
              role="group"
              :aria-label="t('hashGame.editChips')"
            >
              <button
                v-for="chip in chipEditorItems"
                type="button"
                :key="chip.id"
                class="relative mx-auto min-w-0 p-[8px] transition-opacity"
                :aria-label="formatChipAmount(Number(chip.value))"
                :aria-pressed="chip.enabled"
                @click="togglePresetChip(chip.id)"
              >
                <img
                  :src="chipImage"
                  alt=""
                  class="h-[45px] w-[45px] object-contain"
                  :style="{ filter: 'hue-rotate(' + chip.hue + 'deg)' }"
                />
                <span
                  class="absolute inset-0 grid place-items-center pb-[2px] text-[14px] font-bold text-white"
                  >{{ formatChipAmount(Number(chip.value)) }}</span
                >
                <span
                  v-if="chip.enabled"
                  class="absolute -bottom-[0px] left-1/2 grid px-[5px] -translate-x-1/2 place-items-center rounded-[3px] bg-theme-primary"
                  ><GouIcon class="size-[14px] text-icon-4"
                /></span>
              </button>
              <button
                v-for="chip in customChipItems"
                :key="`custom-${chip.id}`"
                type="button"
                class="relative mx-auto min-w-0 p-[8px] transition-opacity"
                :aria-label="
                  chip.value ? formatChipAmount(Number(chip.value)) : t('hashGame.editChip')
                "
                @click="editCustomChip(chip)"
              >
                <img :src="chipEditorImage" alt="" class="h-[45px] w-[45px] object-contain" />
                <span
                  class="absolute inset-0 grid place-items-center pb-[2px] text-[11px] font-bold text-white"
                  >{{
                    chip.value ? formatChipAmount(Number(chip.value)) : t('hashGame.edit')
                  }}</span
                >
                <div
                  class="absolute -bottom-[0px] left-1/2 -translate-x-1/2 bg-bg-4 rounded-[3px] border border-opacity-10 px-[4px] py-[1px]"
                >
                  <editChipIcon class="size-[14px] text-icon-2" />
                </div>
              </button>
            </div>
            <button
              type="submit"
              class="mt-[30px] h-[46px] w-full rounded-[30px] bg-theme-primary text-[14px] font-[700] text-text-4"
            >
              {{ t('hashGame.confirm') }}
            </button>
          </form>

          <!-- 编辑筹码弹窗 -->
          <div
            v-if="keypadOpen"
            class="fixed inset-0 z-[1001] grid place-items-center bg-mask-60-1 px-[25px]"
            @click.self="keypadOpen = false"
          >
            <section
              class="w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="hash-chip-keypad-title"
            >
              <header
                class="flex items-center justify-between bg-bg-2 rounded-t-[15px] px-[14px] py-[12px]"
              >
                <h3
                  id="hash-chip-keypad-title"
                  class="text-[16px] font-bold text-text-1 text-center w-full"
                >
                  {{ t('hashGame.editChipAmount') }}
                </h3>
                <button
                  type="button"
                  class="size-[28px] place-items-center rounded-[6px] bg-opacity-10"
                  :aria-label="t('common.close')"
                  @click="keypadOpen = false"
                >
                  <CloseIcon class="h-2.5 w-2.5 text-icon-1" />
                </button>
              </header>
              <div class="bg-bg-1 rounded-b-[15px] px-[14px] py-[12px]">
                <div
                  class="mb-[10px] grid h-[42px] place-items-center rounded-[8px] border border-theme-primary bg-input-1 text-[15px] text-text-3"
                >
                  {{
                    keypadValue
                      ? formatChipAmount(Number(keypadValue))
                      : t('hashGame.amountPlaceholder')
                  }}
                </div>
                <div class="grid grid-cols-3 gap-[6px]">
                  <button
                    v-for="key in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                    :key="key"
                    type="button"
                    class="h-[36px] rounded-[8px] bg-bg-3 text-[18px] text-text-2"
                    @click="appendKeypadValue(key)"
                  >
                    {{ key }}
                  </button>
                  <button
                    type="button"
                    class="h-[36px] rounded-[8px] bg-bg-3 text-[16px] text-text-2"
                    @click="appendKeypadValue('delete')"
                  >
                    {{ t('hashGame.delete') }}
                  </button>
                  <button
                    type="button"
                    class="h-[36px] rounded-[8px] bg-bg-3 text-[18px] text-text-2"
                    @click="appendKeypadValue('0')"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    class="h-[36px] rounded-[8px] bg-theme-primary text-[16px] text-text-4"
                    @click="confirmKeypadValue"
                  >
                    {{ t('hashGame.confirm') }}
                  </button>
                </div>
                <p v-if="chipEditorError" class="mt-[5px] text-[10px] text-assistRed" role="alert">
                  {{ chipEditorError }}
                </p>
              </div>
            </section>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import RecordsIcon from '@/static/svg/sift.svg?component'
import RecentIcon from '@/static/svg/hash_game/recent.svg?component'
import RulesIcon from '@/static/svg/hash_game/rules.svg?component'
import ArrowDownIcon from '@/static/svg/hash_game/jiantou_xia.svg?component'
import CollapseIcon from '@/static/svg/hash_game/jiantou_shang2.svg?component'
import RefreshIcon from '@/static/svg/hash_game/shauxin.svg?component'
import ResultArrowIcon from '@/static/svg/hash_game/zhixiang.svg?component'
import HistoryArrowIcon from '@/static/svg/hash_game/jiantou_you.svg?component'
import HideArrowIcon from '@/static/svg/hash_game/jiantou_shang.svg?component'
import PeopleIcon from '@/static/svg/hash_game/renshu.svg?component'
import AmountIcon from '@/static/svg/hash_game/jine.svg?component'
import CancelIcon from '@/static/svg/hash_game/cancel.svg?component'
import RepeatIcon from '@/static/svg/hash_game/repeat.svg?component'
import ConfirmIcon from '@/static/svg/hash_game/confirm.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import GouIcon from '@/static/svg/hash_game/gou.svg?component'
import SettingsIcon from '@/static/svg/hash_game/shezhi.svg?component'
import chipEditorImage from '@/static/svg/hash_game/chouma_bianji.svg?url'
import editChipIcon from '@/static/svg/hash_game/bianji2.svg?component'
import ChatIcon from '@/static/svg/hash_game/liaotian.svg?component'
import chipImage from '@/static/svg/hash_game/chouma.svg?url'
import CurrencyPopup from '@/views/settings/preferences/currency-popup.vue'
import RecentBetsPopup from './components/RecentBetsPopup.vue'
import HistoryPopup from './components/HistoryPopup.vue'
import { ref } from 'vue'
import { navigateTo } from '@/utils/router'
import type { HashGamePageState } from './index'

const props = defineProps<{ page: HashGamePageState }>()
const recordsMenuOpen = ref(false)
const recentBetsOpen = ref(false)
const recordsMenuRef = ref<HTMLElement | null>(null)
const recordsTriggerRef = ref<HTMLElement | null>(null)
const {
  t,
  currentCurrencyCode,
  currentCurrencyIcon,
  currentBalanceText,
  currencyOptions,
  isRefreshingBalance,
  selectedPeriod,
  periodOptions,
  periodsOpen,
  periodTriggerRef,
  periodMenuRef,
  currencyPopupOpen,
  roadmapVisible,
  roadmapMode,
  chipOptions,
  selectedChip,
  chipEditorOpen,
  chipEditorItems,
  customChipItems,
  keypadOpen,
  keypadValue,
  chipEditorError,
  chatVisible,
  selectedBet,
  mockRound,
  hashParts,
  mockBet,
  recentBets,
  historyPopupOpen,
  historyRecords,
  recentBetSummary,
  resultLabels,
  resultColumns,
  betOptions,
  selectPeriod,
  refreshBalance,
  openCurrencyPopup,
  selectCurrency,
  handleBack,
  openRecords,
  selectBet,
  cancelSelection,
  repeatSelection,
  chooseChip,
  openChipEditor,
  editCustomChip,
  togglePresetChip,
  appendKeypadValue,
  confirmKeypadValue,
  saveChipEditor,
  closeOverlays,
  handlePeriodOutsidePointerDown
} = props.page

const formatChipAmount = (amount: number) => {
  if (amount >= 1000000) return `${Number((amount / 1000000).toFixed(1))}M`
  if (amount >= 10000) return `${Number((amount / 1000).toFixed(1))}K`
  return String(amount)
}

const handleOutsidePointerDown = (event: PointerEvent) => {
  handlePeriodOutsidePointerDown(event)
  if (!recordsMenuOpen.value || !(event.target instanceof Node)) return
  if (
    recordsMenuRef.value?.contains(event.target) ||
    recordsTriggerRef.value?.contains(event.target)
  )
    return
  recordsMenuOpen.value = false
}

const handleEscape = () => {
  recentBetsOpen.value = false
  recordsMenuOpen.value = false
  closeOverlays()
}

const openRecentBets = () => {
  recordsMenuOpen.value = false
  recentBetsOpen.value = true
}

const openGameRules = () => {
  recordsMenuOpen.value = false
  void navigateTo('/hash-game/rules')
}
</script>
