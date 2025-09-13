<template>
  <div class="bg-background text-foreground">
    <!-- header -->
    <section class="border-b border-ink/10">
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 class="text-[clamp(28px,6vw,48px)] font-extrabold">Catálogo</h1>
        <p class="mt-1 text-ink/70">Explora y filtra por nombre, precio o categoría.</p>
      </div>
    </section>

    <!-- filters -->
    <section class="border-b border-ink/10 bg-secondary/20">
      <div class="container mx-auto max-w-6xl px-4 py-4 md:py-5">
        <div class="flex flex-wrap items-center gap-3 md:gap-4">
          <input v-model="q" type="search" placeholder="Buscar título o artista…"
            class="w-full sm:w-72 md:w-80 border border-ink/40 bg-background px-4 py-2.5 outline-none focus:border-ink" />

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="px-3 py-2 text-sm border"
              :class="allCatsSelected ? 'bg-ink text-cream border-ink' : 'border-ink/50'" @click="selectAllCats">
              Todos
            </button>
            <button v-for="c in categoryOrder" :key="c" type="button" class="px-3 py-2 text-sm border transition"
              :class="selectedCats.has(c) ? 'bg-ink text-cream border-ink' : 'border-ink/50'" @click="toggleCat(c)">
              {{ categoryLabel[c] }}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <input v-model.number="minPrice" type="number" inputmode="numeric" placeholder="Mín"
              class="w-24 border border-ink/40 bg-background px-3 py-2" />
            <span class="opacity-70">–</span>
            <input v-model.number="maxPrice" type="number" inputmode="numeric" placeholder="Máx"
              class="w-24 border border-ink/40 bg-background px-3 py-2" />
          </div>

          <button class="ml-auto text-sm underline" @click="resetFilters">Restablecer</button>
          <span class="text-sm text-ink/70">{{ filteredCount }} resultados</span>
        </div>
      </div>
    </section>

    <!-- product grid -->
    <section>
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <article v-for="p in paged" :key="p.id"
            class="bg-background border border-ink rounded-sm shadow-sm transition hover:-translate-y-0.5">
            <button type="button" class="block w-full" @click="openModal(p)">
              <img class="w-full aspect-[4/3] object-cover border-b border-ink/60" :src="p.cover"
                :alt="`${p.album} — ${p.artist}`" loading="lazy" />
            </button>

            <div class="p-4 space-y-1">
              <p class="text-sm text-ink/80 line-clamp-1">{{ p.album }}</p>
              <h3 class="text-base font-semibold line-clamp-1">{{ p.artist }}</h3>
              <p class="pt-1 text-lg font-bold text-brand">
                {{ currency.symbol }} {{ p.price?.toLocaleString() }}
              </p>
              <p class="text-xs text-ink/60 mt-1">{{ categoryLabel[p.category] }}</p>
            </div>

            <div class="flex flex-col gap-2 p-4 pt-0">
              <button type="button"
                class="w-full bg-ink text-cream px-4 py-2 text-sm font-semibold tracking-wide disabled:opacity-50"
                :disabled="addingId === p.id || !p.isAvailable || p.stock_quantity <= 0" @click="handleAdd(p)">
                <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
                <span v-if="addedId === p.id">Agregado ✓</span>
                <span v-else-if="addingId === p.id">Agregando…</span>
                <span v-else>Agregar</span>
              </button>

              <p v-if="errorById[p.id]" class="text-xs text-red-600 border border-red-300 bg-red-50 px-2 py-1 rounded">
                {{ errorById[p.id] }}
              </p>

              <div class="flex items-center justify-between gap-2">
                <div class="text-xs text-ink/60">
                  <span class="px-2 py-0.5 rounded" :class="availabilityInfo(p).cls">{{ availabilityInfo(p).label
                    }}</span>
                </div>
                <button type="button" class="grid h-9 w-9 place-items-center border border-ink"
                  :aria-label="`Favorito: ${p.album}`">
                  <Icon name="carbon:favorite" size="18" />
                </button>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-10 flex justify-center" v-if="hasMore">
          <button type="button"
            class="px-6 py-3 border border-ink text-sm font-semibold bg-background hover:bg-ink hover:text-cream transition"
            @click="loadMore">
            Ver más
          </button>
        </div>
      </div>
    </section>

    <!-- product modal -->
    <div v-if="active" class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] grid place-items-center p-4"
      @click.self="closeModal" @keydown.esc="closeModal" tabindex="-1">
      <div
        class="w-full max-w-4xl bg-background border border-ink rounded-sm shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div class="bg-muted/30">
          <img :src="active.cover" :alt="`${active.album} — ${active.artist}`" class="w-full h-full object-cover" />
        </div>

        <div class="p-5 md:p-6 flex flex-col">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-bold leading-tight">{{ active.album }}</h3>
              <p class="text-sm text-ink/70">{{ active.artist }}</p>
            </div>
            <button class="border border-ink px-2 py-1 text-sm" @click="closeModal">Cerrar</button>
          </div>

          <div class="mt-3 flex items-center gap-2">
            <span class="px-2 py-1 text-xs font-semibold rounded" :class="availabilityInfo(active).cls">
              {{ availabilityInfo(active).label }}
            </span>
            <span class="text-xs text-ink/60">{{ categoryLabel[active.category] }}</span>
          </div>

          <p class="mt-4 text-2xl font-black text-brand">
            {{ currency.symbol }} {{ active.price?.toLocaleString() }}
          </p>

          <p v-if="active.description" class="mt-4 text-sm leading-relaxed text-ink/80">
            {{ active.description }}
          </p>

          <ul class="mt-4 grid grid-cols-2 gap-2 text-xs text-ink/70">
            <li v-if="active.year"><span class="opacity-70">Año:</span> {{ active.year }}</li>
            <li><span class="opacity-70">Stock:</span> {{ active.stock_quantity }}</li>
            <li><span class="opacity-70">Formato:</span> {{ categoryLabel[active.category] }}</li>
          </ul>

          <div class="mt-3" v-if="errorById[active.id]">
            <p class="text-xs text-red-600 border border-red-300 bg-red-50 px-2 py-1 rounded">
              {{ errorById[active.id] }}
            </p>
          </div>

          <div class="mt-auto pt-6 flex items-center gap-3">
            <button type="button"
              class="bg-ink text-cream px-5 py-3 text-sm font-semibold flex items-center disabled:opacity-50"
              :disabled="addingId === active.id || !active.isAvailable || active.stock_quantity <= 0"
              @click="handleAdd(active)">
              <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
              <span v-if="addedId === active.id">Agregado ✓</span>
              <span v-else-if="addingId === active.id">Agregando…</span>
              <span v-else>Agregar al carrito</span>
            </button>
            <NuxtLink to="/me/cart" class="border border-ink px-5 py-3 text-sm font-semibold flex items-center"
              @click="closeModal">
              Ir al carrito
              <Icon name="carbon:shopping-cart" size="16" class="ml-2 inline-block" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* minimal imports */
