<template>
  <UCard class="bg-gray-50 border border-gray-200">
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-primary-700">Booking Details</h1>
        <UBadge :color="statusColor" variant="solid" size="lg">
          {{ booking.status }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <BookingDetailItem
          label="Booking ID"
          :value="booking.id"
          value-class="font-mono text-sm text-gray-900"
        />
        <BookingDetailItem label="Email" :value="booking.email" />
        <BookingDetailItem
          label="Seats"
          :value="booking.seats"
          value-class="font-semibold text-gray-900"
        />
        <BookingDetailItem
          label="Total Amount"
          :value="formattedAmount"
          value-class="text-xl font-bold text-gray-900"
        />
      </div>

      <UDivider />

      <BookingStatusAlert
        :status="booking.status"
        :remaining-time="remainingTime"
        :formatted-time="formattedTime"
        :warning-threshold="warningThreshold"
      />

      <BookingActions
        :status="booking.status"
        :is-processing="isProcessing"
        @confirm="$emit('confirm')"
        @cancel="$emit('cancel')"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BookingSerialized } from '@booking/shared'

type Props = {
  booking: BookingSerialized
  remainingTime?: number | null
  formattedTime?: string
  warningThreshold?: number
  isProcessing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  remainingTime: null,
  formattedTime: '0m 0s',
  warningThreshold: 300,
  isProcessing: false,
})

defineEmits<{
  confirm: []
  cancel: []
}>()

const { formatPrice } = useFormatters()

const statusColor = computed(() => {
  switch (props.booking.status) {
    case 'CONFIRMED':
      return 'success'
    case 'EXPIRED':
      return 'error'
    default:
      return 'warning'
  }
})

const formattedAmount = computed(() => formatPrice(props.booking.totalAmount))
</script>
