<template>
  <AppDownloadCore v-slot="{ downloadLinks, handleDownload }">
    <div class="min-h-screen bg-[#000]">
      <!-- PC端 - 大于640px显示 -->
      <div class="hidden sm:block md:min-w-[1280px] pcBG">
        <header class="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0d090699]">
          <div class="w-[1280px] h-14 mx-auto px-2 flex items-center justify-between">
            <div class="flex items-center">
              <img src="/src/static/img/home/logo.png" alt="" class="w-44 h-auto cursor-pointer" />
            </div>

            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 h-9">
                <img
                  src="/src/static/img/app-download/app_download_1.webp"
                  alt=""
                  class="w-9 h-9"
                />
                <div class="flex flex-col items-start">
                  <span class="text-xs text-text-1 font-[800]">BC.GAME</span>
                  <span class="text-xs text-theme-level-1 font-[800]">App</span>
                </div>
                <img :src="currentArrowImage" alt="" class="w-3.5 h-3.5 ml-1 -rotate-90" />
              </div>

              <button
                class="flex items-center px-3 h-9 gap-1 rounded-lg btnBox"
                @click="handleDownload('ios')"
              >
                <LoginIcon2 class="w-5 h-5 fill-text-1" />
                <span class="text-sm font-[600] text-text-1">
                  iOS <span class="text-sm font-[600] text-theme-level-1">安装</span>
                </span>
              </button>

              <button
                class="flex items-center px-3 h-9 gap-1 rounded-lg btnBox"
                @click="handleDownload('android')"
              >
                <LoginIcon2 class="w-5 h-5 fill-text-1" />
                <span class="text-sm font-[600] text-text-1">
                  Android <span class="text-sm font-[600] text-theme-level-1">安装</span>
                </span>
              </button>
            </div>
          </div>
        </header>

        <main>
          <section class="w-[1280px] mx-auto pt-[200px] pb-[150px]">
            <div class="h-[400px] w-1/2">
              <div class="pt-10">
                <h1 class="text-[36px] text-text-1 mb-1">下载应用并</h1>
                <h2 class="text-5xl font-[800] pt-3 mb-1 text_color">领取高达 $50</h2>
                <h3 class="text-5xl font-[800] text-text-1 mb-5">的奖金奖励</h3>

                <div class="w-[400px] flex items-start gap-2 p-2 rounded-lg text_bg">
                  <LoginIcon2 class="w-6 h-6 fill-text-1" />
                  <p class="text-xs">
                    <span class="text-text-2">您的奖励将发放至您的 </span>
                    <span class="text-text-1 underline cursor-pointer">返水账户</span>
                    <span class="text-text-2"
                      >。奖励金额将随您的 VIP 等级提升。此优惠每位用户仅限领取一次。</span
                    >
                  </p>
                </div>

                <div class="w-[400px] flex gap-4 mt-5">
                  <button class="btn-primary px-4 h-9 rounded-md" @click="handleDownload('ios')">
                    <span class="text-sm font-[600] text-text-4">下载 App</span>
                  </button>
                  <button
                    class="px-4 h-10 rounded-md border-[1.5px] border-solid border-[#3c4142] flex-1"
                    @click="goHome"
                  >
                    <span class="text-sm font-[600] text-theme-level-1">返回主页</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="w-[1280px] mx-auto">
            <div class="px-4">
              <h2 class="text-4xl font-[800] text-theme-level-1 text-center pb-2">iOS</h2>
              <p class="text-lg font-[600] text-text-1 text-center mb-3">用户安装步骤</p>

              <div class="grid grid-cols-[1fr_1fr_auto] items-start gap-5 py-4">
                <div
                  class="grid grid-rows-[auto_192px_60px_auto] rounded-xl px-24 py-10 h-full gap-3 step_bg cursor-pointer step_hover_container"
                >
                  <p
                    class="text-base font-[800] text-text-1 text-center m-0 p-0 flex items-center justify-center"
                  >
                    步骤 01
                  </p>
                  <img
                    src="/src/static/img/app-download/app_download_2.webp"
                    alt=""
                    class="w-full h-full object-contain"
                  />
                  <p class="text-sm font-[600] text-text-2 text-center">
                    从 App Store 下载后请直接返回本页面，请勿直接启动应用。
                  </p>
                  <div class="flex items-end gap-3 relative">
                    <button
                      class="flex-1 flex items-center justify-center w-full h-11 mt-4 mx-5 btn-primary rounded-lg"
                      @click="handleDownload('ios')"
                    >
                      <span class="text-base text-text-4">扫码下载</span>
                      <img
                        src="/src/static/img/app-download/app_download_7.png"
                        alt=""
                        class="w-6 h-6"
                      />
                    </button>
                    <div class="w-14 h-14 qrcode_absolute">
                      <canvas ref="qrCode1" class="w-full h-full p-1 bg-white rounded-md"></canvas>
                    </div>
                  </div>

                  <!-- 悬停覆盖层 -->
                  <div class="step_hover_overlay">
                    <div class="flex flex-col items-center justify-center h-full gap-6">
                      <canvas ref="qrCodeHover1" class="w-48 h-48 p-2 bg-white rounded-lg"></canvas>
                      <div class="flex items-center gap-3">
                        <img
                          src="/src/static/img/app-download/ios-app-icon.webp"
                          alt="App Icon"
                          class="w-10 h-10 rounded-lg"
                        />
                        <span class="text-lg font-[800] text-text-1">RaceWin</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="grid grid-rows-[auto_192px_60px_auto] rounded-xl px-24 py-10 h-full gap-3 step_bg cursor-pointer step_hover_container"
                >
                  <p
                    class="text-base font-[800] text-text-1 text-center m-0 p-0 flex items-center justify-center"
                  >
                    步骤 02
                  </p>
                  <img
                    src="/src/static/img/app-download/app_download_3.webp"
                    alt=""
                    class="w-full h-full object-contain"
                  />
                  <p class="text-sm font-[600] text-text-2 text-center">
                    点击下面的链接以解锁应用程序。
                  </p>
                  <div class="flex items-center gap-3 relative">
                    <button
                      class="flex-1 flex items-center justify-center w-full h-11 mt-4 mx-5 btn-primary rounded-lg"
                      @click="handleUnlock"
                    >
                      <span class="text-base text-text-4">扫码解锁</span>
                      <img
                        src="/src/static/img/app-download/app_download_7.png"
                        alt=""
                        class="w-6 h-6"
                      />
                    </button>
                    <div class="w-14 h-14 qrcode_absolute">
                      <canvas ref="qrCode2" class="w-full h-full p-1 bg-white rounded-md"></canvas>
                    </div>
                  </div>

                  <!-- 悬停覆盖层 -->
                  <div class="step_hover_overlay">
                    <div class="flex flex-col items-center justify-center h-full gap-6">
                      <canvas ref="qrCodeHover2" class="w-48 h-48 p-2 bg-white rounded-lg"></canvas>
                      <div class="flex items-center gap-3">
                        <span class="text-lg font-[800] text-text-1">Unlock your app</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="w-72 grid grid-rows-[auto_192px_60px_auto] rounded-xl py-10 h-full gap-3 step_bg"
                >
                  <p
                    class="text-base font-[800] text-text-1 text-center m-0 p-0 flex items-center justify-center"
                  >
                    步骤 03
                  </p>
                  <img
                    src="/src/static/img/app-download/app_download_4.webp"
                    alt=""
                    class="w-full h-full object-contain"
                  />
                  <p class="text-sm font-[600] text-text-2 text-center">
                    Open the app and sign in to claim your rewards.
                  </p>
                  <div class="h-11 mt-4"></div>
                </div>
              </div>
            </div>
          </section>

          <section class="w-[1280px] mx-auto mt-8">
            <div class="px-4">
              <h2 class="text-4xl font-[800] text-theme-level-1 text-center pb-2">Android</h2>
              <p class="text-lg font-[600] text-text-1 text-center mb-3">用户安装步骤</p>

              <div class="grid grid-cols-[1fr_1fr_auto] items-start gap-5 py-4">
                <div
                  class="grid grid-rows-[auto_192px_60px_auto] rounded-xl px-24 py-10 h-full gap-3 cursor-pointer step_bg step_hover_container"
                >
                  <h3
                    class="text-base font-[800] text-text-1 text-center m-0 p-0 flex items-center justify-center"
                  >
                    步骤 01
                  </h3>
                  <img
                    src="/src/static/img/app-download/app_download_5.webp"
                    alt=""
                    class="w-full h-full object-contain"
                  />
                  <p class="text-sm font-[600] text-text-2 text-center">
                    Download the APK File on your mobile device
                  </p>
                  <div class="flex items-end gap-3 relative">
                    <button
                      class="flex-1 flex items-center justify-center w-full h-11 mt-4 mx-5 btn-primary rounded-lg"
                      @click="handleDownload('android')"
                    >
                      <span class="text-base text-text-4">Scan to Download</span>
                      <img
                        src="/src/static/img/app-download/app_download_7.png"
                        alt=""
                        class="w-6 h-6"
                      />
                    </button>
                    <div class="w-14 h-14 qrcode_absolute">
                      <canvas ref="qrCode3" class="w-full h-full p-1 bg-white rounded-md"></canvas>
                    </div>
                  </div>

                  <!-- 悬停覆盖层 -->
                  <div class="step_hover_overlay">
                    <div class="flex flex-col items-center justify-center h-full gap-6">
                      <canvas ref="qrCodeHover3" class="w-48 h-48 p-2 bg-white rounded-lg"></canvas>
                      <div class="flex items-center gap-3">
                        <span class="text-lg font-[800] text-text-1">Unlock your app</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="grid grid-rows-[auto_192px_60px_auto] rounded-xl px-24 py-10 h-full gap-3 step_bg"
                >
                  <h3
                    class="text-base font-[800] text-text-1 text-center m-0 p-0 flex items-center justify-center"
                  >
                    步骤 02
                  </h3>
                  <img
                    src="/src/static/img/app-download/app_download_6.webp"
                    alt=""
                    class="w-full h-full object-contain"
                  />
                  <p class="text-sm font-[600] text-text-2 text-center">
                    Install the APK on your device
                  </p>
                  <div class="h-11 mt-4"></div>
                </div>

                <div
                  class="w-72 grid grid-rows-[auto_192px_60px_auto] rounded-xl py-10 h-full gap-3 step_bg"
                >
                  <h3
                    class="text-base font-[800] text-text-1 text-center m-0 p-0 flex items-center justify-center"
                  >
                    步骤 03
                  </h3>
                  <img
                    src="/src/static/img/app-download/app_download_4.webp"
                    alt=""
                    class="w-full h-full object-contain"
                  />
                  <p class="text-sm font-[600] text-text-2 text-center">
                    Open the app and sign in to claim your rewards
                  </p>
                  <div class="h-11 mt-4"></div>
                </div>
              </div>
            </div>
          </section>

          <section class="mx-auto w-2/3 my-10">
            <div class="py-20 gap-3">
              <div class="flex items-center justify-between">
                <img
                  src="/src/static/img/app-download/app_download_BG_2.webp"
                  alt=""
                  class="w-full h-auto object-contain"
                />

                <div class="flex flex-col items-center gap-3">
                  <h2 class="text-3xl font-[800] text_color">下载并解锁</h2>
                  <p class="w-64 text-sm text-text-2 text-center">
                    安装
                    <span class="text-sm text-text-1">iOS</span>
                    应用程序，然后返回并点击下方以解锁。
                  </p>
                  <div class="flex gap-3 pt-5">
                    <button
                      class="flex items-center justify-center w-48 h-14 px-3 gap-2 rounded-lg btnBox"
                      @click="handleDownload('ios')"
                    >
                      <LoginIcon2 class="w-8 h-8 fill-text-1" />
                      <div class="flex flex-col items-start">
                        <span class="text-sm text-text-1">iOS</span>
                        <span class="text-sm text-text-1">安装</span>
                      </div>
                    </button>

                    <button
                      class="flex items-center justify-center w-48 h-14 px-3 gap-2 rounded-lg btnBox"
                      @click="handleDownload('android')"
                    >
                      <LoginIcon2 class="w-8 h-8 fill-text-1" />
                      <div class="flex flex-col items-start">
                        <span class="text-sm text-text-1">Android</span>
                        <span class="text-sm text-text-1">安装</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer class="pt-5">
            <div class="p-8 footer">
              <div class="w-[1280px] mx-auto">
                <div class="flex items-start justify-between mb-8">
                  <img src="/src/static/img/home/logo.png" alt="" class="w-36 h-auto" />

                  <div class="flex flex-col w-80">
                    <h3 class="text-sm font-[600] text-text-2 mb-4">Accepted Networks</h3>
                    <img
                      src="/src/static/img/app-download/app_download_bot.webp"
                      alt=""
                      class="w-full h-auto"
                    />
                  </div>
                </div>

                <div class="mb-10">
                  <p class="text-base text-text-2">
                    BC.GAME is a community-based crypto casino that offers their players the best
                    online casino experience possible-
                  </p>
                  <p class="text-base text-text-2 mt-3">
                    At BC.GAME, we are convinced that blockchain will change the online crypto
                    gambling industry forever. Jump in and check it out for yourself!
                  </p>
                  <p class="text-base text-text-2">Have fun and earn crypto!</p>
                </div>

                <div class="mb-4">
                  <p class="text-base text-text-2">
                    BC.GAME is operated by BlockDance B.V. (Commercial register of Curaçao
                    no.158182, Emancipatie Boulevard Dominico F. "Don" Martina 31, Curaçao) under a
                    sublicense CIL pursuant to Master gaming License #5536/JAZ.
                  </p>
                </div>

                <!-- 底部：版权信息 -->
                <div class="text-center pt-4">
                  <p class="text-base text-text-2">©2025 BC.Game All Rights Reserved</p>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <!-- H5端 -->
      <div class="block sm:hidden">H5端</div>
    </div>
  </AppDownloadCore>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import AppDownloadCore from './AppDownloadCore.vue'
