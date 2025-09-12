<template>
  <div>
    <PageHeading
      title="Usuarios"
      description="Lista de usuarios registrados en el sistema"
      back-link="/admin"
      back-label="Regresar"
    />

    <div class="pb-8 space-y-2">
      <h2 class="text-sm font-semibold">Acciones:</h2>

      <Button as-child size="sm">
        <NuxtLink to="/admin/users/new">
          <Icon name="carbon:user-follow" class="mr-2 -mb-0.5" />
          Crear
        </NuxtLink>
      </Button>
    </div>

    <div class="container mx-auto rounded-lg relative" v-if="users">
      <DataTable
        :columns
        :data="users?.data"
        disable-pagination
        :enable-sorting="false"
        table-key-name="users-table"
      />
      <!-- overlay: -->
      <Transition name="fade-overlay" mode="out-in">
        <div
          class="absolute inset-0 bg-background/40 flex items-center justify-center"
          v-if="usersStatus === 'pending'"
        >
          <LoaderIndicator />
        </div>
      </Transition>
    </div>
  </div>
</template>
<script setup lang="tsx">
  import type { ColumnDef } from "@tanstack/vue-table";
  import { Icon } from "#components";
  import LoaderIndicator from "~/components/ui/LoaderIndicator.vue";
  import DataTable from "~/components/ui/table/DataTable.vue";
  import { Badge } from "~/components/ui/badge";
  import PageHeading from "~/components/partials/PageHeading.vue";
  import Button from "~/components/ui/button/Button.vue";

  const { data: users, status: usersStatus } = await useAsyncData(() =>
    $api("/users"),
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "username",
      meta: {
        displayName: "Usuario",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:user" class="mr-1 -mb-0.5" />
          Usuario
        </div>
      ),
      cell: ({ row }) => (
        <div class="text-base">{row.getValue("username")}</div>
      ),
    },
    {
      accessorKey: "first_name",
      meta: {
        displayName: "Nombres",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:user" class="mr-1 -mb-0.5" />
          Nombres
        </div>
      ),
      cell: ({ row }) => (
        <div class="text-base">{row.getValue("first_name")}</div>
      ),
    },
    {
      accessorKey: "last_name",
      meta: {
        displayName: "Apellidos",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:user" class="mr-1 -mb-0.5" />
          Apellidos
        </div>
      ),
      cell: ({ row }) => (
        <div class="text-base">{row.getValue("last_name")}</div>
      ),
    },
    {
      accessorKey: "email",
      meta: {
        displayName: "Correo Electrónico",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:mail" class="mr-1 -mb-0.5" />
          Correo Electrónico
        </div>
      ),
      cell: ({ row }) => <div class="text-base">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      meta: {
        displayName: "Teléfono",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:phone" class="mr-1 -mb-0.5" />
          Teléfono
        </div>
      ),
      cell: ({ row }) => <div class="text-base">{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "gender",
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:clipboard-list" class="mr-1 -mb-0.5" />
          Género
        </div>
      ),
      cell: ({ row }) => (
        <Badge class="uppercase tracking-wider">{row.getValue("gender")}</Badge>
      ),
    },
    {
      accessorKey: "user_type",
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:clipboard-list" class="mr-1 -mb-0.5" />
          Tipo de Usuario
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" class="uppercase tracking-wider">
          {row.getValue("user_type")}
        </Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:clipboard-list" class="mr-1 -mb-0.5" />
          Estado
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" class="uppercase tracking-wider">
          {row.getValue("is_active") ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      accessorKey: "is_verified",
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="lucide:clipboard-list" class="mr-1 -mb-0.5" />
          Estado
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" class="uppercase tracking-wider">
          {row.getValue("is_verified") ? "Verificado" : "No Verificado"}
        </Badge>
      ),
    },
  ];

  definePageMeta({
    layout: "admin",
  });
</script>
<style scoped>
  @reference '~/assets/css/tailwind.css';

  .fade-overlay-enter-active,
  .fade-overlay-leave-active {
    @apply transition-opacity duration-300;
  }

  .fade-overlay-enter-from,
  .fade-overlay-leave-to {
    opacity: 0;
  }
</style>
