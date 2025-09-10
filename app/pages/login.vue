<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-10">
    <header class="flex flex-col items-center">
      <h1 class="text-3xl font-normal uppercase">INICIAR SESIÓN</h1>
      <Button variant="link" as-child>
        <NuxtLink to="/">
          <Icon name="carbon:arrow-left" />
          Volver al inicio
        </NuxtLink>
      </Button>
    </header>

    <form @submit="onSubmit" class="w-full max-w-sm space-y-4">
      <FormField name="login" :form="form">
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

      <Button
        type="submit"
        class="w-full mt-4"
        :loading="loading"
        icon="carbon:play"
        >Continuar
      </Button>
    </form>

    <Button variant="link" as-child>
      <NuxtLink to="/signup">
        <Icon name="carbon:user-follow" />
        ¿No tienes una cuenta? Regístrate
      </NuxtLink>
    </Button>
  </div>
</template>
<script setup>
  import { toTypedSchema } from "@vee-validate/zod";
  import { useForm } from "vee-validate";
  import * as z from "zod";
  import { Button } from "~/components/ui/button";
  import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
  } from "~/components/ui/form";
  import { Input } from "~/components/ui/input";

  const sessionStore = useSessionStore();
  const { login } = sessionStore;
  const { loading } = storeToRefs(sessionStore);

  const formSchema = toTypedSchema(
    z.object({
      login: z.string(),
      password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    }),
  );

  const form = useForm({
    validationSchema: formSchema,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await login(values)
  });

  definePageMeta({
    layout: "login",
  });
</script>
<style scoped></style>
