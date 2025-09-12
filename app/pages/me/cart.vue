<template>
  <div class="bg-background text-foreground">
    <!-- header -->
    <section class="border-b border-ink/10">
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 class="text-[clamp(28px,6vw,48px)] font-extrabold">Tu carrito</h1>
        <p class="mt-1 text-ink/70">Revisa tus artículos antes de comprar.</p>
      </div>
    </section>

    <!-- content -->
    <section>
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- items -->
        <div class="lg:col-span-8 space-y-4">
          <div v-if="cart.length === 0" class="border border-ink/20 bg-secondary/20 p-6 text-center">
            <p class="font-semibold">Tu carrito está vacío</p>
            <NuxtLink to="/catalog" class="mt-3 inline-block border border-ink px-4 py-2 text-sm">Ir al catálogo
            </NuxtLink>
          </div>

          <!-- one-line item -->
          <article v-for="it in cart" :key="it.id" class="flex items-center gap-4 md:gap-6 bg-background border border-ink/20 rounded-sm shadow-sm p-4 md:p-5
                   grid-cols-[92px,1fr] md:grid-cols-[92px,1fr,140px,130px,130px,44px]"
            :class="(!it.article.isAvailable || (it.article.stock_quantity ?? 0) === 0) ? 'opacity-80' : ''">
            <!-- cover -->
            <img :src="it.article.cover" :alt="`${it.article.album} — ${it.article.artist}`"
              class="w-[92px] h-[92px] object-cover border border-ink/40" />

            <!-- info -->
            <div class="min-w-0 pr-2">
              <h3 class="font-semibold truncate">{{ it.article.album }}</h3>
              <p class="text-sm text-ink/70 truncate">{{ it.article.artist }}</p>
              <div class="mt-1 flex items-center gap-2">
                <span class="text-xs text-ink/60">{{ categoryLabel[it.article.category] }}</span>
                <span class="text-xs px-2 py-0.5 rounded" :class="availabilityInfo(it.article).cls">
                  {{ availabilityInfo(it.article).label }}
                </span>
              </div>
            </div>

            <!-- qty -->
            <div class="justify-self-start">
              <div class="inline-flex items-center overflow-hidden border border-ink/30">
                <button class="px-3 py-2 text-sm hover:bg-secondary/40 disabled:opacity-50" @click="decrQty(it)"
                  :disabled="it.quantity <= 1">−</button>
                <input v-model.number="it.quantity" type="number" inputmode="numeric"
                  class="h-9 w-12 text-center border-l border-r border-ink/20 bg-background" :min="1"
                  :max="it.article.stock_quantity || 99" />
                <button class="px-3 py-2 text-sm hover:bg-secondary/40 disabled:opacity-50" @click="incrQty(it)"
                  :disabled="it.article.stock_quantity && it.quantity >= it.article.stock_quantity">＋</button>
              </div>
            </div>

            <!-- unit price -->
            <div class="text-right">
              <p class="text-xs text-ink/60">Precio unitario</p>
              <p class="font-semibold">{{ currency.symbol }} {{ it.unit_price.toLocaleString() }}</p>
              <p v-if="it.discount_applied" class="text-xs text-brand mt-0.5">
                − {{ currency.symbol }} {{ it.discount_applied.toLocaleString() }}
              </p>
            </div>

            <!-- subtotal -->
            <div class="text-right">
              <p class="text-xs text-ink/60">Subtotal</p>
              <p class="text-lg font-black text-brand">{{ currency.symbol }} {{ lineTotal(it).toLocaleString() }}</p>
            </div>

            <!-- remove -->
            <button
              class="justify-self-end grid place-items-center h-8 w-8 border border-ink hover:bg-secondary/40 transition"
              :aria-label="`Remover ${it.article.album}`" @click="removeItem(it.id)">
              <Icon name="carbon:trash-can" size="16" />
            </button>
          </article>
        </div>

        <!-- summary -->
        <aside class="lg:col-span-4">
          <div class="border border-ink/20 rounded-sm bg-background p-5 shadow-sm">
            <h2 class="font-semibold">Resumen</h2>
            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Artículos</span>
                <span>{{ totalItems }}</span>
              </div>
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>{{ currency.symbol }} {{ subtotal.toLocaleString() }}</span>
              </div>
            </div>

            <p class="mt-3 text-xs text-ink/60">Impuestos y envío se calculan al finalizar la compra.</p>

            <button
              class="mt-5 w-full h-12 bg-ink text-cream px-5 text-sm font-semibold tracking-wide hover:opacity-90 disabled:opacity-60 transition"
              :disabled="cart.length === 0" @click="checkout">
              Comprar ahora
            </button>

            <NuxtLink to="/catalog"
              class="mt-3 inline-flex w-full items-center justify-center h-12 border border-ink px-5 text-sm font-semibold hover:bg-secondary/30 transition">
              Seguir comprando
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
// Ready for auth later:
// definePageMeta({ middleware: ['auth'] })

