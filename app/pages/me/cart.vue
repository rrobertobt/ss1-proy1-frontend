<template>
  <div class="bg-background text-foreground">
    <!-- header -->
    <section class="border-b border-ink/10">
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 class="text-[clamp(28px,6vw,48px)] font-extrabold">Tu carrito</h1>
        <p class="mt-1 text-ink/70">Revisa tus artículos antes de comprar.</p>
      </div>
    </section>

    <!-- read-only banner -->
    <section v-if="isLocalMode" class="border-b border-ink/10 bg-secondary/40">
      <div class="container mx-auto max-w-6xl px-4 py-3 text-sm">
        <strong>Modo solo lectura:</strong> el servidor no acepta escrituras. Tus cambios se guardan localmente.
      </div>
    </section>

    <!-- content -->
    <section>
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- items -->
        <div class="lg:col-span-8 space-y-4">
          <div v-if="cart.length === 0 && !isLoading" class="border border-ink/20 bg-secondary/20 p-6 text-center">
            <p class="font-semibold">Tu carrito está vacío</p>
            <NuxtLink to="/catalog" class="mt-3 inline-block border border-ink px-4 py-2 text-sm">Ir al catálogo</NuxtLink>
          </div>

          <!-- loader overlay -->
          <div v-if="isLoading" class="border border-ink/20 bg-secondary/20 p-6 text-center">
            Cargando carrito…
          </div>

          <!-- one-line item -->
          <article
            v-for="it in cart"
            :key="it.id"
            class="flex items-center gap-4 md:gap-6 bg-background border border-ink/20 rounded-sm shadow-sm p-4 md:p-5"
            :class="(!it.article.isAvailable || (it.article.stock_quantity ?? 0) === 0) ? 'opacity-80' : ''"
          >
            <!-- cover -->
            <img
              :src="it.article.cover"
              :alt="`${it.article.album} — ${it.article.artist}`"
              class="w-[92px] h-[92px] object-cover border border-ink/40"
            />

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
                <button
                  class="px-3 py-2 text-sm hover:bg-secondary/40 disabled:opacity-50"
                  @click="decrQty(it)"
                  :disabled="it.quantity <= 1 || isBusy"
                >−</button>
                <input
                  v-model.number="it.quantity"
                  type="number"
                  inputmode="numeric"
                  class="h-9 w-12 text-center border-l border-r border-ink/20 bg-background"
                  :min="1"
                  :max="it.article.stock_quantity || 99"
                  :disabled="isBusy"
                  @change="setQty(it, $event.target.value)"
                />
                <button
                  class="px-3 py-2 text-sm hover:bg-secondary/40 disabled:opacity-50"
                  @click="incrQty(it)"
                  :disabled="(it.article.stock_quantity && it.quantity >= it.article.stock_quantity) || isBusy"
                >＋</button>
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
              class="justify-self-end grid place-items-center h-8 w-8 border border-ink hover:bg-secondary/40 transition disabled:opacity-50"
              :aria-label="`Remover ${it.article.album}`"
              @click="removeItem(it.id)"
              :disabled="isBusy"
            >
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
              :disabled="cart.length === 0 || isLocalMode || isBusy"
              @click="checkout"
            >
              Comprar ahora
            </button>

            <NuxtLink
              to="/catalog"
              class="mt-3 inline-flex w-full items-center justify-center h-12 border border-ink px-5 text-sm font-semibold hover:bg-secondary/30 transition"
            >
              Seguir comprando
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'

/* labels */
const categoryLabel = { vinyl: 'Vinilo', cd: 'CD', cassette: 'Cassette' }
const DEFAULT_CURRENCY = { code: 'GTQ', symbol: 'Q' }
const LOCAL_KEY = 'bpmn_cart_local'

/* read-only detector */
const isReadOnlyErr = (e) => {
  const m = String((e && e.data && e.data.message) || e?.message || '')
  const s = m.toLowerCase()
  return s.includes('read-only') || s.includes('cannot execute insert') || s.includes('cannot execute update')
}

/* state */
const isLoading = ref(true)
const isBusy = ref(false)
const isLocalMode = ref(false)

const currency = ref(DEFAULT_CURRENCY)
const cart = ref([])

/* adapters */
const toArticle = (a = {}) => ({
  id: a.id,
  album: a.title ?? a.name ?? '—',
  artist: a.artist?.name ?? '—',
  cover: a.imageUrl ?? a.image_url ?? '',
  price: Number(a.price ?? 0),
  category: a.type ?? a.media_type ?? 'vinyl',
  isAvailable: Boolean(a.isAvailable ?? a.is_available ?? true),
  stock_quantity: Number(a.stockQuantity ?? a.stock_quantity ?? 0),
})

const normalizeItem = (r = {}) => ({
  id: r.id,
  quantity: Number(r.quantity ?? 1),
  unit_price: Number((r.unit_price ?? r.unitPrice ?? r.article?.price ?? 0)),
  discount_applied: Number((r.discount_applied ?? r.discountApplied ?? 0)),
  article: toArticle(r.article ?? r.analog_article ?? {}),
})

