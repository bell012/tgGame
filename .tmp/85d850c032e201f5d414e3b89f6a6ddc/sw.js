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
      url: 'assets/yongjin 1-FufibQNn.js',
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
      url: 'assets/useRequireLoginAction-Bs74Wb5T.js',
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
      url: 'assets/transaction_dec-C_dHwwbx.js',
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
      url: 'assets/SportsBuyBackSheet.vue_vue_type_script_setup_true_lang-CXHwVfps.js',
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
      url: 'assets/sport-items-0m5vpQoK.js',
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
      url: 'assets/shared-X_sT8Inc.js',
      revision: null
    },
    {
      url: 'assets/shared-JY8idaQl.js',
      revision: null
    },
    {
      url: 'assets/shared-Diqg7sGm.js',
      revision: null
    },
    {
      url: 'assets/shared-CoAuqdmc.js',
      revision: null
    },
    {
      url: 'assets/shared-Bpzd2ouk.js',
      revision: null
    },
    {
      url: 'assets/set-q74s5zL8.css',
      revision: null
    },
    {
      url: 'assets/set-BcX3f6pa.js',
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
      url: 'assets/RebateRecordsContent-CcaeILOm.js',
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
      url: 'assets/popShell-ZMQD-MNS.js',
      revision: null
    },
    {
      url: 'assets/popShell-DGzl4RdQ.css',
      revision: null
    },
    {
      url: 'assets/pc-layout.vue_vue_type_script_setup_true_lang-DASfeciL.js',
      revision: null
    },
    {
      url: 'assets/pc-layout.vue_vue_type_script_setup_true_lang-ceBB1Gc6.js',
      revision: null
    },
    {
      url: 'assets/pc-layout.vue_vue_type_script_setup_true_lang-Bj3LzuOj.js',
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
      url: 'assets/pageStyle4.vue_vue_type_script_setup_true_lang-DAXYuh_T.js',
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
      url: 'assets/pageStyle2-CgsoUOR0.js',
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
      url: 'assets/newEvent-CMjTdktI.js',
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
      url: 'assets/mobile-DfFjzLdi.js',
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
      url: 'assets/layout.vue_vue_type_script_setup_true_lang-Btsy0GX1.js',
      revision: null
    },
    {
      url: 'assets/layout-DrAfByQ4.css',
      revision: null
    },
    {
      url: 'assets/latestBetTable.vue_vue_type_script_setup_true_lang-CjvJ6dt1.js',
      revision: null
    },
    {
      url: 'assets/kefu-CJgwXT4U.js',
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
      url: 'assets/InvitePosterPopup.vue_vue_type_script_setup_true_lang-BZCe-cCR.js',
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
      url: 'assets/index.vue_vue_type_script_setup_true_lang-BvBKYEmx.js',
      revision: null
    },
    {
      url: 'assets/index.vue_vue_type_script_setup_true_lang-BstXCHNn.js',
      revision: null
    },
    {
      url: 'assets/index-xpzA4e0q.js',
      revision: null
    },
    {
      url: 'assets/index-vWevtItc.css',
      revision: null
    },
    {
      url: 'assets/index-Vf0pqR5O.js',
      revision: null
    },
    {
      url: 'assets/index-QdTkQYlf.css',
      revision: null
    },
    {
      url: 'assets/index-N2ymOdRM.js',
      revision: null
    },
    {
      url: 'assets/index-Ma2vzK37.js',
      revision: null
    },
    {
      url: 'assets/index-KyxuuSo5.js',
      revision: null
    },
    {
      url: 'assets/index-HRztYcHn.css',
      revision: null
    },
    {
      url: 'assets/index-ftV0ka6G.js',
      revision: null
    },
    {
      url: 'assets/index-fmyir7RP.js',
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
      url: 'assets/index-EkHeSDe2.js',
      revision: null
    },
    {
      url: 'assets/index-eFtze6Ne.css',
      revision: null
    },
    {
      url: 'assets/index-D_SX7dmC.js',
      revision: null
    },
    {
      url: 'assets/index-Dz45MfBa.css',
      revision: null
    },
    {
      url: 'assets/index-DWTHY7OG.js',
      revision: null
    },
    {
      url: 'assets/index-DvyVQxlR.js',
      revision: null
    },
    {
      url: 'assets/index-DRDXig09.js',
      revision: null
    },
    {
      url: 'assets/index-DMQ_jSvC.css',
      revision: null
    },
    {
      url: 'assets/index-DiLzFQjD.js',
      revision: null
    },
    {
      url: 'assets/index-DhzCLEB6.js',
      revision: null
    },
    {
      url: 'assets/index-Dhf13eve.js',
      revision: null
    },
    {
      url: 'assets/index-DhaAYg25.js',
      revision: null
    },
    {
      url: 'assets/index-DER1EGvq.js',
      revision: null
    },
    {
      url: 'assets/index-DCXmSFgZ.css',
      revision: null
    },
    {
      url: 'assets/index-DAZixvWQ.js',
      revision: null
    },
    {
      url: 'assets/index-D9WRqxyz.css',
      revision: null
    },
    {
      url: 'assets/index-D55PvVj-.js',
      revision: null
    },
    {
      url: 'assets/index-D4YVZYBA.css',
      revision: null
    },
    {
      url: 'assets/index-D4aWwSi6.js',
      revision: null
    },
    {
      url: 'assets/index-D3MyHek5.js',
      revision: null
    },
    {
      url: 'assets/index-D1MVFntU.js',
      revision: null
    },
    {
      url: 'assets/index-D0YO67TW.css',
      revision: null
    },
    {
      url: 'assets/index-CYtcNaCU.js',
      revision: null
    },
    {
      url: 'assets/index-CyeDBjB-.css',
      revision: null
    },
    {
      url: 'assets/index-CyabtPKw.js',
      revision: null
    },
    {
      url: 'assets/index-CXXhfrpn.js',
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
      url: 'assets/index-CXrQzMmq.js',
      revision: null
    },
    {
      url: 'assets/index-CXKPHEdm.js',
      revision: null
    },
    {
      url: 'assets/index-CWlOapT4.css',
      revision: null
    },
    {
      url: 'assets/index-CuqdzXOL.js',
      revision: null
    },
    {
      url: 'assets/index-CtT4rej_.js',
      revision: null
    },
    {
      url: 'assets/index-CTDlq18V.css',
      revision: null
    },
    {
      url: 'assets/index-CsSropEh.js',
      revision: null
    },
    {
      url: 'assets/index-Cr2-mMHX.js',
      revision: null
    },
    {
      url: 'assets/index-Cr1sECbO.css',
      revision: null
    },
    {
      url: 'assets/index-CpsVNIhs.css',
      revision: null
    },
    {
      url: 'assets/index-CllEvmQ6.css',
      revision: null
    },
    {
      url: 'assets/index-CL2SlvI7.js',
      revision: null
    },
    {
      url: 'assets/index-CF-yakY-.js',
      revision: null
    },
    {
      url: 'assets/index-CElRZTQ9.js',
      revision: null
    },
    {
      url: 'assets/index-CCnq-XEP.js',
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
      url: 'assets/index-CaJ7hS3a.js',
      revision: null
    },
    {
      url: 'assets/index-Ca8dpGtk.js',
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
      url: 'assets/index-C5tybkJW.css',
      revision: null
    },
    {
      url: 'assets/index-C4aqJN1E.js',
      revision: null
    },
    {
      url: 'assets/index-C3Uiprzw.js',
      revision: null
    },
    {
      url: 'assets/index-C3TIvcPE.css',
      revision: null
    },
    {
      url: 'assets/index-BzdMumgK.css',
      revision: null
    },
    {
      url: 'assets/index-BxDlk9zO.js',
      revision: null
    },
    {
      url: 'assets/index-BV52AvRg.js',
      revision: null
    },
    {
      url: 'assets/index-BsZbB0fU.js',
      revision: null
    },
    {
      url: 'assets/index-BrA9TKpi.js',
      revision: null
    },
    {
      url: 'assets/index-BqzlZizP.css',
      revision: null
    },
    {
      url: 'assets/index-BQhKuLFo.js',
      revision: null
    },
    {
      url: 'assets/index-BOtOYPH-.js',
      revision: null
    },
    {
      url: 'assets/index-Bo-0xRfD.js',
      revision: null
    },
    {
      url: 'assets/index-BNQSi4eA.js',
      revision: null
    },
    {
      url: 'assets/index-Bncbcu7f.js',
      revision: null
    },
    {
      url: 'assets/index-BLV4sGGl.css',
      revision: null
    },
    {
      url: 'assets/index-BljVJItR.css',
      revision: null
    },
    {
      url: 'assets/index-BLDasErI.js',
      revision: null
    },
    {
      url: 'assets/index-Bgn_6ehh.css',
      revision: null
    },
    {
      url: 'assets/index-Bdd0aA1V.js',
      revision: null
    },
    {
      url: 'assets/index-BD15vHUo.css',
      revision: null
    },
    {
      url: 'assets/index-BBAlC6iM.js',
      revision: null
    },
    {
      url: 'assets/index-B6xf6GRI.css',
      revision: null
    },
    {
      url: 'assets/index-B1Myz1PT.js',
      revision: null
    },
    {
      url: 'assets/index-B0geQ0Z6.css',
      revision: null
    },
    {
      url: 'assets/index-AEx005Bh.js',
      revision: null
    },
    {
      url: 'assets/index-a3UOjgNp.js',
      revision: null
    },
    {
      url: 'assets/index-8yyNiPny.js',
      revision: null
    },
    {
      url: 'assets/index-8WaHpLwP.js',
      revision: null
    },
    {
      url: 'assets/index-7FpV4Kwp.css',
      revision: null
    },
    {
      url: 'assets/index-5oSdWi-_.css',
      revision: null
    },
    {
      url: 'assets/index-1YCsXH-j.js',
      revision: null
    },
    {
      url: 'assets/index-1m3Z0lnd.js',
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
      url: 'assets/icon9-ClG6IBW1.js',
      revision: null
    },
    {
      url: 'assets/icon9-CDNJSD5D.js',
      revision: null
    },
    {
      url: 'assets/icon84-B_E2akbc.js',
      revision: null
    },
    {
      url: 'assets/icon84-B35di-bO.js',
      revision: null
    },
    {
      url: 'assets/icon83-BcC3NK8I.js',
      revision: null
    },
    {
      url: 'assets/icon82-CocAguXG.js',
      revision: null
    },
    {
      url: 'assets/icon81-B3yPuRUm.js',
      revision: null
    },
    {
      url: 'assets/icon80-BamxXAT4.js',
      revision: null
    },
    {
      url: 'assets/icon8-DseqFeTm.js',
      revision: null
    },
    {
      url: 'assets/icon8-BvTRC5uD.js',
      revision: null
    },
    {
      url: 'assets/icon71-tEuww7oy.js',
      revision: null
    },
    {
      url: 'assets/icon71-CwALbzsK.js',
      revision: null
    },
    {
      url: 'assets/icon70-tLHZT5G_.js',
      revision: null
    },
    {
      url: 'assets/icon70-DpgJzK9r.js',
      revision: null
    },
    {
      url: 'assets/icon7-DetOtxdr.js',
      revision: null
    },
    {
      url: 'assets/icon7-CxjDyb0T.js',
      revision: null
    },
    {
      url: 'assets/icon69-CkOaVuVb.js',
      revision: null
    },
    {
      url: 'assets/icon69-CcIYW-sp.js',
      revision: null
    },
    {
      url: 'assets/icon68-Nl9hEg7S.js',
      revision: null
    },
    {
      url: 'assets/icon68-CjqobKp-.js',
      revision: null
    },
    {
      url: 'assets/icon67-DTebGcV_.js',
      revision: null
    },
    {
      url: 'assets/icon67-BPteZKPG.js',
      revision: null
    },
    {
      url: 'assets/icon66-DBRa06ik.js',
      revision: null
    },
    {
      url: 'assets/icon66-C2WX3g-G.js',
      revision: null
    },
    {
      url: 'assets/icon65-C0jquqyu.js',
      revision: null
    },
    {
      url: 'assets/icon65-BUxtDxvU.js',
      revision: null
    },
    {
      url: 'assets/icon64-v1BtUXrc.js',
      revision: null
    },
    {
      url: 'assets/icon64-CDvsYxaZ.js',
      revision: null
    },
    {
      url: 'assets/icon63-DT21SUTj.js',
      revision: null
    },
    {
      url: 'assets/icon63-BAO9PUqx.js',
      revision: null
    },
    {
      url: 'assets/icon62-Cc38uD_1.js',
      revision: null
    },
    {
      url: 'assets/icon62-C1XfoFPA.js',
      revision: null
    },
    {
      url: 'assets/icon61-ChBmvIdU.js',
      revision: null
    },
    {
      url: 'assets/icon61-BmJqRBM7.js',
      revision: null
    },
    {
      url: 'assets/icon60-DEKps95w.js',
      revision: null
    },
    {
      url: 'assets/icon60-Ccup4NL0.js',
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
      url: 'assets/icon6-JzZADfkQ.js',
      revision: null
    },
    {
      url: 'assets/icon6-DOH25nMz.js',
      revision: null
    },
    {
      url: 'assets/icon6-DCUHUxQZ.js',
      revision: null
    },
    {
      url: 'assets/icon5-D2ULoEL3.js',
      revision: null
    },
    {
      url: 'assets/icon5-CnE0HEn7.js',
      revision: null
    },
    {
      url: 'assets/icon48-DF3UaIdo.js',
      revision: null
    },
    {
      url: 'assets/icon48-BUIiPW8J.js',
      revision: null
    },
    {
      url: 'assets/icon47-DaqVZRXp.js',
      revision: null
    },
    {
      url: 'assets/icon47-DaNJX0WL.js',
      revision: null
    },
    {
      url: 'assets/icon46-DQVEQMaL.js',
      revision: null
    },
    {
      url: 'assets/icon46-4FjOZJ8i.js',
      revision: null
    },
    {
      url: 'assets/icon45-BInDsWAd.js',
      revision: null
    },
    {
      url: 'assets/icon45-7ua_G11L.js',
      revision: null
    },
    {
      url: 'assets/icon44-Duc6M0Ht.js',
      revision: null
    },
    {
      url: 'assets/icon44-DQwO2shG.js',
      revision: null
    },
    {
      url: 'assets/icon43-zFuHtuK9.js',
      revision: null
    },
    {
      url: 'assets/icon43-CqvD7Zyh.js',
      revision: null
    },
    {
      url: 'assets/icon42-BQxkszCN.js',
      revision: null
    },
    {
      url: 'assets/icon42-B95rJd2v.js',
      revision: null
    },
    {
      url: 'assets/icon41-CXcjvMCQ.js',
      revision: null
    },
    {
      url: 'assets/icon41-CmuE_3K3.js',
      revision: null
    },
    {
      url: 'assets/icon4-DtQntNmM.js',
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
      url: 'assets/icon4-Anena3ej.js',
      revision: null
    },
    {
      url: 'assets/icon33-D5AuMAFe.js',
      revision: null
    },
    {
      url: 'assets/icon33-Bic0u4df.js',
      revision: null
    },
    {
      url: 'assets/icon32-D6lM9Jyt.js',
      revision: null
    },
    {
      url: 'assets/icon32-D40SHSq7.js',
      revision: null
    },
    {
      url: 'assets/icon31-DrxF9o4-.js',
      revision: null
    },
    {
      url: 'assets/icon31-BPaEqhYZ.js',
      revision: null
    },
    {
      url: 'assets/icon3-XJRCc8Gh.js',
      revision: null
    },
    {
      url: 'assets/icon3-taBXoAlL.js',
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
      url: 'assets/icon2-y4w5LtgF.webp',
      revision: null
    },
    {
      url: 'assets/icon2-y4w5LtgF.png',
      revision: null
    },
    {
      url: 'assets/icon2-CkZSbHdD.js',
      revision: null
    },
    {
      url: 'assets/icon2-Ci_-JTma.js',
      revision: null
    },
    {
      url: 'assets/icon2-BxifGjHf.js',
      revision: null
    },
    {
      url: 'assets/icon18-Dx6VAIS_.js',
      revision: null
    },
    {
      url: 'assets/icon18-CBtmP59I.js',
      revision: null
    },
    {
      url: 'assets/icon17-DRaK15ND.js',
      revision: null
    },
    {
      url: 'assets/icon17-DlFAIkw2.js',
      revision: null
    },
    {
      url: 'assets/icon16-C2wCcNe1.js',
      revision: null
    },
    {
      url: 'assets/icon16-BqmgjJ2m.js',
      revision: null
    },
    {
      url: 'assets/icon15-C08SIvLd.js',
      revision: null
    },
    {
      url: 'assets/icon15-BIaF4dXZ.js',
      revision: null
    },
    {
      url: 'assets/icon14-wmqRG-CF.js',
      revision: null
    },
    {
      url: 'assets/icon14-DZG4Zy3u.js',
      revision: null
    },
    {
      url: 'assets/icon13-Bqd0M273.js',
      revision: null
    },
    {
      url: 'assets/icon13-BmevfCNL.js',
      revision: null
    },
    {
      url: 'assets/icon12-DgwMttU6.js',
      revision: null
    },
    {
      url: 'assets/icon12-BJteHpOo.js',
      revision: null
    },
    {
      url: 'assets/icon11-tDnZUS1H.js',
      revision: null
    },
    {
      url: 'assets/icon11-CcoZ8yZn.js',
      revision: null
    },
    {
      url: 'assets/icon10-Dti6dDT9.js',
      revision: null
    },
    {
      url: 'assets/icon10-CfZu3N6a.js',
      revision: null
    },
    {
      url: 'assets/icon1-PATfkIJ9.js',
      revision: null
    },
    {
      url: 'assets/icon1-DRrPZ751.js',
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
      url: 'assets/icon1-C9xVvBV4.js',
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
      url: 'assets/FilterPopup-DsVGWoE0.js',
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
      url: 'assets/explain-D6plxO-L.js',
      revision: null
    },
    {
      url: 'assets/eventList-Bn7EF7i0.js',
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
      url: 'assets/drop_down _selection-BqJACWzx.js',
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
      url: 'assets/details-D_iDy1An.js',
      revision: null
    },
    {
      url: 'assets/details-B-61zsG6.css',
      revision: null
    },
    {
      url: 'assets/DesktopPagination.vue_vue_type_script_setup_true_lang-BlO2dMqA.js',
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
      url: 'assets/CustomSelect-C_lnonrQ.js',
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
      url: 'assets/commonFooter.vue_vue_type_script_setup_true_lang-CTY3pe42.js',
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
      url: 'assets/casinoGameModule.vue_vue_type_script_setup_true_lang-B5SEA_iu.js',
      revision: null
    },
    {
      url: 'assets/casinoGameModule-EjBIuXs1.css',
      revision: null
    },
    {
      url: 'assets/casinoGameCard.vue_vue_type_script_setup_true_lang-Dxa3oR_S.js',
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
      url: 'assets/arrow_right2-DFMCgzac.js',
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
      url: 'assets/accountCard.vue_vue_type_script_setup_true_lang-B7C-t15F.js',
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
