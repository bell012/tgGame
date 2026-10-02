<template>
  <LoginRegisterFormCore
    ref="loginFormRef"
    :default-tab="defaultTab"
    :login-setting="loginSetting"
    @register-success="handleRegisterSuccess"
    @login-success="handleLoginSuccess"
    @open-reset-password="emit('open-reset-password')"
  >
    <template
      #default="{
        activeTab,
        activeLoginMethod,
        activeSignupMethod,
        loginMethodTabs,
        signupMethodTabs,
        signinAreaCode,
        signupAreaCode,
        showPassword,
        showConfirmPassword,
        formData,
        checkboxAnimating,
        countdown,
        isSigninValid,
        isSignupValid,
        showSigninPassword,
        showSigninSmsCode,
        showSigninCaptcha,
        showSignupPassword,
        showSignupSmsCode,
        showSignupCaptcha,
        showSignupInvitationCode,
        captchaImageUrl,
        isCaptchaLoading,
        setActiveLoginMethod,
        setActiveSignupMethod,
        setSigninAreaCode,
        setSignupAreaCode,
        togglePassword,
        toggleConfirmPassword,
        handleCheckboxClick,
        handleLogin,
        handleRegister,
        handleSendCode,
        openResetPassword,
        handleSigninUsernameInput,
        handleSigninPhoneInput,
        handleSignupUsernameInput,
        handleSignupPhoneInput,
        handleSignupCodeInput,
        handleSigninPasswordInput,
        handleSigninSmsCodeInput,
        handleSigninCaptchaInput,
        refreshSigninCaptcha,
        handleSignupCaptchaInput,
        refreshSignupCaptcha,
        handleSignupPasswordInput,
        handleSignupConfirmPasswordInput,
        handleSignupInvitationCodeInput
      }"
    >
      <teleport to="body">
        <transition name="drawer-mask">
          <div
            v-if="visible"
            class="auth-mobile-overlay fixed inset-0 bg-mask-60-1 z-[10000] overflow-hidden"
            :style="{ zIndex: props.overlayZIndex }"
            @click="handleClose"
          >
            <transition name="drawer-slide">
              <div
                v-if="showDrawer"
                class="auth-mobile-drawer absolute right-0 top-0 h-full w-full overflow-y-auto shadow-2xl container_bg"
                @click.stop
              >
                <div class="w-full relative h-50 box-content">
                  <div class="w-full z-10 p-3.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <FoldIconH5
                          class="h-5 w-5 text-text-1 mr-[7px] cursor-pointer"
                          @click="handleNavigateToMenu"
                        />
                        <SmartImage
                          v-if="logoUrl"
                          :src="logoUrl"
                          alt=""
                          class="h-[49px] w-auto object-contain"
                        />
                        <MainLogoIcon v-else class="h-[49px] w-auto text-text-1" />
                      </div>
                      <button
                        class="w-7 h-7 bg-opacity-10 rounded-md flex items-center justify-center"
                        @click="handleClose"
                      >
                        <CloseIcon class="h-2.5 w-2.5 text-text-1" />
                      </button>
                    </div>
                    <div class="relative h-[140px] w-full overflow-hidden">
                      <div
                        v-if="showH5BackgroundSkeleton"
                        class="absolute inset-0 animate-pulse bg-bg-4 rounded-xl"
                      ></div>
                      <img
                        v-if="h5BackgroundImage"
                        :src="h5BackgroundImage"
                        alt=""
                        class="h-full w-full transition-opacity duration-300"
                        :class="showH5BackgroundSkeleton ? 'opacity-0' : 'opacity-100'"
                        @load="handleH5BackgroundLoad"
                        @error="handleH5BackgroundError"
                      />
                    </div>
                  </div>
                </div>

                <div class="px-3.5 pb-6">
                  <!-- <div
                class="flex items-center justify-end gap-2 text-[14px] mb-4 font-[800] text-text-2 cursor-pointer"
              >
                <span>下载App，开启更多精彩</span>
                <ExternalIcon class="w-5 h-5 fill-none" />
              </div> -->

                  <template v-if="activeTab === 'signin'">
                    <div v-if="loginMethodTabs.length > 0" class="flex gap-6 mb-3.5">
                      <button
                        v-for="method in loginMethodTabs"
                        :key="method.key"
                        class="relative min-w-14 pb-1.5 text-base font-[700] font-inter transition-all duration-200 tab-button-new"
                        :class="activeLoginMethod === method.key ? 'text-text-1' : 'text-text-2'"
                        @click="handleSigninMethodClick(method.key, setActiveLoginMethod)"
                      >
                        <span>{{ method.label }}</span>
                        <div
                          v-if="activeLoginMethod === method.key"
                          class="absolute bottom-0 left-0 right-0 h-[3px] bg-theme-primary rounded-[4px]"
                        ></div>
                      </button>
                    </div>
                    <!-- 账号 -->
                    <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
                    <div class="mb-3">
                      <!-- 请输入账号 -->
                      <div ref="signinAreaCodeAnchorRef" class="relative">
                        <KeyIcon
                          v-if="activeLoginMethod === 'username'"
                          class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                        />
                        <div
                          v-if="activeLoginMethod === 'phone'"
                          class="absolute left-4 top-[21px] z-10 -translate-y-1/2"
                        >
                          <button
                            type="button"
                            class="flex items-center gap-1 text-[var(--color-theme-level-1)] text-base font-[700]"
                            @click.stop="toggleSigninAreaCodeDropdown"
                          >
                            <span>{{ getSelectedPhoneAreaCode(signinAreaCode).display }}</span>
                            <XiaIcon
                              class="w-3 h-3 transition-transform duration-200"
                              :class="isSigninAreaCodeDropdownOpen ? 'rotate-180' : ''"
                            />
                          </button>
                        </div>
                        <input
                          :value="
                            activeLoginMethod === 'username'
                              ? formData.signin.usernameAccount
                              : formData.signin.phoneAccount
                          "
                          type="text"
                          :inputmode="activeLoginMethod === 'phone' ? 'numeric' : 'text'"
                          :placeholder="
                            activeLoginMethod === 'username'
                              ? t('common.enter_username')
                              : t('common.enter_account')
                          "
                          class="auth-input-placeholder w-full h-[42px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                          :class="activeLoginMethod === 'phone' ? 'pl-[78px]' : 'pl-[44px]'"
                          @input="
                            activeLoginMethod === 'username'
                              ? handleSigninUsernameInput($event)
                              : handleSigninPhoneInput($event)
                          "
                        />
                      </div>
                    </div>

                    <!-- 密码 -->
                    <div v-if="showSigninPassword" class="text-sm font-[700] text-text-1 mb-2">
                      {{ t('common.password') }}
                    </div>
                    <div v-if="showSigninPassword" class="mb-3">
                      <div class="relative">
                        <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                        <!-- 请输入密码 -->
                        <input
                          :key="`signin-password-${activeLoginMethod}`"
                          :value="formData.signin.password"
                          :type="showPassword.signin ? 'text' : 'password'"
                          :placeholder="t('common.enter_password')"
                          class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-11 bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                          :class="showPassword.signin ? '' : 'auth-password-mask'"
                          @input="handleSigninPasswordInput"
                        />
                        <button
                          type="button"
                          class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                          @click="togglePassword('signin')"
                        >
                          <EyeIcon v-if="showPassword.signin" class="w-5 h-5 text-text-2" />
                          <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                        </button>
                      </div>
                    </div>

                    <!-- 记住我 & 忘记密码 -->
                    <template v-if="showSigninSmsCode">
                      <div class="text-sm font-[700] text-text-1 mb-2">
                        {{ t('common.verification') }}
                      </div>
                      <div class="mb-3">
                        <div class="relative">
                          <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                          <input
                            :value="formData.signin.smsCode"
                            type="text"
                            inputmode="numeric"
                            :placeholder="t('common.enter_verification')"
                            class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[92px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                            @input="handleSigninSmsCodeInput"
                          />
                          <button
                            type="button"
                            class="absolute right-4 top-1/2 -translate-y-1/2 h-7 min-w-[70px] px-2 text-xs font-[500] rounded-lg transition-opacity"
                            :class="
                              countdown > 0
                                ? 'bg-opacity-6 text-text-2 cursor-not-allowed'
                                : 'bg-secondary-3 text-theme-primary'
                            "
                            :disabled="countdown > 0"
                            @click="handleSendCode"
                          >
                            {{ countdown > 0 ? `${countdown}s` : t('common.get_code') }}
                          </button>
                        </div>
                      </div>
                    </template>

                    <template v-if="showSigninCaptcha">
                      <div class="text-sm font-[700] text-text-1 mb-2">
                        {{ t('common.captcha') }}
                      </div>
                      <div class="mb-3">
                        <div class="relative">
                          <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                          <input
                            :value="formData.signin.captchaCode"
                            type="text"
                            :placeholder="t('common.enter_captcha')"
                            class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[108px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                            @input="handleSigninCaptchaInput"
                          />
                          <button
                            type="button"
                            class="absolute right-1 top-1/2 -translate-y-1/2 w-[96px] h-[34px] rounded-md overflow-hidden bg-bg-2 border border-input-2 flex items-center justify-center text-xs text-text-2"
                            @click="refreshSigninCaptcha"
                          >
                            <img
                              v-if="captchaImageUrl"
                              :src="captchaImageUrl"
                              alt=""
                              class="w-full h-full object-cover"
                            />
                            <span v-else>{{
                              isCaptchaLoading ? t('common.loading') : t('common.captcha')
                            }}</span>
                          </button>
                        </div>
                      </div>
                    </template>

                    <div v-if="showSigninPassword" class="flex items-center justify-between">
                      <label
                        class="flex items-center cursor-pointer"
                        @click="handleCheckboxClick('rememberMe')"
                      >
                        <div
                          class="w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center"
                          :class="
                            formData.signin.rememberMe
                              ? 'bg-theme-primary border-theme-primary'
                              : 'bg-transparent border-text-3'
                          "
                        >
                          <CheckIcon
                            v-if="formData.signin.rememberMe"
                            class="w-4 h-4"
                            :class="checkboxAnimating.rememberMe ? 'animate-bounce-forward' : ''"
                          />
                        </div>
                        <!-- 记住我 -->
                        <span class="ml-2 text-sm font-[400] text-text-2">{{
                          t('common.remember_me')
                        }}</span>
                      </label>
                      <!-- 忘记密码 -->
                      <a
                        href="#"
                        class="text-text-2 text-sm font-[400]"
                        @click.prevent="openResetPassword"
                        >{{ t('common.forget_password') }}?</a
                      >
                    </div>

                    <!-- 登录 -->
                    <button
                      class="btn-primary w-full h-[40px] mt-8 rounded-lg text-sm font-[700] text-text-4 transition-all"
                      :class="{ 'opacity-60 cursor-not-allowed': !isSigninValid }"
                      :disabled="!isSigninValid"
                      @click="handleLogin"
                    >
                      {{ t('home.sign_In') }}
                    </button>

                    <div class="text-center text-sm font-[700] text-text-2 mt-6">
                      {{ t('common.no_account') }}
                      <button
                        type="button"
                        class="text-theme-primary"
                        @click="handleAuthTabSwitch('signup')"
                      >
                        {{ t('common.sign_up_now') }}
                      </button>
                    </div>

                    <!-- 以访客身份 -->
                    <div
                      class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer"
                      @click="handleGuestContinue"
                    >
                      {{ t('common.continue') }}
                    </div>
                  </template>

                  <template v-else-if="activeTab === 'signup'">
                    <div v-if="signupMethodTabs.length > 0" class="flex gap-6 mb-3.5">
                      <button
                        v-for="method in signupMethodTabs"
                        :key="method.key"
                        class="relative min-w-14 pb-1.5 text-base font-[700] font-inter transition-all duration-200 tab-button-new"
                        :class="activeSignupMethod === method.key ? 'text-text-1' : 'text-text-2'"
                        @click="handleSignupMethodClick(method.key, setActiveSignupMethod)"
                      >
                        <span>{{ method.label }}</span>
                        <div
                          v-if="activeSignupMethod === method.key"
                          class="absolute bottom-0 left-0 right-0 h-[3px] bg-theme-primary rounded-[4px]"
                        ></div>
                      </button>
                    </div>

                    <!-- 账号 -->
                    <div class="text-sm font-[700] text-text-1 mb-2">{{ t('common.account') }}</div>
                    <div class="mb-3">
                      <!-- 请输入账号 -->
                      <div ref="signupAreaCodeAnchorRef" class="relative">
                        <KeyIcon
                          v-if="activeSignupMethod === 'username'"
                          class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                        />
                        <div
                          v-if="activeSignupMethod === 'phone'"
                          class="absolute left-4 top-[21px] z-10 -translate-y-1/2"
                        >
                          <button
                            type="button"
                            class="flex items-center gap-1 text-[var(--color-theme-level-1)] text-base font-[700]"
                            @click.stop="toggleSignupAreaCodeDropdown"
                          >
                            <span>{{ getSelectedPhoneAreaCode(signupAreaCode).display }}</span>
                            <XiaIcon
                              class="w-3 h-3 transition-transform duration-200"
                              :class="isSignupAreaCodeDropdownOpen ? 'rotate-180' : ''"
                            />
                          </button>
                        </div>
                        <input
                          :value="
                            activeSignupMethod === 'username'
                              ? formData.signup.usernameAccount
                              : formData.signup.phoneAccount
                          "
                          type="text"
                          :inputmode="activeSignupMethod === 'phone' ? 'numeric' : 'text'"
                          :placeholder="
                            activeSignupMethod === 'username'
                              ? t('common.enter_username')
                              : t('common.enter_account')
                          "
                          class="auth-input-placeholder w-full h-[42px] pr-[3px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                          :class="activeSignupMethod === 'phone' ? 'pl-[78px]' : 'pl-[44px]'"
                          @input="
                            activeSignupMethod === 'username'
                              ? handleSignupUsernameInput($event)
                              : handleSignupPhoneInput($event)
                          "
                        />
                      </div>
                    </div>

                    <template v-if="showSignupSmsCode">
                      <!-- 验证码 -->
                      <div class="text-sm font-[700] text-text-1 mb-2">
                        {{ t('common.verification') }}
                      </div>
                      <div class="mb-3">
                        <div class="relative">
                          <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                          <!-- 请输入验证码 -->
                          <input
                            :value="formData.signup.code"
                            type="text"
                            inputmode="numeric"
                            :placeholder="t('common.enter_verification')"
                            class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[92px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                            @input="handleSignupCodeInput"
                          />
                          <!-- 获取验证码 -->
                          <button
                            type="button"
                            class="absolute right-4 top-1/2 -translate-y-1/2 h-7 min-w-[70px] px-2 text-xs font-[500] rounded-lg transition-opacity"
                            :class="
                              countdown > 0
                                ? 'bg-opacity-6 text-text-2 cursor-not-allowed'
                                : 'bg-secondary-3 text-theme-primary'
                            "
                            :disabled="countdown > 0"
                            @click="handleSendCode"
                          >
                            {{ countdown > 0 ? `${countdown}s` : t('common.get_code') }}
                          </button>
                        </div>
                      </div>
                    </template>

                    <template v-if="showSignupCaptcha">
                      <div class="text-sm font-[700] text-text-1 mb-2">
                        {{ t('common.captcha') }}
                      </div>
                      <div class="mb-3">
                        <div class="relative">
                          <SafeIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                          <input
                            :value="formData.signup.captchaCode"
                            type="text"
                            :placeholder="t('common.enter_captcha')"
                            class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[108px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                            @input="handleSignupCaptchaInput"
                          />
                          <button
                            type="button"
                            class="absolute right-1 top-1/2 -translate-y-1/2 w-[96px] h-[34px] rounded-md overflow-hidden bg-bg-2 border border-input-2 flex items-center justify-center text-xs text-text-2"
                            @click="refreshSignupCaptcha"
                          >
                            <img
                              v-if="captchaImageUrl"
                              :src="captchaImageUrl"
                              alt=""
                              class="w-full h-full object-cover"
                            />
                            <span v-else>{{
                              isCaptchaLoading ? t('common.loading') : t('common.captcha')
                            }}</span>
                          </button>
                        </div>
                      </div>
                    </template>

                    <template v-if="showSignupPassword">
                      <!-- 密码 -->
                      <div class="text-sm font-[700] text-text-1 mb-2">
                        {{ t('common.password') }}
                      </div>
                      <div class="mb-3">
                        <div class="relative">
                          <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                          <!-- 请输入密码 -->
                          <input
                            :value="formData.signup.password"
                            :type="showPassword.signup ? 'text' : 'password'"
                            :placeholder="t('common.enter_password')"
                            class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-11 bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                            :class="showPassword.signup ? '' : 'auth-password-mask'"
                            @input="handleSignupPasswordInput"
                          />
                          <button
                            type="button"
                            class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                            @click="togglePassword('signup')"
                          >
                            <EyeIcon v-if="showPassword.signup" class="w-5 h-5 text-text-2" />
                            <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                          </button>
                        </div>
                      </div>

                      <!-- 确认密码 -->
                      <div class="text-sm font-[700] text-text-1 mb-2">
                        {{ t('common.confirm_password') }}
                      </div>
                      <div class="mb-3">
                        <div class="relative">
                          <PasswordIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                          <!-- 请输入确认密码 -->
                          <input
                            :value="formData.signup.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            :placeholder="t('common.enter_confirm_password')"
                            class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-11 bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                            :class="showConfirmPassword ? '' : 'auth-password-mask'"
                            @input="handleSignupConfirmPasswordInput"
                          />
                          <button
                            type="button"
                            class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                            @click="toggleConfirmPassword"
                          >
                            <EyeIcon v-if="showConfirmPassword" class="w-5 h-5 text-text-2" />
                            <EyeOffIcon v-else class="w-5 h-5 text-text-2" />
                          </button>
                        </div>
                      </div>
                    </template>

                    <div v-if="showSignupInvitationCode" class="mb-8">
                      <div class="text-sm font-[700] text-text-1 mb-2">
                        {{ t('common.invitation_code') }}
                      </div>
                      <div class="relative">
                        <InviteIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                        <input
                          :value="formData.signup.invitationCode"
                          type="text"
                          inputmode="numeric"
                          :placeholder="t('common.enter_invitation_code')"
                          class="auth-input-placeholder w-full h-[42px] pl-[44px] pr-[3px] bg-input-3 border border-input-2 rounded-lg text-text-1 text-sm font-[700] focus:outline-none focus:border-theme-primary placeholder:text-text-3 placeholder:text-sm placeholder:font-[400]"
                          @input="handleSignupInvitationCodeInput"
                        />
                      </div>
                    </div>

                    <!-- 注册按钮 -->
                    <button
                      class="btn-primary w-full h-[40px] rounded-lg text-sm font-[700] text-text-4 transition-all"
                      :class="{ 'opacity-60 cursor-not-allowed': !isSignupValid }"
                      :disabled="!isSignupValid"
                      @click="handleRegister"
                    >
                      <!-- 注册 -->
                      {{ t('home.sign_Up') }}
                    </button>

                    <div class="text-center text-sm font-[700] text-text-2 mt-6">
                      {{ t('common.have_account') }}
                      <button
                        type="button"
                        class="text-theme-primary"
                        @click="handleAuthTabSwitch('signin')"
                      >
                        {{ t('common.log_in_now') }}
                      </button>
                    </div>

                    <!-- 以访客身份 -->
                    <div
                      class="text-center text-sm font-[700] text-theme-primary mt-6 cursor-pointer"
                      @click="handleGuestContinue"
                    >
                      {{ t('common.continue') }}
                    </div>
                  </template>

                  <!-- 第三方登录 -->
                  <!-- <div class="mt-6">
                <SocialLogin :show-key-login="true" />
              </div> -->
                </div>
                <Teleport to="body">
                  <transition name="area-code-mask">
                    <div
                      v-if="isAnyAreaCodeSheetOpen"
                      class="fixed inset-0 z-[10020] bg-mask-60-1"
                      @click="closeAllAreaCodeSheets"
                    />
                  </transition>

                  <transition name="area-code-sheet">
                    <div
                      v-if="isSigninAreaCodeDropdownOpen"
                      ref="signinAreaCodePopupRef"
                      class="fixed bottom-0 left-0 z-[10021] w-full"
                    >
                      <div
                        class="area-code-sheet-panel flex h-[60vh] flex-col rounded-t-xl bg-bg-5 p-3"
                      >
                        <div class="mb-2 text-center text-base font-[700] text-text-1">
                          {{ t('common.select_country') }}
                        </div>
                        <div class="relative mb-2 shrink-0">
                          <SearchIcon
                            class="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-icon-3"
                          />
                          <input
                            v-model="signinAreaCodeSearchKeyword"
                            type="text"
                            :placeholder="t('common.search_country')"
                            class="auth-input-placeholder h-10 w-full rounded-[12px] border border-opacity-10 bg-opacity-6 pl-11 pr-3 text-sm font-[400] text-text-1 outline-none transition-colors focus:border-theme-primary placeholder:text-text-3"
                            @click.stop
                          />
                        </div>
                        <div class="min-h-0 flex-1 space-y-2 overflow-y-auto">
                          <button
                            v-for="option in filteredPhoneAreaCodeOptions"
                            :key="option.code"
                            type="button"
                            class="flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm font-[400] text-text-1 transition-colors"
                            :class="
                              option.code === signinAreaCode
                                ? 'bg-bg-3 font-[700]'
                                : 'hover:bg-opacity-6'
                            "
                            @click.stop="handleSigninAreaCodeSelect(option.code, setSigninAreaCode)"
                          >
                            <span>{{ option.country }} ({{ option.display }})</span>
                            <SelectedIcon
                              v-if="option.code === signinAreaCode"
                              class="h-4 w-4 text-theme-primary"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </transition>

                  <transition name="area-code-sheet">
                    <div
                      v-if="isSignupAreaCodeDropdownOpen"
                      ref="signupAreaCodePopupRef"
                      class="fixed bottom-0 left-0 z-[10021] w-full"
                    >
                      <div
                        class="area-code-sheet-panel flex h-[60vh] flex-col rounded-t-xl bg-bg-5 p-3"
                      >
                        <div class="mb-2 text-center text-base font-[700] text-text-1">
                          {{ t('common.select_country') }}
                        </div>
                        <div class="relative mb-2 shrink-0">
                          <SearchIcon
                            class="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-icon-3"
                          />
                          <input
                            v-model="signupAreaCodeSearchKeyword"
                            type="text"
                            :placeholder="t('common.search_country')"
                            class="auth-input-placeholder h-10 w-full rounded-[12px] border border-opacity-10 bg-opacity-6 pl-11 pr-3 text-sm font-[400] text-text-1 outline-none transition-colors focus:border-theme-primary placeholder:text-text-3"
                            @click.stop
                          />
                        </div>
                        <div class="min-h-0 flex-1 space-y-2 overflow-y-auto">
                          <button
                            v-for="option in filteredSignupPhoneAreaCodeOptions"
                            :key="option.code"
                            type="button"
                            class="flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm font-[400] text-text-1 transition-colors"
                            :class="
                              option.code === signupAreaCode
                                ? 'bg-bg-3 font-[700]'
                                : 'hover:bg-opacity-6'
                            "
                            @click.stop="handleSignupAreaCodeSelect(option.code, setSignupAreaCode)"
                          >
                            <span>{{ option.country }} ({{ option.display }})</span>
                            <SelectedIcon
                              v-if="option.code === signupAreaCode"
                              class="h-4 w-4 text-theme-primary"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </transition>
                </Teleport>
              </div>
            </transition>
          </div>
        </transition>
      </teleport>
    </template>
  </LoginRegisterFormCore>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import CloseIcon from '@/static/svg/close.svg?component'
import EyeIcon from '@/static/svg/login/eye.svg?component'
import EyeOffIcon from '@/static/svg/login/eye-off.svg?component'
import SafeIcon from '@/static/svg/login/safe.svg?skipsvgo'
import PasswordIcon from '@/static/svg/login/password.svg?skipsvgo'
import CheckIcon from '@/static/svg/login/check.svg?skipsvgo'
import KeyIcon from '@/static/svg/login/key.svg?skipsvgo'
import InviteIcon from '@/static/svg/login/yaoqing.svg?skipsvgo'
import XiaIcon from '@/static/svg/login/xia.svg?skipsvgo'
import SearchIcon from '@/static/svg/login/sousuo.svg?skipsvgo'
import SelectedIcon from '@/static/svg/login/selected.svg?skipsvgo'
import MainLogoIcon from '@/static/svg/main-logo.svg?component'
import { getPhoneAreaCodeOption, getPhoneAreaCodeOptions } from '@/utils/phone-input'
import LoginRegisterFormCore from './LoginRegisterFormCore.vue'
import { useI18n } from 'vue-i18n'
import FoldIconH5 from '@/static/svg/foldH5.svg?component'
import { navigateTo } from '@/utils/router'
import type { LoginSetResult } from '@/api/interface/login_register'

const { t } = useI18n()
interface Props {
  visible: boolean
  defaultTab?: 'signin' | 'signup'
  loginSetting?: LoginSetResult | null
  logoUrl?: string
  backgroundImageUrl?: string
  backgroundLoading?: boolean
  overlayZIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'signin',
  loginSetting: null,
  overlayZIndex: 10000
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'open-reset-password': []
  'switch-tab': [tab: 'signin' | 'signup']
}>()

const showDrawer = ref(false)
const loginFormRef = ref<InstanceType<typeof LoginRegisterFormCore> | null>(null)
const isH5BackgroundLoaded = ref(false)
const isSigninAreaCodeDropdownOpen = ref(false)
const isSignupAreaCodeDropdownOpen = ref(false)
const signinAreaCodeAnchorRef = ref<HTMLElement | null>(null)
const signupAreaCodeAnchorRef = ref<HTMLElement | null>(null)
const signinAreaCodePopupRef = ref<HTMLElement | null>(null)
const signupAreaCodePopupRef = ref<HTMLElement | null>(null)
const signinAreaCodeSearchKeyword = ref('')
const signupAreaCodeSearchKeyword = ref('')
const phoneAreaCodeOptions = getPhoneAreaCodeOptions()

const isAnyAreaCodeSheetOpen = computed(() => {
  return isSigninAreaCodeDropdownOpen.value || isSignupAreaCodeDropdownOpen.value
})

const filteredPhoneAreaCodeOptions = computed(() => {
  const keyword = signinAreaCodeSearchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return phoneAreaCodeOptions
  }

  return phoneAreaCodeOptions.filter(option => option.searchText.includes(keyword))
})

const filteredSignupPhoneAreaCodeOptions = computed(() => {
  const keyword = signupAreaCodeSearchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return phoneAreaCodeOptions
  }

  return phoneAreaCodeOptions.filter(option => option.searchText.includes(keyword))
})

usePageScrollLock(() => props.visible)

// 登录/注册弹窗背景图
const h5BackgroundImage = computed(() => {
  return props.backgroundImageUrl
})

const showH5BackgroundSkeleton = computed(() => {
  return (
    (!h5BackgroundImage.value && !!props.backgroundLoading) ||
    (!!h5BackgroundImage.value && !isH5BackgroundLoaded.value)
  )
})

watch(
  () => h5BackgroundImage.value,
  () => {
    isH5BackgroundLoaded.value = false
  },
  { immediate: true }
)

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      isH5BackgroundLoaded.value = false
      loginFormRef.value?.resetForm()
      await nextTick()
      setTimeout(() => {
        showDrawer.value = true
      }, 50)
    } else {
      showDrawer.value = false
    }
  },
  { immediate: true }
)