import { ref, computed, watchEffect } from 'vue'

/* categories */
const categoryOrder = ['vinyl', 'cd', 'cassette']
const categoryLabel = { vinyl: 'Vinilo', cd: 'CD', cassette: 'Cassette' }

/* fetch */
const { data: api } = await useAsyncData('catalog-articles', () => $api('/catalog/articles', { query: {} }))

/* helpers */
const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const DEFAULT_CURRENCY = { code: 'GTQ', symbol: 'Q' }
const SIMPLE_CART_MSG = 'Excediste la cantidad de stock en tu carrito.'

/* rows → ui */
const rows = computed(() => api.value?.data?.articles ?? [])
const toUI = (a) => ({
  id: a.id,
  slug: slugify(`${a.artist?.name || ''} ${a.title}`),
  album: a.title,
  artist: a.artist?.name || '—',
  cover: a.imageUrl,
  price: Number(a.price) || 0,
  currency: a.currency && a.currency.symbol ? { code: a.currency.code, symbol: a.currency.symbol } : DEFAULT_CURRENCY,
  category: a.type,
  isAvailable: !!a.isAvailable,
  stock_quantity: Number(a.stockQuantity ?? 0),
  isPreorder: !!a.isPreorder,
  year: null,
  description: '',
})

const products = computed(() => rows.value.map(toUI))
const currency = computed(() => products.value[0]?.currency || DEFAULT_CURRENCY)