import LoginIcon2 from '@/static/svg/login/login_icon_2.svg?component'

const router = useRouter()

// 二维码 canvas
const qrCode1 = ref<HTMLCanvasElement>()
const qrCode2 = ref<HTMLCanvasElement>()
const qrCode3 = ref<HTMLCanvasElement>()

// 悬停二维码 canvas
const qrCodeHover1 = ref<HTMLCanvasElement>()
const qrCodeHover2 = ref<HTMLCanvasElement>()
const qrCodeHover3 = ref<HTMLCanvasElement>()

// 箭头动画
const currentArrowIndex = ref(1)
const arrowAnimationInterval = ref<number | null>(null)

const currentArrowImage = computed(() => {
  return `/src/static/img/app-download/arrow_right_${currentArrowIndex.value}.png`
})

// 返回主页
const goHome = () => {
  router.push('/')
}

// 处理解锁
const handleUnlock = () => {
  window.open('https://www.google.com', '_blank')
}

// 生成二维码
const generateQRCode = async (canvas: HTMLCanvasElement | undefined, url: string, size = 56) => {
  if (!canvas) return

  try {
    await QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  const url = 'https://www.google.com'
  // 小二维码
  generateQRCode(qrCode1.value, url, 56)
  generateQRCode(qrCode2.value, url, 56)
  generateQRCode(qrCode3.value, url, 56)

  // 悬停大二维码 (192x192)
  generateQRCode(qrCodeHover1.value, url, 192)
  generateQRCode(qrCodeHover2.value, url, 192)
  generateQRCode(qrCodeHover3.value, url, 192)

  // 箭头动画
  arrowAnimationInterval.value = window.setInterval(() => {
    currentArrowIndex.value = currentArrowIndex.value === 3 ? 1 : currentArrowIndex.value + 1
  }, 500)
})