const handleH5BackgroundLoad = () => {
  isH5BackgroundLoaded.value = true
}

const handleH5BackgroundError = () => {
  isH5BackgroundLoaded.value = true
}

/**
 * 获取当前选中的手机号区号配置。
 */
const getSelectedPhoneAreaCode = (areaCode?: string) => {
  return getPhoneAreaCodeOption(areaCode)
}

/**
 * 展开或收起登录手机号区号底部弹窗。
 */
const toggleSigninAreaCodeDropdown = () => {
  isSigninAreaCodeDropdownOpen.value = !isSigninAreaCodeDropdownOpen.value
  isSignupAreaCodeDropdownOpen.value = false
}

/**
 * 关闭登录手机号区号底部弹窗。
 */
const closeSigninAreaCodeDropdown = () => {
  isSigninAreaCodeDropdownOpen.value = false
}

/**
 * 展开或收起注册手机号区号底部弹窗。
 */
const toggleSignupAreaCodeDropdown = () => {
  isSignupAreaCodeDropdownOpen.value = !isSignupAreaCodeDropdownOpen.value
  isSigninAreaCodeDropdownOpen.value = false
}

/**
 * 关闭注册手机号区号底部弹窗。
 */
const closeSignupAreaCodeDropdown = () => {
  isSignupAreaCodeDropdownOpen.value = false
}

