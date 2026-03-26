<template>
  <div
    class="relative w-full max-w-[480px] h-full sm:max-h-[684px] rounded-xl modal-container bg-bg-2"
    :class="{
      'sm:max-h-[684px]': confirmUploadStatus === 'not_started' && orderInfo.type === 'Crypto',
      'sm:max-h-[679px]': confirmUploadStatus === 'in_progress' && orderInfo.type === 'Crypto',
      'sm:max-h-[562px]': confirmUploadStatus === 'completed' && orderInfo.type === 'Crypto',
      'sm:max-h-[491px]': orderInfo.type === 'Fiat'
    }"
  >
    <div class="flex items-center justify-between h-14">
      <h2 class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-1">
        {{ t('deposit.deposit_order') }}
      </h2>
      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 w-6 h-6 bg-opacity-10 rounded-md flex items-center justify-center z-10"
        @click="handleClose"
      >
        <CloseIcon class="w-4 h-4 fill-none" />
      </button>
    </div>
    <template v-if="orderInfo.type === 'Crypto'">
      <div
        v-show="confirmUploadStatus === 'not_started'"
        class="w-full h-full flex-1 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[628px]"
      >
        <div ref="targetRef" class="w-full bg-bg-2 rounded-lg relative">
          <div class="flex items-center p-3 border-b border-[var(--color-input-level-1)]">
            <div class="w-5 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 0C15.5228 0 20 4.47715 20 10C20 10.7096 19.9247 11.4016 19.7842 12.0693H17.7285C17.9048 11.4092 18 10.7157 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C10.7158 18 11.4091 17.9039 12.0693 17.7275V19.7842C11.4016 19.9247 10.7096 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0ZM17.2969 13.1094C18.887 13.2259 19.7255 15.111 18.6846 16.375L18.5381 16.5518L18.6846 16.7285C19.7254 17.9925 18.887 19.8777 17.2969 19.9941L17.1406 20H15.9619L15.8057 19.9941C14.2669 19.8813 13.4322 18.1121 14.3232 16.8525L14.418 16.7285L14.5635 16.5518L14.418 16.375L14.3232 16.251C13.4319 14.9914 14.2668 13.2222 15.8057 13.1094L15.9619 13.1035H17.1406L17.2969 13.1094ZM16.9375 16.9658C16.7375 16.7233 16.365 16.7233 16.165 16.9658L15.5752 17.6816C15.307 18.0078 15.5397 18.4998 15.9619 18.5H17.1406C17.5632 18.5 17.7949 18.0078 17.5264 17.6816L16.9375 16.9658ZM15.9619 14.6035C15.5396 14.6037 15.3067 15.0958 15.5752 15.4219L16.165 16.1377C16.271 16.2664 16.4256 16.3241 16.5771 16.3164L16.2861 16.5342L16.8799 16.416L16.7695 16.2686C16.832 16.2383 16.8899 16.1954 16.9375 16.1377L17.5264 15.4219C17.795 15.0957 17.5632 14.6035 17.1406 14.6035H15.9619ZM10.6484 6.18457C11.6898 6.20885 12.3997 6.38517 12.9521 6.5752L12.4785 7.9082C12.0835 7.76569 11.3418 7.4942 10.2061 7.49414C9.18181 7.49414 8.84879 7.83657 8.84863 8.16699C8.84863 8.54392 9.40182 8.80538 10.7588 9.16992C12.6355 9.66613 13.3771 10.3147 13.3779 11.3896C13.3779 12.4394 12.3996 13.3364 10.5869 13.5605V14.7764H9.02344V13.6553C7.96547 13.6202 6.9406 13.3958 6.34082 13.1475L6.81348 11.7666C7.47612 12.0377 8.40741 12.2861 9.43359 12.2861C10.3491 12.2861 10.9635 12.0155 10.9639 11.5557C10.9639 11.1074 10.4577 10.8227 9.27441 10.5273C7.58736 10.1024 6.43555 9.513 6.43555 8.36816C6.43581 7.31854 7.41305 6.50355 9.10059 6.26758V5.14648H10.6484V6.18457Z"
                  fill="white"
                />
              </svg>
            </div>
            <div class="flex items-center justify-between">
              <p>Please pay within</p>
              <div class="mx-1">
                <CountDown :time="countdownTime">
                  <template #default="timeData">
                    <span class="led-font text-secondary-7 text-[33px] font-bold leading-none">{{
                      timeData.minutes
                    }}</span>
                    <span class="led-font text-secondary-7 text-[33px] font-bold leading-none"
                      >:</span
                    >
                    <span class="led-font text-secondary-7 text-[33px] font-bold leading-none">{{
                      timeData.seconds
                    }}</span>
                  </template>
                </CountDown>
              </div>
              <p>and upload proof</p>
            </div>
          </div>
          <div class="pt-3 flex items-end justify-center">
            <p class="text-text-1 text-[40px] font-bold leading-none capitalize">
              {{ orderInfo.amount }}
            </p>
            <p class="text-text-1 text-lg font-bold leading-none capitalize">
              {{ orderInfo.method }}
            </p>
          </div>
          <div
            v-if="'rate' in orderInfo"
            class="pt-1 px-3 text-base font-normal leading-none w-full text-center text-text-2"
          >
            {{ orderInfo.rate }}
          </div>
          <div class="w-full mt-6 flex justify-center">
            <canvas class="w-[153px]" ref="canvasRef" />
          </div>
          <div
            v-if="'network' in orderInfo"
            class="w-full mt-4 px-3 text-theme-primary text-2xl font-bold leading-none capitalize text-center"
          >
            {{ orderInfo.network }}
          </div>
          <div v-if="'address_token' in orderInfo" class="w-full p-3 mt-1.5">
            <div
              class="w-full p-4 rounded-lg bg-bg-4 text-text-1 text-base break-all leading-normal"
            >
              {{ orderInfo.address_token }}
            </div>
          </div>
          <div v-if="'address_token' in orderInfo" class="p-3 grid grid-cols-2 gap-2">
            <button
              @click.stop="doCapture"
              class="py-4 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal"
            >
              Save QR Code
            </button>
            <button
              @click.stop="copyWord(orderInfo.address_token)"
              class="py-4 bg-theme-3 rounded-lg text-theme-primary text-base font-bold leading-normal"
            >
              Copy Address
            </button>
          </div>
        </div>
        <div class="mt-6 px-5 py-3 w-full bg-bg-2 rounded-lg relative grid grid-rows-4 gap-2">
          <div v-if="'network' in orderInfo" class="flex items-center justify-between">
            <p class="text-text-3 text-base">Network</p>
            <div class="text-text-1 text-base">{{ orderInfo.network }}</div>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-text-3 text-base">Order No.</p>
            <div class="text-text-1 text-base flex items-center">
              {{ orderInfo.order_no }}
              <div class="ml-3 w-[18px]" @click.stop="copyWord(orderInfo.order_no)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M17 3C18.933 3 20.5 4.567 20.5 6.5V14L20.4951 14.1797C20.4046 15.9697 18.9697 17.4046 17.1797 17.4951L17 17.5H16.5L16.4951 17.6797C16.4016 19.5292 14.8727 21 13 21H7.5C5.567 21 4 19.433 4 17.5V10C4 8.067 5.567 6.5 7.5 6.5H8C8 4.567 9.567 3 11.5 3H17ZM11.5 4.5C10.3954 4.5 9.5 5.39543 9.5 6.5H13C14.933 6.5 16.5 8.067 16.5 10V16H17C18.1046 16 19 15.1046 19 14V6.5C19 5.39543 18.1046 4.5 17 4.5H11.5Z"
                    fill="#B3BEC1"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-text-3 text-base">Created At</p>
            <div class="text-text-1 text-base">{{ orderInfo.created_at }}</div>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-text-3 text-base">Deposit Method</p>
            <div class="text-text-1 text-base flex items-center">
              <img class="w-5 aspect-square mr-1" :src="orderInfo.method_icon" />
              {{ orderInfo.method }}
            </div>
          </div>
        </div>
        <button
          class="mt-6 w-full py-3 rounded-lg btn-primary text-text-4 text-[14px] font-bold"
          @click.stop="openUploadPop"
        >
          {{ t('deposit.upload_proof') }}
        </button>
        <button
          class="mt-3 w-full p-3 rounded-lg bg-opacity-10 text-text-2 text-[14px] font-bold"
          @click.stop="doCancelOrder"
        >
          {{ t('deposit.cancel_order_title') }}
        </button>
        <div class="mt-3 w-full text-center text-secondary-7 text-[14px] leading-normal">
          {{ t('deposit.deposit_order_bottom_tips') }}
        </div>
      </div>
      <div
        v-show="confirmUploadStatus === 'in_progress'"
        class="w-full h-full flex-1 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[623px]"
      >
        <div class="w-full bg-bg-2 rounded-tl-lg rounded-tr-lg">
          <div class="flex items-center p-3 border-b border-input-1">
            <div class="w-5 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path d="M4.17969 8.35742H9.25735" stroke="white" stroke-width="1.37174" />
                <path d="M4.03125 11.0449H12.0958" stroke="white" stroke-width="1.37174" />
                <path
                  d="M12.6875 0.888672V4.48949C12.6875 5.05769 13.1481 5.5183 13.7163 5.5183H18.6612"
                  stroke="white"
                  stroke-width="1.37174"
                />
                <path
                  d="M18.8034 11.941L18.6633 5.66855L12.839 0.740234H1.77099C1.2028 0.740234 0.742188 1.20085 0.742188 1.76904V18.2299C0.742188 18.7981 1.2028 19.2588 1.77099 19.2588H10.6048M12.6956 13.5837H18.52L16.5785 16.2719L18.52 18.8107H12.3969L14.0397 16.2719L12.6956 13.5837Z"
                  stroke="white"
                  stroke-width="1.37174"
                />
              </svg>
            </div>
            <div class="w-full overflow-hidden whitespace-nowrap">
              <p class="marquee">
                Payment received. Your order is being verified. Thank you for your patience.
              </p>
            </div>
          </div>
        </div>
        <div class="bg-bg-2 p-4 rounded-bl-lg rounded-br-lg">
          <div class="pt-2 flex items-end justify-center">
            <p class="text-text-1 text-[40px] font-bold leading-none capitalize">
              {{ orderInfo.amount }}
            </p>
            <p class="text-text-1 text-lg font-bold leading-none capitalize">
              {{ orderInfo.method }}
            </p>
          </div>
          <div
            v-if="'rate' in orderInfo"
            class="pt-1 px-3 text-base font-normal leading-none w-full text-center text-text-2"
          >
            {{ orderInfo.rate }}
          </div>
          <div class="mt-4 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid grid-rows-4 gap-2">
            <div v-if="'network' in orderInfo" class="flex items-center justify-between">
              <p class="text-text-3 text-base">Network</p>
              <div class="text-text-1 text-base">{{ orderInfo.network }}</div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Order No.</p>
              <div class="text-text-1 text-base flex items-center">
                {{ orderInfo.order_no }}
                <div class="ml-3 w-[18px]" @click.stop="copyWord(orderInfo.order_no)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17 3C18.933 3 20.5 4.567 20.5 6.5V14L20.4951 14.1797C20.4046 15.9697 18.9697 17.4046 17.1797 17.4951L17 17.5H16.5L16.4951 17.6797C16.4016 19.5292 14.8727 21 13 21H7.5C5.567 21 4 19.433 4 17.5V10C4 8.067 5.567 6.5 7.5 6.5H8C8 4.567 9.567 3 11.5 3H17ZM11.5 4.5C10.3954 4.5 9.5 5.39543 9.5 6.5H13C14.933 6.5 16.5 8.067 16.5 10V16H17C18.1046 16 19 15.1046 19 14V6.5C19 5.39543 18.1046 4.5 17 4.5H11.5Z"
                      fill="#B3BEC1"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Created At</p>
              <div class="text-text-1 text-base">{{ orderInfo.created_at }}</div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Deposit Method</p>
              <div class="text-text-1 text-base flex items-center">
                <img class="w-5 aspect-square mr-1" :src="orderInfo.method_icon" />
                {{ orderInfo.method }}
              </div>
            </div>
          </div>
        </div>
        <button
          class="mt-6 w-full h-12 rounded-lg btn-primary text-text-4 text-[14px] font-bold flex items-center justify-center"
          @click.stop="openUploadPop"
        >
          {{ t('deposit.upload_proof_again_btn_text') }}
        </button>
        <div class="bg-bg-2 mt-6 p-5 rounded-lg text-base font-normal leading-normal">
          <p class="text-[color:#F44854]">Reminder</p>
          <p class="text-text-3 mt-4">
            · To ensure funds are credited successfully, please upload the correct payment receipt.
          </p>
          <p class="text-text-3 mt-4">
            · If you have already uploaded the proof, please wait patiently. Verification usually
            takes 1–5 minutes.
          </p>
        </div>
      </div>
      <div
        v-show="confirmUploadStatus === 'completed'"
        class="w-full h-full flex-1 flex flex-col relative bg-bg-1 p-4 rounded-bl-lg rounded-br-lg overflow-y-auto sm:max-h-[506px]"
      >
        <div class="w-full bg-bg-2 rounded-lg pt-10 px-4 pb-8">
          <div class="flex flex-col items-center">
            <div class="w-[76px] h-[76px]">
              <svg
                v-if="orderStatus === 'Completed'"
                xmlns="http://www.w3.org/2000/svg"
                width="76"
                height="76"
                viewBox="0 0 76 76"
                fill="none"
              >
                <g clip-path="url(#clip0_4067_156898)">
                  <path
                    d="M0 38C0 48.0782 4.00356 57.7437 11.1299 64.8701C18.2563 71.9964 27.9218 76 38 76C48.0782 76 57.7437 71.9964 64.8701 64.8701C71.9964 57.7437 76 48.0782 76 38C76 27.9218 71.9964 18.2563 64.8701 11.1299C57.7437 4.00356 48.0782 0 38 0C27.9218 0 18.2563 4.00356 11.1299 11.1299C4.00356 18.2563 0 27.9218 0 38Z"
                    fill="url(#paint0_linear_4067_156898)"
                  />
                  <path
                    d="M31.9461 53.1996C31.0555 53.1996 30.2242 52.8434 29.5117 52.1902L18.2898 40.909C16.9242 39.5434 16.9242 37.4652 18.2898 36.0996C19.6555 34.734 21.7336 34.734 23.0992 36.0996L31.8867 44.8871L52.8461 23.9871C54.2117 22.6215 56.2898 22.6215 57.6555 23.9871C59.0211 25.3527 59.0211 27.4309 57.6555 28.7965L34.3805 52.1902C33.668 52.8434 32.8367 53.1996 31.9461 53.1996Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_4067_156898"
                    x1="0"
                    y1="38"
                    x2="76"
                    y2="38"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#24EE89" />
                    <stop offset="1" stop-color="#9FE871" />
                  </linearGradient>
                  <clipPath id="clip0_4067_156898">
                    <rect width="76" height="76" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <svg
                v-else-if="orderStatus === 'Cancelled'"
                xmlns="http://www.w3.org/2000/svg"
                width="76"
                height="76"
                viewBox="0 0 76 76"
                fill="none"
              >
                <g clip-path="url(#clip0_4067_156938)">
                  <path
                    d="M0 38C0 48.0782 4.00356 57.7437 11.1299 64.8701C18.2563 71.9964 27.9218 76 38 76C48.0782 76 57.7437 71.9964 64.8701 64.8701C71.9964 57.7437 76 48.0782 76 38C76 27.9218 71.9964 18.2563 64.8701 11.1299C57.7437 4.00356 48.0782 0 38 0C27.9218 0 18.2563 4.00356 11.1299 11.1299C4.00356 18.2563 0 27.9218 0 38Z"
                    fill="#7B7D7D"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M46.8357 25.1305C48.0073 23.9592 49.9064 23.959 51.0779 25.1305C52.2491 26.3021 52.2491 28.2012 51.0779 29.3727L42.4519 37.9987L51.0798 46.6266C52.251 47.7982 52.2511 49.6973 51.0798 50.8688C49.9084 52.0403 48.0092 52.0401 46.8376 50.8688L38.2097 42.2409L29.5818 50.8688C28.4103 52.0403 26.5112 52.0401 25.3396 50.8688C24.168 49.6973 24.1681 47.7982 25.3396 46.6266L33.9675 37.9987L25.3416 29.3727C24.17 28.2012 24.17 26.3021 25.3416 25.1305C26.5131 23.9591 28.4122 23.959 29.5837 25.1305L38.2097 33.7565L46.8357 25.1305Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4067_156938">
                    <rect width="76" height="76" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <p class="mt-4 text-base font-bold leading-normal text-text-1">
              {{ orderStatus === 'Completed' ? 'Order Completed' : 'Order Cancelled' }}
            </p>
          </div>
          <div class="mt-6 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid grid-rows-4 gap-3">
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Total Payment</p>
              <div class="text-text-1 text-base">{{ orderInfo.amount }}{{ orderInfo.method }}</div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Final Amount</p>
              <div class="text-text-1 text-base">{{ orderInfo.amount * 7.15 }}PHP</div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Exchange Rate</p>
              <div class="text-text-1 text-base">1USDT≈7.15PHP</div>
            </div>
            <div v-if="'network' in orderInfo" class="flex items-center justify-between">
              <p class="text-text-3 text-base">Network</p>
              <div class="text-text-1 text-base">{{ orderInfo.network }}</div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Order No.</p>
              <div class="text-text-1 text-base flex items-center">
                {{ orderInfo.order_no }}
                <div class="ml-3 w-[18px]" @click.stop="copyWord(orderInfo.order_no)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17 3C18.933 3 20.5 4.567 20.5 6.5V14L20.4951 14.1797C20.4046 15.9697 18.9697 17.4046 17.1797 17.4951L17 17.5H16.5L16.4951 17.6797C16.4016 19.5292 14.8727 21 13 21H7.5C5.567 21 4 19.433 4 17.5V10C4 8.067 5.567 6.5 7.5 6.5H8C8 4.567 9.567 3 11.5 3H17ZM11.5 4.5C10.3954 4.5 9.5 5.39543 9.5 6.5H13C14.933 6.5 16.5 8.067 16.5 10V16H17C18.1046 16 19 15.1046 19 14V6.5C19 5.39543 18.1046 4.5 17 4.5H11.5Z"
                      fill="#B3BEC1"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Created At</p>
              <div class="text-text-1 text-base">{{ orderInfo.created_at }}</div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-text-3 text-base">Deposit Method</p>
              <div class="text-text-1 text-base flex items-center">
                <img class="w-5 aspect-square mr-1" :src="orderInfo.method_icon" />
                {{ orderInfo.method }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="orderInfo.type === 'Fiat'">
      <div class="w-full h-full p-3 rounded-bl-xl rounded-br-xl bg-bg-1 sm:max-h-[435px]">
        <div class="w-full h-full px-4 pt-8 pb-4 rounded-xl bg-bg-2">
          <div class="w-full flex items-center justify-center">
            <div class="w-4 mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="21"
                viewBox="0 0 17 21"
                fill="none"
              >
                <path
                  d="M8.82422 0C10.932 2.99388e-05 12.5133 0.550949 13.6035 1.65234C14.199 2.24619 14.6243 2.99435 14.8799 3.89551H16.3262V5.59473H15.1494C15.159 5.77347 15.166 5.95635 15.166 6.14355C15.166 6.31833 15.1599 6.48968 15.1514 6.65723H16.3262V8.35645H14.8867C14.6319 9.2665 14.2043 10.0268 13.6035 10.6357C12.5133 11.7371 10.932 12.2881 8.82422 12.2881H4.15625V20.6807H1.19824V8.35645H0V6.65723H1.19824V5.59473H0V3.89551H1.19824V0H8.82422ZM4.15625 8.35645V10.0391C6.0835 9.78415 10.1955 10.7583 11.6729 8.35645H4.15625ZM4.15625 6.65723H12.1914C12.1982 6.58206 12.204 6.50526 12.208 6.42676C12.2421 6.18452 12.2506 5.89975 12.2266 5.59473H4.15625V6.65723ZM4.15625 3.89551H11.6826C11.1229 3.01441 10.069 2.30188 8.20117 2.30176H4.15625V3.89551Z"
                  fill="white"
                />
              </svg>
            </div>
            <p class="text-2xl font-bold leading-normal capitalize text-text-1">
              {{ orderInfo.amount }}
            </p>
          </div>
          <p class="mt-2 text-text-1 text-base leading-normal text-center">Deposit Amount</p>
          <div class="mt-8 px-5 py-3 w-full bg-bg-4 rounded-lg relative grid gap-4">
            <div v-if="'currency' in orderInfo" class="h-5 flex items-center justify-between">
              <p class="text-text-3 text-base">Currency</p>
              <div class="text-text-1 text-base">{{ orderInfo.currency }}</div>
            </div>
            <div class="h-5 flex items-center justify-between">
              <p class="text-text-3 text-base">Payment Amount</p>
              <div class="text-text-1 text-base">{{ orderInfo.amount }}</div>
            </div>
            <div v-if="'bonus' in orderInfo" class="h-5 flex items-center justify-between">
              <p class="text-text-3 text-base">Deposit Bonus</p>
              <div class="text-text-1 text-base">{{ orderInfo.bonus }}</div>
            </div>
            <div class="h-5 flex items-center justify-between">
              <p class="text-text-3 text-base">Order Status</p>
              <div class="text-theme-primary text-base">{{ orderInfo.status }}</div>
            </div>
            <div class="h-5 flex items-center justify-between">
              <p class="text-text-3 text-base">Order No.</p>
              <div class="text-text-1 text-base flex items-center">
                {{ orderInfo.order_no }}
                <div class="ml-3 w-[18px]" @click.stop="copyWord(orderInfo.order_no)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17 3C18.933 3 20.5 4.567 20.5 6.5V14L20.4951 14.1797C20.4046 15.9697 18.9697 17.4046 17.1797 17.4951L17 17.5H16.5L16.4951 17.6797C16.4016 19.5292 14.8727 21 13 21H7.5C5.567 21 4 19.433 4 17.5V10C4 8.067 5.567 6.5 7.5 6.5H8C8 4.567 9.567 3 11.5 3H17ZM11.5 4.5C10.3954 4.5 9.5 5.39543 9.5 6.5H13C14.933 6.5 16.5 8.067 16.5 10V16H17C18.1046 16 19 15.1046 19 14V6.5C19 5.39543 18.1046 4.5 17 4.5H11.5Z"
                      fill="#B3BEC1"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div class="h-5 flex items-center justify-between">
              <p class="text-text-3 text-base">Created At</p>
              <div class="text-text-1 text-base">{{ orderInfo.created_at }}</div>
            </div>
            <div class="h-5 flex items-center justify-between">
              <p class="text-text-3 text-base">Deposit Method</p>
              <div class="text-text-1 text-base flex items-center">
                <img class="h-5 mr-1" :src="orderInfo.method_icon" />
                {{ orderInfo.method }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <cancelOrderPop v-if="cancelOrderPopShow" v-model="cancelOrderPopShow" />
  <uploadProofPop
    v-if="uploadPopShow"
    v-model="uploadPopShow"
    @close="handleUploadRroofClose"
    @confirmUpload="handleConfirmUpload"
  />
</template>
<script setup lang="ts">
import { CountDown, showToast } from 'vant'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'
import cancelOrderPop from './cancelOrderPop.vue'
import uploadProofPop from './uploadProofPop.vue'
import { OrderType } from './orderType'

const { t } = useI18n()

interface Props {
  orderInfo: OrderType
}
const props = defineProps<Props>()
const emit = defineEmits(['close', 'hidden'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const targetRef = ref<HTMLElement | null>(null)
const countdownTime = ref(15 * 60 * 1000)
const cancelOrderPopShow = ref<boolean>(false)
const uploadPopShow = ref<boolean>(false)
const confirmUploadStatus = ref<string>('not_started')
const orderStatus = ref<'Completed' | 'Cancelled'>('Completed')

const handleClose = () => {
  emit('close')
}

const handleUploadRroofClose = () => {
  emit('hidden')
}

const handleConfirmUpload = () => {
  confirmUploadStatus.value = 'in_progress'
}

const openUploadPop = () => {
  emit('hidden')
  uploadPopShow.value = true
}

const doCapture = async () => {
  const el = targetRef.value
  if (!el) return

  await document.fonts.ready
  const canvas = await html2canvas(el, {
    scale: window.devicePixelRatio || 2,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    backgroundColor: '#fff'
  })

  canvas.toBlob(async blob => {
    if (!blob) return
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    showToast({
      message: t('betDetails.copy'),
      type: 'success'
    })
  })
}

const doCancelOrder = () => {
  cancelOrderPopShow.value = true
}

const copyWord = (word: string) => {
  navigator.clipboard.writeText(word)
  showToast({
    message: t('betDetails.copy'),
    type: 'success'
  })
}

onMounted(() => {
  if (canvasRef.value && 'address_token' in props.orderInfo) {
    QRCode.toCanvas(canvasRef.value, props.orderInfo.address_token, {
      width: 153,
      margin: 2
    })
  }
})
</script>
<style scoped lang="scss">
@font-face {
  font-family: 'FX-LED';
  src: url('@/static/fonts/FX-LED.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.led-font {
  font-family: 'FX-LED', monospace;
}

.marquee {
  animation: marquee 10s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
