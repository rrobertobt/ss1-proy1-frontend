<template>
  <div class="home bg-background text-foreground overflow-hidden">
    <!-- HERO -->
    <section class="relative isolate">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute left-0 right-[40%] top-16 h-px bg-ink/20"></div>
        <div class="absolute right-[40%] top-0 bottom-0 w-px bg-ink/10"></div>
        <div class="absolute left-[60%] right-0 bottom-16 h-px bg-ink/20"></div>
      </div>

      <div class="container mx-auto max-w-6xl px-4 py-14 md:py-24">
        <div class="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
          <div class="md:col-span-7">
            <h1 class="font-extrabold tracking-tight leading-[1.05] text-[clamp(34px,6vw,56px)]">
              Bueno Para Más Nada:
              <span class="italic">rompemos los moldes</span>
              para que la música independiente
              <span class="text-brand">suene más fuerte</span>.
            </h1>

            <div class="mt-6 h-px w-full max-w-md bg-ink/30"></div>

            <p class="mt-4 max-w-xl text-lg md:text-xl">
              — “La música es sinónimo de libertad, de tocar lo que quieras y cómo quieras, siempre que sea bueno y
              tenga pasión. Que la música sea el alimento del amor.”
              <span class="text-ink/60 block">Kurt Cobain · 1967 - 1994</span>
            </p>

            <div class="mt-8">
              <NuxtLink
                to="/catalog"
                class="inline-flex items-center gap-3 bg-ink px-5 py-3 font-semibold text-cream transition hover:opacity-90"
                aria-label="Explore catalog"
              >
                Elegir un disco
                <span class="grid h-6 w-6 place-items-center rounded-full bg-brand">
                  <Icon name="carbon:play-filled" size="16" />
                </span>
              </NuxtLink>
            </div>
          </div>

          <div class="relative md:col-span-5 z-50">
            <div class="mx-auto aspect-square w-[490px] rounded-full border border-ink/20 grid place-items-center">
              <div class="vinyl size-[88%] animate-spin-slow">
                <div class="vinyl-label"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BEST SELLERS -->
    <section class="bg-secondary/90 border-t border-ink/10">
      <div class="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 class="mb-10 text-center text-[clamp(26px,5vw,40px)] font-extrabold tracking-wide">
          LOS MÁS VENDIDOS
        </h2>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="item in bestSellers"
            :key="item.id"
            class="bg-background border border-ink rounded-sm shadow-sm transition hover:-translate-y-0.5"
          >
            <NuxtLink :to="`/producto/${item.slug}`" class="block">
              <img
                class="w-full aspect-[4/3] object-cover border-b border-ink/60"
                :src="item.cover"
                :alt="`${item.album} — ${item.artist}`"
                loading="lazy"
              />
            </NuxtLink>

            <div class="p-4 space-y-1">
              <p class="text-sm text-ink/80 line-clamp-1">{{ item.album }}</p>
              <h3 class="text-base font-semibold line-clamp-1">{{ item.artist }}</h3>
              <p class="pt-1 text-lg font-bold text-brand">
                {{ item.currency.symbol }} {{ item.price?.toLocaleString() }}
              </p>
            </div>

            <div class="flex flex-col gap-2 p-4 pt-0">
              <button
                type="button"
                class="w-full bg-ink text-cream px-4 py-2 text-sm font-semibold tracking-wide disabled:opacity-50"
                :disabled="addingId === item.id || !item.isAvailable || item.stock_quantity <= 0"
                @click="handleAdd(item)"
              >
                <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
                <span v-if="addedId === item.id">Agregado ✓</span>
                <span v-else-if="addingId === item.id">Agregando…</span>
                <span v-else>Agregar</span>
              </button>

              <p
                v-if="errorById[item.id]"
                class="text-xs text-red-600 border border-red-300 bg-red-50 px-2 py-1 rounded"
              >
                {{ errorById[item.id] }}
              </p>

              <div class="flex items-center justify-between gap-2">
                <div class="text-xs text-ink/60">
                  <span
                    class="px-2 py-0.5 rounded"
                    :class="availabilityInfo(item).cls"
                  >{{ availabilityInfo(item).label }}</span>
                </div>
                <button
                  type="button"
                  class="grid h-9 w-9 place-items-center border border-ink"
                  :aria-label="`Favorito: ${item.album}`"
                >
                  <Icon name="carbon:favorite" size="18" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- RECOMENDACIÓN DEL DÍA -->
    <section class="relative border-t border-ink/10 bg-secondary/20">
      <div class="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-12 md:py-24">
        <div class="md:col-span-5">
          <div class="relative rounded border border-ink/50 bg-background shadow-sm">
            <img class="w-full aspect-square object-cover" :src="featured.cover" :alt="`${featured.album} — ${featured.artist}`" loading="lazy" />
            <span class="absolute left-3 top-3 bg-brand px-2 py-1 text-xs font-bold text-cream">Recomendación del día</span>
          </div>
        </div>

        <div class="md:col-span-7">
          <h2 class="text-[clamp(26px,4.5vw,40px)] font-extrabold leading-tight">
            {{ featured.album }}
          </h2>
          <p class="mt-1 text-xl font-semibold">{{ featured.artist }}</p>

          <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/70">
            <span class="rounded border border-ink/50 px-2 py-1">{{ featured.year }}</span>
            <span class="rounded border border-ink/50 px-2 py-1">{{ featured.format }}</span>
            <span v-for="t in featured.tags" :key="t" class="rounded border border-ink/50 px-2 py-1">{{ t }}</span>
          </div>

          <p class="mt-6 max-w-prose text-lg">
            {{ featured.description }}
          </p>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p class="mb-2 text-sm font-semibold">Lado A</p>
              <ol class="list-decimal pl-5 space-y-1 text-sm">
                <li v-for="(t, i) in featured.tracksA" :key="`A${i}`">{{ t }}</li>
              </ol>
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold">Lado B</p>
              <ol class="list-decimal pl-5 space-y-1 text-sm">
                <li v-for="(t, i) in featured.tracksB" :key="`B${i}`">{{ t }}</li>
              </ol>
            </div>
          </div>

          <div class="mt-3" v-if="errorById[featured.id]">
            <p class="text-xs text-red-600 border border-red-300 bg-red-50 px-2 py-1 rounded">
              {{ errorById[featured.id] }}
            </p>
          </div>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <span class="text-2xl font-black text-brand">
              {{ featured.currency.symbol }} {{ featured.price?.toLocaleString() }}
            </span>
            <button
              type="button"
              class="bg-ink text-cream px-5 py-3 text-sm font-semibold disabled:opacity-50"
              :disabled="addingId === featured.id || !featured.isAvailable || featured.stock_quantity <= 0"
              @click="handleAdd(featured)"
            >
              <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
              <span v-if="addedId === featured.id">Agregado ✓</span>
              <span v-else-if="addingId === featured.id">Agregando…</span>
              <span v-else>Agregar al carrito</span>
            </button>
            <button type="button" class="grid h-10 w-10 place-items-center border border-ink" :aria-label="`Favorito: ${featured.album}`">
              <Icon name="carbon:favorite" size="18" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- PRE-FOOTER -->
    <section class="bg-brand text-cream">
      <div class="container mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">
        <div class="flex items-center gap-2 text-xl font-black italic">
          <Icon name="carbon:cd-archive" size="32" />
          Bueno Para Más Nada
        </div>
        <div>
          <p class="font-semibold">Estamos en:</p>
          <p>Quetzaltenango, Guatemala</p>
          <p class="mt-2 text-cream/90">Eventos, lanzamientos y comunidad analógica.</p>
        </div>
        <form class="flex h-[56px]" @submit.prevent>
          <label for="newsletter-email" class="sr-only">Email</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="tu@email.com"
            class="w-full border border-cream/70 bg-transparent px-4 py-2 placeholder:opacity-80 outline-none focus:bg-cream/10"
            autocomplete="email"
          />
          <button type="submit" class="ml-2 grid place-items-center bg-ink px-3 py-2" aria-label="Subscribe">
            <Icon name="carbon:play-filled" size="18" />
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'

