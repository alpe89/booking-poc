<template>
  <div>
    <!-- Timer alert for PENDING bookings -->
    <UAlert
      v-if="status === 'PENDING' && remainingTime !== null && remainingTime > 0"
      icon="i-heroicons-clock"
      :color="remainingTime < warningThreshold ? 'warning' : 'neutral'"
      :variant="remainingTime < warningThreshold ? 'solid' : 'outline'"
    >
      <template #title> Reservation expires in {{ formattedTime }} </template>
      <template #description>
        Complete your payment before the reservation expires
      </template>
    </UAlert>

    <!-- EXPIRED alert -->
    <UAlert
      v-else-if="status === 'EXPIRED'"
      icon="i-heroicons-exclamation-circle"
      color="error"
      variant="solid"
      title="Reservation expired"
      description="This booking has expired. Please make a new reservation."
    />

    <!-- CONFIRMED alert -->
    <UAlert
      v-else-if="status === 'CONFIRMED'"
      icon="i-heroicons-check-circle"
      color="success"
      variant="solid"
      title="Booking confirmed"
      description="Your booking has been successfully confirmed!"
    />

    <!-- CANCELLED alert -->
    <UAlert
      v-else-if="status === 'CANCELLED'"
      icon="i-heroicons-x-circle"
      color="neutral"
      variant="solid"
      title="Booking cancelled"
      description="This booking has been cancelled."
    />
  </div>
</template>

<script setup lang="ts">
type Props = {
  status: string;
  remainingTime?: number | null;
  formattedTime?: string;
  warningThreshold?: number;
};

withDefaults(defineProps<Props>(), {
  remainingTime: null,
  formattedTime: "0m 0s",
  warningThreshold: 300,
});
</script>
