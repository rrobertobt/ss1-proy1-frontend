<template>
  <div>
    <PageHeading
      title="Crear Usuario"
      description="Completa el siguiente formulario para crear un nuevo usuario."
      back-link="/admin/users"
      back-label="Regresar a Usuarios"
    />

    <form @submit="onSubmit">
      <fieldset
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        :disabled="asyncStatus === 'loading'"
      >
        <FormField v-slot="{ componentField }" name="username">
          <FormItem>
            <FormLabel icon="carbon:at">Nombre de usuario</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Nombre de usuario"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel icon="carbon:email">Correo electrónico</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Correo electrónico"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel icon="carbon:locked">Contraseña</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Contraseña"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="first_name">
          <FormItem>
            <FormLabel icon="carbon:user">Nombre</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nombre" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="last_name">
          <FormItem>
            <FormLabel icon="carbon:user">Apellido</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Apellido"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="gender_id">
          <FormItem>
            <FormLabel icon="carbon:shapes">Género</FormLabel>
            <FormControl>
              <Select v-bind="componentField" placeholder="Género">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="gender in genders"
                    :key="gender.id"
                    :value="gender.id"
                  >
                    {{ gender.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel icon="carbon:phone">Teléfono</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Teléfono"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </fieldset>

      <Button
        type="submit"
        class="w-full mt-4"
        :loading="asyncStatus === 'loading'"
        icon="carbon:save"
        >Guardar
      </Button>
    </form>
  </div>
</template>
<script setup lang="ts">
  import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import { toTypedSchema } from "@vee-validate/yup";
  import { useForm } from "vee-validate";
  import { toast } from "vue-sonner";
  import * as yup from "yup";
  import PageHeading from "~/components/partials/PageHeading.vue";
  import { genders } from "~/lib/utils";

  const formSchema = yup.object({
    username: yup.string().required("El nombre de usuario es obligatorio"),
    email: yup
      .string()
      .required("El correo electrónico es obligatorio")
      .email("Debe ser un correo electrónico válido"),
    password: yup
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .required("La contraseña es obligatoria"),
    first_name: yup.string().required("El nombre es obligatorio"),
    last_name: yup.string().required("El apellido es obligatorio"),
    gender_id: yup
      .number()
      .typeError("El género es obligatorio")
      .required("El género es obligatorio")
      .min(1, "El género es obligatorio"),
    phone: yup.string().required("El teléfono es obligatorio"),
  });

  const { mutate, asyncStatus } = useMutation({
    mutation: (data: yup.InferType<typeof formSchema>) =>
      $api("/users/admin", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      toast.success("Usuario creado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.data?.message ||
          `Ocurrió un error al crear la cuenta: ${
            error?.data?.error.message || ""
          }`.trim(),
      );
    },
  });

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const onSubmit = handleSubmit((values) => {
    mutate(values);
  });

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
