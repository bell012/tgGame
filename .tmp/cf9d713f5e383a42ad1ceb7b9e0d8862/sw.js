import { registerRoute as workbox_routing_registerRoute } from 'D:/can/tgGame/node_modules/workbox-routing/registerRoute.mjs'
import { ExpirationPlugin as workbox_expiration_ExpirationPlugin } from 'D:/can/tgGame/node_modules/workbox-expiration/ExpirationPlugin.mjs'
import { NetworkFirst as workbox_strategies_NetworkFirst } from 'D:/can/tgGame/node_modules/workbox-strategies/NetworkFirst.mjs'
import { CacheableResponsePlugin as workbox_cacheable_response_CacheableResponsePlugin } from 'D:/can/tgGame/node_modules/workbox-cacheable-response/CacheableResponsePlugin.mjs'
import { CacheFirst as workbox_strategies_CacheFirst } from 'D:/can/tgGame/node_modules/workbox-strategies/CacheFirst.mjs'
import { clientsClaim as workbox_core_clientsClaim } from 'D:/can/tgGame/node_modules/workbox-core/clientsClaim.mjs'
import { precacheAndRoute as workbox_precaching_precacheAndRoute } from 'D:/can/tgGame/node_modules/workbox-precaching/precacheAndRoute.mjs'
import { cleanupOutdatedCaches as workbox_precaching_cleanupOutdatedCaches } from 'D:/can/tgGame/node_modules/workbox-precaching/cleanupOutdatedCaches.mjs' /**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

self.skipWaiting()
workbox_core_clientsClaim()
/**
 * The precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox_precaching_precacheAndRoute(
  [
    {
      url: 'registerSW.js',
      revision: '1872c500de691dce40960bb85481de07'
    },
    {
      url: 'mask-icon.svg',
      revision: '61c10f66303615377013f04a337f6239'
    },
    {
      url: 'lottie/mystery-box/open/open.json',
      revision: '534364fb80055a7a7ff5aa307b4a5a7c'
    },
    {
      url: 'lottie/mystery-box/open/images/xing.png',
      revision: '5b0ac95e1edc360b03e640515f1e5ebe'
    },
    {
      url: 'lottie/mystery-box/open/images/sheguang.png',
      revision: 'bc9cde23290a04bddec6485a27d332aa'
    },
    {
      url: 'lottie/mystery-box/open/images/saoguang.png',
      revision: '0ffafd525b2eaae2598cc6c06ece3095'
    },
    {
      url: 'lottie/mystery-box/open/images/meijin2.png',
      revision: '5dbc149b13ab8c482f8c903be3fce95f'
    },
    {
      url: 'lottie/mystery-box/open/images/meijin1.png',
      revision: '025dd5e8bf1bfe2020618603b726c8a1'
    },
    {
      url: 'lottie/mystery-box/open/images/liheding.png',
      revision: '5d3fa5b5c19f8f29452f9cdc4a54dc4f'
    },
    {
      url: 'lottie/mystery-box/open/images/lihedi2.png',
      revision: 'dd023d7d675bc7e5dd549eb4d972ebcb'
    },
    {
      url: 'lottie/mystery-box/open/images/lihedi1.png',
      revision: '20155d89fc6b540f63e731436e9a1042'
    },
    {
      url: 'lottie/mystery-box/open/images/jinbidui.png',
      revision: '3ed02f119c4b44b7febc6da283cae5de'
    },
    {
      url: 'lottie/mystery-box/open/images/jinbi.png',
      revision: '2ddc6b1639966156a735abefc0ae2f70'
    },
    {
      url: 'lottie/mystery-box/open/images/guangxiao.png',
      revision: '59a95610f57a3633253e67f62a05c1b2'
    },
    {
      url: 'lottie/mystery-box/open/images/guang1.png',
      revision: '5b39a18d3b9e42e3798da73bc930152e'
    },
    {
      url: 'lottie/mystery-box/open/images/daoying.png',
      revision: 'e385e767467778aea7fa0e7dc1cc9004'
    },
    {
      url: 'lottie/lucky-spin/cash-result/cash-popup.json',
      revision: 'd75f7724337d7e6f5f21d170f147b6dd'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/zuojin.png',
      revision: '8568516c0275fe3634f0abd0499bdb8f'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/zuodai.png',
      revision: '01349a15b26d8a427603c29aac12073c'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/youjin.png',
      revision: '3a5fbbd24d084be30b6478a3e1557f85'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/youdai.png',
      revision: 'a27c15532c64a2119a9abca107bfb236'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/xing.png',
      revision: '5b0ac95e1edc360b03e640515f1e5ebe'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/sheguang.png',
      revision: '95482a88c0e485935df338771ee4fc49'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/qiandai.png',
      revision: 'e17d1ad9594be661afb49784b3ddd376'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/meijin.png',
      revision: '2029a7554688591ddfb2925efc31877c'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/jinbi.png',
      revision: '7e27b165722737a77d119171ddebd63f'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/guang1.png',
      revision: '5b39a18d3b9e42e3798da73bc930152e'
    },
    {
      url: 'lottie/lucky-spin/cash-result/images/daoying.png',
      revision: '01564357fe1f7378b8d5e74138124b24'
    },
    {
      url: 'lottie/lucky-red-envelope/open/open.json',
      revision: '87f0c546adb49a8ac402dad01c62b54c'
    },
    {
      url: 'lottie/lucky-red-envelope/open/images/wenzidi.png',
      revision: '56d556a696752b312d7f4958e48b9111'
    },
    {
      url: 'lottie/lucky-red-envelope/open/images/wenlidi.png',
      revision: '2bb283e77e7fc636d3481c211ee3666c'
    },
    {
      url: 'lottie/lucky-red-envelope/open/images/hongdi.png',
      revision: 'c99bab3da4940753261c4152b53c5e20'
    },
    {
      url: 'lottie/lucky-red-envelope/open/images/hongbaoding.png',
      revision: '2ecb48f0d9db0e358073c8c7d96eba04'
    },
    {
      url: 'lottie/lucky-red-envelope/open/images/anniu.png',
      revision: 'ddd080be8c0863c746e2117d7cffa7f1'
    },
    {
      url: 'lottie/lucky-red-envelope/intro/intro.json',
      revision: 'b52e208d0c20ec3c8b9ab761f73b39c9'
    },
    {
      url: 'lottie/lucky-red-envelope/intro/images/dahongbao.png',
      revision: 'c185e5c3a97e844a5add2a805474623c'
    },
    {
      url: 'lottie/lucky-red-envelope/idle/idle.json',
      revision: '3659077fad9c51bbeeb653731c11be0e'
    },
    {
      url: 'lottie/lucky-red-envelope/idle/images/saoguang.png',
      revision: '31dd1cebeac627b8309d0265fce91b21'
    },
    {
      url: 'lottie/lucky-red-envelope/idle/images/kuosan.png',
      revision: 'c7e77a9a9552ba16ec32833cbe5a882e'
    },
    {
      url: 'lottie/lucky-red-envelope/idle/images/anniu.png',
      revision: 'ddd080be8c0863c746e2117d7cffa7f1'
    },
    {
      url: 'lottie/cash-voucher/result/popup.json',
      revision: 'a4ff5ba7a113152350dc8faa7b003685'
    },
    {
      url: 'lottie/cash-voucher/result/images/xing.png',
      revision: '5b0ac95e1edc360b03e640515f1e5ebe'
    },
    {
      url: 'lottie/cash-voucher/result/images/touying.png',
      revision: '0f9c42f8c1687a3de1a6fd184e06a5c6'
    },
    {
      url: 'lottie/cash-voucher/result/images/sheguang.png',
      revision: '95482a88c0e485935df338771ee4fc49'
    },
    {
      url: 'lottie/cash-voucher/result/images/meijintouying.png',
      revision: 'b547a31723739c316440ccbf29b3bb86'
    },
    {
      url: 'lottie/cash-voucher/result/images/meijin.png',
      revision: 'b4cd88173c6f6d670260d7b0cc04d2b7'
    },
    {
      url: 'lottie/cash-voucher/result/images/guangxiao.png',
      revision: '2f2072607fe348231359c9e51fc7e09a'
    },
    {
      url: 'lottie/cash-voucher/result/images/guang1.png',
      revision: '5b39a18d3b9e42e3798da73bc930152e'
    },
    {
      url: 'lottie/cash-voucher/result/images/dabaoxiang.png',
      revision: '7388fe1fc7dbaea16d55acc92331835c'
    },
    {
      url: 'guide/videos/guide-home-intro.png',
      revision: '73917833d150c85cfaa0d1b816e83745'
    },
    {
      url: 'assets/zhusucai-xG2Z5VVZ.webp',
      revision: null
    },
    {
      url: 'assets/zhusucai-xG2Z5VVZ.png',
      revision: null
    },
    {
      url: 'assets/yongjin 1-msGOc0ee.js',
      revision: null
    },
    {
      url: 'assets/yaoqing2-CelkDmk6.webp',
      revision: null
    },
    {
      url: 'assets/yaoqing2-CelkDmk6.png',
      revision: null
    },
    {
      url: 'assets/yaoqing-Ch8Px6xr.webp',
      revision: null
    },
    {
      url: 'assets/yaoqing-Ch8Px6xr.png',
      revision: null
    },
    {
      url: 'assets/XRP.black-Dfwz-XK7.svg',
      revision: null
    },
    {
      url: 'assets/xianjian-B4PBak46.webp',
      revision: null
    },
    {
      url: 'assets/x-B_89Yzrw.svg',
      revision: null
    },
    {
      url: 'assets/wheel-shadow-CNlTYMmq.webp',
      revision: null
    },
    {
      url: 'assets/wheel-shadow-CNlTYMmq.png',
      revision: null
    },
    {
      url: 'assets/wheel-segment-light-B-6sBOXU.webp',
      revision: null
    },
    {
      url: 'assets/wheel-segment-light-B-6sBOXU.png',
      revision: null
    },
    {
      url: 'assets/wheel-segment-dark-D7eWuzt3.webp',
      revision: null
    },
    {
      url: 'assets/wheel-segment-dark-D7eWuzt3.png',
      revision: null
    },
    {
      url: 'assets/wheel-sector-highlight-DhxMopA7.webp',
      revision: null
    },
    {
      url: 'assets/wheel-sector-highlight-DhxMopA7.png',
      revision: null
    },
    {
      url: 'assets/wheel-pointer-go-Blvb1weL.webp',
      revision: null
    },
    {
      url: 'assets/wheel-pointer-go-Blvb1weL.png',
      revision: null
    },
    {
      url: 'assets/wheel-frame-hMFyREcb.webp',
      revision: null
    },
    {
      url: 'assets/wheel-frame-hMFyREcb.png',
      revision: null
    },
    {
      url: 'assets/VISA-DtoSAxt_.svg',
      revision: null
    },
    {
      url: 'assets/vip_right-BTep2U1F.webp',
      revision: null
    },
    {
      url: 'assets/vip_right-BTep2U1F.png',
      revision: null
    },
    {
      url: 'assets/vip_left-D9825reS.webp',
      revision: null
    },
    {
      url: 'assets/vip_left-D9825reS.png',
      revision: null
    },
    {
      url: 'assets/vip9-VzFpAjVg.svg',
      revision: null
    },
    {
      url: 'assets/vip8-bmmPmJ1H.svg',
      revision: null
    },
    {
      url: 'assets/vip7-KqSZ1sVf.svg',
      revision: null
    },
    {
      url: 'assets/vip6-DjVHxaAQ.svg',
      revision: null
    },
    {
      url: 'assets/vip5-CrTUR-bT.svg',
      revision: null
    },
    {
      url: 'assets/vip4-DpQox-Rv.svg',
      revision: null
    },
    {
      url: 'assets/vip3-BZldUbJG.svg',
      revision: null
    },
    {
      url: 'assets/vip2-Cs7LU_0I.svg',
      revision: null
    },
    {
      url: 'assets/vip10-DhZEFLMF.svg',
      revision: null
    },
    {
      url: 'assets/vip1-DooO0IyS.svg',
      revision: null
    },
    {
      url: 'assets/vip0-kjbpHqZN.svg',
      revision: null
    },
    {
      url: 'assets/video-volume-on-CnjbIsAU.js',
      revision: null
    },
    {
      url: 'assets/useRequireLoginAction-BEm4yJwc.js',
      revision: null
    },
    {
      url: 'assets/USDT.black-Dk3sv0HG.svg',
      revision: null
    },
    {
      url: 'assets/USDC.black-DsbyFKji.svg',
      revision: null
    },
    {
      url: 'assets/USDC-CAn6kEVM.webp',
      revision: null
    },
    {
      url: 'assets/USDC-CAn6kEVM.png',
      revision: null
    },
    {
      url: 'assets/turntable-CQOxBypn.webp',
      revision: null
    },
    {
      url: 'assets/turntable-CQOxBypn.png',
      revision: null
    },
    {
      url: 'assets/TRX.black-B53RPBhU.svg',
      revision: null
    },
    {
      url: 'assets/TRX-B2kvd0ot.webp',
      revision: null
    },
    {
      url: 'assets/TRX-B2kvd0ot.png',
      revision: null
    },
    {
      url: 'assets/transaction_dec-BaMBXJWZ.js',
      revision: null
    },
    {
      url: 'assets/title-back-DolDPNJ3.webp',
      revision: null
    },
    {
      url: 'assets/title-back-DolDPNJ3.png',
      revision: null
    },
    {
      url: 'assets/table-DZ48S_kv.webp',
      revision: null
    },
    {
      url: 'assets/table-DZ48S_kv.png',
      revision: null
    },
    {
      url: 'assets/sucai-Bm8cxCwY.webp',
      revision: null
    },
    {
      url: 'assets/sucai-Bm8cxCwY.png',
      revision: null
    },
    {
      url: 'assets/stand-CAmgl4yD.webp',
      revision: null
    },
    {
      url: 'assets/stand-CAmgl4yD.png',
      revision: null
    },
    {
      url: 'assets/SportsBuyBackSheet.vue_vue_type_script_setup_true_lang-CmiSTAOb.js',
      revision: null
    },
    {
      url: 'assets/sports-DKUln5eu.webp',
      revision: null
    },
    {
      url: 'assets/sports-DKUln5eu.png',
      revision: null
    },
    {
      url: 'assets/sport-items-ChtxfIVJ.js',
      revision: null
    },
    {
      url: 'assets/SOL.black-WgaIfPmU.svg',
      revision: null
    },
    {
      url: 'assets/slots-DoCGCKMv.webp',
      revision: null
    },
    {
      url: 'assets/slots-DoCGCKMv.png',
      revision: null
    },
    {
      url: 'assets/shopping-C8LpLcbK.svg',
      revision: null
    },
    {
      url: 'assets/shopeePay-BnVo7jhJ.svg',
      revision: null
    },
    {
      url: 'assets/sheguang-B3BTvruL.webp',
      revision: null
    },
    {
      url: 'assets/sheguang-B3BTvruL.png',
      revision: null
    },
    {
      url: 'assets/shared-D_mvZnQR.js',
      revision: null
    },
    {
      url: 'assets/shared-CtW7Boq9.js',
      revision: null
    },
    {
      url: 'assets/shared-CtqRBYAN.js',
      revision: null
    },
    {
      url: 'assets/shared-BsN2Ib49.js',
      revision: null
    },
    {
      url: 'assets/shared-BeqIHrSM.js',
      revision: null
    },
    {
      url: 'assets/set-q74s5zL8.css',
      revision: null
    },
    {
      url: 'assets/set-Dy-Zsf8P.js',
      revision: null
    },
    {
      url: 'assets/saoguang1-uIEFEF7d.webp',
      revision: null
    },
    {
      url: 'assets/saoguang1-uIEFEF7d.png',
      revision: null
    },
    {
      url: 'assets/saoguang-CQWEBukO.webp',
      revision: null
    },
    {
      url: 'assets/saoguang-CQWEBukO.png',
      revision: null
    },
    {
      url: 'assets/s-BIO8XDaJ.svg',
      revision: null
    },
    {
      url: 'assets/rule_1-DVshvZIh.svg',
      revision: null
    },
    {
      url: 'assets/roulette-C5xKMEA7.webp',
      revision: null
    },
    {
      url: 'assets/roulette-C5xKMEA7.png',
      revision: null
    },
    {
      url: 'assets/ribbon-gift-DXT4tHNE.webp',
      revision: null
    },
    {
      url: 'assets/ribbon-gift-DXT4tHNE.png',
      revision: null
    },
    {
      url: 'assets/referral-coin-npaQVOWv.webp',
      revision: null
    },
    {
      url: 'assets/referral-coin-npaQVOWv.png',
      revision: null
    },
    {
      url: 'assets/red-packet-success-D8-ODBit.webp',
      revision: null
    },
    {
      url: 'assets/red-packet-success-D8-ODBit.png',
      revision: null
    },
    {
      url: 'assets/red-packet-CVkUCj6Q.webp',
      revision: null
    },
    {
      url: 'assets/red-packet-CVkUCj6Q.png',
      revision: null
    },
    {
      url: 'assets/red-envelope-DKUECV_p.webp',
      revision: null
    },
    {
      url: 'assets/red-envelope-DKUECV_p.png',
      revision: null
    },
    {
      url: 'assets/RebateRecordsContent-CuGjv6Nx.js',
      revision: null
    },
    {
      url: 'assets/RebateRecordsContent-B7Hho5TG.css',
      revision: null
    },
    {
      url: 'assets/quick-action-task-CrjmX141.webp',
      revision: null
    },
    {
      url: 'assets/quick-action-task-CrjmX141.png',
      revision: null
    },
    {
      url: 'assets/quick-action-rules-CWhN3R5b.webp',
      revision: null
    },
    {
      url: 'assets/quick-action-rules-CWhN3R5b.png',
      revision: null
    },
    {
      url: 'assets/quick-action-guide-ysumzNaY.webp',
      revision: null
    },
    {
      url: 'assets/quick-action-guide-ysumzNaY.png',
      revision: null
    },
    {
      url: 'assets/quick-action-details-BqOqMIMV.webp',
      revision: null
    },
    {
      url: 'assets/quick-action-details-BqOqMIMV.png',
      revision: null
    },
    {
      url: 'assets/popup-summary-coin-DlaNvSSM.webp',
      revision: null
    },
    {
      url: 'assets/popup-promo-card-GNy8f8RU.webp',
      revision: null
    },
    {
      url: 'assets/popShell-DGzl4RdQ.css',
      revision: null
    },
    {
      url: 'assets/popShell-BJQIOvjh.js',
      revision: null
    },
    {
      url: 'assets/pc-layout.vue_vue_type_script_setup_true_lang-DgZCqMTC.js',
      revision: null
    },
    {
      url: 'assets/pc-layout.vue_vue_type_script_setup_true_lang-Bg-jf47b.js',
      revision: null
    },
    {
      url: 'assets/pc-layout.vue_vue_type_script_setup_true_lang-8TETRxLV.js',
      revision: null
    },
    {
      url: 'assets/payment_receipt_sample-Ch3DpHcs.webp',
      revision: null
    },
    {
      url: 'assets/payment_receipt_sample-Ch3DpHcs.png',
      revision: null
    },
    {
      url: 'assets/pageStyle4.vue_vue_type_script_setup_true_lang-Bx3Qb7oj.js',
      revision: null
    },
    {
      url: 'assets/pageStyle4-CiMJ42U1.css',
      revision: null
    },
    {
      url: 'assets/pageStyle2-DXTnvrhg.css',
      revision: null
    },
    {
      url: 'assets/pageStyle2-Dh0nbgD9.js',
      revision: null
    },
    {
      url: 'assets/p4-Ci16PvnQ.svg',
      revision: null
    },
    {
      url: 'assets/p3-BeWtl3xv.svg',
      revision: null
    },
    {
      url: 'assets/p2-BFm9Ojur.webp',
      revision: null
    },
    {
      url: 'assets/p1-BWxCDxWR.svg',
      revision: null
    },
    {
      url: 'assets/noData-Dqaae3J5.webp',
      revision: null
    },
    {
      url: 'assets/noData-Dqaae3J5.png',
      revision: null
    },
    {
      url: 'assets/noData-DEnwKMji.js',
      revision: null
    },
    {
      url: 'assets/newEvent-CnsJVw6c.js',
      revision: null
    },
    {
      url: 'assets/newEvent-BqHbqdAb.css',
      revision: null
    },
    {
      url: 'assets/mobile-LDlO6z0B.css',
      revision: null
    },
    {
      url: 'assets/mobile-DDBVZZTC.js',
      revision: null
    },
    {
      url: 'assets/maya-BHT6qMii.webp',
      revision: null
    },
    {
      url: 'assets/maya-BHT6qMii.png',
      revision: null
    },
    {
      url: 'assets/MATIC.black-D9QlRFYk.svg',
      revision: null
    },
    {
      url: 'assets/manghe-DNmGaaSf.webp',
      revision: null
    },
    {
      url: 'assets/manghe-DNmGaaSf.png',
      revision: null
    },
    {
      url: 'assets/logo-white-B7aDSqBj.svg',
      revision: null
    },
    {
      url: 'assets/live-Nk5luhTy.webp',
      revision: null
    },
    {
      url: 'assets/live-Nk5luhTy.png',
      revision: null
    },
    {
      url: 'assets/live-KEX1QTO6.svg',
      revision: null
    },
    {
      url: 'assets/line-BW3YsxcM.svg',
      revision: null
    },
    {
      url: 'assets/layout.vue_vue_type_script_setup_true_lang-Ba7-fg_x.js',
      revision: null
    },
    {
      url: 'assets/layout-DrAfByQ4.css',
      revision: null
    },
    {
      url: 'assets/latestBetTable.vue_vue_type_script_setup_true_lang-DE_hfTG0.js',
      revision: null
    },
    {
      url: 'assets/kefu-hTwznsBm.js',
      revision: null
    },
    {
      url: 'assets/jindanzakai-Dd6o4HL4.webp',
      revision: null
    },
    {
      url: 'assets/jindanzakai-Dd6o4HL4.png',
      revision: null
    },
    {
      url: 'assets/jindanding-CBfcvIqE.webp',
      revision: null
    },
    {
      url: 'assets/jindanding-CBfcvIqE.png',
      revision: null
    },
    {
      url: 'assets/jindandi-CEkCdNHc.webp',
      revision: null
    },
    {
      url: 'assets/jindandi-CEkCdNHc.png',
      revision: null
    },
    {
      url: 'assets/jindan-Dmj1hrSW.webp',
      revision: null
    },
    {
      url: 'assets/jindan-Dmj1hrSW.png',
      revision: null
    },
    {
      url: 'assets/jindan-DiG-oqw1.webp',
      revision: null
    },
    {
      url: 'assets/jindan-DiG-oqw1.png',
      revision: null
    },
    {
      url: 'assets/item_4-OSz4OYpC.webp',
      revision: null
    },
    {
      url: 'assets/item_4-OSz4OYpC.png',
      revision: null
    },
    {
      url: 'assets/item_3-D6pm7ibI.webp',
      revision: null
    },
    {
      url: 'assets/item_3-D6pm7ibI.png',
      revision: null
    },
    {
      url: 'assets/item_1-DwVtInVf.webp',
      revision: null
    },
    {
      url: 'assets/item_1-DwVtInVf.png',
      revision: null
    },
    {
      url: 'assets/ios-app-icon-CKlLoLWR.webp',
      revision: null
    },
    {
      url: 'assets/InvitePosterPopup.vue_vue_type_script_setup_true_lang-BdTnE-94.js',
      revision: null
    },
    {
      url: 'assets/invite-task-banner-pc-Cvc_5Iuk.webp',
      revision: null
    },
    {
      url: 'assets/invite-task-banner-pc-Cvc_5Iuk.png',
      revision: null
    },
    {
      url: 'assets/invite-task-banner-h5-D4zcsc1Q.webp',
      revision: null
    },
    {
      url: 'assets/invite-task-banner-h5-D4zcsc1Q.png',
      revision: null
    },
    {
      url: 'assets/index.vue_vue_type_script_setup_true_lang-ubU8Zqth.js',
      revision: null
    },
    {
      url: 'assets/index.vue_vue_type_script_setup_true_lang-CQSc6Ews.js',
      revision: null
    },
    {
      url: 'assets/index-vWevtItc.css',
      revision: null
    },
    {
      url: 'assets/index-qwNU2738.js',
      revision: null
    },
    {
      url: 'assets/index-qLd2FdP1.js',
      revision: null
    },
    {
      url: 'assets/index-QdTkQYlf.css',
      revision: null
    },
    {
      url: 'assets/index-PcPHbi_X.js',
      revision: null
    },
    {
      url: 'assets/index-mrgLqPRB.js',
      revision: null
    },
    {
      url: 'assets/index-HRztYcHn.css',
      revision: null
    },
    {
      url: 'assets/index-GTSM7jAr.js',
      revision: null
    },
    {
      url: 'assets/index-FmQzCten.css',
      revision: null
    },
    {
      url: 'assets/index-fJ5oXIhT.css',
      revision: null
    },
    {
      url: 'assets/index-FhHqbgUs.css',
      revision: null
    },
    {
      url: 'assets/index-eFtze6Ne.css',
      revision: null
    },
    {
      url: 'assets/index-e7Vx_2LO.js',
      revision: null
    },
    {
      url: 'assets/index-DZQnU33q.js',
      revision: null
    },
    {
      url: 'assets/index-Dz45MfBa.css',
      revision: null
    },
    {
      url: 'assets/index-DRWkmCYx.js',
      revision: null
    },
    {
      url: 'assets/index-DOr9-EYq.js',
      revision: null
    },
    {
      url: 'assets/index-DN-Brz3E.js',
      revision: null
    },
    {
      url: 'assets/index-DMQ_jSvC.css',
      revision: null
    },
    {
      url: 'assets/index-Dl0O9AuL.js',
      revision: null
    },
    {
      url: 'assets/index-DkDH6VjV.js',
      revision: null
    },
    {
      url: 'assets/index-DH3dz2ab.js',
      revision: null
    },
    {
      url: 'assets/index-DCXmSFgZ.css',
      revision: null
    },
    {
      url: 'assets/index-DC7rFh-c.js',
      revision: null
    },
    {
      url: 'assets/index-Db8lNlJU.js',
      revision: null
    },
    {
      url: 'assets/index-DaXIqPnE.js',
      revision: null
    },
    {
      url: 'assets/index-D9WRqxyz.css',
      revision: null
    },
    {
      url: 'assets/index-D9kaiGDn.js',
      revision: null
    },
    {
      url: 'assets/index-D6fH9Vqq.js',
      revision: null
    },
    {
      url: 'assets/index-D5hBBhzG.js',
      revision: null
    },
    {
      url: 'assets/index-D4YVZYBA.css',
      revision: null
    },
    {
      url: 'assets/index-D4LdQLkS.js',
      revision: null
    },
    {
      url: 'assets/index-D41_GQ4u.js',
      revision: null
    },
    {
      url: 'assets/index-D-X7DB2E.js',
      revision: null
    },
    {
      url: 'assets/index-D-fz9g7j.js',
      revision: null
    },
    {
      url: 'assets/index-CZxiijZ1.js',
      revision: null
    },
    {
      url: 'assets/index-CYYzBRTv.js',
      revision: null
    },
    {
      url: 'assets/index-CyeDBjB-.css',
      revision: null
    },
    {
      url: 'assets/index-Cxtkjri_.css',
      revision: null
    },
    {
      url: 'assets/index-CxTahY5g.css',
      revision: null
    },
    {
      url: 'assets/index-CWlOapT4.css',
      revision: null
    },
    {
      url: 'assets/index-CV5suvHo.css',
      revision: null
    },
    {
      url: 'assets/index-CTDlq18V.css',
      revision: null
    },
    {
      url: 'assets/index-Cr7CSpzw.js',
      revision: null
    },
    {
      url: 'assets/index-Cr1sECbO.css',
      revision: null
    },
    {
      url: 'assets/index-Cqz5dOje.js',
      revision: null
    },
    {
      url: 'assets/index-CpsVNIhs.css',
      revision: null
    },
    {
      url: 'assets/index-CpPcirnL.js',
      revision: null
    },
    {
      url: 'assets/index-CMoQl_HZ.js',
      revision: null
    },
    {
      url: 'assets/index-CllEvmQ6.css',
      revision: null
    },
    {
      url: 'assets/index-CK1E4Cer.js',
      revision: null
    },
    {
      url: 'assets/index-CJJGWmIW.js',
      revision: null
    },
    {
      url: 'assets/index-CiM3eqsh.js',
      revision: null
    },
    {
      url: 'assets/index-CIFxvzS9.js',
      revision: null
    },
    {
      url: 'assets/index-CGCjifc_.js',
      revision: null
    },
    {
      url: 'assets/index-cevJFXBF.css',
      revision: null
    },
    {
      url: 'assets/index-Cbf7BreZ.css',
      revision: null
    },
    {
      url: 'assets/index-CB3c5rAa.css',
      revision: null
    },
    {
      url: 'assets/index-C9yRYOCt.css',
      revision: null
    },
    {
      url: 'assets/index-C7Zfesv_.css',
      revision: null
    },
    {
      url: 'assets/index-C6Tbu9wo.js',
      revision: null
    },
    {
      url: 'assets/index-C6cTYh22.js',
      revision: null
    },
    {
      url: 'assets/index-C5tybkJW.css',
      revision: null
    },
    {
      url: 'assets/index-C3TIvcPE.css',
      revision: null
    },
    {
      url: 'assets/index-C1bmc4Le.js',
      revision: null
    },
    {
      url: 'assets/index-BZzFqEcw.js',
      revision: null
    },
    {
      url: 'assets/index-BzdMumgK.css',
      revision: null
    },
    {
      url: 'assets/index-BXTjI2Ed.js',
      revision: null
    },
    {
      url: 'assets/index-BxTGOQC0.js',
      revision: null
    },
    {
      url: 'assets/index-BW1hxjdN.js',
      revision: null
    },
    {
      url: 'assets/index-BT2H7Gfg.js',
      revision: null
    },
    {
      url: 'assets/index-BqzlZizP.css',
      revision: null
    },
    {
      url: 'assets/index-BqTC0AHp.js',
      revision: null
    },
    {
      url: 'assets/index-BNETssR8.js',
      revision: null
    },
    {
      url: 'assets/index-BkwMq6dK.js',
      revision: null
    },
    {
      url: 'assets/index-BkCvqsjP.js',
      revision: null
    },
    {
      url: 'assets/index-Bj9UO_3e.js',
      revision: null
    },
    {
      url: 'assets/index-Bgn_6ehh.css',
      revision: null
    },
    {
      url: 'assets/index-BFY1tVhb.js',
      revision: null
    },
    {
      url: 'assets/index-BfpT9uxK.js',
      revision: null
    },
    {
      url: 'assets/index-BD15vHUo.css',
      revision: null
    },
    {
      url: 'assets/index-BcTH15Lf.js',
      revision: null
    },
    {
      url: 'assets/index-Bc236Lqy.js',
      revision: null
    },
    {
      url: 'assets/index-B9HkU9_d.js',
      revision: null
    },
    {
      url: 'assets/index-B6xf6GRI.css',
      revision: null
    },
    {
      url: 'assets/index-B5A-6ivw.js',
      revision: null
    },
    {
      url: 'assets/index-B4_aOzZy.js',
      revision: null
    },
    {
      url: 'assets/index-B2J-1uI5.js',
      revision: null
    },
    {
      url: 'assets/index-B1YLXuFZ.js',
      revision: null
    },
    {
      url: 'assets/index-B0geQ0Z6.css',
      revision: null
    },
    {
      url: 'assets/index-A7xc-anQ.js',
      revision: null
    },
    {
      url: 'assets/index-9K7zetcL.js',
      revision: null
    },
    {
      url: 'assets/index-7FpV4Kwp.css',
      revision: null
    },
    {
      url: 'assets/index-73nxEt04.css',
      revision: null
    },
    {
      url: 'assets/index-5oSdWi-_.css',
      revision: null
    },
    {
      url: 'assets/in-0UDEQ4S6.svg',
      revision: null
    },
    {
      url: 'assets/Image7-CvHXmpuc.svg',
      revision: null
    },
    {
      url: 'assets/Image6-6UiVc4OW.svg',
      revision: null
    },
    {
      url: 'assets/Image5-DVjTyar6.svg',
      revision: null
    },
    {
      url: 'assets/Image1-hWaG4J5t.svg',
      revision: null
    },
    {
      url: 'assets/icon9-zpNcHZRx.js',
      revision: null
    },
    {
      url: 'assets/icon9-wEfvTmwa.js',
      revision: null
    },
    {
      url: 'assets/icon84-tv-V1uJB.js',
      revision: null
    },
    {
      url: 'assets/icon84-aJyAXvcr.js',
      revision: null
    },
    {
      url: 'assets/icon83-BHG5xAJD.js',
      revision: null
    },
    {
      url: 'assets/icon82-W1tP6q5_.js',
      revision: null
    },
    {
      url: 'assets/icon81-C7IDojAl.js',
      revision: null
    },
    {
      url: 'assets/icon80-BjVOD26n.js',
      revision: null
    },
    {
      url: 'assets/icon8-TsX3ZNES.js',
      revision: null
    },
    {
      url: 'assets/icon8-Bxm0t6iz.js',
      revision: null
    },
    {
      url: 'assets/icon71-CTx7iYAr.js',
      revision: null
    },
    {
      url: 'assets/icon71-CRxR8UIR.js',
      revision: null
    },
    {
      url: 'assets/icon70-DHZ9idMN.js',
      revision: null
    },
    {
      url: 'assets/icon70-BCoIf1LQ.js',
      revision: null
    },
    {
      url: 'assets/icon7-kbk2V5jJ.js',
      revision: null
    },
    {
      url: 'assets/icon7-DzxCjVr7.js',
      revision: null
    },
    {
      url: 'assets/icon69-DTBEnPWf.js',
      revision: null
    },
    {
      url: 'assets/icon69-DDZwgEDD.js',
      revision: null
    },
    {
      url: 'assets/icon68-x8tLc8K0.js',
      revision: null
    },
    {
      url: 'assets/icon68-BEwCwJZv.js',
      revision: null
    },
    {
      url: 'assets/icon67-CKC83Nzb.js',
      revision: null
    },
    {
      url: 'assets/icon67-Bi4F3zGc.js',
      revision: null
    },
    {
      url: 'assets/icon66-qJ2hxDHv.js',
      revision: null
    },
    {
      url: 'assets/icon66-CpdheQu_.js',
      revision: null
    },
    {
      url: 'assets/icon65-CoF7sHyT.js',
      revision: null
    },
    {
      url: 'assets/icon65-BvGsh5oh.js',
      revision: null
    },
    {
      url: 'assets/icon64-CJmB8i2B.js',
      revision: null
    },
    {
      url: 'assets/icon64-B49LN_gq.js',
      revision: null
    },
    {
      url: 'assets/icon63-DRU3AcSX.js',
      revision: null
    },
    {
      url: 'assets/icon63-DfaltoJ4.js',
      revision: null
    },
    {
      url: 'assets/icon62-DqfRsNn9.js',
      revision: null
    },
    {
      url: 'assets/icon62-BX8aIcj2.js',
      revision: null
    },
    {
      url: 'assets/icon61-X7jJ_8Zo.js',
      revision: null
    },
    {
      url: 'assets/icon61-Dl6mOrxJ.js',
      revision: null
    },
    {
      url: 'assets/icon60-DaZuTc8o.js',
      revision: null
    },
    {
      url: 'assets/icon60-Cl2fGAKl.js',
      revision: null
    },
    {
      url: 'assets/icon6-wzEUCxYF.webp',
      revision: null
    },
    {
      url: 'assets/icon6-wzEUCxYF.png',
      revision: null
    },
    {
      url: 'assets/icon6-I1w0Llgr.js',
      revision: null
    },
    {
      url: 'assets/icon6-C2XnCLTx.js',
      revision: null
    },
    {
      url: 'assets/icon6-BxMycm_B.js',
      revision: null
    },
    {
      url: 'assets/icon5-D5zgkRn4.js',
      revision: null
    },
    {
      url: 'assets/icon5-CtB4v3Xe.js',
      revision: null
    },
    {
      url: 'assets/icon48-CRaiTPQL.js',
      revision: null
    },
    {
      url: 'assets/icon48-BIGf237J.js',
      revision: null
    },
    {
      url: 'assets/icon47-DURC6YP8.js',
      revision: null
    },
    {
      url: 'assets/icon47-CDBlfSwP.js',
      revision: null
    },
    {
      url: 'assets/icon46-DatcxiGD.js',
      revision: null
    },
    {
      url: 'assets/icon46-Cu-9Deyh.js',
      revision: null
    },
    {
      url: 'assets/icon45-D_XcqIv4.js',
      revision: null
    },
    {
      url: 'assets/icon45-CdEJCZmE.js',
      revision: null
    },
    {
      url: 'assets/icon44-CzkNfJ7H.js',
      revision: null
    },
    {
      url: 'assets/icon44-8yLnilK9.js',
      revision: null
    },
    {
      url: 'assets/icon43-BYG6wtRC.js',
      revision: null
    },
    {
      url: 'assets/icon43-BDbd8pZK.js',
      revision: null
    },
    {
      url: 'assets/icon42-BCsmRyGn.js',
      revision: null
    },
    {
      url: 'assets/icon42-B5Uj-byt.js',
      revision: null
    },
    {
      url: 'assets/icon41-CjRPaoD9.js',
      revision: null
    },
    {
      url: 'assets/icon41-BKK6mhsI.js',
      revision: null
    },
    {
      url: 'assets/icon4-CrU9I5h7.js',
      revision: null
    },
    {
      url: 'assets/icon4-CQxJWN0G.webp',
      revision: null
    },
    {
      url: 'assets/icon4-CQxJWN0G.png',
      revision: null
    },
    {
      url: 'assets/icon4-ChpVHtDQ.js',
      revision: null
    },
    {
      url: 'assets/icon33-D9IpdAJ4.js',
      revision: null
    },
    {
      url: 'assets/icon33-BxOR4gf9.js',
      revision: null
    },
    {
      url: 'assets/icon32-CoxHGrTl.js',
      revision: null
    },
    {
      url: 'assets/icon32-BCTBplLn.js',
      revision: null
    },
    {
      url: 'assets/icon31-CIxBcZM_.js',
      revision: null
    },
    {
      url: 'assets/icon31-B-A9Nh4J.js',
      revision: null
    },
    {
      url: 'assets/icon3-DDqslT6y.js',
      revision: null
    },
    {
      url: 'assets/icon3-CcarzaX4.webp',
      revision: null
    },
    {
      url: 'assets/icon3-CcarzaX4.png',
      revision: null
    },
    {
      url: 'assets/icon3-BTQuGwix.js',
      revision: null
    },
    {
      url: 'assets/icon2-y4w5LtgF.webp',
      revision: null
    },
    {
      url: 'assets/icon2-y4w5LtgF.png',
      revision: null
    },
    {
      url: 'assets/icon2-ByqvNA6M.js',
      revision: null
    },
    {
      url: 'assets/icon2-BdTQLUzT.js',
      revision: null
    },
    {
      url: 'assets/icon2-32qIovma.js',
      revision: null
    },
    {
      url: 'assets/icon18-CddKBfVI.js',
      revision: null
    },
    {
      url: 'assets/icon18-B5J8jBZY.js',
      revision: null
    },
    {
      url: 'assets/icon17-CSA6pQuM.js',
      revision: null
    },
    {
      url: 'assets/icon17-APDkGAAP.js',
      revision: null
    },
    {
      url: 'assets/icon16-MS2og7rF.js',
      revision: null
    },
    {
      url: 'assets/icon16-CAgI2mud.js',
      revision: null
    },
    {
      url: 'assets/icon15-DSJIvkik.js',
      revision: null
    },
    {
      url: 'assets/icon15-DmU6E84p.js',
      revision: null
    },
    {
      url: 'assets/icon14-rzX4BwSV.js',
      revision: null
    },
    {
      url: 'assets/icon14-CrEMcv0q.js',
      revision: null
    },
    {
      url: 'assets/icon13-D7RJzZy5.js',
      revision: null
    },
    {
      url: 'assets/icon13-03Lh8IWj.js',
      revision: null
    },
    {
      url: 'assets/icon12-Zfjakk5s.js',
      revision: null
    },
    {
      url: 'assets/icon12-BBLlNVP6.js',
      revision: null
    },
    {
      url: 'assets/icon11-CGiX3nsw.js',
      revision: null
    },
    {
      url: 'assets/icon11-B49C10PZ.js',
      revision: null
    },
    {
      url: 'assets/icon10-e0wXJ6X4.js',
      revision: null
    },
    {
      url: 'assets/icon10-CgJDNVXa.js',
      revision: null
    },
    {
      url: 'assets/icon1-Z0S_yM1Q.js',
      revision: null
    },
    {
      url: 'assets/icon1-DCn5kUzw.webp',
      revision: null
    },
    {
      url: 'assets/icon1-DCn5kUzw.png',
      revision: null
    },
    {
      url: 'assets/icon1-ciYwA8kU.js',
      revision: null
    },
    {
      url: 'assets/icon1-CgrAASxq.js',
      revision: null
    },
    {
      url: 'assets/icon1-B8KiUcsv.svg',
      revision: null
    },
    {
      url: 'assets/hero-spin-again-Cn5-Fs8g.webp',
      revision: null
    },
    {
      url: 'assets/hero-spin-again-Cn5-Fs8g.png',
      revision: null
    },
    {
      url: 'assets/hero-no-prize-CFI1luXj.webp',
      revision: null
    },
    {
      url: 'assets/hero-no-prize-CFI1luXj.png',
      revision: null
    },
    {
      url: 'assets/hero-cash-DnDOK0qu.webp',
      revision: null
    },
    {
      url: 'assets/hero-cash-DnDOK0qu.png',
      revision: null
    },
    {
      url: 'assets/hdj-BZ5NAsJr.svg',
      revision: null
    },
    {
      url: 'assets/guang1-DftcFKul.webp',
      revision: null
    },
    {
      url: 'assets/guang1-DftcFKul.png',
      revision: null
    },
    {
      url: 'assets/groupIcons-CIdqVo2L.webp',
      revision: null
    },
    {
      url: 'assets/groupIcons-CIdqVo2L.png',
      revision: null
    },
    {
      url: 'assets/GrouPay-Dl1FDDkO.svg',
      revision: null
    },
    {
      url: 'assets/grabPay-DeITHguh.webp',
      revision: null
    },
    {
      url: 'assets/grabPay-DeITHguh.png',
      revision: null
    },
    {
      url: 'assets/golden-egg-D9jnLnif.webp',
      revision: null
    },
    {
      url: 'assets/golden-egg-D9jnLnif.png',
      revision: null
    },
    {
      url: 'assets/gift-box-open-3Z3PWrvc.webp',
      revision: null
    },
    {
      url: 'assets/gift-box-open-3Z3PWrvc.png',
      revision: null
    },
    {
      url: 'assets/gift-box-closed-Djr6MqZE.webp',
      revision: null
    },
    {
      url: 'assets/gift-box-closed-Djr6MqZE.png',
      revision: null
    },
    {
      url: 'assets/gcash-CDe_m9wL.svg',
      revision: null
    },
    {
      url: 'assets/gCash-Cc-yJE9a.webp',
      revision: null
    },
    {
      url: 'assets/gCash-Cc-yJE9a.png',
      revision: null
    },
    {
      url: 'assets/game-mystery-box-DeIgfeLC.webp',
      revision: null
    },
    {
      url: 'assets/game-mystery-box-DeIgfeLC.png',
      revision: null
    },
    {
      url: 'assets/game-lucky-spin-BxMqWBy5.webp',
      revision: null
    },
    {
      url: 'assets/game-lucky-spin-BxMqWBy5.png',
      revision: null
    },
    {
      url: 'assets/game-lucky-red-envelope-B_GpRiae.webp',
      revision: null
    },
    {
      url: 'assets/game-lucky-red-envelope-B_GpRiae.png',
      revision: null
    },
    {
      url: 'assets/game-golden-egg-qDIzWIXG.webp',
      revision: null
    },
    {
      url: 'assets/game-golden-egg-qDIzWIXG.png',
      revision: null
    },
    {
      url: 'assets/game-cash-voucher-2JweNuiS.webp',
      revision: null
    },
    {
      url: 'assets/game-cash-voucher-2JweNuiS.png',
      revision: null
    },
    {
      url: 'assets/footer_row3_right_miami-DOHzlUGE.webp',
      revision: null
    },
    {
      url: 'assets/footer_row3_right_leicester-dDknG1vj.webp',
      revision: null
    },
    {
      url: 'assets/footer_row3_right_kwara_united-ALTH5K-P.webp',
      revision: null
    },
    {
      url: 'assets/footer_row3_right_jason_derulo-CceLfnqN.webp',
      revision: null
    },
    {
      url: 'assets/footer_row3_left_responsible_gambling-m-J995xU.webp',
      revision: null
    },
    {
      url: 'assets/footer_row3_left_betblocker-DP8K3-S0.webp',
      revision: null
    },
    {
      url: 'assets/footer_4_2-DyPNgwda.webp',
      revision: null
    },
    {
      url: 'assets/footer_4_2-DyPNgwda.png',
      revision: null
    },
    {
      url: 'assets/float-history-CYbTKfJD.webp',
      revision: null
    },
    {
      url: 'assets/float-history-CYbTKfJD.png',
      revision: null
    },
    {
      url: 'assets/float-betslip-s8UzUqLG.webp',
      revision: null
    },
    {
      url: 'assets/float-betslip-s8UzUqLG.png',
      revision: null
    },
    {
      url: 'assets/fishing-ByDZ0uTA.webp',
      revision: null
    },
    {
      url: 'assets/fishing-ByDZ0uTA.png',
      revision: null
    },
    {
      url: 'assets/FilterPopup-QtRHmhFb.css',
      revision: null
    },
    {
      url: 'assets/FilterPopup-CQIQui9S.js',
      revision: null
    },
    {
      url: 'assets/faguang-CS_v4in4.webp',
      revision: null
    },
    {
      url: 'assets/faguang-CS_v4in4.png',
      revision: null
    },
    {
      url: 'assets/explain-BtVGfwpb.js',
      revision: null
    },
    {
      url: 'assets/eventList-CcHXrXGU.js',
      revision: null
    },
    {
      url: 'assets/eventList-BBxS184V.css',
      revision: null
    },
    {
      url: 'assets/ETH.black-DftHmS42.svg',
      revision: null
    },
    {
      url: 'assets/ETH-dU8ayL--.webp',
      revision: null
    },
    {
      url: 'assets/ETH-dU8ayL--.png',
      revision: null
    },
    {
      url: 'assets/Ellipse-BnutC5YD.webp',
      revision: null
    },
    {
      url: 'assets/Ellipse-BnutC5YD.png',
      revision: null
    },
    {
      url: 'assets/egg-C872Xrm-.webp',
      revision: null
    },
    {
      url: 'assets/egg-C872Xrm-.png',
      revision: null
    },
    {
      url: 'assets/drop_down _selection-xaJcSTCu.js',
      revision: null
    },
    {
      url: 'assets/DOGE.black-CQ_RHi8K.svg',
      revision: null
    },
    {
      url: 'assets/dl-B_NdsS2o.svg',
      revision: null
    },
    {
      url: 'assets/details-SyQWe5GK.js',
      revision: null
    },
    {
      url: 'assets/details-B-61zsG6.css',
      revision: null
    },
    {
      url: 'assets/DesktopPagination.vue_vue_type_script_setup_true_lang-5L7iRFmU.js',
      revision: null
    },
    {
      url: 'assets/default_white-qmafT9Fi.webp',
      revision: null
    },
    {
      url: 'assets/default_white-qmafT9Fi.png',
      revision: null
    },
    {
      url: 'assets/default-U9cx0iq7.webp',
      revision: null
    },
    {
      url: 'assets/default-U9cx0iq7.png',
      revision: null
    },
    {
      url: 'assets/d-99-NFJF9gM_-DQPGTve0.webp',
      revision: null
    },
    {
      url: 'assets/d-99-NFJF9gM_-DQPGTve0.png',
      revision: null
    },
    {
      url: 'assets/d-98-DA42CT6W-BDrSRZjB.webp',
      revision: null
    },
    {
      url: 'assets/d-98-DA42CT6W-BDrSRZjB.png',
      revision: null
    },
    {
      url: 'assets/d-97-qal8av7f-C28nVr8O.webp',
      revision: null
    },
    {
      url: 'assets/d-97-qal8av7f-C28nVr8O.png',
      revision: null
    },
    {
      url: 'assets/d-96-pZM7QuMr-CIgeJN0h.webp',
      revision: null
    },
    {
      url: 'assets/d-96-pZM7QuMr-CIgeJN0h.png',
      revision: null
    },
    {
      url: 'assets/d-95-CMQSGT4N-CSN01sc4.webp',
      revision: null
    },
    {
      url: 'assets/d-95-CMQSGT4N-CSN01sc4.png',
      revision: null
    },
    {
      url: 'assets/d-94-BjjhhHHh-Ld86-oyj.webp',
      revision: null
    },
    {
      url: 'assets/d-94-BjjhhHHh-Ld86-oyj.png',
      revision: null
    },
    {
      url: 'assets/d-93-0pkDEp9Z-B_jhpOlq.webp',
      revision: null
    },
    {
      url: 'assets/d-93-0pkDEp9Z-B_jhpOlq.png',
      revision: null
    },
    {
      url: 'assets/d-92-DCx7K2V3-cF2sQUqI.webp',
      revision: null
    },
    {
      url: 'assets/d-92-DCx7K2V3-cF2sQUqI.png',
      revision: null
    },
    {
      url: 'assets/CustomSelect-ClCzibSI.js',
      revision: null
    },
    {
      url: 'assets/CustomSelect-C2ytjIp6.css',
      revision: null
    },
    {
      url: 'assets/customer-service-luna-DguCxFTr.webp',
      revision: null
    },
    {
      url: 'assets/commonFooter.vue_vue_type_script_setup_true_lang-CmboTKya.js',
      revision: null
    },
    {
      url: 'assets/combination-B85zKB62.webp',
      revision: null
    },
    {
      url: 'assets/combination-B85zKB62.png',
      revision: null
    },
    {
      url: 'assets/claim_popup_hero-CQmU8GWq.webp',
      revision: null
    },
    {
      url: 'assets/claim_popup_hero-CQmU8GWq.png',
      revision: null
    },
    {
      url: 'assets/chuizi.-DMVgwDPJ.webp',
      revision: null
    },
    {
      url: 'assets/chuizi.-DMVgwDPJ.png',
      revision: null
    },
    {
      url: 'assets/casinoPageConfig-DZzSEXSA.js',
      revision: null
    },
    {
      url: 'assets/casinoGameModule.vue_vue_type_script_setup_true_lang--xVXzehN.js',
      revision: null
    },
    {
      url: 'assets/casinoGameModule-EjBIuXs1.css',
      revision: null
    },
    {
      url: 'assets/casinoGameCard.vue_vue_type_script_setup_true_lang-BCkdbEQ9.js',
      revision: null
    },
    {
      url: 'assets/casino-DMS44B2S.webp',
      revision: null
    },
    {
      url: 'assets/casino-DMS44B2S.png',
      revision: null
    },
    {
      url: 'assets/cash-CHYNZRJJ.webp',
      revision: null
    },
    {
      url: 'assets/cash-CHYNZRJJ.png',
      revision: null
    },
    {
      url: 'assets/BTC.black-CDXkj__K.svg',
      revision: null
    },
    {
      url: 'assets/BTC-DXxIWAU9.webp',
      revision: null
    },
    {
      url: 'assets/BTC-DXxIWAU9.png',
      revision: null
    },
    {
      url: 'assets/border_none-Dd0myMMA.webp',
      revision: null
    },
    {
      url: 'assets/border_none-Dd0myMMA.png',
      revision: null
    },
    {
      url: 'assets/border_5-DSvxBkhH.webp',
      revision: null
    },
    {
      url: 'assets/border_5-DSvxBkhH.png',
      revision: null
    },
    {
      url: 'assets/border_4-DPPi4c0B.webp',
      revision: null
    },
    {
      url: 'assets/border_4-DPPi4c0B.png',
      revision: null
    },
    {
      url: 'assets/border_3-DuXhqY0I.webp',
      revision: null
    },
    {
      url: 'assets/border_3-DuXhqY0I.png',
      revision: null
    },
    {
      url: 'assets/border_2-GrjkYlQd.webp',
      revision: null
    },
    {
      url: 'assets/border_2-GrjkYlQd.png',
      revision: null
    },
    {
      url: 'assets/border_1-CQIsATls.webp',
      revision: null
    },
    {
      url: 'assets/border_1-CQIsATls.png',
      revision: null
    },
    {
      url: 'assets/BNB.black-CY--mZyI.svg',
      revision: null
    },
    {
      url: 'assets/BNB-yu9uAFsr.webp',
      revision: null
    },
    {
      url: 'assets/BNB-yu9uAFsr.png',
      revision: null
    },
    {
      url: 'assets/blind-box-az1_6RU9.webp',
      revision: null
    },
    {
      url: 'assets/blind-box-az1_6RU9.png',
      revision: null
    },
    {
      url: 'assets/bind-phone-tip-pc-DLFb3Otk.webp',
      revision: null
    },
    {
      url: 'assets/bind-phone-tip-pc-DLFb3Otk.png',
      revision: null
    },
    {
      url: 'assets/bg-layer-3-34b3a2-CsWSVFAj.webp',
      revision: null
    },
    {
      url: 'assets/bg-layer-3-34b3a2-CsWSVFAj.png',
      revision: null
    },
    {
      url: 'assets/bg-layer-2-jky7cRvH.webp',
      revision: null
    },
    {
      url: 'assets/bg-layer-2-jky7cRvH.png',
      revision: null
    },
    {
      url: 'assets/bg-layer-1-BF2KhqQy.webp',
      revision: null
    },
    {
      url: 'assets/bg-layer-1-BF2KhqQy.png',
      revision: null
    },
    {
      url: 'assets/bet-dwdFpk72.webp',
      revision: null
    },
    {
      url: 'assets/bet-dwdFpk72.png',
      revision: null
    },
    {
      url: 'assets/bet-Dm0nQtb1.js',
      revision: null
    },
    {
      url: 'assets/base-Kl_skktx.webp',
      revision: null
    },
    {
      url: 'assets/base-Kl_skktx.png',
      revision: null
    },
    {
      url: 'assets/baozhag-CI2d4luK.webp',
      revision: null
    },
    {
      url: 'assets/baozhag-CI2d4luK.png',
      revision: null
    },
    {
      url: 'assets/balance-BheRdQxB.webp',
      revision: null
    },
    {
      url: 'assets/balance-BheRdQxB.png',
      revision: null
    },
    {
      url: 'assets/avatar-CkCXMSE9.webp',
      revision: null
    },
    {
      url: 'assets/avatar-CkCXMSE9.png',
      revision: null
    },
    {
      url: 'assets/arrow_right2-BJjvJyaO.js',
      revision: null
    },
    {
      url: 'assets/app_download_bot-DQWPb9jI.webp',
      revision: null
    },
    {
      url: 'assets/app_download_BG_2-DJK33xvU.webp',
      revision: null
    },
    {
      url: 'assets/app_download_BG_1_h5-CPp8gDjh.webp',
      revision: null
    },
    {
      url: 'assets/app_download_BG_1-BF5Nh0hw.webp',
      revision: null
    },
    {
      url: 'assets/app_download_6-H3kBYVsY.webp',
      revision: null
    },
    {
      url: 'assets/app_download_5-CUNwyICo.webp',
      revision: null
    },
    {
      url: 'assets/app_download_4-CzyF_D77.webp',
      revision: null
    },
    {
      url: 'assets/app_download_3-CCJud6Vo.webp',
      revision: null
    },
    {
      url: 'assets/app_download_2-Bw16tEfy.webp',
      revision: null
    },
    {
      url: 'assets/all_view_light-rcGKJ2KA.webp',
      revision: null
    },
    {
      url: 'assets/all_view_light-rcGKJ2KA.png',
      revision: null
    },
    {
      url: 'assets/all_view_light-P6rTf2EZ.js',
      revision: null
    },
    {
      url: 'assets/all_view_dark-Cv7xBys1.webp',
      revision: null
    },
    {
      url: 'assets/all_view_dark-Cv7xBys1.png',
      revision: null
    },
    {
      url: 'assets/ADA.black-BGPISvnB.svg',
      revision: null
    },
    {
      url: 'assets/activity-chest-open-BWYzOpRB.webp',
      revision: null
    },
    {
      url: 'assets/activity-chest-open-BWYzOpRB.png',
      revision: null
    },
    {
      url: 'assets/activity-chest-locked-BeC3f4Fj.webp',
      revision: null
    },
    {
      url: 'assets/activity-chest-locked-BeC3f4Fj.png',
      revision: null
    },
    {
      url: 'assets/accountCard.vue_vue_type_script_setup_true_lang-CpnoU8de.js',
      revision: null
    },
    {
      url: 'assets/accountCard-BKOw1l3u.css',
      revision: null
    },
    {
      url: 'assets/9-Bztq4ROc.svg',
      revision: null
    },
    {
      url: 'assets/8-xAfNcD9e.svg',
      revision: null
    },
    {
      url: 'assets/7-3Xyc1EVc.svg',
      revision: null
    },
    {
      url: 'assets/6-DwfmLUVe.svg',
      revision: null
    },
    {
      url: 'mask-icon.svg',
      revision: '61c10f66303615377013f04a337f6239'
    },
    {
      url: 'manifest.webmanifest',
      revision: '4f87d8e7ea28db9655709427fb769852'
    }
  ],
  {}
)
workbox_precaching_cleanupOutdatedCaches()
workbox_routing_registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox_strategies_NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 3,
    plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 86400 })]
  }),
  'GET'
)
workbox_routing_registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new workbox_strategies_CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new workbox_expiration_ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536000 }),
      new workbox_cacheable_response_CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  }),
  'GET'
)
workbox_routing_registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new workbox_strategies_CacheFirst({
    cacheName: 'gstatic-fonts-cache',
    plugins: [
      new workbox_expiration_ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536000 }),
      new workbox_cacheable_response_CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  }),
  'GET'
)
workbox_routing_registerRoute(
  /\/api\/.*/i,
  new workbox_strategies_NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new workbox_expiration_ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 300 }),
      new workbox_cacheable_response_CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  }),
  'GET'
)
