<template>
  <Teleport to="body">
    <Transition name="bottom-sheet" appear @after-leave="handleAfterLeave">
      <div
        v-if="popupVisible"
        ref="popupRoot"
        class="fixed inset-0 z-[9999] flex items-end justify-center bg-mask-60-1"
        @click.self="close"
      >
        <div
          class="bottom-sheet-panel w-full max-h-[90vh] flex flex-col bg-bg-1 rounded-t-xl overflow-hidden"
        >
          <div class="bg-bg-2 relative flex flex-1 items-center justify-center pt-2.5 pb-2.5">
            <span class="text-text-1 font-semibold">{{ $t('home.ExclusivePromotions') }} </span>
            <button
              type="button"
              class="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center p-2 rounded-[6px] bg-black/10"
              aria-label="close"
              @click="close"
            >
              <CloseIcon class="h-2.5 w-2.5 text-icon-1" />
            </button>
          </div>

          <!-- 轮播图 -->
          <Swipe
            ref="swipeRef"
            class="mt-2.5 mb-2.5 flex-1 min-h-0 w-full bg-bg-1"
            :autoplay="list.length > 1 ? AUTO_PLAY_INTERVAL_MS : 0"
            :show-indicators="false"
            :touchable="list.length > 1"
            lazy-render
            @change="handleChange"
          >
            <SwipeItem v-for="(item, index) in list" :key="index" class="h-full">
              <div class="flex h-full w-full items-center justify-center">
                <img
                  v-if="item.isImage === 1"
                  :src="item.imageUrl"
                  :alt="`slide-${index + 1}`"
                  class="max-h-full w-full max-w-[100vw] cursor-pointer select-none object-contain"
                  draggable="false"
                  @click="handleImageJump(item)"
                  @dragstart.prevent
                />
                <!-- 文本 -->
                <div
                  v-if="item.isImage === 2"
                  class="w-[92%] rounded-lg p-3.5 pop-rich-text bg-bg-2"
                >
                  <h2 class="text-base font-bold text-text-1">{{ item.title }}</h2>
                  <div class="mt-2 font-normal text-sm text-text-1" v-html="item.text"></div>
                </div>
              </div>
            </SwipeItem>
          </Swipe>
          <!-- <button
        
          class="flex justify-center items-center w-[92%] h-[40px] buttonStyle m-auto mb-2.5 text-text-4 font-bold"
          @click.stop="openLogin"
        >
          {{ $t('home.JoinNow') }}
        </button> -->

          <!-- 左右按钮 + 滑动条 -->
          <div
            v-if="list.length > 1"
            class="flex flex-shrink-0 items-center justify-center px-4 pb-2.5"
          >
            <div class="inline-flex max-w-full min-w-0 items-center justify-center gap-2">
              <button
                type="button"
                class="flex size-2 shrink-0 items-center justify-center rounded-full bg-transparent text-text-1 transition-opacity hover:opacity-80 disabled:opacity-40 [&_svg]:size-full [&_path]:fill-current"
                :disabled="currentIndex <= 0"
                aria-label="上一张"
                @click="prev"
              >
                <LeftIcon />
              </button>

              <div class="flex min-w-0 items-center justify-center gap-1.5 overflow-hidden">
                <button
                  v-for="(_, index) in list"
                  :key="index"
                  type="button"
                  class="flex shrink-0 items-center justify-center transition-colors"
                  :class="
                    currentIndex === index
                      ? 'h-[5px] w-6 rounded-full overflow-hidden bg-[var(--color-background-level-4)] sm:w-10'
                      : 'size-[5px] rounded-full bg-[var(--color-background-level-4)]'
                  "
                  :aria-label="`第 ${index + 1} 张`"
                  @click="goTo(index)"
                >
                  <span
                    v-if="currentIndex === index"
                    class="slideshow-indicator-progress h-full w-full origin-left rounded-full bg-[var(--color-theme-level-1)]"
                    :key="`${index}-${progressKey}`"
                    :style="progressStyle"
                  ></span>
                </button>
              </div>

              <button
                type="button"
                class="flex size-2 shrink-0 items-center justify-center rounded-full bg-transparent text-text-1 transition-opacity hover:opacity-80 disabled:opacity-40 [&_svg]:size-full [&_path]:fill-current"
                :disabled="currentIndex >= list.length - 1"
                aria-label="下一张"
                @click="next"
              >
                <RightIcon />
              </button>
            </div>
          </div>
          <!-- 底部多选框 -->
          <div class="bg-bg-2 px-3.5 pt-[10px] pb-[20px]">
            <label
              class="checkbox-wrap inline-flex cursor-pointer items-center gap-2"
              :class="{ 'checkbox-checked': checked }"
            >
              <span class="checkbox-box" />
              <input v-model="checked" type="checkbox" class="sr-only" aria-label="多选" />
              <span class="text-text-1 text-xs">{{ $t('home.DontDisplayThisForNextToday') }}</span>
            </label>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import Api from '@/api'
