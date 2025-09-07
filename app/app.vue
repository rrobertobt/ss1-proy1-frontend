<template>
  <!-- <NuxtLayout>
    <NuxtPage />
  </NuxtLayout> -->
  <div>
    <NuxtLoadingIndicator
      :height="3"
      color="var(--brand)"
      :throttle="20"
    />
    <NuxtLayout>
      <slot />
    </NuxtLayout>
  </div>
</template>
<script lang="ts" setup></script>
<style>
  body {
  }
</style>
