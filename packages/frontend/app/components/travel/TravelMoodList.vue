<template>
  <div class="space-y-5">
    <h3 class="text-lg font-semibold text-sand-900">{{ title }}</h3>
    <div class="space-y-3">
      <div
        v-for="mood in moods"
        :key="mood.mood"
        class="rounded-2xl border border-sand-100 bg-sand-50/80 px-4 py-3"
      >
        <div class="flex items-center justify-between text-sm font-medium text-sand-700">
          <span class="capitalize">{{ mood.mood }}</span>
          <span>{{ mood.value }}%</span>
        </div>
        <div class="mt-2 h-2 rounded-full bg-sand-200">
          <div
            class="h-full rounded-full bg-primary-500 transition-all"
            :style="{ width: `${mood.value}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Mood = {
  mood: string
  value: number
}

type Props = {
  title: string
  moods: Mood[]
}

defineProps<Props>()
</script>