import type { QueryNoticeMsgItem } from '@/api/interface/home.interface'
import { useAuthModalStore } from '@/stores/authModal'
import { useLocaleStore } from '@/stores/locale'
import { computed, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import { useI18n } from 'vue-i18n'
import type { SwipeInstance } from 'vant'
import { Swipe, SwipeItem } from 'vant'
import { navigateTo, navigateToName } from '@/utils/router'
import { openLuckySpin } from '@/utils/openLuckySpin'
import CloseIcon from '@/static/svg/close.svg?component'
import LeftIcon from '@/static/svg/left-icon.svg?component'
import RightIcon from '@/static/svg/right-icon.svg?component'
import { resolveGameImageUrl } from '@/utils/image'
import { getStorageLanguageCode } from '@/utils/locale'
import { homePopVisitState } from '@/utils/homePopVisit'
import { getPopupContext, isPopupContextCurrent } from '@/utils/popupContext'
import {
  markPopupShown,
  shouldShowPopup,
  resolvePopupMode,
  popupKey,
  readPopupStorage,
  writePopupStorage,
  type PopupFrequencyContext
} from '@/utils/popupFrequency'

const emit = defineEmits<{
  close: []
}>()
const authModalStore = useAuthModalStore()
const localeStore = useLocaleStore()
const { locale } = useI18n()
const HOME_POP_STORAGE_PREFIX = 'home_pop_notice'
const HOME_POP_SUPPRESS_KEY = `${HOME_POP_STORAGE_PREFIX}:suppress_until`
const HOME_POP_SUPPRESS_MS = 24 * 60 * 60 * 1000
const AUTO_PLAY_INTERVAL_MS = 10000

interface HomePopItem {
  rowId: number
  isImage: number
  imageUrl: string
  title: string
  text: string
  jumpType: number
  linkType: number
  linkUrl: string
}

const noticeList = ref<QueryNoticeMsgItem[]>([])
const list = computed<HomePopItem[]>(() => {
  const records = noticeList.value
    .map(item => {
      const isImage = Number(item.isImage ?? 0)
      return {
        rowId: Number(item.rowId ?? 0),
        isImage,
        imageUrl: isImage === 1 ? normalizeNoticeImage(item.noticeText) : '',
        title: String(item.noticeTitle ?? ''),
        text: sanitizeNoticeHtml(item.noticeText),
        jumpType: Number(item.jumpType ?? 0),
        linkType: Number(item.linkType ?? 0),
        linkUrl: String(item.linkUrl ?? '').trim()
      }
    })
    .filter(item => (item.isImage === 1 ? Boolean(item.imageUrl) : item.isImage === 2))

  return records
})
const swipeRef = ref<SwipeInstance>()
const currentIndex = ref(0)
const progressKey = ref(0)
const checked = ref(false)
// 公告加载完成且存在可展示内容后再打开，避免先出现空弹窗。
const visible = ref(false)
const popupRoot = ref<HTMLElement | null>(null)
const isDisposed = ref(false)
const popupContext = getPopupContext()
// 渲染和滚动锁使用同一状态，旧访问、缓存中的失效实例不能重新锁住页面。
const popupVisible = computed(
  () => visible.value && !isDisposed.value && isPopupContextCurrent(popupContext)
)
// 显示意图不能代替实际挂载：节点进入文档后才锁背景和记录展示次数。
const popupMounted = computed(() => popupVisible.value && popupRoot.value?.isConnected === true)
usePageScrollLock(popupMounted)
watch(
  popupMounted,
  mounted => {
    if (!mounted) return
    homePopVisitState.hasShown = true
    const displayedIds = new Set(list.value.map(item => item.rowId))
    noticeList.value
      .filter(item => displayedIds.has(Number(item.rowId)))
      .forEach(item => {
        markPopupShown(noticeOptions(item, popupContext))
      })
  },
  { flush: 'post' }
)
const progressStyle = computed(() => ({
  animationDuration: `${AUTO_PLAY_INTERVAL_MS}ms`
}))

const normalizeNoticeImage = (value: unknown) => {
  const text = String(value ?? '').trim()
  if (!text) {
    return ''
  }

  if (/^https?:\/\//i.test(text) || text.startsWith('data:')) {
    return text
  }

  return resolveGameImageUrl(text)
}

const sanitizeNoticeHtml = (value: unknown) => {
  const html = String(value ?? '').trim()
  if (!html) {
    return ''
  }

  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

const sortNoticeRecords = (records: QueryNoticeMsgItem[]) => {
  return [...records].sort((a, b) => {
    const sortA = Number(a.sort ?? Number.MAX_SAFE_INTEGER)
    const sortB = Number(b.sort ?? Number.MAX_SAFE_INTEGER)
    return sortA - sortB
  })
}

const handleImageJump = (item: HomePopItem) => {
  switch (item.jumpType) {
    case 1:
      handleUrlJump(item)
      return
    case 2:
      handleInternalJump(item)
      return
    case 3:
      handleGameJump(item)
      return
    default:
      return
  }
}

const handleUrlJump = (item: HomePopItem) => {
  const linkUrl = String(item.linkUrl ?? '').trim()
  if (!linkUrl) {
    return
  }
  const linkType = Number(item.linkType ?? 0)
  if (linkType === 0) {
    return
  }
  if (linkType === 2) {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
    return
  }
  navigateTo(linkUrl)
}
// 1活动，2充值栏目，3分享转盘，4充值页面，5积分转盘，6 邀请好友，7 登录注册页
const handleInternalJump = (item: HomePopItem) => {
  switch (item.linkType) {
    case 1:
      console.log('活动')
      return
    case 2:
      navigateTo('/deposit')
      return
    case 3:
      openLuckySpin()
      return
    case 4:
      navigateTo('/deposit')
      return
    case 5:
      console.log('积分转盘')
      return
    case 6:
      console.log('邀请好友')
      return
    case 7:
      authModalStore.openLoginModal()
      return

    default:
      return
  }
}

const handleGameJump = (item: HomePopItem) => {
  const idFromLinkUrl = Number(item.linkUrl)
  const gameRowId = Number.isFinite(idFromLinkUrl) && idFromLinkUrl > 0 ? idFromLinkUrl : item.rowId
  if (!gameRowId) {
    return
  }
  navigateToName('gameDetail', { params: { rowId: gameRowId } })
}

const noticeOptions = (item: QueryNoticeMsgItem, context: PopupFrequencyContext) => ({
  ...context,
  key: popupKey('notice', item.rowId),
  mode: resolvePopupMode(
    context.memberId ? item.loginAfterPopWay : item.loginBeforePopWay,
    context.memberId ? 'authenticated' : 'guest'
  )
})

const getSuppressUntil = () => {
  const raw = readPopupStorage(HOME_POP_SUPPRESS_KEY)
  const value = Number(raw ?? 0)
  return Number.isFinite(value) ? value : 0
}

const isSuppressedNow = () => {
  return Date.now() < getSuppressUntil()
}

const fetchNoticeList = async () => {
  const context = popupContext
  if (!isPopupContextCurrent(context)) return
  // 同一次首页访问已展示过，或处于勾选“不再显示”的抑制期时，直接结束。
  if (homePopVisitState.hasShown || isSuppressedNow()) {
    closeWithoutSuppress()
    return
  }

  try {
    const res = await Api.home.queryNoticeMsg({
      languageCode: getStorageLanguageCode(String(locale.value)),
      msgType: '0',
      noticeType: '1',
      channelId: '4',
      page: {
        current: 1,
        size: 50
      }
    })
    // 请求返回时组件可能已因路由切换被卸载，忽略旧实例的响应。
    if (isDisposed.value || !isPopupContextCurrent(context)) {
      return
    }
    // 请求期间其他实例可能已经展示，返回后再次判断，避免并发重复弹出。
    if (homePopVisitState.hasShown || isSuppressedNow()) {
      closeWithoutSuppress()
      return
    }
    const records = Array.isArray(res?.result?.records) ? res.result.records : []
    const filtered = sortNoticeRecords(records).filter(item =>
      shouldShowPopup(noticeOptions(item, context))
    )
    noticeList.value = filtered
    // 没有有效展示内容时直接通知父组件移除，无需等待关闭动画。
    if (list.value.length === 0) {
      closeWithoutSuppress()
      return
    }
    // 只提交显示意图；实际挂载后再锁背景并记录频次。
    visible.value = true
  } catch (error) {
    // 已卸载实例不再更新弹窗或向父组件发送关闭事件。
    if (isDisposed.value || !isPopupContextCurrent(context)) {
      return
    }
    noticeList.value = []
    console.error('queryNoticeMsg failed', error)
    // 请求失败时移除弹窗组件，避免残留空弹窗。
    closeWithoutSuppress()
  } finally {
    currentIndex.value = 0
    progressKey.value += 1
  }
}

const close = () => {
  if (!visible.value) {
    return
  }
  if (checked.value) {
    writePopupStorage(HOME_POP_SUPPRESS_KEY, String(Date.now() + HOME_POP_SUPPRESS_MS))
  }
  visible.value = false
}

const handleAfterLeave = () => {
  // 旧实例的退场回调不能关闭新访问创建的弹窗。
  if (isDisposed.value || !isPopupContextCurrent(popupContext)) return
  emit('close')
}

const closeWithoutSuppress = () => {
  visible.value = false
  if (!isDisposed.value && isPopupContextCurrent(popupContext)) emit('close')
}

const handleChange = (index: number) => {
  currentIndex.value = index
  progressKey.value += 1
}

const goTo = (index: number) => {
  currentIndex.value = index
  progressKey.value += 1
  swipeRef.value?.swipeTo(index)
}

const prev = () => {
  if (currentIndex.value <= 0) return
  swipeRef.value?.prev()
}

const next = () => {
  if (currentIndex.value >= list.value.length - 1) return
  swipeRef.value?.next()
}

let hasStartedNoticeRequest = false
const startNoticeAfterInitialization = () => {
  // 刷新时先等站点默认语言及路由稳定，再请求并展示，避免安卓上先显示后被初始化关闭。
  // 组件已停用或本实例已经开始请求时跳过，防止旧实例和就绪通知重复触发。
  if (isDisposed.value || hasStartedNoticeRequest || !localeStore.isSiteDefaultsReady) return
  hasStartedNoticeRequest = true
  void fetchNoticeList()
}

watch(() => localeStore.isSiteDefaultsReady, startNoticeAfterInitialization, { flush: 'post' })
// 切换 Tab 再次进入首页时初始化已完成，直接沿用原有公告展示规则。
onMounted(startNoticeAfterInitialization)

const disposePopup = () => {
  // 同时清理可见状态和请求资格，避免缓存恢复后按旧 visible 重新加锁。
  isDisposed.value = true
  visible.value = false
}
onBeforeUnmount(disposePopup)
onDeactivated(disposePopup)
</script>
<style lang="scss" scoped>
@keyframes slideshow-indicator-fill {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

.slideshow-indicator-progress {
  animation-name: slideshow-indicator-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.buttonStyle {
  border-radius: 8px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
  box-shadow:
    0 0 12px 0 rgba(35, 238, 136, 0.3),
    0 -2px 0 0 #1dca6a inset;
}
.checkbox-box {
  position: relative;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--color-icon-level-3, #7b7d7d);
  background: transparent;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}
.checkbox-wrap.checkbox-checked .checkbox-box {
  background: var(--color-theme-level-1, #2aee88);
  border-color: var(--color-theme-level-1, #2aee88);
}
.checkbox-wrap.checkbox-checked .checkbox-box::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.pop-rich-text :deep(*) {
  max-width: 100%;
  word-break: break-word;
}

.pop-rich-text {
  max-height: 180px;
  overflow-y: auto;
  text-align: left;
  -webkit-overflow-scrolling: touch;
}
</style>
