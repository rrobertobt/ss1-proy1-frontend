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
          <!-- search -->
          <input v-model="q" type="search" placeholder="Buscar título o artista…"
            class="w-full sm:w-72 md:w-80 border border-ink/40 bg-background px-4 py-2.5 outline-none focus:border-ink" />

          <!-- categories -->
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

          <!-- price -->
          <div class="flex items-center gap-2">
            <input v-model.number="minPrice" type="number" inputmode="numeric" placeholder="Mín"
              class="w-24 border border-ink/40 bg-background px-3 py-2" />
            <span class="opacity-70">–</span>
            <input v-model.number="maxPrice" type="number" inputmode="numeric" placeholder="Máx"
              class="w-24 border border-ink/40 bg-background px-3 py-2" />
          </div>

          <!-- reset -->
          <button class="ml-auto text-sm underline" @click="resetFilters">Restablecer</button>
          <span class="text-sm text-ink/70">{{ filteredCount }} resultados</span>
        </div>
      </div>
    </section>

    <!-- product grid -->
    <section>
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <article v-for="p in paged" :key="p.slug"
            class="bg-background border border-ink rounded-sm shadow-sm transition hover:-translate-y-0.5">
            <!-- open modal instead of navigate -->
            <button type="button" class="block w-full" @click="openModal(p)">
              <img class="w-full aspect-[4/3] object-cover border-b border-ink/60" :src="p.cover"
                :alt="`${p.album} — ${p.artist}`" loading="lazy" />
            </button>

            <div class="p-4 space-y-1">
              <p class="text-sm text-ink/80 line-clamp-1">{{ p.album }}</p>
              <h3 class="text-base font-semibold line-clamp-1">{{ p.artist }}</h3>
              <p class="pt-1 text-lg font-bold text-brand">{{ currency.symbol }} {{ p.price.toLocaleString() }}</p>
              <p class="text-xs text-ink/60 mt-1">{{ categoryLabel[p.category] }}</p>
            </div>

            <div class="flex items-center justify-between gap-2 p-4 pt-0">
              <button type="button" class="w-full bg-ink text-cream px-4 py-2 text-sm font-semibold tracking-wide">
                <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
                Agregar
              </button>
              <button type="button" class="grid h-9 w-9 place-items-center border border-ink"
                :aria-label="`Favorito: ${p.album}`">
                <Icon name="carbon:favorite" size="18" />
              </button>
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
        <!-- cover -->
        <div class="bg-muted/30">
          <img :src="active.cover" :alt="`${active.album} — ${active.artist}`" class="w-full h-full object-cover" />
        </div>

        <!-- info -->
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

          <p class="mt-4 text-2xl font-black text-brand">{{ currency.symbol }} {{ active.price.toLocaleString() }}</p>

          <p v-if="active.description" class="mt-4 text-sm leading-relaxed text-ink/80">
            {{ active.description }}
          </p>

          <ul class="mt-4 grid grid-cols-2 gap-2 text-xs text-ink/70">
            <li v-if="active.year"><span class="opacity-70">Año:</span> {{ active.year }}</li>
            <li><span class="opacity-70">Stock:</span> {{ active.stock_quantity }}</li>
            <li><span class="opacity-70">Formato:</span> {{ categoryLabel[active.category] }}</li>
          </ul>

          <div class="mt-auto pt-6 flex items-center gap-3">
            <button type="button" class="bg-ink text-cream px-5 py-3 text-sm font-semibold flex items-center"
              :disabled="!active.isAvailable">
              <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
              Agregar al carrito
            </button>
            <NuxtLink to="/cart" class="border border-ink px-5 py-3 text-sm font-semibold flex items-center"
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
import { ref, computed, watchEffect } from 'vue'

/* categories */
const categoryOrder = ['vinyl', 'cd', 'cassette']
const categoryLabel = { vinyl: 'Vinilo', cd: 'CD', cassette: 'Cassette' }

/* lookups */
const artistMap = {
  1: 'A-ha', 2: 'Michael Jackson', 3: 'Metallica', 4: 'Madonna',
  5: 'Pink Floyd', 6: 'Daft Punk', 7: 'Radiohead', 8: 'The Beatles',
  9: 'Kendrick Lamar', 10: 'Nirvana', 11: 'LCD Soundsystem', 12: 'Fleetwood Mac'
}
const currency = { code: 'GTQ', symbol: 'Q' }

