<template>
  <div class="space-y-16 pb-20">
    <HomeHeroSection
      title="Transform every journey into an unforgettable memory"
      subtitle="We select the best destinations, take care of every logistical detail, and support you with local experts to experience the essence of each location."
      :stats="heroStats"
      highlight-card-title="Upcoming scheduled tours"
      :highlights="travelHighlights"
      highlight-card-footer="Guaranteed departures with selected groups and certified tour leaders"
    />

    <UContainer>
      <TravelListHeader
        title="Curated itineraries for you"
        subtitle="From iconic destinations to authentic places, explore carefully crafted proposals that balance adventure, culture, and relaxation."
      />

      <UCard v-if="pending" class="mt-10 flex justify-center bg-white/70 py-12">
        <div class="flex items-center gap-3 text-sand-600">
          <USkeleton class="h-12 w-12 rounded-full" />
          <span>Loading the best destinations...</span>
        </div>
      </UCard>

      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="primary"
        variant="soft"
        :title="error.message"
        class="mt-10"
      />

      <div v-else-if="data" class="mt-10 space-y-10">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <TravelCard v-for="travel in data.data" :key="travel.id" :travel="travel" />
        </div>

        <div v-if="data.meta.total > data.meta.limit" class="flex flex-col items-center gap-3">
          <UPagination
            v-model="currentPage"
            :page-count="data.meta.limit"
            :total="data.meta.total"
            :ui="{ root: 'gap-2' }"
          />
          <p class="text-sm text-sand-500">Page {{ currentPage }} of {{ totalPages }}</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { PAGINATION_CONFIG } from '~/config/pagination'

const api = useApi()
const currentPage = ref(1)
const pageLimit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE

const { data, pending, error } = await useAsyncData(
  'travels',
  () => api.travels.list({ page: currentPage.value, limit: pageLimit }),
  { watch: [currentPage] }
)

const heroStats = [
  { title: 'Trips organized across 5 continents', value: '120+' },
  { title: 'Certified travel coaches', value: '250' },
  { title: 'Satisfaction rate', value: '97%' },
]

const travelHighlights = [
  {
    tag: 'New departure',
    title: 'Morocco Essential',
    subtitle: 'Merzouga dunes, Marrakech by night and Berber villages',
    duration: '8 days',
  },
  {
    tag: 'Best seller',
    title: 'Iceland on the road',
    subtitle: 'Geysers, waterfalls and northern lights along the ring road',
    duration: '7 days',
  },
  {
    tag: 'Only 4 seats',
    title: 'Vietnam Explorer',
    subtitle: 'Street food tour, Halong cruise and Sapa trekking',
    duration: '12 days',
  },
]

const totalPages = computed(() => {
  if (!data.value) {
    return 1
  }
  return Math.ceil(data.value.meta.total / data.value.meta.limit)
})
</script>
