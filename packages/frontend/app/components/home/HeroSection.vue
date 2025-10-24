<template>
  <section
    class="relative isolate overflow-hidden bg-linear-to-br from-primary-500 via-primary-400 to-primary-600 text-white"
  >
    <div
      class="absolute inset-0 mix-blend-soft-light"
      style="
        background-image:
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3), transparent 60%),
          radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.2), transparent 55%),
          radial-gradient(circle at 50% 85%, rgba(255, 255, 255, 0.15), transparent 50%);
      "
    ></div>
    <UContainer class="relative z-10 py-16 sm:py-20">
      <div class="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div class="space-y-8">
          <div class="space-y-4">
            <h1 class="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {{ title }}
            </h1>
            <p class="text-lg text-white/85">
              {{ subtitle }}
            </p>
          </div>

          <HomeHeroStats :stats="stats" />
        </div>

        <HomeHeroHighlightCard
          :title="highlightCardTitle"
          :highlights="highlights"
          :footer="highlightCardFooter"
        />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
type Stat = {
  title: string
  value: string
}

type Highlight = {
  tag: string
  title: string
  subtitle: string
  duration: string
}

type Props = {
  title: string
  subtitle: string
  stats: Stat[]
  highlightCardTitle: string
  highlights: Highlight[]
  highlightCardFooter: string
}

defineProps<Props>()
</script>
