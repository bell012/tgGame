<template>
  <div class="flex flex-col items-center">
    <div class="w-[76px] h-[76px]">
      <svg
        v-if="status === 'Completed'"
        xmlns="http://www.w3.org/2000/svg"
        width="76"
        height="76"
        viewBox="0 0 76 76"
        fill="none"
      >
        <g clip-path="url(#clip0_completed)">
          <path
            d="M0 38C0 48.0782 4.00356 57.7437 11.1299 64.8701C18.2563 71.9964 27.9218 76 38 76C48.0782 76 57.7437 71.9964 64.8701 64.8701C71.9964 57.7437 76 48.0782 76 38C76 27.9218 71.9964 18.2563 64.8701 11.1299C57.7437 4.00356 48.0782 0 38 0C27.9218 0 18.2563 4.00356 11.1299 11.1299C4.00356 18.2563 0 27.9218 0 38Z"
            fill="url(#paint0_completed)"
          />
          <path
            d="M31.9461 53.1996C31.0555 53.1996 30.2242 52.8434 29.5117 52.1902L18.2898 40.909C16.9242 39.5434 16.9242 37.4652 18.2898 36.0996C19.6555 34.734 21.7336 34.734 23.0992 36.0996L31.8867 44.8871L52.8461 23.9871C54.2117 22.6215 56.2898 22.6215 57.6555 23.9871C59.0211 25.3527 59.0211 27.4309 57.6555 28.7965L34.3805 52.1902C33.668 52.8434 32.8367 53.1996 31.9461 53.1996Z"
            fill="white"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_completed"
            x1="0"
            y1="38"
            x2="76"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#24EE89" />
            <stop offset="1" stop-color="#9FE871" />
          </linearGradient>
          <clipPath id="clip0_completed">
            <rect width="76" height="76" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="76"
        height="76"
        viewBox="0 0 76 76"
        fill="none"
      >
        <g clip-path="url(#clip0_cancelled)">
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
          <clipPath id="clip0_cancelled">
            <rect width="76" height="76" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
    <p class="mt-4 text-base font-bold leading-normal text-text-1">
      {{ title }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: 'Completed' | 'Cancelled'
  title: string
}>()
</script>
