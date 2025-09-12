<template>
  <div class="bg-background text-foreground">
    <!-- header -->
    <section class="border-b border-ink/10">
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 class="text-[clamp(28px,6vw,48px)] font-extrabold">Preventas</h1>
        <p class="mt-1 text-ink/70">
          Lanza pronto. Pre-ordena y accede a pre-escuchas cuando estén disponibles.
        </p>
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
              :class="allCatsSelected ? 'bg-ink text-cream border-ink' : 'border-ink/50'"
              @click="selectAllCats">Todos</button>
            <button v-for="c in categoryOrder" :key="c" type="button" class="px-3 py-2 text-sm border transition"
              :class="selectedCats.has(c) ? 'bg-ink text-cream border-ink' : 'border-ink/50'" @click="toggleCat(c)">{{
                categoryLabel[c] }}</button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm text-ink/70">Ordenar</label>
            <select v-model="sortBy" class="border border-ink/40 bg-background px-3 py-2">
              <option value="date">Lanzamiento</option>
              <option value="artist">Artista</option>
              <option value="price">Precio</option>
            </select>
          </div>

          <span class="ml-auto text-sm text-ink/70">{{ filtered.length }} resultados</span>
        </div>
      </div>
    </section>

    <!-- grid -->
    <section>
      <div class="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <article v-for="p in paged" :key="p.id"
            class="bg-background border border-ink rounded-sm shadow-sm flex flex-col">
            <div class="relative">
              <img class="w-full aspect-[4/3] object-cover border-b border-ink/60" :src="p.image_url"
                :alt="`${p.title} — ${p.artist}`" loading="lazy" />
              <span class="absolute left-3 top-3 bg-brand px-2 py-1 text-xs font-bold text-cream">Preventa</span>
            </div>

            <div class="p-4 space-y-1">
              <p class="text-sm text-ink/80 line-clamp-1">{{ p.title }}</p>
              <h3 class="text-base font-semibold line-clamp-1">{{ p.artist }}</h3>
              <p class="text-xs text-ink/60">{{ categoryLabel[p.media_type] }}</p>

              <div class="mt-2 flex items-center gap-2">
                <span class="rounded border border-ink/40 px-2 py-0.5 text-xs">
                  Lanza {{ formatDate(p.release_date) }}
                </span>
                <span class="rounded px-2 py-0.5 text-xs" :class="preorderStatus(p).cls">{{ preorderStatus(p).label
                }}</span>
              </div>

              <div class="mt-3 h-1.5 w-full bg-ink/10">
                <div class="h-1.5 bg-ink" :style="{ width: preorderProgress(p) + '%' }" />
              </div>

              <p class="pt-3 text-lg font-bold text-brand">
                {{ currency.symbol }} {{ p.price.toLocaleString() }}
              </p>
            </div>

            <div class="px-4 pb-4 mt-auto flex items-center gap-2">
              <button type="button" class="bg-ink text-cream px-4 py-2 text-sm font-semibold disabled:opacity-60"
                :disabled="!isPreorderOpen(p)" @click="preorder(p)">
                Preordenar
              </button>

              <button type="button" class="border border-ink px-4 py-2 text-sm font-semibold"
                @click="togglePreview(p.id)">
                Pre-escucha
              </button>
            </div>

            <!-- preview -->
            <div v-if="openPreview.has(p.id)" class="border-t border-ink/20 p-4 space-y-2">
              <template v-if="tracksByArticle[p.id]?.length">
                <div v-for="t in tracksByArticle[p.id]" :key="t.id" class="flex items-center gap-3">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium truncate">{{ t.track_title }}</p>
                    <p class="text-xs text-ink/60">{{ formatSeconds(t.duration_seconds) }}</p>
                  </div>

                  <template v-if="userCanAccess.has(t.id)">
                    <audio :src="t.audio_file_url" controls class="w-40"></audio>
                  </template>
                  <template v-else>
                    <button type="button" class="text-xs border border-ink px-2 py-1" @click="grantDemoAccess(t.id)">
                      Solicitar acceso
                    </button>
                  </template>
                </div>
              </template>
              <p v-else class="text-sm text-ink/60">Sin pre-escuchas por ahora.</p>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

/* categories */
const categoryOrder = ['vinyl', 'cd', 'cassette']
const categoryLabel = { vinyl: 'Vinilo', cd: 'CD', cassette: 'Cassette' }
const currency = { code: 'GTQ', symbol: 'Q' }
const artistMap = {
  1: 'A-ha', 2: 'Michael Jackson', 3: 'Metallica', 4: 'Madonna',
  5: 'Pink Floyd', 6: 'Daft Punk', 7: 'Radiohead', 8: 'The Beatles',
  9: 'Kendrick Lamar', 10: 'Nirvana', 11: 'LCD Soundsystem', 12: 'Fleetwood Mac'
}

