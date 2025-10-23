<template>
  <UContainer class="py-8">
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      class="mb-6"
      @click="navigateTo('/')"
    >
      Back to travels
    </UButton>

    <UCard v-if="pending" class="py-12">
      <div class="space-y-4">
        <USkeleton class="h-8 w-2/3" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-full" />
      </div>
    </UCard>

    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="error"
      variant="soft"
      :title="error.message"
      class="mb-6"
    />

    <div v-else-if="data" class="max-w-3xl mx-auto space-y-6">
      <BookingDetailsCard
        :booking="data.data"
        :remaining-time="remainingTime"
        :formatted-time="formattedTime"
        :warning-threshold="BOOKING_CONFIG.TIMER_WARNING_THRESHOLD"
        :is-processing="isProcessing"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />

      <UCard v-if="data.data.status === 'PENDING'" class="bg-gray-50 border border-gray-200">
        <template #header>
          <h2 class="text-lg font-semibold text-primary-700">Payment Information</h2>
        </template>

        <UAlert
          icon="i-heroicons-information-circle"
          color="info"
          variant="solid"
          title="Test Mode"
          description='This is a POC. Click "Confirm & Pay" to simulate a successful payment.'
        />
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { BOOKING_CONFIG } from '~/config/booking'

const route = useRoute()
const api = useApi()
const toast = useToast()

const bookingId = route.params.id as string

const { data, pending, error, refresh } = await useAsyncData(
  `booking-${bookingId}`,
  () => api.bookings.getById(bookingId)
)

const isProcessing = ref(false)

// Sync with server and return updated remaining time
const syncWithServer = async (): Promise<number | null> => {
  try {
    const response = await api.bookings.getById(bookingId)

    // Only update if status changed
    if (response.data.status !== data.value?.data.status) {
      // Status changed, do a full refresh
      await refresh()
    }

    return response.meta.remainingTime
  } catch (err) {
    // On error, just log it - don't disrupt the UI
    console.error('Failed to sync with server:', err)
    return null
  }
}

// Use countdown composable
const { remainingTime, formattedTime, stop: stopCountdown } = useCountdown({
  initialTime: data.value?.meta.remainingTime ?? null,
  onExpire: async () => {
    // When countdown expires, refresh to get latest status from server
    await refresh()
  },
  syncInterval: BOOKING_CONFIG.SYNC_INTERVAL,
  onSync: syncWithServer,
})

const handleConfirm = async () => {
  try {
    isProcessing.value = true
    const response = await api.bookings.confirm(bookingId, { paymentMethod: 'fake' })

    toast.add({
      title: 'Payment successful!',
      description: `Your booking has been confirmed. Transaction ID: ${response.meta.payment.transactionId}`,
      color: 'success',
    })

    await refresh()
  } catch (err) {
    toast.add({
      title: 'Payment failed',
      description: err instanceof Error ? err.message : 'An error occurred',
      color: 'error',
    })
  } finally {
    isProcessing.value = false
  }
}

const handleCancel = async () => {
  try {
    isProcessing.value = true
    await api.bookings.cancel(bookingId)

    toast.add({
      title: 'Booking cancelled',
      description: 'Your booking has been cancelled successfully',
      color: 'neutral',
    })

    await refresh()
  } catch (err) {
    toast.add({
      title: 'Cancellation failed',
      description: err instanceof Error ? err.message : 'An error occurred',
      color: 'error',
    })
  } finally {
    isProcessing.value = false
  }
}

// Stop countdown when status changes from PENDING
watch(() => data.value?.data.status, (newStatus) => {
  if (newStatus !== 'PENDING') {
    stopCountdown()
  }
})
</script>
