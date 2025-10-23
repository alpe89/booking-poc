<template>
  <ul class="flex flex-wrap gap-6 text-sm text-white/80">
    <li v-for="stat in stats" :key="stat.title" class="flex flex-col">
      <span class="text-2xl font-semibold text-white">{{ stat.value }}</span>
      <span>{{ stat.title }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
type Stat = {
  title: string
  value: string
}

type Props = {
  stats: Stat[]
}

defineProps<Props>()
</script>
