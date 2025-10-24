<template>
  <UCard class="bg-white">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-sand-900">Booking</h2>
        <UBadge
          :color="isSoldOut ? 'error' : limitedStock ? 'warning' : 'success'"
          variant="soft"
          size="lg"
        >
          {{
            isSoldOut ? "Sold out" : limitedStock ? "Last seats" : "Available"
          }}
        </UBadge>
      </div>

      <UAlert
        v-if="isSoldOut"
        icon="i-heroicons-exclamation-circle"
        color="primary"
        variant="soft"
        title="No seats available"
        description="This trip is fully booked. Check other available dates or explore our other destinations."
      />
    </template>

    <template v-if="!isSoldOut">
      <UAlert
        v-if="limitedStock"
        icon="i-heroicons-exclamation-triangle"
        color="primary"
        variant="soft"
        :title="`Only ${availableSeats} seats left!`"
      />
      <div
        v-else
        class="flex items-center gap-2 rounded-lg border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-sand-600"
      >
        <UIcon name="i-heroicons-user-group" class="h-5 w-5 text-primary-600" />
        {{ availableSeats }} seats available
      </div>

      <USeparator class="mt-3" />

      <UForm
        :schema="bookingSchema"
        :state="form"
        class="space-y-5"
        @submit="handleSubmit"
      >
        <div class="my-4">
          <UFormField
            label="Email"
            name="email"
            required
            :ui="{ label: 'text-sand-500 py-1' }"
          >
            <UInput
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              icon="i-heroicons-envelope"
              :disabled="isSubmitting"
              size="lg"
              :ui="{
                root: 'w-full',
                base: 'bg-white/90 border border-sand-100/80 text-sand-500',
              }"
            />
          </UFormField>

          <UFormField
            label="Number of seats"
            name="seats"
            required
            :ui="{ label: 'text-sand-500 py-1' }"
          >
            <UInput
              v-model.number="form.seats"
              type="number"
              color="neutral"
              :min="1"
              :max="maxBookableSeats"
              :disabled="isSubmitting"
              size="lg"
              :ui="{
                base: 'bg-white/90 border border-sand-100/80 text-sand-500',
              }"
            />
            <template #hint>
              <span class="text-xs text-sand-500">
                Up to {{ BOOKING_CONFIG.MAX_SEATS_PER_BOOKING }} seats per
                booking ({{ maxBookableSeats }}
                available)
              </span>
            </template>
          </UFormField>
        </div>

        <USeparator />

        <div class="rounded-lg border border-sand-200 bg-sand-50 px-5 py-4">
          <p class="text-sm text-sand-600">Trip total</p>
          <p class="mt-1 text-3xl font-semibold text-primary-600">
            €{{ totalAmount }}
          </p>
        </div>

        <UButton
          type="submit"
          block
          size="xl"
          color="primary"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          {{ isSubmitting ? "Booking in progress..." : "Book now" }}
        </UButton>
      </UForm>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type {
  ReserveBookingDto,
  ApiResponse,
  BookingSerialized,
  BookingReserveMeta,
} from "@booking/shared";
import { z } from "zod";
import { BOOKING_CONFIG } from "~/config/booking";

type Props = {
  travelId: string;
  pricePerSeat: number;
  availableSeats: number;
  handleApiCall?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  handleApiCall: false,
});

const emit = defineEmits<{
  submit: [data: ReserveBookingDto];
  success: [response: ApiResponse<BookingSerialized, BookingReserveMeta>];
  error: [error: Error];
}>();

const api = useApi();
const toast = useToast();
const { formatPrice } = useFormatters();

const isSubmitting = ref(false);

const form = reactive<ReserveBookingDto>({
  email: "",
  seats: 1,
  travelId: props.travelId,
});

const isSoldOut = computed(() => props.availableSeats <= 0);
const limitedStock = computed(
  () =>
    props.availableSeats > 0 &&
    props.availableSeats <= BOOKING_CONFIG.LOW_STOCK_THRESHOLD
);
const maxBookableSeats = computed(() =>
  Math.max(
    1,
    Math.min(props.availableSeats, BOOKING_CONFIG.MAX_SEATS_PER_BOOKING)
  )
);

// Dynamic validation schema that considers available seats
const bookingSchema = computed(() =>
  z.object({
    email: z.string().email("Invalid email format"),
    seats: z
      .number()
      .int("Seats must be an integer")
      .min(1, "Must reserve at least 1 seat")
      .max(
        maxBookableSeats.value,
        `Cannot reserve more than ${maxBookableSeats.value} seats`
      ),
    travelId: z.string().uuid("Travel ID must be a valid UUID"),
  })
);

const totalAmount = computed(() => {
  return formatPrice(props.pricePerSeat * form.seats).replace("€", "");
});

const handleSubmit = async (event: { data: ReserveBookingDto }) => {
  if (props.handleApiCall) {
    try {
      isSubmitting.value = true;
      const response = await api.bookings.reserve(event.data);

      toast.add({
        title: "Booking confirmed!",
        description: `Your booking expires on ${new Date(
          response.meta.expiresAt
        ).toLocaleString("en-US")}`,
        color: "success",
      });

      emit("success", response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");

      toast.add({
        title: "Booking failed",
        description: error.message,
        color: "error",
      });

      emit("error", error);
    } finally {
      isSubmitting.value = false;
    }
  } else {
    emit("submit", event.data);
  }
};

// Update form travelId when prop changes
watch(
  () => props.travelId,
  (newTravelId) => {
    form.travelId = newTravelId;
  },
  { immediate: true }
);

// Adjust seats when available seats changes
watch(
  () => props.availableSeats,
  (available) => {
    form.seats = Math.min(
      form.seats,
      Math.max(1, Math.min(available, BOOKING_CONFIG.MAX_SEATS_PER_BOOKING))
    );
  },
  { immediate: true }
);
</script>
