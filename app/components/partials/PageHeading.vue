<template>
  <div class="pt-2 pb-4">
    <Button
      v-if="backLink && backLabel"
      variant="link"
      class="px-0"
      as-child
    >
      <NuxtLink :to="backLink">
        <Icon name="carbon:arrow-left" />
        {{ backLabel }}
      </NuxtLink>
    </Button>
    <h1 class="text-2xl pb-1.5">{{ title }}</h1>
    <p class="text-sm text-muted-foreground">{{ description }}</p>
  </div>
</template>
<script setup lang="ts">
  import { defineProps } from "vue";
  import { Button } from "../ui/button";

  const {
    title,
    description,
    backLink,
    backLabel = "Regresar",
  } = defineProps<{
    title: string;
    description: string;
    backLink?: string;
    backLabel?: string;
  }>();
</script>
<style scoped></style>
