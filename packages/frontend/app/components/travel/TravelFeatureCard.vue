<template>
  <div class="relative">
    <div class="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-white/15 blur-2xl" />
    <UCard
      class="relative overflow-hidden rounded-3xl border border-white/20 bg-white/95 text-primary-700 shadow-xl backdrop-blur"
      :ui="{ body: 'p-8 space-y-6' }"
    >
      <div class="space-y-4 text-primary-700/90">
        <div class="flex items-center gap-3 text-primary-500">
          <UIcon name="i-heroicons-sparkles" class="h-6 w-6" />
          <p class="text-sm font-medium uppercase tracking-wide">
            {{ title }}
          </p>
        </div>
        <p class="text-base text-primary-700/90">
          {{ description }}
        </p>
      </div>

      <UDivider />

      <div class="grid gap-4 text-sm text-primary-700">
        <div v-for="feature in features" :key="feature.title" class="flex items-start gap-3">
          <UIcon :name="feature.icon" class="mt-1 h-5 w-5 text-primary-500" />
          <div>
            <p class="font-medium">{{ feature.title }}</p>
            <p class="text-primary-600/80">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
type Feature = {
  icon: string
  title: string
  description: string
}

type Props = {
  title: string
  description: string
  features: Feature[]
}

defineProps<Props>()
</script>
