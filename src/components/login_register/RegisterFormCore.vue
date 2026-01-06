<template>
  <slot
    :show-password="showPassword"
    :show-promo-code="showPromoCode"
    :form-data="formData"
    :checkbox-animating="checkboxAnimating"
    :toggle-password="togglePassword"
    :toggle-promo-code="togglePromoCode"
    :handle-checkbox-click="handleCheckboxClick"
    :handle-register="handleRegister"
    :switch-to-login="switchToLogin"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'switch-to-login': []
}>()

const showPassword = ref(false)
const showPromoCode = ref(false)

const formData = ref({
  username: '',
  displayName: '',
  password: '',
  promoCode: '',
  agreeTerms: false,
  receiveMarketing: false
})

const checkboxAnimating = ref({
  agreeTerms: false,
  receiveMarketing: false
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const togglePromoCode = () => {
  showPromoCode.value = !showPromoCode.value
}

const handleCheckboxClick = (field: 'agreeTerms' | 'receiveMarketing') => {
  const willBeChecked = !formData.value[field]

  if (willBeChecked) {
    checkboxAnimating.value[field] = true
    formData.value[field] = true

    setTimeout(() => {
      checkboxAnimating.value[field] = false
    }, 300)
  } else {
    checkboxAnimating.value[field] = true
    setTimeout(() => {
      formData.value[field] = false
      checkboxAnimating.value[field] = false
    }, 150)
  }
}

const handleRegister = async () => {
  console.log('注册:', formData.value)
}

const switchToLogin = () => {
  emit('switch-to-login')
}

defineExpose({
  formData,
  showPassword,
  showPromoCode,
  checkboxAnimating,
  togglePassword,
  togglePromoCode,
  handleCheckboxClick,
  handleRegister
})
</script>