/* data (api-shaped) */
const productsApi = [
  { id: 201, title: 'Hunting High and Low', artist_id: 1, price: 340, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 12, media_type: 'vinyl', release_date: '1985-06-01', description: '' },
  { id: 202, title: 'Thriller', artist_id: 2, price: 400, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 2, media_type: 'vinyl', release_date: '1982-11-30', description: '' },
  { id: 203, title: '...And Justice for All', artist_id: 3, price: 370, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 0, media_type: 'cd', release_date: '1988-09-07', description: '' },
  { id: 204, title: 'Like a Prayer', artist_id: 4, price: 270, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 7, media_type: 'cassette', release_date: '1989-03-21', description: '' },
  { id: 205, title: 'Discovery', artist_id: 6, price: 320, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop', is_available: false, stock_quantity: 0, media_type: 'cd', release_date: '2001-03-12', description: '' },
  { id: 206, title: 'OK Computer', artist_id: 7, price: 450, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 15, media_type: 'vinyl', release_date: '1997-05-21', description: '' },
  { id: 207, title: 'Abbey Road', artist_id: 8, price: 380, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 5, media_type: 'vinyl', release_date: '1969-09-26', description: '' },
  { id: 208, title: 'Nevermind', artist_id: 10, price: 295, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 3, media_type: 'cassette', release_date: '1991-09-24', description: '' },
  { id: 209, title: 'Rumours', artist_id: 12, price: 310, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 9, media_type: 'cd', release_date: '1977-02-04', description: '' },
  { id: 210, title: 'To Pimp a Butterfly', artist_id: 9, price: 360, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 11, media_type: 'vinyl', release_date: '2015-03-15', description: '' },
  { id: 211, title: 'The Dark Side of the Moon', artist_id: 5, price: 520, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 1, media_type: 'vinyl', release_date: '1973-03-01', description: '' },
  { id: 212, title: 'Random Access Memories', artist_id: 6, price: 350, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 4, media_type: 'cassette', release_date: '2013-05-17', description: '' },
  { id: 213, title: 'In Rainbows', artist_id: 7, price: 390, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 0, media_type: 'cd', release_date: '2007-10-10', description: '' },
  { id: 214, title: 'The Wall', artist_id: 5, price: 540, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1520975682031-a0f61c7d1df1?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 6, media_type: 'vinyl', release_date: '1979-11-30', description: '' },
  { id: 215, title: 'Off the Wall', artist_id: 2, price: 330, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?q=80&w=1200&auto=format&fit=crop', is_available: true, stock_quantity: 10, media_type: 'cd', release_date: '1979-08-10', description: '' },
  { id: 216, title: 'The Beatles (White Album)', artist_id: 8, price: 610, currency_id: 1, image_url: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop', is_available: false, stock_quantity: 0, media_type: 'vinyl', release_date: '1968-11-22', description: '' },
]

/* helpers */
const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/* ui adapter */
const products = computed(() =>
  productsApi.map(p => ({
    slug: slugify(`${artistMap[p.artist_id] || ''} ${p.title}`),
    album: p.title,
    artist: artistMap[p.artist_id] || '—',
    cover: p.image_url,
    price: p.price,
    category: p.media_type,
    isAvailable: p.is_available,
    stock_quantity: p.stock_quantity,
    year: p.release_date ? new Date(p.release_date).getFullYear() : null,
    description: p.description || '',
  }))
)

/* state */
const q = ref('')
const selectedCats = ref(new Set(categoryOrder))
const visible = ref(12)
const bounds = computed(() => {
  const arr = products.value.map(p => p.price)
  return { min: Math.min(...arr), max: Math.max(...arr) }
})
const minPrice = ref(0)
const maxPrice = ref(0)
watchEffect(() => {
  if (minPrice.value === 0 && maxPrice.value === 0) {
    minPrice.value = bounds.value.min
    maxPrice.value = bounds.value.max
  }
})

/* filters */
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

/* availability label + class */
const LOW_STOCK = 3
const availabilityInfo = (p) => {
  if (!p.isAvailable || p.stock_quantity <= 0) {
    return { label: 'Agotado', cls: 'bg-ink text-cream' }
  }
  if (p.stock_quantity <= LOW_STOCK) {
    return { label: 'Pocas unidades', cls: 'bg-brand text-cream' }
  }
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
