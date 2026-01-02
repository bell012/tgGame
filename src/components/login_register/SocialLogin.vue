<template>
  <div class="flex flex-col">
    <div class="w-full h-4 flex items-center">
      <div class="bg-[#e4eaf019] flex-1 h-[1px]"></div>
      <span class="mx-3 flex-none text-[14px] text-text-2">直接登入</span>
      <div class="bg-[#e4eaf019] flex-1 h-[1px]"></div>
    </div>
    <div
      v-if="showKeyLogin"
      class="w-full h-[40px] border border-[#e4eaf019] flex items-center justify-center mt-3 rounded-lg text-[14px] text-text-1 font-[800] cursor-pointer"
    >
      <KeyIcon class="w-5 h-5 fill-none mr-2" />
      使用秘钥登入
    </div>
    <div class="flex items-center justify-center gap-3 flex-wrap mt-6">
      <div
        v-for="icon in socialIcons"
        :key="icon.name"
        class="w-[40px] h-[40px] border border-[#e4eaf019] rounded-lg flex items-center justify-center cursor-pointer"
        @click="handleSocialLogin(icon.name)"
      >
        <component :is="icon.component" class="w-5 h-5 fill-none" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginIcon1 from '@/static/svg/login/login_icon_1.svg?component'
import LoginIcon2 from '@/static/svg/login/login_icon_2.svg?component'
import LoginIcon4 from '@/static/svg/login/login_icon_4.svg?component'
import LoginIcon5 from '@/static/svg/login/login_icon_5.svg?component'
import LoginIcon6 from '@/static/svg/login/login_icon_6.svg?component'
import LoginIcon7 from '@/static/svg/login/login_icon_7.svg?component'
import KeyIcon from '@/static/svg/login/key.svg?component'

interface Props {
  showKeyLogin?: boolean
}

withDefaults(defineProps<Props>(), {
  showKeyLogin: true
})

const socialIcons = [
  { name: 'icon1', component: LoginIcon1 },
  { name: 'icon2', component: LoginIcon2 },
  { name: 'icon4', component: LoginIcon4 },
  { name: 'icon5', component: LoginIcon5 },
  { name: 'icon6', component: LoginIcon6 },
  { name: 'icon7', component: LoginIcon7 }
]

const handleSocialLogin = (iconName: string) => {
  console.log('点击第三方登录:', iconName)
}
</script>
