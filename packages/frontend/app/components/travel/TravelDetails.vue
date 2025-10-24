<template>
  <section class="space-y-10">
    <UCard
      class="bg-white/90 border border-sand-100/80 shadow-xl rounded-3xl"
      :ui="{ body: 'p-8 space-y-8' }"
    >
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold text-sand-900">
          {{ title }}
        </h2>
        <p class="leading-relaxed text-sand-600">
          {{ travel.description }}
        </p>
      </div>

      <USeparator />

      <TravelDateInfo :departure-date="formattedDepartureDate" :return-date="formattedReturnDate" />

      <USeparator />

      <TravelMoodList :title="moodTitle" :moods="moodEntries" />
    </UCard>

    <TravelIncludedCard :title="includedTitle" :items="includedItems" />
  </section>
</template>

<script setup lang="ts">
import type { TravelSerialized } from '@booking/shared'

type Props = {
  travel: TravelSerialized
  title?: string
  moodTitle?: string
  includedTitle?: string
  includedItems?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: "Why you'll love this trip",
  moodTitle: 'Travel mood',
  includedTitle: "What's included",
  includedItems: () => [
    'Internal transportation, selected accommodations and immersive activities.',
    'Local travel coach always with the group.',
    'Pre-departure support and dedicated participant group.',
  ],
})

const { formatDate } = useFormatters()
const { getMoodEntries } = useMoods()

const moodEntries = computed(() => getMoodEntries(props.travel.moods))

const formattedDepartureDate = computed(() => formatDate(props.travel.startingDate))
const formattedReturnDate = computed(() => formatDate(props.travel.endingDate))
</script>