/* categories */
const categoryLabel = { vinyl: 'Vinilo', cd: 'CD', cassette: 'Cassette' }

/* lookups */
const artistMap = {
  1: 'A-ha', 2: 'Michael Jackson', 3: 'Metallica', 4: 'Madonna',
  5: 'Pink Floyd', 6: 'Daft Punk', 7: 'Radiohead', 8: 'The Beatles',
  9: 'Kendrick Lamar', 10: 'Nirvana', 11: 'LCD Soundsystem', 12: 'Fleetwood Mac'
}
const currency = { code: 'GTQ', symbol: 'Q' }

/* analog articles (api-shaped) */
const articlesApi = [
  { id: 211, title: 'The Dark Side of the Moon', artist_id: 5, price: 520, image_url: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 1, media_type: 'vinyl', release_date: '1973-03-01' },
  { id: 207, title: 'Abbey Road', artist_id: 8, price: 380, image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 5, media_type: 'vinyl', release_date: '1969-09-26' },
  { id: 203, title: '...And Justice for All', artist_id: 3, price: 370, image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 0, media_type: 'cd', release_date: '1988-09-07' },
  { id: 212, title: 'Random Access Memories', artist_id: 6, price: 350, image_url: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 4, media_type: 'cassette', release_date: '2013-05-17' },
]

/* cart api-shaped */
const cartApi = { id: 1, user_id: 123, total_items: 3, subtotal: 0 }
const cartItemsApi = [
  { id: 9001, shopping_cart_id: 1, analog_article_id: 211, quantity: 1, unit_price: 520, discount_applied: 0, cd_promotion_id: null },
  { id: 9002, shopping_cart_id: 1, analog_article_id: 207, quantity: 2, unit_price: 380, discount_applied: 0, cd_promotion_id: null },
  { id: 9003, shopping_cart_id: 1, analog_article_id: 203, quantity: 1, unit_price: 370, discount_applied: 0, cd_promotion_id: null },
]

/* adapter */
const articlesById = Object.fromEntries(
  articlesApi.map(a => [a.id, {
    id: a.id,
    album: a.title,
    artist: artistMap[a.artist_id] || '—',
    cover: a.image_url,
    price: a.price,
    category: a.media_type,
    isAvailable: a.is_available,
    stock_quantity: a.stock_quantity,
    year: a.release_date ? new Date(a.release_date).getFullYear() : null,
  }])
)

const cart = ref(cartItemsApi.map(r => ({
  ...r,
  article: articlesById[r.analog_article_id],
})))

/* qty guards */
watch(cart, (list) => {
  list.forEach(it => {
    if (it.quantity < 1) it.quantity = 1
    const stock = it.article?.stock_quantity || Infinity
    if (Number.isFinite(stock) && it.quantity > stock) it.quantity = stock
  })
}, { deep: true })

/* totals */
const lineTotal = (it) => Math.max(0, (it.unit_price * it.quantity) - (it.discount_applied || 0))
const subtotal = computed(() => cart.value.reduce((sum, it) => sum + lineTotal(it), 0))
const totalItems = computed(() => cart.value.reduce((n, it) => n + it.quantity, 0))

/* actions */
const incrQty = (it) => {
  const stock = it.article?.stock_quantity || Infinity
  if (!Number.isFinite(stock) || it.quantity < stock) it.quantity++
}
const decrQty = (it) => { if (it.quantity > 1) it.quantity-- }
const removeItem = (id) => { cart.value = cart.value.filter(i => i.id !== id) }
const checkout = () => {
  alert('Compra simulada. Integra tu flujo de pago aquí.')
}

/* availability badge */
const LOW_STOCK = 3
const availabilityInfo = (a) => {
  if (!a?.isAvailable || (a?.stock_quantity ?? 0) <= 0) return { label: 'Agotado', cls: 'bg-ink text-cream' }
  if ((a?.stock_quantity ?? 0) <= LOW_STOCK) return { label: 'Pocas unidades', cls: 'bg-brand text-cream' }
  return { label: 'Disponible', cls: 'border border-ink text-ink' }
}
</script>

<style scoped>
/* number input polish */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
