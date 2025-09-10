<template>
  <div>
    Users Admin Page
    {{ users }}
  </div>
</template>
<script setup lang="ts">
const { data: users } = useAsyncData(() => $api('/admin/users'))
</script>
<style scoped>
</style>