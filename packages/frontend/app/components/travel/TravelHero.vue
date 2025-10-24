<template>
  <section
    class="relative isolate overflow-hidden bg-linear-to-br from-primary-500 via-primary-400 to-primary-600 text-white"
  >
    <div
      class="absolute inset-0 mix-blend-soft-light"
      style="
        background-image:
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 60%),
          radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.18), transparent 55%),
          radial-gradient(circle at 50% 85%, rgba(255, 255, 255, 0.12), transparent 50%);
      "
    />
    <UContainer class="relative z-10 py-14 sm:py-16">
      <div class="flex flex-wrap items-center gap-4 text-sm text-white/80">
        <UButton
          icon="i-heroicons-arrow-left"
          color="neutral"
          variant="ghost"
          class="text-white/85 hover:text-white"
          @click="navigateTo('/')"
        >
          Back to travels
        </UButton>
        <span class="hidden h-1 w-12 rounded-full bg-white/50 sm:block" />
        <span class="hidden sm:block">{{ heroSummary.duration }} tour</span>
      </div>

      <div class="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div class="space-y-6">
          <div class="space-y-4">
            <UBadge color="neutral" variant="soft" class="bg-white/20 text-white backdrop-blur-sm">
              {{ heroSummary.tagline }}
            </UBadge>
            <h1 class="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {{ travel.name }}
            </h1>
          </div>

          <div class="flex flex-wrap gap-4 text-sm text-white/85">
            <TravelInfoPill icon="i-heroicons-calendar-days" :text="dateRangeText" />
            <TravelInfoPill icon="i-heroicons-user-group" :text="seatSummary" />
            <TravelInfoPill icon="i-heroicons-currency-euro" :text="priceText" />
          </div>

          <div class="flex flex-wrap gap-3 pt-2">
            <UBadge
              v-for="mood in topMoods"
              :key="mood.mood"
              color="neutral"
              variant="soft"
              class="bg-white/15 text-white backdrop-blur-sm"
            >
              {{ mood.mood }} {{ mood.value }}%
            </UBadge>
          </div>
        </div>

        <TravelFeatureCard
          :title="featureCardTitle"
          :description="featureCardDescription"
          :features="features"
        />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import type { TravelSerialized } from '@booking/shared'

type Feature = {
  icon: string
  title: string
  description: string
}

type Props = {
  travel: TravelSerialized
  availableSeats: number
  featureCardTitle?: string
  featureCardDescription?: string
  features?: Feature[]
}

const props = withDefaults(defineProps<Props>(), {
  featureCardTitle: 'What awaits you on this journey',
  featureCardDescription:
    'Selected groups, certified travel coach and logistics handled in every detail. Experience a shared adventure worry-free.',
  features: () => [
    {
      icon: 'i-heroicons-user-group',
      title: 'Small groups',
      description: 'Max 14 people to fully experience every moment',
    },
    {
      icon: 'i-heroicons-map-pin',
      title: 'Local travel coach',
      description: 'Expert guides to discover hidden sides of the destination',
    },
    {
      icon: 'i-heroicons-heart',
      title: 'Balanced itinerary',
      description: 'Adventure, culture and relaxation in a perfect mix',
    },
  ],
})

const { formatDate, formatPrice, formatDuration } = useFormatters()
const { getMoodEntries, getTripTagline } = useMoods()

const isSoldOut = computed(() => props.availableSeats <= 0)

const moodEntries = computed(() => getMoodEntries(props.travel.moods))

const topMoods = computed(() =>
  moodEntries.value
    .slice()
    .sort(
      (a: { mood: string; value: number }, b: { mood: string; value: number }) => b.value - a.value
    )
    .slice(0, 3)
)

const heroSummary = computed(() => ({
  tagline: getTripTagline(props.travel.startingDate, props.travel.endingDate),
  duration: formatDuration(props.travel.startingDate, props.travel.endingDate),
  excerpt: props.travel.description.split('\n')[0],
}))

const seatSummary = computed(() => {
  if (isSoldOut.value) {
    return 'Trip fully booked'
  }
  return `${props.availableSeats} seats still available`
})

const dateRangeText = computed(
  () => `${formatDate(props.travel.startingDate)} – ${formatDate(props.travel.endingDate)}`
)

const priceText = computed(() => `${formatPrice(props.travel.price)} per person`)
</script>
