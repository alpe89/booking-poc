<template>
  <UCard
    class="bg-white/90 border border-sand-100/80 shadow-xl rounded-3xl"
    :ui="{ body: 'p-8 space-y-6' }"
  >
    <h3 class="text-xl font-semibold text-sand-900">{{ title }}</h3>
    <ul class="space-y-3 text-sand-600">
      <li v-for="(item, index) in items" :key="index" class="flex items-start gap-3">
        <UIcon name="i-heroicons-check-circle" class="mt-0.5 h-5 w-5 text-primary-500" />
        {{ item }}
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  title: string
  items: string[]
}

defineProps<Props>()
</script>
