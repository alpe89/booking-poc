<template>
  <div class="min-h-screen flex flex-col bg-sand-50">
    <!-- Header / Navigation -->
    <header
      class="sticky top-0 z-50 border-b border-sand-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80"
    >
      <UContainer>
        <nav class="flex h-16 items-center justify-between">
          <!-- Logo / Brand -->
          <NuxtLink
            to="/"
            class="flex items-center gap-2 text-xl font-semibold text-primary-700 transition hover:text-primary-800"
          >
            <UIcon name="i-heroicons-globe-alt" class="h-6 w-6" />
            <span>Travel Booking</span>
          </NuxtLink>

          <!-- Navigation Links -->
          <div class="flex items-center gap-6">
            <NuxtLink
              to="/"
              class="text-sm font-medium text-sand-600 transition hover:text-primary-700"
              active-class="text-primary-700"
            >
              Browse Travels
            </NuxtLink>

            <!-- Future: Add more nav items -->
            <!-- <NuxtLink
              to="/my-bookings"
              class="text-sm font-medium text-sand-600 transition hover:text-primary-700"
            >
              My Bookings
            </NuxtLink> -->
          </div>
        </nav>
      </UContainer>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-sand-200 bg-white py-8">
      <UContainer>
        <div class="grid gap-8 md:grid-cols-3">
          <!-- Brand Section -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-lg font-semibold text-primary-700">
              <UIcon name="i-heroicons-globe-alt" class="h-5 w-5" />
              <span>Travel Booking</span>
            </div>
            <p class="text-sm text-sand-600">
              Book your next adventure with confidence. Selected destinations, expert guides, and
              unforgettable experiences.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-sand-900">Quick Links</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink to="/" class="text-sand-600 transition hover:text-primary-700">
                  Browse Travels
                </NuxtLink>
              </li>
              <!-- Future links -->
              <!-- <li>
                <NuxtLink to="/about" class="text-sand-600 transition hover:text-primary-700">
                  About Us
                </NuxtLink>
              </li> -->
            </ul>
          </div>

          <!-- Info -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-sand-900">Info</h3>
            <p class="text-xs text-sand-500">
              This is a Proof of Concept for a travel booking system.
            </p>
            <p class="text-xs text-sand-500">
              © {{ new Date().getFullYear() }} Travel Booking POC
            </p>
          </div>
        </div>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Layout is automatically applied to all pages unless overridden
</script>
