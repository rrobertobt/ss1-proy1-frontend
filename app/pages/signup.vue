<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-12">
    <header class="flex flex-col items-center">
      <h1 class="text-3xl font-normal uppercase">REGISTRO</h1>
      <div class="flex gap-4" v-if="!hasSentEmail || !hasSuccessfullyVerified">
        <Button variant="link" as-child>
          <NuxtLink to="/">
            <Icon name="carbon:home" />
            Volver al inicio
          </NuxtLink>
        </Button>
        <Button variant="link" as-child>
          <NuxtLink to="/login">
            <Icon name="carbon:arrow-left" />
            Volver a iniciar sesión
          </NuxtLink>
        </Button>
      </div>
    </header>

    <div class="w-full max-w-md text-center" v-if="hasSentEmail">
      <div
        class="p-4 mb-4 text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800 border border-foreground flex items-center flex-col"
        role="alert"
      >
        <span class="font-medium text-lg">Éxito!</span> Se ha enviado un correo
        de verificación a <strong>{{ registeringEmail }}</strong
        >. Por favor, revisa tu bandeja de entrada e ingresa el código de
        verificación.

        <PinInput
          placeholder="○"
          id="pin-input"
          class="mt-8 font-mono text-foreground font-bold"
          @complete="handleVerificationCode"
          v-model="code"
        >
          <PinInputGroup>
            <PinInputSlot v-for="(id, index) in 6" :key="id" :index="index" />
          </PinInputGroup>
        </PinInput>
      </div>
    </div>

    <div v-else-if="hasSuccessfullyVerified" class="w-full max-w-md">
      <div
        class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800"
        role="alert"
      >
        <span class="font-medium">Éxito!</span> Tu correo electrónico ha sido
        verificado exitosamente. Ahora puedes iniciar sesión en tu cuenta.
      </div>
    </div>

    <form
      @submit="onSubmit"
      class="w-full max-w-md space-y-4"
      :disabled="asyncStatus === 'loading'"
      v-else
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
          <FormDescription> Este es tu identificador público </FormDescription>
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

      <FormField v-slot="{ componentField }" name="firstName">
        <FormItem>
          <FormLabel icon="carbon:user">Nombre</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Nombre" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="lastName">
        <FormItem>
          <FormLabel icon="carbon:user">Apellido</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Apellido" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="genderId">
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
            <Input type="text" placeholder="Teléfono" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button
        type="submit"
        class="w-full mt-4"
        :loading="asyncStatus === 'loading'"
        icon="carbon:play"
        >Continuar
      </Button>
    </form>
  </div>
</template>
<script setup lang="ts">
  import { useForm } from "vee-validate";
  import { toast } from "vue-sonner";
  import * as yup from "yup";
  import { Button } from "~/components/ui/button";
  import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
  } from "~/components/ui/form";
  import { Input } from "~/components/ui/input";
  import {
    PinInput,
    PinInputGroup,
    PinInputSlot,
  } from "~/components/ui/pin-input";
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectContent,
  } from "~/components/ui/select";

  const hasSentEmail = ref(false);
  const hasSuccessfullyVerified = ref(false);
  const registeringEmail = ref("");
  const code = ref([]);

  // TODO: fetch genders, hard coded for now
  const genders = [
    { id: 1, name: "Masculino" },
    { id: 2, name: "Femenino" },
    { id: 3, name: "Otro" },
  ];

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
    firstName: yup.string().required("El nombre es obligatorio"),
    lastName: yup.string().required("El apellido es obligatorio"),
    genderId: yup
      .number()
      .typeError("El género es obligatorio")
      .required("El género es obligatorio")
      .min(1, "El género es obligatorio"),
    phone: yup.string().required("El teléfono es obligatorio"),
  });

  const form = useForm({
    validationSchema: formSchema,
  });

  const { mutate, asyncStatus } = useMutation({
    mutation: (data: yup.InferType<typeof formSchema>) =>
      $api("/auth/register", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      toast.success(
        "Cuenta creada exitosamente. Por favor, verifica tu correo electrónico.",
      );
      hasSentEmail.value = true;
      hasSuccessfullyVerified.value = false;
      registeringEmail.value = form.values.email;
    },
    onError: (error: any) => {
      toast.error(
        error?.data?.message ||
          `Ocurrió un error al crear la cuenta: ${
            error?.data?.error.message || ""
          }`.trim(),
      );
      console.error(error);
      hasSentEmail.value = false;
      hasSuccessfullyVerified.value = false;
      // form.resetForm();
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    mutate(values as yup.InferType<typeof formSchema>);
  });

  const handleVerificationCode = async (code: string[]) => {
    try {
      const response = await $api("/auth/verify-email", {
        method: "POST",
        body: {
          email: registeringEmail.value,
          verificationCode: code.join(""),
        },
      });
      if (response.success) {
        toast.success("Correo electrónico verificado exitosamente.");
        hasSuccessfullyVerified.value = true;
        hasSentEmail.value = false;

        // wait and redirect to login
        setTimeout(() => {
          navigateTo("/login");
        }, 5000);
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Ocurrió un error al verificar el correo electrónico: ${
            error?.data?.error.message || ""
          }`.trim(),
      );
      hasSuccessfullyVerified.value = false;
      hasSentEmail.value = true;
    }
  };

  definePageMeta({
    layout: "login",
  });
</script>
<style scoped></style>
