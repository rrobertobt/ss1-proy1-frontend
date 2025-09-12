<template>
  <div>
    <header
      class="fixed top-0 left-0 transition right-0 backdrop-blur-sm px-4 py-2.5 text-foreground border-b-2 border-b-foreground/80 flex items-center gap-2"
      :class="{
        'bg-brand/100': !hasScrolled,
        'bg-brand/80 shadow-sm': hasScrolled,
      }"
    >
      <Icon name="carbon:cd-archive" size="32" />
      <h1 class="text-lg font-mono italic font-black">BPMN - Administración</h1>
    </header>
    <main class="pt-16 container mx-auto px-2">
      <NuxtPage />
    </main>
  </div>
</template>
<script setup>
  const hasScrolled = ref(false);
  onMounted(() => {
    window.addEventListener("scroll", () => {
      hasScrolled.value = window.scrollY > 30;
    });
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", () => {
      hasScrolled.value = window.scrollY > 30;
    });
  });
</script>
<style scoped></style>
