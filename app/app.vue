<template>
  <!-- <NuxtLayout>
    <NuxtPage />
  </NuxtLayout> -->
  <div>
    <NuxtLoadingIndicator :height="3" color="var(--brand)" :throttle="20" />
    <NuxtLayout>
      <slot />
    </NuxtLayout>
    <Toaster position="top-center" />
  </div>
</template>
<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>
<style>
  body {
  }
</style>
