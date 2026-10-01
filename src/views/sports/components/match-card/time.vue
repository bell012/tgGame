<template>
  <span class="tabular-nums" :title="label">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { SportsMatch } from '../../shared/types'
import { matchTimeKey } from '../../composables/useMatchTime'
import { getMatchDisplayTime } from '../../shared/match'

const props = defineProps<{ match: SportsMatch }>()
const getTime = inject(matchTimeKey, match => getMatchDisplayTime(match, Date.now()))
const label = computed(() => getTime(props.match))
</script>
