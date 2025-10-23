<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <div class="flex items-center gap-3 rounded-2xl border border-sand-100 bg-sand-50/70 px-4 py-3">
      <UIcon name="i-heroicons-calendar-days" class="h-6 w-6 text-primary-500" />
      <div>
        <p class="text-xs uppercase tracking-wide text-sand-400">Departure</p>
        <p class="font-semibold text-sand-900">{{ departureDate }}</p>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-2xl border border-sand-100 bg-sand-50/70 px-4 py-3">
      <UIcon name="i-heroicons-flag" class="h-6 w-6 text-primary-500" />
      <div>
        <p class="text-xs uppercase tracking-wide text-sand-400">Return</p>
        <p class="font-semibold text-sand-900">{{ returnDate }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  departureDate: string
  returnDate: string
}

defineProps<Props>()
</script>
