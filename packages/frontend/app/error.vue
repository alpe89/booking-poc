<template>
  <NuxtLayout>
    <UContainer class="py-16">
      <div class="mx-auto max-w-lg space-y-8 text-center">
        <!-- Error Icon -->
        <div class="flex justify-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
            <UIcon :name="errorIcon" class="h-10 w-10 text-primary-600" />
          </div>
        </div>

        <!-- Error Message -->
        <div class="space-y-3">
          <h1 class="text-4xl font-bold text-sand-900">
            {{ errorTitle }}
          </h1>
          <p class="text-lg text-sand-600">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Error Details (only in development) -->
        <div v-if="isDev && error?.message" class="rounded-lg bg-sand-100 p-4 text-left">
          <p class="font-mono text-xs text-sand-700">{{ error.message }}</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <UButton size="lg" color="primary" icon="i-heroicons-home" @click="handleClearError">
            Go to Home
          </UButton>

          <UButton
            v-if="!is404"
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-path"
            @click="handleRetry"
          >
            Try Again
          </UButton>
        </div>

        <!-- Additional Help -->
        <div class="pt-8 text-sm text-sand-500">
          <p>
            If the problem persists, please contact support or
            <NuxtLink to="/" class="text-primary-600 hover:text-primary-700 underline">
              return to the homepage </NuxtLink
            >.
          </p>
        </div>
      </div>
    </UContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

type Props = {
  error: NuxtError
}

const props = defineProps<Props>()

const isDev = process.env.NODE_ENV === 'development'

const is404 = computed(() => props.error?.statusCode === 404)

const errorIcon = computed(() => {
  if (is404.value) return 'i-heroicons-magnifying-glass'
  return 'i-heroicons-exclamation-triangle'
})

const errorTitle = computed(() => {
  if (is404.value) return 'Page Not Found'
  if (props.error?.statusCode === 500) return 'Server Error'
  if (props.error?.statusCode === 403) return 'Access Denied'
  return 'Something Went Wrong'
})

const errorMessage = computed(() => {
  if (is404.value) {
    return "The page you're looking for doesn't exist or has been moved."
  }
  if (props.error?.statusCode === 500) {
    return 'An unexpected error occurred on the server. Please try again later.'
  }
  if (props.error?.statusCode === 403) {
    return "You don't have permission to access this resource."
  }
  return props.error?.message || 'An unexpected error occurred. Please try again.'
})

const handleClearError = () => {
  clearError({ redirect: '/' })
}

const handleRetry = () => {
  clearError()
}
</script>
