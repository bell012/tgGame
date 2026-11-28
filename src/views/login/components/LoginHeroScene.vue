<template>
  <div class="login-hero pointer-events-none" :class="{ 'is-paused': isPaused }" aria-hidden="true">
    <svg
      class="block h-full w-full overflow-visible"
      viewBox="0 0 1000 650"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="login-hero-vignette" cx=".49" cy=".54" r=".55">
          <stop offset=".53" stop-color="white" />
          <stop offset=".81" stop-color="white" stop-opacity=".73" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </radialGradient>
        <mask id="login-hero-scene-edge">
          <rect x="-70" y="-104" width="1140" height="794" fill="url(#login-hero-vignette)" />
        </mask>
        <linearGradient
          id="login-hero-ground-fade"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="240"
          x2="0"
          y2="654"
        >
          <stop stop-color="white" stop-opacity="0" />
          <stop offset=".21" stop-color="white" stop-opacity=".36" />
          <stop offset=".49" stop-color="white" />
          <stop offset=".83" stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="login-hero-rock-edge">
          <rect x="0" y="200" width="1000" height="454" fill="url(#login-hero-ground-fade)" />
        </mask>
        <linearGradient id="login-hero-sides">
          <stop stop-color="white" stop-opacity="0" />
          <stop offset=".16" stop-color="white" />
          <stop offset=".84" stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="login-hero-side-mask">
          <rect width="1000" height="650" fill="url(#login-hero-sides)" />
        </mask>
        <linearGradient
          id="login-hero-cave-edges"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="-16"
          x2="0"
          y2="650"
        >
          <stop stop-color="white" stop-opacity="0" />
          <stop offset=".25" stop-color="white" />
          <stop offset=".82" stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="login-hero-cave-mask">
          <rect x="0" y="-16" width="1000" height="666" fill="url(#login-hero-cave-edges)" />
        </mask>
        <clipPath id="login-hero-frame">
          <rect x="-70" y="-104" width="1140" height="754" />
        </clipPath>
        <radialGradient id="login-hero-contact">
          <stop stop-color="#080812" stop-opacity=".86" />
          <stop offset=".48" stop-color="#100c24" stop-opacity=".49" />
          <stop offset="1" stop-color="#101020" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="login-hero-floor-bounce">
          <stop stop-color="#a1b4fe" stop-opacity=".30" />
          <stop offset=".49" stop-color="#a66fec" stop-opacity=".12" />
          <stop offset="1" stop-color="#804cb4" stop-opacity="0" />
        </radialGradient>
        <linearGradient
          id="login-hero-cast-tone"
          gradientUnits="userSpaceOnUse"
          x1="503"
          y1="587"
          x2="441"
          y2="617"
        >
          <stop stop-color="#100d23" stop-opacity=".57" />
          <stop offset=".6" stop-color="#111125" stop-opacity=".29" />
          <stop offset="1" stop-color="#12132a" stop-opacity="0" />
        </linearGradient>
        <filter id="login-hero-cast-soft" x="-30%" y="-70%" width="160%" height="240%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id="login-hero-warm-air">
          <stop stop-color="#ff8037" stop-opacity=".19" />
          <stop offset="1" stop-color="#f05420" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="login-hero-warm-rim-air">
          <stop stop-color="#ff9a57" stop-opacity=".51" />
          <stop offset=".34" stop-color="#ec6352" stop-opacity=".27" />
          <stop offset="1" stop-color="#dc4760" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="login-hero-cool-rim-air">
          <stop stop-color="#78bfff" stop-opacity=".35" />
          <stop offset=".39" stop-color="#7375ee" stop-opacity=".21" />
          <stop offset="1" stop-color="#986ee8" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="login-hero-violet-floor">
          <stop stop-color="#bc8aff" stop-opacity=".24" />
          <stop offset=".55" stop-color="#9a72ed" stop-opacity=".12" />
          <stop offset="1" stop-color="#9a72ed" stop-opacity="0" />
        </radialGradient>
        <mask
          id="login-hero-hero-alpha"
          mask-type="alpha"
          maskUnits="userSpaceOnUse"
          x="317"
          y="146"
          width="346"
          height="458"
        >
          <use href="#login-hero-hero-image" />
        </mask>
        <radialGradient id="login-hero-magic">
          <stop stop-color="#b7ffdc" stop-opacity=".51" />
          <stop offset=".31" stop-color="var(--login-hero-green)" stop-opacity=".27" />
          <stop offset="1" stop-color="var(--login-hero-green)" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="login-hero-logo-radiance">
          <stop stop-color="#d0ffea" stop-opacity=".76" />
          <stop offset=".26" stop-color="#57ffc0" stop-opacity=".56" />
          <stop offset=".56" stop-color="#24e88e" stop-opacity=".18" />
          <stop offset="1" stop-color="#24e88e" stop-opacity="0" />
        </radialGradient>
        <filter id="login-hero-crystal-bloom" x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4.4" result="spread" />
          <feFlood flood-color="#3dffa6" flood-opacity=".95" />
          <feComposite in2="spread" operator="in" result="green-bloom" />
          <feMerge>
            <feMergeNode in="green-bloom" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <image id="login-hero-ember-sheet" width="658" height="687" :href="emberSheetImage" />
        <symbol id="login-hero-ember-a" viewBox="237 74 23 31">
          <use href="#login-hero-ember-sheet" />
        </symbol>
        <symbol id="login-hero-ember-b" viewBox="80 86 17 19">
          <use href="#login-hero-ember-sheet" />
        </symbol>
        <symbol id="login-hero-ember-c" viewBox="279 422 36 32">
          <use href="#login-hero-ember-sheet" />
        </symbol>
        <symbol id="login-hero-ember-d" viewBox="267 486 25 23">
          <use href="#login-hero-ember-sheet" />
        </symbol>
        <radialGradient id="login-hero-eye-reflection">
          <stop stop-color="#edabff" stop-opacity=".45" />
          <stop offset=".46" stop-color="#da87ff" stop-opacity=".22" />
          <stop offset="1" stop-color="#cb63ed" stop-opacity="0" />
        </radialGradient>
        <filter id="login-hero-lava-emission" color-interpolation-filters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  3.6 -3.6 0 0 -.38"
            result="warm"
          />
          <feComposite in="warm" in2="SourceAlpha" operator="in" />
        </filter>
        <clipPath id="login-hero-sword-blade">
          <path
            d="M12 430C40 432 79 486 115 495L119 540 221 807 Q234 843 240 885 L242 915 230 949 220 963 186 892 75 628 36 655 10 668 7 577 5 513Z"
          />
        </clipPath>
        <radialGradient id="login-hero-sword-sweep">
          <stop stop-color="#ffffff" stop-opacity=".99" />
          <stop offset=".31" stop-color="#f7fbff" stop-opacity=".93" />
          <stop offset=".59" stop-color="#d0eaff" stop-opacity=".59" />
          <stop offset=".82" stop-color="#bfdefb" stop-opacity=".14" />
          <stop offset="1" stop-color="#b7d6f2" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="login-hero-sword-ambient">
          <stop stop-color="#e2f2ff" stop-opacity=".38" />
          <stop offset=".62" stop-color="#9ec6e8" stop-opacity=".12" />
          <stop offset="1" stop-color="#aecdec" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="login-hero-sword-tip">
          <stop stop-color="#ffffff" stop-opacity="1" />
          <stop offset=".22" stop-color="#ffffff" stop-opacity=".97" />
          <stop offset=".55" stop-color="#edf8ff" stop-opacity=".64" />
          <stop offset="1" stop-color="#cce9ff" stop-opacity="0" />
        </radialGradient>
      </defs>

      <g clip-path="url(#login-hero-frame)">
        <g mask="url(#login-hero-scene-edge)">
          <g mask="url(#login-hero-side-mask)">
            <image
              mask="url(#login-hero-cave-mask)"
              class="hero-distance"
              :href="caveImage"
              x="-5"
              y="-16"
              width="1010"
              height="828"
            />
            <ellipse cx="509" cy="365" rx="393" ry="112" fill="url(#login-hero-warm-air)" />
            <g mask="url(#login-hero-rock-edge)">
              <image
                id="login-hero-ground-texture"
                :href="groundImage"
                x="3"
                y="56"
                width="994"
                height="1102"
              />
              <use
                class="hero-lava-light hero-move"
                href="#login-hero-ground-texture"
                filter="url(#login-hero-lava-emission)"
              />
              <ellipse
                cx="476"
                cy="551"
                rx="267"
                ry="76"
                transform="rotate(-7 476 551)"
                fill="url(#login-hero-floor-bounce)"
              />
              <ellipse
                cx="616"
                cy="565"
                rx="166"
                ry="53"
                transform="rotate(8 616 565)"
                fill="url(#login-hero-violet-floor)"
              />
              <path
                d="M592 587Q605 596 586 606L529 616 444 631 385 624 399 606 456 576Q477 568 496 579L527 584Z"
                fill="url(#login-hero-cast-tone)"
                filter="url(#login-hero-cast-soft)"
              />
              <ellipse
                cx="455"
                cy="570"
                rx="35"
                ry="11"
                transform="rotate(-10 455 570)"
                fill="url(#login-hero-contact)"
              />
              <ellipse
                cx="585"
                cy="602"
                rx="32"
                ry="8"
                transform="rotate(4 585 602)"
                fill="url(#login-hero-contact)"
              />
            </g>
          </g>
          <image class="hero-demon" :href="demonImage" x="114" y="-92" width="772" height="534" />
          <ellipse
            class="hero-eye-light hero-move"
            cx="500"
            cy="95"
            rx="38"
            ry="33"
            fill="url(#login-hero-eye-reflection)"
          />
          <image
            mask="url(#login-hero-side-mask)"
            class="hero-sparks"
            :href="sparksImage"
            x="31"
            y="280"
            width="938"
            height="774"
          />
        </g>

        <g mask="url(#login-hero-side-mask)">
          <ellipse
            cx="372"
            cy="321"
            rx="143"
            ry="106"
            transform="rotate(-15 372 321)"
            fill="url(#login-hero-warm-rim-air)"
          />
          <ellipse
            cx="599"
            cy="281"
            rx="148"
            ry="100"
            fill="url(#login-hero-warm-rim-air)"
            opacity=".70"
          />
          <ellipse cx="487" cy="410" rx="224" ry="126" fill="url(#login-hero-cool-rim-air)" />
        </g>

        <g>
          <use
            v-for="(ember, index) in embers"
            :key="index"
            class="hero-ember hero-move"
            :style="{
              '--ember-time': ember.time,
              '--ember-delay': ember.delay,
              '--ember-drift': ember.drift,
              '--ember-rise': ember.rise,
              '--ember-alpha': ember.alpha
            }"
            :href="`#login-hero-ember-${ember.shape}`"
            :x="ember.x"
            :y="ember.y"
            :width="ember.width"
            :height="ember.height"
            :opacity="ember.opacity"
          />
        </g>

        <g>
          <image
            class="hero-gem hero-gem-blue hero-move"
            :href="gemBlueImage"
            x="672"
            y="213"
            width="48"
            height="48"
          />
          <image
            class="hero-gem hero-gem-pink hero-move"
            :href="gemPinkImage"
            x="752"
            y="359"
            width="51"
            height="52"
          />
        </g>

        <g class="hero-figure">
          <g class="hero-logo-float hero-move">
            <ellipse
              class="hero-logo-light hero-move"
              cx="625"
              cy="320"
              rx="54"
              ry="48"
              fill="url(#login-hero-logo-radiance)"
            />
          </g>
          <g class="hero-breathe hero-move">
            <image
              id="login-hero-hero-image"
              :href="heroImage"
              x="317"
              y="146"
              width="346"
              height="458"
            />
            <svg
              class="hero-blade-window"
              x="317"
              y="146"
              width="346"
              height="458"
              viewBox="0 0 1053 1396"
            >
              <g clip-path="url(#login-hero-sword-blade)">
                <g class="hero-blade-travel">
                  <ellipse
                    cx="230"
                    cy="894"
                    rx="155"
                    ry="244"
                    fill="url(#login-hero-sword-ambient)"
                  />
                  <ellipse
                    cx="230"
                    cy="894"
                    rx="128"
                    ry="187"
                    fill="url(#login-hero-sword-sweep)"
                  />
                </g>
                <ellipse
                  class="hero-blade-tip"
                  cx="25"
                  cy="452"
                  rx="82"
                  ry="108"
                  fill="url(#login-hero-sword-tip)"
                />
              </g>
            </svg>
            <ellipse
              class="hero-logo-light hero-move mix-blend-screen"
              cx="625"
              cy="354"
              rx="43"
              ry="29"
              fill="url(#login-hero-magic)"
              opacity=".85"
              mask="url(#login-hero-hero-alpha)"
            />
          </g>
          <g class="hero-logo-float hero-move">
            <g class="hero-logo-light hero-move">
              <image
                :href="handLogoImage"
                x="597"
                y="290"
                width="56"
                height="52"
                filter="url(#login-hero-crystal-bloom)"
              />
            </g>
          </g>
        </g>

        <image
          class="hero-gem hero-gem-purple hero-move"
          :href="gemPurpleImage"
          x="219"
          y="407"
          width="61"
          height="62"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import caveImage from '@/static/img/login/hero/cave.webp'
