<template>
  <div v-if="status === 'PENDING'" class="relative">
    <!-- Loading Overlay -->
    <div
      v-if="isProcessing"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-2">
        <USkeleton class="h-8 w-8 rounded-full" />
        <p class="text-sm font-medium text-primary-700">Processing...</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <UButton
        block
        size="lg"
        :disabled="isProcessing"
        :loading="isProcessing"
        @click="$emit('confirm')"
      >
        Confirm & Pay
      </UButton>
      <UButton
        color="error"
        variant="outline"
        size="lg"
        :disabled="isProcessing"
        @click="$emit('cancel')"
      >
        Cancel
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  status: string
  isProcessing?: boolean
}

withDefaults(defineProps<Props>(), {
  isProcessing: false,
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
