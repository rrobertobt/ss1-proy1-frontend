<template>
  <div>
    <PageHeading
      title="Nuevo artículo/producto"
      description="Formulario para crear un nuevo artículo/producto"
      back-link="/admin/articles"
      back-label="Regresar a artículos/productos"
    />
    <Tabs default-value="cd">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="cd"> CD </TabsTrigger>
        <TabsTrigger value="vinyl"> Vinyl </TabsTrigger>
        <TabsTrigger value="cassette"> Cassette </TabsTrigger>
      </TabsList>
      <TabsContent value="cd">
        <CDForm @submit="handleSubmit" :loading="isLoading" />
      </TabsContent>
      <TabsContent value="vinyl">
        <VinylForm @submit="handleSubmit" :loading="isLoading" />
      </TabsContent>
      <TabsContent value="cassette">
        <CassetteForm @submit="handleSubmit" :loading="isLoading" />
      </TabsContent>
    </Tabs>
  </div>
</template>
<script setup>
  import { toast } from "vue-sonner";
import CassetteForm from "~/components/articleForm/CassetteForm.vue";
  import CDForm from "~/components/articleForm/CDForm.vue";
  import VinylForm from "~/components/articleForm/VinylForm.vue";
  import PageHeading from "~/components/partials/PageHeading.vue";

  const { mutate, isLoading } = useMutation({
    mutation: (values) =>
      $api("/admin/catalog/articles", { method: "POST", body: values }),
    onSuccess: () => {
      toast.success("Artículo creado exitosamente");
      navigateTo("/admin/articles");
    },
  });

  const handleSubmit = (values) => {
    mutate(values);
  };

  definePageMeta({
    layout: "admin",
  });
</script>
<style scoped></style>