/* analog_article (only preorders) */
const articlesApi = [
  { id: 301, title: 'More', artist_id: 5, price: 520, image_url: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=1200&auto=format&fit=crop', is_preorder: true, preorder_release_date: '2025-10-01', preorder_end_date: '2025-10-20', release_date: '2025-10-21', media_type: 'vinyl' },
  { id: 302, title: 'Discovery (Deluxe)', artist_id: 6, price: 360, image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop', is_preorder: true, preorder_release_date: '2025-09-05', preorder_end_date: '2025-09-25', release_date: '2025-10-01', media_type: 'cd' },
  { id: 303, title: 'In Rainbows – Live Tapes', artist_id: 7, price: 410, image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop', is_preorder: true, preorder_release_date: '2025-09-10', preorder_end_date: '2025-10-10', release_date: '2025-10-15', media_type: 'cassette' },
]

/* preorder_audio (clips per article) */
const preorderAudioApi = [
  { id: 8001, analog_article_id: 301, audio_file_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav', track_title: 'Cirrus Minor (clip)', duration_seconds: 30, file_size_bytes: 512000, download_count: 0, is_downloadable: false, created_at: '2025-08-15' },
  { id: 8002, analog_article_id: 301, audio_file_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav', track_title: 'Green Is the Colour (clip)', duration_seconds: 40, file_size_bytes: 640000, download_count: 0, is_downloadable: false, created_at: '2025-08-15' },
  { id: 8003, analog_article_id: 302, audio_file_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav', track_title: 'Aerodynamic (clip)', duration_seconds: 45, file_size_bytes: 720000, download_count: 0, is_downloadable: false, created_at: '2025-08-20' },
]

/* user_preorder_audio_access (grants for current user) */
const currentUserId = 123
const userPreorderAccessApi = [
  { id: 5001, user_id: currentUserId, preorder_audio_id: 8001, access_granted_at: '2025-09-01', last_played_at: null, play_count: 0, downloaded: false, downloaded_at: null },
]

/* adapters */
const preorders = computed(() =>
  articlesApi
    .filter(a => a.is_preorder)
    .map(a => ({
      ...a,
      artist: artistMap[a.artist_id] || '—',
    }))
)

const tracksByArticle = computed(() => {
  const m = {}
  for (const t of preorderAudioApi) {
    (m[t.analog_article_id] ||= []).push(t)
  }
  return m
})

const userCanAccess = computed(() => new Set(userPreorderAccessApi.map(x => x.preorder_audio_id)))

/* state */
const q = ref('')
const sortBy = ref('date')
const selectedCats = ref(new Set(categoryOrder))
const openPreview = ref(new Set())
const visible = ref(12)

/* filters + sort */
const filtered = computed(() => {
  const qv = q.value.trim().toLowerCase()
  let arr = preorders.value.filter(p => {
    const inCat = selectedCats.value.has(p.media_type)
    const inText = !qv || (`${p.title} ${p.artist}`.toLowerCase().includes(qv))
    return inCat && inText
  })
  if (sortBy.value === 'artist') arr = arr.sort((a, b) => a.artist.localeCompare(b.artist))
  else if (sortBy.value === 'price') arr = arr.sort((a, b) => a.price - b.price)
  else arr = arr.sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
  return arr
})

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

/* preview gating */
const togglePreview = (id) => {
  const s = new Set(openPreview.value)
  s.has(id) ? s.delete(id) : s.add(id)
  openPreview.value = s
}
const grantDemoAccess = (trackId) => {
  if (!userCanAccess.value.has(trackId)) {
    userPreorderAccessApi.push({
      id: Date.now(), user_id: currentUserId, preorder_audio_id: trackId,
      access_granted_at: new Date().toISOString()
    })
  }
}

/* preorder window helpers */
const now = () => new Date()
const isPreorderOpen = (p) => {
  const start = new Date(p.preorder_release_date)
  const end = new Date(p.preorder_end_date)
  const t = now()
  return t >= start && t <= end
}
const preorderProgress = (p) => {
  const start = new Date(p.preorder_release_date).getTime()
  const end = new Date(p.preorder_end_date).getTime()
  const t = now().getTime()
  if (t <= start) return 0
  if (t >= end) return 100
  return Math.round(((t - start) / (end - start)) * 100)
}
const preorderStatus = (p) => {
  const t = now()
  const start = new Date(p.preorder_release_date)
  const end = new Date(p.preorder_end_date)
  if (t < start) return { label: `Abre ${formatDate(p.preorder_release_date)}`, cls: 'border border-ink/40' }
  if (t > end) return { label: 'Cerrada', cls: 'bg-ink text-cream' }
  const daysLeft = Math.max(0, Math.ceil((end - t) / (1000 * 60 * 60 * 24)))
  return { label: `Quedan ${daysLeft} días`, cls: 'bg-brand text-cream' }
}

/* ui utils */
const formatDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return iso }
}
const formatSeconds = (s) => {
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(Math.floor(s % 60)).padStart(2, '0')
  return `${mm}:${ss}`
}

/* CTA */
const preorder = (p) => {
  alert(`Pre-orden simulada: ${p.title} — ${p.artist}`)
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
