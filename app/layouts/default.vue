<template>
  <div>
    <header class="fixed top-0 inset-x-0 z-50 border-b border-foreground/10 backdrop-blur-sm transition-colors"
      :class="hasScrolled ? 'bg-brand/80 shadow-sm' : 'bg-brand/100'">
      <nav aria-label="principal" class="mx-auto max-w-6xl px-4">
        <div class="h-14 flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/"
            class="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-0 rounded">
            <Icon name="carbon:cd-archive" size="28" />
            <span class="text-base font-mono italic font-black">BPMN</span>
          </NuxtLink>

          <!-- Desktop nav -->
          <ul class="hidden md:flex items-center gap-1 ml-6">
            <li v-for="item in items" :key="item.to">
              <NuxtLink :to="item.to"
                class="px-3 py-2 text-sm rounded hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-0"
                exact-active-class="bg-foreground/15 font-semibold"
                :aria-current="isActive(item.to) ? 'page' : undefined">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>

          <!-- Actions -->
          <div class="flex items-center gap-2">

            <NuxtLink to="/profile"
              class="relative p-2 rounded hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-0"
              aria-label="Usuario">
              <Icon name="carbon:user" size="22" />
            </NuxtLink>

            <NuxtLink to="/cart"
              class="relative p-2 rounded hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-0"
              aria-label="Carrito">
              <Icon name="carbon:shopping-cart" size="22" />
              <span v-if="cartCount > 0"
                class="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-foreground text-background"
                aria-label="Productos en carrito">
                {{ cartCount }}
              </span>
            </NuxtLink>

            <!-- Hamburger for mobile -->
            <button
              class="md:hidden p-2 rounded hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-0"
              :aria-expanded="mobileOpen ? 'true' : 'false'" aria-controls="mobile-menu"
              @click="mobileOpen = !mobileOpen">
              <Icon :name="mobileOpen ? 'carbon:close' : 'carbon:menu'" size="22" />
              <span class="sr-only">Abrir menú</span>
            </button>
          </div>
        </div>

        <!-- Mobile -->
        <transition name="fade">
          <ul v-if="mobileOpen" id="mobile-menu" class="md:hidden py-2 border-t border-foreground/10">
            <li v-for="item in items" :key="item.to">
              <NuxtLink :to="item.to"
                class="block px-3 py-2 text-sm rounded hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-0"
                exact-active-class="bg-foreground/15 font-semibold"
                :aria-current="isActive(item.to) ? 'page' : undefined" @click="mobileOpen = false">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </transition>
      </nav>
    </header>

    <main id="main" class="pt-16">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const items = [
  { to: '/home', label: 'Inicio' },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/presales', label: 'Preventas' },
  { to: '/events', label: 'Eventos' },
]

const mobileOpen = ref(false)
const hasScrolled = ref(false)
const cartCount = ref(0)

const route = useRoute()
const isActive = (to) => route.path === to

// Scroll performant
let ticking = false
const onScroll = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    hasScrolled.value = window.scrollY > 30
    ticking = false
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {

  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
