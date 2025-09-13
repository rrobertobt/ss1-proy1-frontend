<template>
  <PageHeading
    title="Administración"
    description="Enlaces rápidos a las secciones de administración"
  />
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card
      v-for="link in links"
      :key="link.name"
      @click="link.onClick"
      class="cursor-pointer hover:shadow-md transition-shadow group"
    >
      <CardHeader>
        <CardTitle>{{ link.name }}</CardTitle>
      </CardHeader>
      <CardContent>
        <span class="flex items-center gap-2 text-brand">
          Navegar
          <Icon name="carbon:arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </span>
      </CardContent>
    </Card>
  </div>
</template>
<script setup lang="ts">
  import PageHeading from "~/components/partials/PageHeading.vue";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "~/components/ui/card";

  const links = [
    { name: "Usuarios", onClick: () => navigateTo("/admin/users") },
    {
      name: "Artículos/Productos",
      onClick: () => navigateTo("/admin/articles"),
    },
  ];

  definePageMeta({
    layout: "admin",
  });
</script>
<style scoped></style>
