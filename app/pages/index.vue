<template>
  <div class="h-screen">
    <Button class="m-4" :loading="loading" @click="click">Hola</Button>
  </div>
</template>
<script setup lang="ts">
import { Button } from "@/components/ui/button"

const mockTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loading = ref(false);
const click = async () => {
  loading.value = true;
  console.log("click");
  await mockTimeout(2000);
  console.log("done");
  loading.value = false;
};
</script>
<style scoped>
</style>