<template>
  <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
    <div class="space-y-2">
      <h2 class="text-3xl font-semibold tracking-tight text-sand-900">{{ title }}</h2>
      <p class="max-w-2xl text-sand-600">
        {{ subtitle }}
      </p>
    </div>
    <div class="flex gap-3">
      <UButton color="primary" variant="soft" icon="i-heroicons-sparkles">
        Filter experiences
      </UButton>
      <UButton color="primary" variant="ghost" icon="i-heroicons-arrow-path">
        Suggest a tour
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>