/* filters */
const q = ref('')
const selectedCats = ref(new Set(categoryOrder))
const visible = ref(12)

const apiRange = computed(() => api.value?.data?.filters?.priceRange)
const bounds = computed(() => {
  const r = apiRange.value
  if (r && Number.isFinite(r.min) && Number.isFinite(r.max)) return { min: Number(r.min), max: Number(r.max) }
  const arr = products.value.map(p => p.price)
  return arr.length ? { min: Math.min(...arr), max: Math.max(...arr) } : { min: 0, max: 0 }
})
const minPrice = ref(0)
const maxPrice = ref(0)
watchEffect(() => {
  if ((minPrice.value === 0 && maxPrice.value === 0) && (bounds.value.min || bounds.value.max)) {
    minPrice.value = bounds.value.min
    maxPrice.value = bounds.value.max
  }
})

const filtered = computed(() => {
  const qv = q.value.trim().toLowerCase()
  const min = Number.isFinite(minPrice.value) ? minPrice.value : -Infinity
  const max = Number.isFinite(maxPrice.value) ? maxPrice.value : Infinity
  return products.value.filter(p => {
    const inCat = selectedCats.value.has(p.category)
    const inPrice = p.price >= min && p.price <= max
    const inText = !qv || (`${p.album} ${p.artist}`.toLowerCase().includes(qv))
    return inCat && inPrice && inText
  })
})
const filteredCount = computed(() => filtered.value.length)
const paged = computed(() => filtered.value.slice(0, visible.value))
const hasMore = computed(() => visible.value < filtered.value.length)
const loadMore = () => (visible.value += 12)

const allCatsSelected = computed(() => selectedCats.value.size === categoryOrder.length)
const toggleCat = (c) => {
  const s = new Set(selectedCats.value)
  s.has(c) ? s.delete(c) : s.add(c)
  if (s.size === 0) s.add(c)
  selectedCats.value = s
}
const selectAllCats = () => (selectedCats.value = new Set(categoryOrder))
const resetFilters = () => {
  q.value = ''
  selectAllCats()
  minPrice.value = bounds.value.min
  maxPrice.value = bounds.value.max
  visible.value = 12
}

/* modal */
const active = ref(null)
const openModal = (p) => { active.value = p }
const closeModal = () => { active.value = null }

/* add-to-cart states */
const addingId = ref(null)
const addedId = ref(null)
const errorById = ref({})

const showError = (id, msg = SIMPLE_CART_MSG) => {
  errorById.value = { ...errorById.value, [id]: msg }
  setTimeout(() => {
    if (errorById.value[id] === msg) {
      const copy = { ...errorById.value }
      delete copy[id]
      errorById.value = copy
    }
  }, 2500)
}

const addRemote = async (p, qty = 1) => {
  await $api('/cart/items', {
    method: 'POST',
    body: { article_id: Number(p.id), quantity: Number(qty || 1) },
  })
}

const handleAdd = async (p) => {
  if (!p || !p.isAvailable || p.stock_quantity <= 0) return
  addingId.value = p.id
  try {
    await addRemote(p, 1)
    addedId.value = p.id
    setTimeout(() => { if (addedId.value === p.id) addedId.value = null }, 1400)
  } catch (_e) {
    showError(p.id)
  } finally {
    addingId.value = null
  }
}

/* availability badge */
const LOW_STOCK = 3
const availabilityInfo = (p) => {
  if (!p.isAvailable || p.stock_quantity <= 0) return { label: 'Agotado', cls: 'bg-ink text-cream' }
  if (p.stock_quantity <= LOW_STOCK) return { label: 'Pocas unidades', cls: 'bg-brand text-cream' }
  return { label: 'Disponible', cls: 'border border-ink text-ink' }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