/* utils */
const DEFAULT_CURRENCY = { code: 'GTQ', symbol: 'Q' }
const SIMPLE_CART_MSG = 'Excediste la cantidad de stock en tu carrito.'
const normCurrency = (c) => (c && c.symbol ? c : DEFAULT_CURRENCY)
const typeLabel = (t) => (t === 'vinyl' ? 'Vinilo LP' : t === 'cd' ? 'CD' : t === 'cassette' ? 'Cassette' : t)
const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/* fetch list */
const { data: api } = await useAsyncData('home-catalog-articles', () => $api('/catalog/articles', { query: {} }))

const rows = computed(() => api.value?.data?.articles ?? [])
const toUI = (a) => ({
  id: a.id,
  slug: slugify(`${a.artist?.name || ''} ${a.title}`),
  album: a.title,
  artist: a.artist?.name || '—',
  cover: a.imageUrl,
  price: Number(a.price) || 0,
  currency: normCurrency(a.currency),
  category: a.type,
  isAvailable: !!a.isAvailable,
  isPreorder: !!a.isPreorder,
  stock_quantity: Number(a.stockQuantity ?? 0),
})
const articles = computed(() => rows.value.map(toUI))

/* sections */
const bestSellers = computed(() => articles.value.slice(0, 4))
const featured = computed(() => {
  const f = articles.value[0] || { currency: DEFAULT_CURRENCY, category: 'vinyl' }
  return {
    ...f,
    year: new Date().getFullYear(),
    format: typeLabel(f.category),
    tags: [api.value?.data?.filters?.genres?.[0]?.name].filter(Boolean),
    description: '',
  }
})

/* filtering UI (unchanged visual) */
const currency = computed(() => articles.value[0]?.currency || DEFAULT_CURRENCY)

/* add-to-cart */
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

/* availability chip */
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
