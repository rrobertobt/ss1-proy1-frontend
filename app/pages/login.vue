<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-12">
    <header class="flex flex-col items-center ">
      <h1 class="text-3xl font-normal uppercase">INICIAR SESIÓN</h1>
      <Button variant="link" as-child>
        <NuxtLink to="/">
          <Icon name="carbon:arrow-left" />
          Volver al inicio
        </NuxtLink>
      </Button>
    </header>

    <form @submit="onSubmit" class="w-full max-w-sm space-y-4">
      <FormField name="email" :form="form">
        <template #default="{ field }">
          <FormItem>
            <FormControl>
              <Input v-bind="field" placeholder="Correo electrónico" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </template>
      </FormField>

      <FormField name="password" :form="form">
        <template #default="{ field }">
          <FormItem>
            <FormControl>
              <Input v-bind="field" type="password" placeholder="Contraseña" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </template>
      </FormField>

      <Button type="submit" class="w-full mt-4" :disabled="!form.meta.value.valid" icon="carbon:play"
        >Continuar
      </Button>
    </form>
  </div>
</template>
<script setup>
  import { useForm } from "vee-validate";
  import { toTypedSchema } from "@vee-validate/zod";
  import * as z from "zod";
  import { Button } from "~/components/ui/button";
  import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "~/components/ui/form";
  import { Input } from "~/components/ui/input";

  const formSchema = toTypedSchema(
    z.object({
      email: z.string().email("Debe ser un correo electrónico válido"),
      password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    }),
  );

  const form = useForm({
    validationSchema: formSchema,
  });

  const onSubmit = form.handleSubmit((values) => {
    console.log("Form submitted!", values);
  });

  definePageMeta({
    layout: "login",
  });
</script>
<style scoped></style>
