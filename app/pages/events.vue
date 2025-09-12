<template>
  <div class="bg-background text-foreground">
    <!-- Header -->
    <section class="border-b border-ink/10 bg-secondary/20">
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div class="flex items-end justify-between gap-4">
          <div>
            <h1 class="text-[clamp(28px,6vw,48px)] font-extrabold">Eventos</h1>
            <p class="mt-1 text-ink/70">Lanzamientos, escuchas colectivas y encuentros de la comunidad.</p>
          </div>
          <div class="hidden sm:block text-right">
            <p class="text-sm text-ink/60">Próximamente</p>
            <p class="text-2xl font-black">{{ upcomingCount }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filtros (sticky) -->
    <section class="sticky top-16 z-10 border-b border-ink/10 bg-background/80 backdrop-blur">
      <div class="container mx-auto max-w-6xl px-4 py-3">
        <div class="flex flex-wrap items-center gap-3 md:gap-4">
          <!-- search -->
          <input v-model="q" type="search" placeholder="Buscar evento o artista…"
            class="w-full sm:w-72 md:w-80 border border-ink/40 bg-background px-4 py-2.5 outline-none focus:border-ink" />

          <!-- status chips -->
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="px-3 py-2 text-sm border transition"
              :class="allStatusesSelected ? 'bg-ink text-cream border-ink' : 'border-ink/50 bg-background'"
              @click="selectAllStatuses">
              Todos
            </button>

            <button v-for="s in statusOrder" :key="s" type="button" class="px-3 py-2 text-sm border transition"
              :class="selectedStatuses.has(s) ? 'bg-ink text-cream border-ink' : 'border-ink/50 bg-background'"
              @click="toggleStatus(s)">
              {{ statusLabel[s] }}
            </button>
          </div>

          <!-- sort -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-ink/70">Orden</label>
            <select v-model="sortBy" class="border border-ink/40 bg-background px-3 py-2">
              <option value="soon">Más próximos</option>
              <option value="artist">Artista</option>
              <option value="new">Recientes</option>
            </select>
          </div>

          <span class="ml-auto text-sm text-ink/70">{{ filtered.length }} resultados</span>
        </div>
      </div>
    </section>

    <!-- Grid -->
    <section>
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <article v-for="ev in paged" :key="ev.id"
            class="relative overflow-hidden rounded-lg border border-ink/30 bg-background/90 shadow-sm flex flex-col">
            <!-- Ribbon -->
            <div class="bg-brand/95 text-cream px-3 py-2 flex items-center justify-between">
              <span class="font-semibold text-sm">{{ eventStatus(ev).label }}</span>
              <span class="text-sm">{{ formatDateTime(ev.start_datetime) }}</span>
            </div>

            <!-- Cover -->
            <div class="relative">
              <img class="w-full aspect-[4/3] object-cover border-b border-ink/10"
                :src="articlesById[ev.analog_article_id]?.image_url"
                :alt="`${ev.title} — ${articlesById[ev.analog_article_id]?.artist}`" loading="lazy" />
              <div v-if="ev.event_status_id === 'live'"
                class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/50 px-2 py-1">
                <span class="h-2 w-2 rounded-full bg-brand animate-pulse"></span>
                <span class="text-xs text-cream">En vivo</span>
              </div>
            </div>

            <!-- Body -->
            <div class="p-4 space-y-2">
              <h3 class="text-base font-bold leading-tight line-clamp-2">{{ ev.title }}</h3>
              <p class="text-sm text-ink/70 line-clamp-1">
                {{ articlesById[ev.analog_article_id]?.artist }}
              </p>

              <!-- Capacity -->
              <div class="mt-2">
                <div class="h-1.5 bg-ink/10 rounded">
                  <div class="h-1.5 bg-brand rounded" :style="{ width: capacityPct(ev) + '%' }"></div>
                </div>
                <div class="mt-1 flex justify-between text-xs text-ink/60">
                  <span>{{ capacityText(ev) }}</span>
                  <span v-if="ev.max_participants">Capacidad</span>
                </div>
              </div>

              <p class="pt-2 text-lg font-bold text-brand">
                {{ currency.symbol }} {{ (articlesById[ev.analog_article_id]?.price || 0).toLocaleString() }}
              </p>
            </div>

            <!-- Stub (acciones) -->
            <div class="relative flex items-center justify-between gap-2 px-4 py-3 border-t border-ink/20">
              <button type="button" class="bg-ink text-cream px-4 py-2 text-sm font-semibold disabled:opacity-60"
                :disabled="!canRegister(ev)" @click="toggleRegistration(ev)">
                {{ isRegistered(ev.id) ? 'Cancelar' : ctaLabel(ev) }}
              </button>
              <button type="button" class="border border-ink px-4 py-2 text-sm font-semibold" @click="openDetail(ev)">
                Detalle
              </button>

              <!-- Perforación visual -->
              <div class="pointer-events-none absolute top-0 bottom-0 right-[88px] w-px"
                style="background:repeating-linear-gradient(to bottom,rgba(0,0,0,.25),rgba(0,0,0,.25) 6px,transparent 6px,transparent 12px);" />
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

    <!-- Modal -->
    <div v-if="detail" class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] grid place-items-center p-4"
      @click.self="detail = null">
      <div class="w-full max-w-3xl bg-background border border-ink rounded-sm shadow-xl overflow-hidden">
        <div class="bg-brand/95 text-cream px-5 py-3 flex items-center justify-between">
          <strong class="truncate">{{ detail.title }}</strong>
          <span class="text-sm">{{ formatDateTime(detail.start_datetime) }}</span>
        </div>

        <div class="grid md:grid-cols-2 gap-6 p-5">
          <div class="space-y-3">
            <img :src="articlesById[detail.analog_article_id]?.image_url"
              class="w-full aspect-square object-cover border border-ink/20"
              :alt="articlesById[detail.analog_article_id]?.title" />
            <p class="text-sm text-ink/70">{{ articlesById[detail.analog_article_id]?.artist }}</p>
            <p class="text-sm">{{ detail.description }}</p>

            <div v-if="detail.audio_file_url" class="space-y-1">
              <p class="text-sm font-semibold">Pre-escucha</p>
              <audio :src="detail.audio_file_url" controls class="w-full"></audio>
              <p class="text-xs text-ink/60">{{ formatDuration(detail.audio_duration_seconds) }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="rounded border border-ink/40 px-2 py-0.5">{{ eventStatus(detail).label }}</span>
              <span class="rounded border border-ink/40 px-2 py-0.5">{{ capacityText(detail) }}</span>
            </div>

            <div>
              <p class="text-sm font-semibold mb-2">Chat (preview)</p>
              <div class="h-48 overflow-auto border border-ink/20">
                <div v-for="m in chatByEvent[detail.id] || []" :key="m.id" class="px-3 py-2 border-b border-ink/10">
                  <p class="text-xs text-ink/60">
                    {{ usersById[m.user_id]?.first_name }} — {{ formatTime(m.sent_at) }}
                    <span v-if="m.is_system_message" class="ml-2 text-[10px] px-1 border border-ink/40">sistema</span>
                  </p>
                  <p class="text-sm">{{ m.message }}</p>
                </div>
                <p v-if="!(chatByEvent[detail.id]?.length)" class="p-3 text-sm text-ink/60">Aún no hay mensajes.</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button class="bg-ink text-cream px-4 py-2 text-sm font-semibold disabled:opacity-60"
                :disabled="!canRegister(detail)" @click="toggleRegistration(detail)">
                {{ isRegistered(detail.id) ? 'Cancelar' : ctaLabel(detail) }}
              </button>
              <button class="border border-ink px-4 py-2 text-sm font-semibold" :disabled="!canEnter(detail)">
                Entrar al evento
              </button>
              <button class="ml-auto grid h-9 w-9 place-items-center border border-ink" @click="detail = null">
                <Icon name="carbon:close" size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

/* lookups */
const currency = { code: 'GTQ', symbol: 'Q' }
const usersById = {
  1: { id: 1, first_name: 'Alexa' },
  2: { id: 2, first_name: 'Diego' },
  3: { id: 3, first_name: 'Majo' },
  4: { id: 4, first_name: 'Rafa' },
}
const currentUserId = 4

/* artículos */
const articlesById = {
  211: { id: 211, title: 'The Dark Side of the Moon', artist: 'Pink Floyd', image_url: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=1200&auto=format&fit=crop', price: 520 },
  207: { id: 207, title: 'Abbey Road', artist: 'The Beatles', image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop', price: 380 },
  203: { id: 203, title: '...And Justice for All', artist: 'Metallica', image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop', price: 370 },
}

/* estados */
const statusOrder = ['scheduled', 'live', 'ended']
const statusLabel = { scheduled: 'Próximos', live: 'En vivo', ended: 'Finalizados' }
const statusMeta = { scheduled: { allow_registration: true }, live: { allow_registration: true }, ended: { allow_registration: false } }

/* eventos (mock) */
const eventsApi = [
  {
    id: 501,
    title: 'Escucha grupal — Dark Side',
    description: 'Sesión íntima para repasar el clásico de 1973 y comentar anécdotas detrás del álbum.',
    event_status_id: 'scheduled',
    analog_article_id: 211,
    audio_file_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
    audio_duration_seconds: 60,
    start_datetime: addHours(24),
    end_datetime: addHours(26),
    max_participants: 50,
    current_participants: 18,
    allow_chat: true,
    created_by_user_id: 1
  },
  {
    id: 502,
    title: 'Listening Party — Abbey Road',
    description: 'Comparte tu corte favorito, rankeamos y charlamos.',
    event_status_id: 'live',
    analog_article_id: 207,
    audio_file_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
    audio_duration_seconds: 60,
    start_datetime: addMinutes(-20),
    end_datetime: addMinutes(70),
    max_participants: 100,
    current_participants: 63,
    allow_chat: true,
    created_by_user_id: 2
  },
  {
    id: 503,
    title: 'Metal Night — Justice Retrospectiva',
    description: 'Revisitamos la mezcla y el legado del disco más discutido de la banda.',
    event_status_id: 'ended',
    analog_article_id: 203,
    audio_file_url: '',
    audio_duration_seconds: 0,
    start_datetime: addDays(-5),
    end_datetime: addDays(-5, 2),
    max_participants: 80,
    current_participants: 72,
    allow_chat: false,
    created_by_user_id: 3
  }
]

/* registros (mock) */
const eventRegistrationsApi = [
  { event_id: 501, user_id: 4, registered_at: new Date().toISOString(), attended: false, attendance_duration_seconds: 0 },
  { event_id: 503, user_id: 4, registered_at: new Date(Date.now() - 86400000 * 6).toISOString(), attended: true, attendance_duration_seconds: 3200 },
]

/* chat (preview) */
const chatByEvent = {
  501: [
    { id: 1, event_id: 501, user_id: 1, message: '¡Nos vemos mañana!', is_system_message: false, sent_at: addHours(-1) },
    { id: 2, event_id: 501, user_id: 2, message: 'Traigan sus mejores audífonos 🎧', is_system_message: false, sent_at: addMinutes(-20) },
  ],
  502: [
    { id: 3, event_id: 502, user_id: 3, message: 'Arrancamos con Come Together', is_system_message: false, sent_at: addMinutes(-10) },
    { id: 4, event_id: 502, user_id: 2, message: '¡Bienvenidos!', is_system_message: true, sent_at: addMinutes(-20) },
  ],
}

/* estado UI */
const q = ref('')
const sortBy = ref('soon')
const selectedStatuses = ref(new Set(statusOrder))
const visible = ref(12)
const detail = ref(null)

/* derivados */
const events = computed(() => eventsApi)
const registrations = ref([...eventRegistrationsApi])

const filtered = computed(() => {
  const qv = q.value.trim().toLowerCase()
  let arr = events.value.filter(e => {
    const inStatus = selectedStatuses.value.has(e.event_status_id)
    const inText = !qv || (`${e.title} ${articlesById[e.analog_article_id]?.artist}`.toLowerCase().includes(qv))
    return inStatus && inText
  })
  if (sortBy.value === 'artist') {
    arr = arr.slice().sort((a, b) =>
      (articlesById[a.analog_article_id]?.artist || '')
        .localeCompare(articlesById[b.analog_article_id]?.artist || '')
    )
  } else if (sortBy.value === 'new') {
    arr = arr.slice().sort((a, b) => new Date(b.start_datetime) - new Date(a.start_datetime))
  } else {
    arr = arr.slice().sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
  }
  return arr
})
const paged = computed(() => filtered.value.slice(0, visible.value))
const hasMore = computed(() => visible.value < filtered.value.length)
const loadMore = () => (visible.value += 12)
const upcomingCount = computed(() => events.value.filter(e => e.event_status_id === 'scheduled').length)

const allStatusesSelected = computed(() => selectedStatuses.value.size === statusOrder.length)
const toggleStatus = (s) => {
  const set = new Set(selectedStatuses.value)
  set.has(s) ? set.delete(s) : set.add(s)
  if (!set.size) set.add(s)
  selectedStatuses.value = set
}
const selectAllStatuses = () => (selectedStatuses.value = new Set(statusOrder))

/* acciones */
const openDetail = (ev) => { detail.value = ev }
const isRegistered = (eventId) => registrations.value.some(r => r.event_id === eventId && r.user_id === currentUserId)
const canRegister = (ev) => statusMeta[ev.event_status_id]?.allow_registration
const canEnter = (ev) => ev.event_status_id === 'live' && isRegistered(ev.id)

const toggleRegistration = (ev) => {
  if (isRegistered(ev.id)) {
    registrations.value = registrations.value.filter(r => !(r.event_id === ev.id && r.user_id === currentUserId))
    ev.current_participants = Math.max(0, (ev.current_participants || 0) - 1)
  } else if (canRegister(ev)) {
    registrations.value.push({ event_id: ev.id, user_id: currentUserId, registered_at: new Date().toISOString(), attended: false, attendance_duration_seconds: 0 })
    ev.current_participants = (ev.current_participants || 0) + 1
  }
}

/* helpers UI */
const eventStatus = (ev) => {
  if (ev.event_status_id === 'live') return { label: 'En vivo' }
  if (ev.event_status_id === 'ended') return { label: 'Finalizado' }
  return { label: 'Próximo' }
}
const ctaLabel = (ev) => ev.event_status_id === 'live' ? 'Unirme' : 'Registrarme'
const capacityText = (ev) => {
  const cur = ev.current_participants || 0
  const max = ev.max_participants || 0
  return max ? `${cur}/${max} inscritos` : `${cur} inscritos`
}
const capacityPct = (ev) => {
  const cur = ev.current_participants || 0
  const max = ev.max_participants || 0
  return max ? Math.min(100, Math.round((cur / max) * 100)) : 0
}

/* formatting + time utils */
function formatDateTime(iso) {
  try { return new Date(iso).toLocaleString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function formatTime(iso) {
  try { return new Date(iso).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function formatDuration(s) {
  const m = Math.floor((s || 0) / 60), ss = String((s || 0) % 60).padStart(2, '0')
  return `${m}:${ss}`
}
function addMinutes(delta) { return new Date(Date.now() + delta * 60000).toISOString() }
function addHours(delta) { return new Date(Date.now() + delta * 3600000).toISOString() }
function addDays(delta, extraHours = 0) { return new Date(Date.now() + delta * 86400000 + extraHours * 3600000).toISOString() }
</script>

<style scoped></style>