/**
 * 关闭所有手机号区号底部弹窗。
 */
const closeAllAreaCodeSheets = () => {
  closeSigninAreaCodeDropdown()
  closeSignupAreaCodeDropdown()
}

/**
 * 选择登录手机号区号，并收起底部弹窗。
 */
const handleSigninAreaCodeSelect = (
  areaCode: string,
  setSigninAreaCode: (areaCode: string) => void
) => {
  setSigninAreaCode(areaCode)
  signinAreaCodeSearchKeyword.value = ''
  closeSigninAreaCodeDropdown()
}

/**
 * 选择注册手机号区号，并收起底部弹窗。
 */
const handleSignupAreaCodeSelect = (
  areaCode: string,
  setSignupAreaCode: (areaCode: string) => void
) => {
  setSignupAreaCode(areaCode)
  signupAreaCodeSearchKeyword.value = ''
  closeSignupAreaCodeDropdown()
}

/**
 * 切换登录方式，并收起手机号区号底部弹窗。
 */
const handleSigninMethodClick = (
  method: string,
  setActiveLoginMethod: (method: string) => void
) => {
  setActiveLoginMethod(method)
  signinAreaCodeSearchKeyword.value = ''
  closeSigninAreaCodeDropdown()
}

/**
 * 切换注册方式，并收起手机号区号底部弹窗。
 */