onUnmounted(() => {
  if (arrowAnimationInterval.value) {
    clearInterval(arrowAnimationInterval.value)
  }
})
</script>

<style lang="scss" scoped>
.pcBG {
  min-height: 200vh;
  background-image: url('/src/static/img/app-download/app_download_BG_1.webp');
  background-size: 1920px auto;
  background-position: top center;
  background-repeat: no-repeat;
}

.btnBox {
  border: 1px solid #38eb6a;
  box-sizing: border-box;
  background: linear-gradient(180deg, #181818, #111 16.3%, #070707 59.13%, #000);
  box-shadow: 0 4px 12px #1d1008;
}

.text_color {
  background: linear-gradient(90deg, #9fe871, #24ee89);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text_bg {
  background-color: rgba(255, 255, 255, 0.1);
}

.step_bg {
  background-color: rgba(255, 255, 255, 0.1);
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 288px;
    height: 1px;
    transform: translateX(-50%);
    background: linear-gradient(270deg, #2fee8700, #2fee8780 54.5%, #2fee8700);
  }
}

.step_hover_container {
  overflow: hidden;

  .step_hover_overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.15s ease;
    z-index: 10;
    backdrop-filter: blur(10px);
  }

  &:hover {
    .step_hover_overlay {
      opacity: 1;
      visibility: visible;
    }

    > *:not(.step_hover_overlay) {
      filter: blur(5px);
    }
  }
}

.qrcode_absolute {
  position: absolute;
  top: 13%;
  right: -20%;
  z-index: 1;
}

.footer {
  background-color: #141515;
  border: 1px solid #262829;
}
</style>
