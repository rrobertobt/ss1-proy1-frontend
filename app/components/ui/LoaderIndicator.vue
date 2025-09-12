<template>
  <div class="flex items-center justify-center gap-2 p-4">
    <Icon
    name="lucide:loader"
    class="animate-spin size-6 text-muted-foreground"
    />
    <span class="">{{ text }}</span>
  </div>
</template>
<script setup>
defineProps({
  text: {
    type: String,
    default: 'Cargando...'
  }
})
</script>
<style scoped></style>
