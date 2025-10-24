<template>
  <div class="relative">
    <div class="absolute inset-0 -translate-x-6 translate-y-6 rounded-3xl bg-white/15 blur-2xl" />
    <UCard
      class="relative overflow-hidden rounded-3xl border border-white/20 bg-white/90 text-primary-700 shadow-xl backdrop-blur"
    >
      <div class="space-y-6 p-8">
        <h2 class="text-2xl font-semibold">{{ title }}</h2>
        <div class="space-y-4">
          <div
            v-for="highlight in highlights"
            :key="highlight.title"
            class="rounded-2xl border border-primary-100/80 bg-primary-50/80 px-5 py-4 shadow-sm"
          >
            <div class="flex items-center justify-between text-primary-600">
              <span class="text-sm font-medium uppercase tracking-wide">{{ highlight.tag }}</span>
              <span class="text-xs font-semibold">{{ highlight.duration }}</span>
            </div>
            <p class="mt-2 text-lg font-semibold text-primary-700">
              {{ highlight.title }}
            </p>
            <p class="text-sm text-primary-600/80">{{ highlight.subtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-sm text-primary-700/80">
          <UIcon name="i-heroicons-sparkles" class="h-5 w-5" />
          {{ footer }}
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
type Highlight = {
  tag: string
  title: string
  subtitle: string
  duration: string
}

type Props = {
  title: string
  highlights: Highlight[]
  footer: string
}

defineProps<Props>()
</script>