const handleSignupMethodClick = (
  method: string,
  setActiveSignupMethod: (method: string) => void
) => {
  setActiveSignupMethod(method)
  signupAreaCodeSearchKeyword.value = ''
  closeSignupAreaCodeDropdown()
}

/**
 * H5 登录/注册互相切换时交给外层切换独立抽屉，保持和忘记密码一致的动画。
 */
const handleAuthTabSwitch = (tab: 'signin' | 'signup') => {
  closeAllAreaCodeSheets()
  emit('switch-tab', tab)
}

/**
 * 关闭 H5 登录/注册页并重置表单状态。
 */
const handleClose = () => {
  showDrawer.value = false
  closeAllAreaCodeSheets()
  setTimeout(() => {
    loginFormRef.value?.resetForm()
    emit('update:visible', false)
  }, 350)
}

/**
 * 关闭 H5 登录/注册页并跳转到菜单页。
 */
const handleNavigateToMenu = () => {
  showDrawer.value = false
  closeAllAreaCodeSheets()
  setTimeout(() => {
    loginFormRef.value?.resetForm()
    emit('update:visible', false)
    void navigateTo('/menu')
  }, 350)
}

/**
 * 以访客身份继续时关闭当前弹窗。
 */
const handleGuestContinue = () => {
  closeAllAreaCodeSheets()
  handleClose()
}

