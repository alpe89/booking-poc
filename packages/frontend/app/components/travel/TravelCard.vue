<template>
  <UCard
    class="group cursor-pointer transition duration-200 hover:-translate-y-1 bg-white/90 border border-sand-100/80"
    :ui="{ body: 'p-6 space-y-5' }"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-sand-900 group-hover:text-primary-600 transition">
        {{ travel.name }}
      </h3>
      <UBadge color="primary" variant="soft" class="capitalize">
        {{ getPrimaryMoodLabel(travel.moods) }}
      </UBadge>
    </div>

    <p class="line-clamp-3 text-sm leading-relaxed text-sand-600">
      {{ travel.description }}
    </p>

    <div class="flex flex-wrap gap-4 text-sm text-sand-500">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-calendar-days" class="h-5 w-5 text-primary-500" />
        <span>{{ formatDateShort(travel.startingDate) }} – {{ formatDateShort(travel.endingDate) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-sparkles" class="h-5 w-5 text-primary-500" />
        <span>{{ travel.totalSeats }} total seats</span>
      </div>
    </div>

    <div>
      <p class="text-xs uppercase tracking-wide text-sand-400">Travel mood</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <UBadge
          v-for="[mood, value] in getTopMoods(travel.moods, 3)"
          :key="mood"
          variant="soft"
          class="bg-ocean-50 text-ocean-700"
        >
          {{ mood }} {{ value }}%
        </UBadge>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2">
      <div class="text-left">
        <span class="text-xs uppercase tracking-wide text-sand-400">Price per person</span>
        <p class="text-2xl font-semibold text-sand-900">{{ formatPrice(travel.price) }}</p>
      </div>
      <UButton color="primary" variant="soft" trailing-icon="i-heroicons-arrow-right">
        Details
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { TravelSerialized } from '@booking/shared'

type Props = {
  travel: TravelSerialized
}

const props = defineProps<Props>()

const { formatDateShort, formatPrice } = useFormatters()
const { getTopMoods, getPrimaryMoodLabel } = useMoods()

const handleClick = () => {
  navigateTo(`/travels/${props.travel.slug}`)
}
</script>
