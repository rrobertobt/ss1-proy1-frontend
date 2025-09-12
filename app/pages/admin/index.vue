<template>
  <div>
    Admin Page
  </div>
  <NuxtLink to="/admin/users">
    Usuarios
  </NuxtLink>
</template>
<script setup lang="ts">

definePageMeta({
  layout: 'admin',
})
</script>
<style scoped>
</style>