/* local fallback store */
const loadLocal = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return { items: [], currency: DEFAULT_CURRENCY }
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed.items) ? parsed.items.map(normalizeItem) : [],
      currency: parsed.currency ?? DEFAULT_CURRENCY,
    }
  } catch { return { items: [], currency: DEFAULT_CURRENCY } }
}
const saveLocal = () => {
  const payload = {
    items: cart.value,
    currency: currency.value ?? DEFAULT_CURRENCY,
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload))
}

/* initial fetch (JWT via $api) */
try {
  const { data, status } = await useAsyncData(
    'cart',
    async () => {
      try {
        return await $api('/cart')
      } catch (e) {
        if (isReadOnlyErr(e)) {
          isLocalMode.value = true
          const local = loadLocal()
          currency.value = local.currency
          cart.value = local.items
          return { data: { items: [], currency: local.currency } }
        }
        throw e
      }
    },
    { server: true, default: () => ({ data: { items: [], currency: DEFAULT_CURRENCY } }) }
  )

  const payload = data.value?.data ?? {}
  if (!isLocalMode.value) {
    currency.value = payload.currency ?? DEFAULT_CURRENCY
    const list = payload.items ?? payload.cartItems ?? []
    cart.value = list.map(normalizeItem)
  }
} finally {
  isLoading.value = false
}

/* totals */
const lineTotal = (it) => Math.max(0, (it.unit_price * it.quantity) - (it.discount_applied ?? 0))
const subtotal = computed(() => cart.value.reduce((s, it) => s + lineTotal(it), 0))
const totalItems = computed(() => cart.value.reduce((n, it) => n + Number(it.quantity ?? 0), 0))

/* API helpers (no-op in local mode) */
const refreshCart = async () => {
  if (isLocalMode.value) { saveLocal(); return }
  const res = await $api('/cart')
  const payload = res?.data ?? {}
  currency.value = payload.currency ?? DEFAULT_CURRENCY
  const list = payload.items ?? payload.cartItems ?? []
  cart.value = list.map(normalizeItem)
}

const putQty = async (id, qty) => {
  if (isLocalMode.value) return
  await $api(`/cart/items/${id}`, { method: 'PUT', body: { quantity: Number(qty) } })
}
const removeRemote = async (id) => {
  if (isLocalMode.value) return
  await $api(`/cart/items/${id}`, { method: 'DELETE' })
}

/* actions */
const incrQty = async (it) => {
  const stock = it.article?.stock_quantity ?? Infinity
  if (Number.isFinite(stock) && it.quantity >= stock) return
  isBusy.value = true
  try {
    if (isLocalMode.value) {
      it.quantity = Number(it.quantity ?? 1) + 1
      saveLocal()
    } else {
      await putQty(it.id, (it.quantity ?? 1) + 1)
      await refreshCart()
    }
  } catch (e) {
    if (isReadOnlyErr(e)) { isLocalMode.value = true; it.quantity = Number(it.quantity ?? 1) + 1; saveLocal() }
  } finally { isBusy.value = false }
}

const decrQty = async (it) => {
  if ((it.quantity ?? 1) <= 1) return
  isBusy.value = true
  try {
    if (isLocalMode.value) {
      it.quantity = Number(it.quantity ?? 1) - 1
      saveLocal()
    } else {
      await putQty(it.id, (it.quantity ?? 1) - 1)
      await refreshCart()
    }
  } catch (e) {
    if (isReadOnlyErr(e)) { isLocalMode.value = true; it.quantity = Number(it.quantity ?? 1) - 1; saveLocal() }
  } finally { isBusy.value = false }
}

const setQty = async (it, raw) => {
  let next = Math.max(1, Number(raw ?? 1))
  const stock = it.article?.stock_quantity ?? Infinity
  if (Number.isFinite(stock)) next = Math.min(next, stock)

  isBusy.value = true
  try {
    if (isLocalMode.value) {
      it.quantity = next
      saveLocal()
    } else {
      await putQty(it.id, next)
      await refreshCart()
    }
  } catch (e) {
    if (isReadOnlyErr(e)) { isLocalMode.value = true; it.quantity = next; saveLocal() }
  } finally { isBusy.value = false }
}

const removeItem = async (id) => {
  isBusy.value = true
  try {
    if (isLocalMode.value) {
      cart.value = cart.value.filter(i => i.id !== id)
      saveLocal()
    } else {
      await removeRemote(id)
      await refreshCart()
    }
  } catch (e) {
    if (isReadOnlyErr(e)) { isLocalMode.value = true; cart.value = cart.value.filter(i => i.id !== id); saveLocal() }
  } finally { isBusy.value = false }
}

const checkout = () => {
  if (isLocalMode.value) {
    alert('Servidor en modo solo lectura. No se puede completar la compra ahora.')
    return
  }
  alert('Flujo de pago pendiente.')
}

/* availability badge */
const LOW_STOCK = 3
const availabilityInfo = (a) => {
  const qty = Number(a?.stock_quantity ?? 0)
  if (!a?.isAvailable || qty <= 0) return { label: 'Agotado', cls: 'bg-ink text-cream' }
  if (qty <= LOW_STOCK) return { label: 'Pocas unidades', cls: 'bg-brand text-cream' }
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
input[type="number"] { -moz-appearance: textfield; }
</style>
