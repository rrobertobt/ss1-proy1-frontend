<template>
  <div>
    <PageHeading
      title="Artículos/Productos"
      description="Lista de artículos/productos registrados en el sistema"
      back-link="/admin"
      back-label="Regresar"
    />

    <div class="pb-8 space-y-2">
      <h2 class="text-sm font-semibold">Acciones:</h2>

      <Button as-child size="sm">
        <NuxtLink to="/admin/articles/new">
          <Icon name="carbon:add-alt" class="mr-2 -mb-0.5" />
          Crear
        </NuxtLink>
      </Button>
    </div>
    <div
      class="container mx-auto rounded-lg relative"
      v-if="articles?.data?.articles"
    >
      <DataTable
        :columns
        :data="articles?.data?.articles"
        disable-pagination
        :enable-sorting="false"
        table-key-name="articles-table"
      />
      <!-- overlay: -->
      <Transition name="fade-overlay" mode="out-in">
        <div
          class="absolute inset-0 bg-background/40 flex items-center justify-center"
          v-if="articlesStatus === 'pending'"
        >
          <LoaderIndicator />
        </div>
      </Transition>
    </div>
  </div>
</template>
<script setup lang="jsx">
  import PageHeading from "~/components/partials/PageHeading.vue";
  import { Badge } from "~/components/ui/badge";
  import LoaderIndicator from "~/components/ui/LoaderIndicator.vue";
  import DataTable from "~/components/ui/table/DataTable.vue";

  const { data: articles, status: articlesStatus } = await useAsyncData(() =>
    $api("/catalog/articles"),
  );

  const columns = [
    {
      accessorKey: "title",
      meta: {
        displayName: "Título",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="carbon:text-long-paragraph" class="mr-1 -mb-0.5" />
          Título
        </div>
      ),
      cell: ({ row }) => <div class="text-base">{row.getValue("title")}</div>,
    },
    {
      id: "artist",
      accessorFn: (row) => row.artist.name,
      meta: {
        displayName: "Artista",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="carbon:user" class="mr-1 -mb-0.5" />
          Artista
        </div>
      ),
      cell: ({ row }) => <div class="text-base">{row.getValue("artist")}</div>,
    },
    {
      accessorKey: "type",
      meta: {
        displayName: "Tipo",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="carbon:category" class="mr-1 -mb-0.5" />
          Tipo
        </div>
      ),
      cell: ({ row }) => (
        <Badge class="text-sm uppercase">{row.getValue("type")}</Badge>
      ),
    },
    {
      id: "price",
      accessorFn: (row) =>
        Intl.NumberFormat("es-GT", {
          style: "currency",
          currency: row.currency.code,
        }).format(row.price),
      meta: {
        displayName: "Precio",
      },
      header: () => (
        <div class="text-center font-semibold">
          <Icon name="carbon:money" class="mr-1 -mb-0.5" />
          Precio
        </div>
      ),
      cell: ({ row }) => <div class="text-base">{row.getValue("price")}</div>,
    },
  ];

  definePageMeta({
    layout: "admin",
  });
</script>
<style scoped></style>
