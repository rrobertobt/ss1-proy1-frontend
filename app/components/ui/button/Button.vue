<script setup lang="ts">
  import type { PrimitiveProps } from "reka-ui";
  import type { HTMLAttributes } from "vue";
  import type { ButtonVariants } from ".";
  import { Primitive } from "reka-ui";
  import { cn } from "@/lib/utils";
  import { buttonVariants } from ".";

  interface Props extends PrimitiveProps {
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    class?: HTMLAttributes["class"];
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    as: "button",
  });
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class, 'group')"
    :disabled="disabled || loading"
  >
    <slot />
    <span
      v-if="icon && !loading"
      class="bg-brand rounded-full p-2 text-primary border border-primary group-hover:bg-primary group-hover:text-brand transition"
    >
      <Icon :name="icon" class="block!" />
    </span>

    <span
      v-if="loading"
      class="bg-brand rounded-full p-2 text-primary border border-primary group-hover:bg-primary group-hover:text-brand transition"
    >
      <Icon name="svg-spinners:bars-scale-middle" class="block!" />
    </span>
  </Primitive>
</template>
