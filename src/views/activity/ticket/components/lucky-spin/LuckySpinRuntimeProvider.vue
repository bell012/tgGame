<script setup lang="ts">
import { REGISTER_LUCKY_SPIN_RUNTIME_KEY } from '../../shell/registerLuckySpinRuntime'
import { useLuckySpinRuntime } from './useLuckySpinRuntime'
import { inject, onUnmounted } from 'vue'

const register = inject(REGISTER_LUCKY_SPIN_RUNTIME_KEY)
const runtime = useLuckySpinRuntime()

register?.(runtime)

onUnmounted(() => {
  register?.(null)
})
</script>