import demonImage from '@/static/img/login/hero/demon.webp'
import emberSheetImage from '@/static/img/login/hero/ember-sheet.webp'
import gemBlueImage from '@/static/img/login/hero/gem-blue.webp'
import gemPinkImage from '@/static/img/login/hero/gem-pink.webp'
import gemPurpleImage from '@/static/img/login/hero/gem-purple.webp'
import groundImage from '@/static/img/login/hero/ground.webp'
import handLogoImage from '@/static/img/login/hero/hand-logo.webp'
import heroImage from '@/static/img/login/hero/hero.webp'
import sparksImage from '@/static/img/login/hero/sparks.webp'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import '@/views/login/colors.css'

interface Ember {
  shape: 'a' | 'b' | 'c' | 'd'
  time: string
  delay: string
  drift: string
  rise: string
  alpha: number
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

const embers: Ember[] = [
  {
    shape: 'a',
    time: '5.9s',
    delay: '-2.1s',
    drift: '-13px',
    rise: '-56px',
    alpha: 0.89,
    x: 173.4,
    y: 414.44,
    width: 18.2,
    height: 29.12,
    opacity: 0.74
  },
  {
    shape: 'b',
    time: '7.4s',
    delay: '-6.1s',
    drift: '11px',
    rise: '-45px',
    alpha: 0.76,
    x: 274.08,
    y: 293.76,
    width: 21.84,
    height: 25.48,
    opacity: 0.61
  },
  {
    shape: 'c',
    time: '6.8s',
    delay: '-3.8s',
    drift: '-8px',
    rise: '-70px',
    alpha: 0.93,
    x: 302.8,
    y: 469.12,
    width: 36.4,
    height: 32.76,
    opacity: 0.78
  },
  {
    shape: 'd',
    time: '8.2s',
    delay: '-6.9s',
    drift: '17px',
    rise: '-61px',
    alpha: 0.91,
    x: 201.76,
    y: 528.76,
    width: 25.48,
    height: 25.48,
    opacity: 0.76
  },
  {
    shape: 'a',
    time: '5.5s',
    delay: '-1.4s',
    drift: '13px',
    rise: '-55px',
    alpha: 0.84,
    x: 732.08,
    y: 448.12,
    width: 21.84,
    height: 32.76,
    opacity: 0.69
  },
  {
    shape: 'b',
    time: '7.8s',
    delay: '-7.1s',
    drift: '-11px',
    rise: '-49px',
    alpha: 0.68,
    x: 792.4,
    y: 301.08,
    width: 18.2,
    height: 21.84,
    opacity: 0.53
  },
  {
    shape: 'd',
    time: '6.4s',
    delay: '-3.5s',
    drift: '18px',
    rise: '-66px',
    alpha: 1,
    x: 679.44,
    y: 525.76,
    width: 29.12,
    height: 25.48,
    opacity: 0.86
  },
  {
    shape: 'c',
    time: '7.1s',
    delay: '-5.2s',
    drift: '14px',
    rise: '-76px',
    alpha: 0.82,
    x: 750.16,
    y: 559.8,
    width: 43.68,
    height: 36.4,
    opacity: 0.67
  },
  {
    shape: 'a',
    time: '6.2s',
    delay: '-0.7s',
    drift: '-14px',
    rise: '-58px',
    alpha: 0.8,
    x: 290.4,
    y: 581.76,
    width: 18.2,
    height: 25.48,
    opacity: 0.65
  },
  {
    shape: 'd',
    time: '8.3s',
    delay: '-4.6s',
    drift: '-16px',
    rise: '-71px',
    alpha: 0.88,
    x: 234.08,
    y: 449.76,
    width: 21.84,
    height: 25.48,
    opacity: 0.73
  },
  {
    shape: 'b',
    time: '7.6s',
    delay: '-2.8s',
    drift: '9px',
    rise: '-63px',
    alpha: 0.83,
    x: 344.4,
    y: 557.08,
    width: 18.2,
    height: 21.84,
    opacity: 0.68
  },
  {
    shape: 'c',
    time: '6.3s',
    delay: '-5.1s',
    drift: '-12px',
    rise: '-74px',
    alpha: 0.95,
    x: 152.12,
    y: 601.44,
    width: 32.76,
    height: 29.12,
    opacity: 0.8
  },
  {
    shape: 'a',
    time: '9.1s',
    delay: '-4.3s',
    drift: '14px',
    rise: '-57px',
    alpha: 0.84,
    x: 699.08,
    y: 483.44,
    width: 21.84,
    height: 29.12,
    opacity: 0.69
  },
  {
    shape: 'd',
    time: '6.9s',
    delay: '-1.1s',
    drift: '-17px',
    rise: '-68px',
    alpha: 0.87,
    x: 800.76,
    y: 510.08,
    width: 25.48,
    height: 21.84,
    opacity: 0.72
  },
  {
    shape: 'c',
    time: '8.7s',
    delay: '-7.8s',
    drift: '8px',
    rise: '-61px',
    alpha: 0.97,
    x: 662.12,
    y: 599.44,
    width: 32.76,
    height: 29.12,
    opacity: 0.82
  }
]

const isPaused = ref(false)

const syncPaused = () => {
  isPaused.value = document.hidden
}

onMounted(() => {
  syncPaused()
  document.addEventListener('visibilitychange', syncPaused)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', syncPaused)
})
</script>

<style scoped>
.login-hero {
  --login-hero-green: #24e88e;
  animation: hero-appear 0.9s 0.3s both;
}

@keyframes hero-appear {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.hero-distance {
  filter: var(--login-hero-distance-filter);
}

.hero-demon {
  filter: var(--login-hero-demon-filter);
}

.hero-sparks {
  opacity: var(--login-hero-sparks-opacity);
}

.hero-figure image {
  filter: drop-shadow(0 4px 11px #170f25a6);
}

.hero-gem {
  filter: drop-shadow(0 2px 6px #170f2688);
}

.hero-breathe {
  transform-box: view-box;
  transform-origin: 505px 599px;
  animation: hero-breath 8.6s ease-in-out infinite;
}

.hero-logo-float {
  animation: hero-logo-hover 5.8s ease-in-out infinite;
}

.hero-logo-light {
  animation: hero-logo-pulse 5.8s ease-in-out infinite;
}

.hero-gem-blue {
  --gem-rise: -14px;
  animation: hero-gem-hover 4.8s -1.2s ease-in-out infinite;
}

.hero-gem-pink {
  --gem-rise: -17px;
  animation: hero-gem-hover 5.7s -3.5s ease-in-out infinite;
}

.hero-gem-purple {
  --gem-rise: -12px;
  animation: hero-gem-hover 6.6s -2.1s ease-in-out infinite;
}

.hero-ember {
  filter: brightness(1.24) drop-shadow(0 0 2px #ff8d38a6);
  animation: hero-ember-rise var(--ember-time) var(--ember-delay) linear infinite;
}

.hero-eye-light {
  opacity: 0;
  animation: hero-eye-pulse 9.1s -1.9s ease-in-out infinite;
}

.hero-lava-light {
  opacity: 0;
  mix-blend-mode: screen;
  animation: hero-lava-pulse 10.8s -1.7s ease-in-out infinite;
}

.hero-blade-window {
  pointer-events: none;
  mix-blend-mode: screen;
}

.hero-blade-travel,
.hero-blade-tip {
  opacity: 0;
}

.hero-blade-travel {
  animation:
    blade-pass 3.3s linear infinite,
    blade-fade 3.3s ease-in-out infinite;
}

.hero-blade-tip {
  animation: blade-tip-flash 3.3s ease-in-out infinite;
}

.is-paused :is(.hero-move, .hero-blade-travel, .hero-blade-tip) {
  animation-play-state: paused;
}

@keyframes hero-breath {
  0%,
  100% {
    transform: scaleY(1);
  }

  48% {
    transform: scaleY(1.006);
  }
}

@keyframes hero-logo-hover {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(2px, -13px);
  }
}

@keyframes hero-logo-pulse {
  0%,
  100% {
    opacity: 0.62;
  }

  50% {
    opacity: 1;
  }
}

@keyframes hero-gem-hover {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(var(--gem-rise));
  }
}

@keyframes hero-ember-rise {
  0% {
    transform: translate(0, 5px);
    opacity: 0;
  }

  16%,
  36% {
    opacity: var(--ember-alpha);
  }

  74% {
    opacity: calc(var(--ember-alpha) * 0.8);
  }

  100% {
    transform: translate(var(--ember-drift), var(--ember-rise));
    opacity: 0;
  }
}

@keyframes hero-eye-pulse {
  0%,
  100% {
    opacity: 0.08;
  }

  51% {
    opacity: 0.79;
  }
}

@keyframes hero-lava-pulse {
  0%,
  100% {
    opacity: 0.025;
  }

  47% {
    opacity: 0.46;
  }
}

@keyframes blade-pass {
  0%,
  8% {
    transform: translate(30px, 70px);
  }

  41% {
    transform: translate(-205px, -442px);
  }

  53%,
  100% {
    transform: translate(-245px, -535px);
  }
}

@keyframes blade-fade {
  0%,
  8%,
  57%,
  100% {
    opacity: 0;
  }

  14%,
  39% {
    opacity: 1;
  }

  46% {
    opacity: 0.58;
  }
}

@keyframes blade-tip-flash {
  0%,
  34%,
  64%,
  100% {
    opacity: 0;
  }

  39% {
    opacity: 0.58;
  }

  43% {
    opacity: 1;
  }

  47% {
    opacity: 0.84;
  }

  54% {
    opacity: 0.31;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-hero,
  .hero-move,
  .hero-blade-travel,
  .hero-blade-tip {
    animation: none;
  }
}
</style>