/**
 * 注册成功后关闭 H5 注册页。
 */
const handleRegisterSuccess = () => {
  closeAllAreaCodeSheets()
  handleClose()
}

/**
 * 登录成功后关闭 H5 登录页并刷新页面状态。
 */
const handleLoginSuccess = () => {
  closeAllAreaCodeSheets()
  handleClose()
  window.location.reload()
}
</script>

<style scoped lang="scss">
.tab-button-new {
  position: relative;

  &:active {
    transform: scale(0.98);
  }
}

@keyframes bounceForward {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.animate-bounce-forward {
  animation: bounceForward 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

// 遮罩层淡入淡出动画
.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

.drawer-mask-enter-to,
.drawer-mask-leave-from {
  opacity: 1;
}

// 抽屉滑动动画 - 从右往左滑入，从左往右滑出
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}

.auth-mobile-overlay {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
}

.auth-mobile-drawer {
  overscroll-behavior: contain;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.area-code-sheet-panel {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

.area-code-mask-enter-active,
.area-code-mask-leave-active {
  transition: opacity 0.25s ease;
}

.area-code-mask-enter-from,
.area-code-mask-leave-to {
  opacity: 0;
}

.area-code-mask-enter-to,
.area-code-mask-leave-from {
  opacity: 1;
}

.area-code-sheet-enter-active,
.area-code-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-code-sheet-enter-from,
.area-code-sheet-leave-to {
  transform: translateY(100%);
}

.area-code-sheet-enter-to,
.area-code-sheet-leave-from {
  transform: translateY(0);
}

.container_bg {
  background:
    radial-gradient(
      102.8% 51.58% at 100% 0%,
      rgba(35, 238, 136, 0.06) 0%,
      rgba(35, 238, 136, 0) 100%
    ),
    var(--color-background-level-1, #242626);
}
</style>
