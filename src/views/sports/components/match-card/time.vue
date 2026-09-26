<template>
  <span :title="label">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { SportsMatch } from '../../shared/types'
import { matchTimeKey } from '../../composables/useMatchTime'

const props = defineProps<{ match: SportsMatch }>()
const getTime = inject(matchTimeKey, match => match.phase || match.kickoff)
const label = computed(() => getTime(props.match))
</script>
