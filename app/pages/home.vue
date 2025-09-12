<template>
  <div class="home bg-background text-foreground overflow-hidden">
    <!-- HERO -->
    <section class="relative isolate">
      <!-- poster lines -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute left-0 right-[40%] top-16 h-px bg-ink/20"></div>
        <div class="absolute right-[40%] top-0 bottom-0 w-px bg-ink/10"></div>
        <div class="absolute left-[60%] right-0 bottom-16 h-px bg-ink/20"></div>
      </div>

      <div class="container mx-auto max-w-6xl px-4 py-14 md:py-24">
        <div class="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
          <!-- left: copy -->
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
              <NuxtLink to="/catalog"
                class="inline-flex items-center gap-3 bg-ink px-5 py-3 font-semibold text-cream transition hover:opacity-90"
                aria-label="Explore catalog">
                Elegir un disco
                <span class="grid h-6 w-6 place-items-center rounded-full bg-brand">
                  <Icon name="carbon:play-filled" size="16" />
                </span>
              </NuxtLink>
            </div>
          </div>

          <!-- right: vinyl -->
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
          <article v-for="item in bestSellers" :key="item.slug"
            class="bg-background border border-ink rounded-sm shadow-sm transition hover:-translate-y-0.5">
            <NuxtLink :to="`/producto/${item.slug}`" class="block">
              <img class="w-full aspect-[4/3] object-cover border-b border-ink/60" :src="item.cover"
                :alt="`${item.album} — ${item.artist}`" loading="lazy" />
            </NuxtLink>

            <div class="p-4 space-y-1">
              <p class="text-sm text-ink/80 line-clamp-1">{{ item.album }}</p>
              <h3 class="text-base font-semibold line-clamp-1">{{ item.artist }}</h3>
              <p class="pt-1 text-lg font-bold text-brand">Q {{ item.price.toLocaleString() }}</p>
            </div>

            <div class="flex items-center justify-between gap-2 p-4 pt-0">
              <button type="button" class="w-full bg-ink text-cream px-4 py-2 text-sm font-semibold tracking-wide">
                <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
                Agregar
              </button>

              <button type="button" class="grid h-9 w-9 place-items-center border border-ink"
                :aria-label="`Favorito: ${item.album}`">
                <Icon name="carbon:favorite" size="18" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>


    <!-- RECOMENDACIÓN DEL DÍA -->
    <section class="relative border-t border-ink/10 bg-secondary/20">
      <div class="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-12 md:py-24">
        <!-- cover -->
        <div class="md:col-span-5">
          <div class="relative rounded border border-ink/50 bg-background shadow-sm">
            <img class="w-full aspect-square object-cover" :src="featured.cover"
              :alt="`${featured.album} — ${featured.artist}`" loading="lazy" />
            <span class="absolute left-3 top-3 bg-brand px-2 py-1 text-xs font-bold text-cream">Recomendación del
              día</span>
          </div>
        </div>

        <!-- info -->
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

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <span class="text-2xl font-black text-brand">Q {{ featured.price.toLocaleString() }}</span>
            <button type="button" class="bg-ink text-cream px-5 py-3 text-sm font-semibold">
              <Icon name="carbon:shopping-cart" size="16" class="mr-2 inline-block" />
              Agregar al carrito
            </button>
            <NuxtLink :to="`/producto/${featured.slug}`" class="border border-ink px-5 py-3 text-sm font-semibold">
              Ver detalles
            </NuxtLink>
            <button type="button" class="grid h-10 w-10 place-items-center border border-ink"
              :aria-label="`Favorito: ${featured.album}`">
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
          <input id="newsletter-email" type="email" placeholder="tu@email.com"
            class="w-full border border-cream/70 bg-transparent px-4 py-2 placeholder:opacity-80 outline-none focus:bg-cream/10"
            autocomplete="email" />
          <button type="submit" class="ml-2 grid place-items-center bg-ink px-3 py-2" aria-label="Subscribe">
            <Icon name="carbon:play-filled" size="18" />
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/* minimal lookups; en producción vendrán de sus tablas/endpoint */
const artistMap = {
  1: 'A-ha',
  2: 'Michael Jackson',
  3: 'Metallica',
  4: 'Madonna',
  99: 'Pink Floyd',
}
const currencyMap = {
  1: { code: 'GTQ', symbol: 'Q' },
  2: { code: 'USD', symbol: '$' },
}
const genreMap = {
  1: 'Rock', 2: 'Pop', 3: 'Psychedelic', 4: 'OST'
}

/* === MOCK con la forma del endpoint (campos del schema) === */
const bestSellersApi = [
  {
    id: 101,
    title: 'Hunting High and Low',
    artist_id: 1,
    price: 340,
    currency_id: 1,
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    total_sold: 1200,
    is_available: true,
  },
  {
    id: 102,
    title: 'Thriller',
    artist_id: 2,
    price: 400,
    currency_id: 1,
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    total_sold: 2000,
    is_available: true,
  },
  {
    id: 103,
    title: '...And Justice for All',
    artist_id: 3,
    price: 370,
    currency_id: 1,
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    total_sold: 980,
    is_available: true,
  },
  {
    id: 104,
    title: 'Like a Prayer',
    artist_id: 4,
    price: 270,
    currency_id: 1,
    image_url: 'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?q=80&w=1200&auto=format&fit=crop',
    total_sold: 1100,
    is_available: true,
  },
]

const featuredApi = {
  id: 999,
  title: 'More',
  artist_id: 99,
  price: 520,
  currency_id: 1,
  image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
  music_genre_id: 4,
  release_date: '1969-06-13',
  description:
    'Edición cuidada de la banda sonora de “More”. Texturas psicodélicas y momentos acústicos que marcan la transición temprana de Pink Floyd.',
  is_available: true,
}

/* helpers */
const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const bestSellers = computed(() =>
  bestSellersApi.map(p => ({
    slug: slugify(`${artistMap[p.artist_id] || ''} ${p.title}`),
    album: p.title,
    artist: artistMap[p.artist_id] || '—',
    cover: p.image_url,
    price: p.price,
    currency: currencyMap[p.currency_id] || currencyMap[1],
    isAvailable: p.is_available,
  }))
)

const featured = computed(() => ({
  slug: slugify(`${artistMap[featuredApi.artist_id]} ${featuredApi.title}`),
  album: featuredApi.title,
  artist: artistMap[featuredApi.artist_id] || '—',
  year: new Date(featuredApi.release_date).getFullYear(),
  format: 'Vinilo LP · 180g',
  tags: [genreMap[featuredApi.music_genre_id]].filter(Boolean),
  cover: featuredApi.image_url,
  price: featuredApi.price,
  description: featuredApi.description,
  tracksA: [],
  tracksB: [],
}))
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
