<template>
  <div>
    <form @submit="onSubmit" class="pt-2 pb-14">
      <Button type="submit" class="mb-4 sticky top-16" icon="carbon:save"
        >Guardar</Button
      >
      <fieldset class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :disabled="loading">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel icon="carbon:text-align-center">Título</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Título" v-bind="componentField" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="artist_id">
          <FormItem>
            <FormLabel icon="carbon:user">Artista</FormLabel>
            <FormControl>
              <Select v-bind="componentField" placeholder="Artista">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Artista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="artist in artists?.data"
                    :key="artist.id"
                    :value="artist.id"
                  >
                    {{ artist.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="price">
          <FormItem>
            <FormLabel icon="carbon:money">Precio</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Precio"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="currency_id">
          <FormItem>
            <FormLabel icon="carbon:money">Moneda</FormLabel>
            <FormControl>
              <Select v-bind="componentField" placeholder="Moneda">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="currency in currencies"
                    :key="currency.id"
                    :value="currency.id"
                  >
                    {{ currency.name }} ({{ currency.code }})
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="music_genre_id">
          <FormItem>
            <FormLabel icon="carbon:music">Género musical</FormLabel>
            <FormControl>
              <Select v-bind="componentField" placeholder="Género musical">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Género musical" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="genre in genres?.data"
                    :key="genre.id"
                    :value="genre.id"
                  >
                    {{ genre.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="release_date">
          <FormItem>
            <FormLabel icon="carbon:calendar">Fecha de lanzamiento</FormLabel>
            <FormControl>
              <Input
                type="date"
                placeholder="Fecha de lanzamiento"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem class="col-span-1 md:col-span-2 lg:col-span-3">
            <FormLabel icon="carbon:text-align-left">Descripción</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descripción"
                v-bind="componentField"
                rows="4"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="dimensions">
          <FormItem>
            <FormLabel icon="carbon:move">Dimensiones</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Dimensiones (Alto x Ancho x Profundidad)"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="weight_grams">
          <FormItem>
            <FormLabel icon="carbon:message-queue">Peso (gramos)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Peso en gramos"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="barcode">
          <FormItem>
            <FormLabel icon="carbon:barcode">Código de barras</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Código de barras"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="stock_quantity">
          <FormItem>
            <FormLabel icon="carbon:box">Cantidad en stock</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Cantidad en stock"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="min_stock_level">
          <FormItem>
            <FormLabel icon="carbon:arrow-down"
              >Nivel mínimo de stock</FormLabel
            >
            <FormControl>
              <Input
                type="number"
                placeholder="Nivel mínimo de stock"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="max_stock_level">
          <FormItem>
            <FormLabel icon="carbon:arrow-up">Nivel máximo de stock</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Nivel máximo de stock"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="is_available">
          <FormItem class="flex items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                :model-value="value"
                @update:model-value="handleChange"
              />
            </FormControl>
            <FormLabel icon="carbon:checkmark">Disponible</FormLabel>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="is_preorder">
          <FormItem class="flex items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                :model-value="value"
                @update:model-value="handleChange"
              />
            </FormControl>
            <FormLabel icon="carbon:time">Es preventa</FormLabel>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="preorder_release_date">
          <FormItem>
            <FormLabel icon="carbon:calendar"
              >Fecha de lanzamiento de preventa</FormLabel
            >
            <FormControl>
              <Input
                type="date"
                placeholder="Fecha de lanzamiento de preventa"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="preorder_end_date">
          <FormItem>
            <FormLabel icon="carbon:calendar"
              >Fecha de finalización de preventa</FormLabel
            >
            <FormControl>
              <Input
                type="date"
                placeholder="Fecha de finalización de preventa"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <h2
          class="col-span-1 md:col-span-2 lg:col-span-3 text-lg font-semibold mt-6"
        >
          Detalles del tipo
        </h2>

        <FormField
          v-slot="{ componentField }"
          name="type_details.cassette_category_id"
        >
          <FormItem>
            <FormLabel icon="carbon:category">Categoría del cassette</FormLabel>
            <FormControl>
              <Select
                v-bind="componentField"
                placeholder="Categoría del cassette"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Categoría del cassette" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="category in cassetteCategories?.data"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="type_details.brand">
          <FormItem>
            <FormLabel icon="carbon:brand">Marca</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Marca" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ value, handleChange }"
          name="type_details.is_chrome_tape"
        >
          <FormItem class="flex items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                :model-value="value"
                @update:model-value="handleChange"
              />
            </FormControl>
            <FormLabel icon="carbon:checkmark">Cinta de cromo</FormLabel>
          </FormItem>
        </FormField>
      </fieldset>
    </form>
  </div>
</template>
<script setup lang="ts">
  import { toTypedSchema } from "@vee-validate/yup";
  import * as yup from "yup";
  import { useForm } from "vee-validate";
  import { Textarea } from "../ui/textarea";
  import { Checkbox } from "../ui/checkbox";
  import { Button } from "../ui/button";

  const { data: artists } = await useAsyncData(() => $api("/artists"), {
    lazy: true,
  });

  const { data: currencies } = await useAsyncData(() => $api("/currencies"), {
    lazy: true,
  });

  const { data: genres } = await useAsyncData(() => $api("/genres"), {
    lazy: true,
  });

  const { data: cassetteCategories } = await useAsyncData(
    () => $api("/catalog/cassette-categories"),
    {
      lazy: true,
    },
  );

  const formSchema = yup.object({
    title: yup.string().required("El título es obligatorio"),
    artist_id: yup
      .number()
      .typeError("El ID del artista debe ser un número")
      .required("El ID del artista es obligatorio")
      .integer("El ID del artista debe ser un número entero")
      .positive("El ID del artista debe ser un número positivo"),
    price: yup
      .number()
      .typeError("El precio debe ser un número")
      .required("El precio es obligatorio")
      .min(0, "El precio no puede ser negativo"),
    currency_id: yup
      .number()
      .typeError("El ID de la moneda debe ser un número")
      .required("El ID de la moneda es obligatorio")
      .integer("El ID de la moneda debe ser un número entero")
      .positive("El ID de la moneda debe ser un número positivo"),
    music_genre_id: yup
      .number()
      .typeError("El ID del género musical debe ser un número")
      .required("El ID del género musical es obligatorio")
      .integer("El ID del género musical debe ser un número entero")
      .positive("El ID del género musical debe ser un número positivo"),
    release_date: yup
      .date()
      .typeError("La fecha de lanzamiento debe ser una fecha válida")
      .required("La fecha de lanzamiento es obligatoria"),
    description: yup.string().required("La descripción es obligatoria"),
    dimensions: yup.string().required("Las dimensiones son obligatorias"),
    weight_grams: yup
      .number()
      .typeError("El peso debe ser un número")
      .required("El peso es obligatorio")
      .min(0, "El peso no puede ser negativo"),
    barcode: yup.string().required("El código de barras es obligatorio"),
    stock_quantity: yup
      .number()
      .typeError("La cantidad en stock debe ser un número")
      .required("La cantidad en stock es obligatoria")
      .min(0, "La cantidad en stock no puede ser negativa"),
    min_stock_level: yup
      .number()
      .typeError("El nivel mínimo de stock debe ser un número")
      .required("El nivel mínimo de stock es obligatorio")
      .min(0, "El nivel mínimo de stock no puede ser negativo"),
    max_stock_level: yup
      .number()
      .typeError("El nivel máximo de stock debe ser un número")
      .required("El nivel máximo de stock es obligatorio")
      .min(0, "El nivel máximo de stock no puede ser negativo"),
    is_available: yup
      .boolean()
      .typeError("El campo de disponibilidad debe ser verdadero o falso")
      .required("El campo de disponibilidad es obligatorio"),
    is_preorder: yup
      .boolean()
      .typeError("El campo de preventa debe ser verdadero o falso")
      .optional(),
    preorder_release_date: yup
      .date()
      .typeError(
        "La fecha de lanzamiento de preventa debe ser una fecha válida",
      )
      .when("isPreorder", {
        is: true,
        then(schema) {
          return schema.required(
            "La fecha de lanzamiento de preventa es obligatoria",
          );
        },
        otherwise(schema) {
          return schema.notRequired();
        },
      }),
    preorder_end_date: yup
      .date()
      .typeError(
        "La fecha de finalización de preventa debe ser una fecha válida",
      )
      .when("isPreorder", {
        is: true,
        then(schema) {
          return schema.required(
            "La fecha de finalización de preventa es obligatoria",
          );
        },
        otherwise(schema) {
          return schema.notRequired();
        },
      }),
    type: yup
      .string()
      .oneOf(["cd", "vinyl", "cassette"], "Tipo inválido")
      .default("cassette")
      .required("El tipo es obligatorio"),
    type_details: yup
      .object({
        cassette_category_id: yup
          .number()
          .typeError("El ID de la categoría del cassette debe ser un número")
          .required("El ID de la categoría del cassette es obligatorio")
          .integer(
            "El ID de la categoría del cassette debe ser un número entero",
          )
          .positive(
            "El ID de la categoría del cassette debe ser un número positivo",
          ),
        brand: yup.string().required("La marca es obligatoria"),
        is_chrome_tape: yup
          .boolean()
          .typeError("El campo de cinta de cromo debe ser verdadero o falso")
          .required("El campo de cinta de cromo es obligatorio"),
      })
      .required("Los detalles del tipo son obligatorios"),
  });

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const emit = defineEmits(["submit"]);
    

  const onSubmit = handleSubmit((values) => {
    console.log(values);
    emit("submit", values);
  });

  const { loading } = defineProps<{
    loading: boolean;
  }>();
</script>
<style scoped></style>
