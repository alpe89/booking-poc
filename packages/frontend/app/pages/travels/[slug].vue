<template>
  <div class="space-y-16 pb-20">
    <UContainer v-if="pending" class="py-16">
      <div class="space-y-6">
        <USkeleton class="h-6 w-48 rounded-full" />
        <USkeleton class="h-12 w-2/3" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
      </div>
    </UContainer>

    <UContainer v-else-if="error" class="py-16">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        variant="soft"
        color="primary"
        :title="error.message"
      />
    </UContainer>

    <template v-else-if="travel">
      <TravelHero
        :travel="travel"
        :available-seats="availableSeats"
      />

      <UContainer class="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TravelDetails :travel="travel" />

        <aside class="lg:sticky lg:top-24">
          <BookingForm
            :travel-id="travel.id"
            :price-per-seat="travel.price"
            :available-seats="availableSeats"
            handle-api-call
            @success="handleBookingSuccess"
          />
        </aside>
      </UContainer>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse, BookingSerialized, BookingReserveMeta } from "@booking/shared";

const route = useRoute();
const api = useApi();

const slug = route.params.slug as string;

const { data, pending, error } = await useAsyncData(`travel-${slug}`, () =>
  api.travels.getBySlug(slug)
);

const travel = computed(() => data.value?.data);
const availableSeats = computed(() => data.value?.meta?.availableSeats ?? 0);

const handleBookingSuccess = async (response: ApiResponse<BookingSerialized, BookingReserveMeta>) => {
  await navigateTo(`/bookings/${response.data.id}`);
};
</script>
