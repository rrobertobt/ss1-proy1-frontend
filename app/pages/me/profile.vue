<template>
  <div class="bg-background text-foreground">
    <!-- Header -->
    <section class="border-b border-ink/10 bg-secondary/20">
      <div class="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 class="text-[clamp(28px,6vw,48px)] font-extrabold">Tu cuenta</h1>
        <p class="mt-1 text-ink/70">Gestiona tu perfil y revisa tus compras.</p>
      </div>
    </section>

    <!-- Profile -->
    <section>
      <div class="container mx-auto max-w-6xl px-4 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5">
          <div class="border border-ink/20 rounded-sm bg-background p-5 shadow-sm">
            <div class="flex items-center gap-4">
              <div
                class="grid h-16 w-16 place-items-center rounded-full bg-secondary/60 border border-ink/20 text-xl font-bold">
                {{ initials }}
              </div>
              <div class="min-w-0">
                <p class="text-lg font-extrabold leading-tight truncate">{{ fullName }}</p>
                <p class="text-sm text-ink/70 truncate">@{{ user.username }}</p>
              </div>
            </div>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <Icon name="carbon:email" size="16" /><span class="truncate">{{ user.email }}</span>
              </div>
              <div class="flex items-center gap-2" v-if="user.phone">
                <Icon name="carbon:phone" size="16" /><span class="truncate">{{ user.phone }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="carbon:calendar" size="16" />
                <span>Miembro desde {{ formatDate(user.created_at) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="carbon:time" size="16" />
                <span>Último acceso {{ formatDateTime(user.last_login) }}</span>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3 text-center">
              <div class="rounded border border-ink/20 p-4">
                <p class="text-sm text-ink/60">Órdenes</p>
                <p class="text-2xl font-black">{{ user.total_orders }}</p>
              </div>
              <div class="rounded border border-ink/20 p-4">
                <p class="text-sm text-ink/60">Gastado</p>
                <p class="text-2xl font-black">{{ currency.symbol }} {{ user.total_spent.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7">
          <div class="border border-ink/20 rounded-sm bg-background p-5 shadow-sm">
            <h2 class="font-semibold mb-3">Direcciones</h2>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="rounded border border-ink/20 p-4">
                <div class="flex items-center justify-between">
                  <p class="font-semibold">Envío</p>
                  <span v-if="shipping?.is_default"
                    class="text-xs border border-ink/40 px-2 py-0.5">Predeterminada</span>
                </div>
                <p class="mt-1 text-sm">{{ addressText(shipping) }}</p>
              </div>
              <div class="rounded border border-ink/20 p-4">
                <div class="flex items-center justify-between">
                  <p class="font-semibold">Facturación</p>
                  <span v-if="billing?.is_default"
                    class="text-xs border border-ink/40 px-2 py-0.5">Predeterminada</span>
                </div>
                <p class="mt-1 text-sm">{{ addressText(billing) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Orders: filters -->
    <section class="border-t border-ink/10">
      <div class="container mx-auto max-w-6xl px-4 py-6">
        <div class="flex flex-wrap items-center gap-3 md:gap-4">
          <input v-model="q" type="search" placeholder="Buscar por número de orden…"
            class="w-full sm:w-80 border border-ink/40 bg-background px-4 py-2.5 outline-none focus:border-ink" />

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

          <div class="flex items-center gap-2">
            <label class="text-sm text-ink/70">Orden</label>
            <select v-model="sortBy" class="border border-ink/40 bg-background px-3 py-2">
              <option value="new">Recientes</option>
              <option value="old">Antiguas</option>
              <option value="amount">Monto</option>
            </select>
          </div>

          <span class="ml-auto text-sm text-ink/70">{{ filtered.length }} resultados</span>
        </div>
      </div>
    </section>

    <!-- Orders: list -->
    <section>
      <div class="container mx-auto max-w-6xl px-4 pb-12">
        <div class="space-y-4">
          <article v-for="o in paged" :key="o.id"
            class="border border-ink/20 bg-background rounded-sm shadow-sm overflow-hidden">
            <!-- row -->
            <div class="flex gap-4 items-center  justify-between p-4 md:p-5">
              <!-- info -->
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-semibold truncate">Orden #{{ o.order_number }}</p>
                  <span class="text-xs px-2 py-0.5 rounded" :class="statusBadge(o.order_status_id).cls">
                    {{ statusBadge(o.order_status_id).label }}
                  </span>
                </div>
                <p class="text-sm text-ink/70">{{ formatDateTime(o.created_at) }}</p>

                <!-- items thumbnails -->
                <div class="mt-2 flex items-center gap-2 overflow-hidden">
                  <img v-for="it in (itemsByOrder[o.id] || []).slice(0, 4)" :key="it.id"
                    :src="articlesById[it.analog_article_id]?.image_url"
                    class="h-10 w-10 object-cover border border-ink/30"
                    :alt="articlesById[it.analog_article_id]?.title" />
                  <span v-if="(itemsByOrder[o.id] || []).length > 4" class="text-xs text-ink/60">
                    +{{ (itemsByOrder[o.id] || []).length - 4 }} más
                  </span>
                </div>
              </div>

              <!-- address -->
              <div class="text-sm">
                <p class="text-ink/60">Enviado a</p>
                <p class="truncate">{{ addressText(addressById[o.shipping_address_id]) }}</p>
              </div>

              <!-- amounts -->
              <div class="text-sm">
                <div class="flex justify-between gap-4">
                  <span class="text-ink/60">Subtotal</span>
                  <span>{{ currency.symbol }} {{ o.subtotal_amount.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between" v-if="o.shipping_cost">
                  <span class="text-ink/60">Envío</span>
                  <span>{{ currency.symbol }} {{ o.shipping_cost.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between" v-if="o.tax_amount">
                  <span class="text-ink/60">Impuestos</span>
                  <span>{{ currency.symbol }} {{ o.tax_amount.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between font-bold mt-1">
                  <span>Total</span>
                  <span class="text-brand">{{ currency.symbol }} {{ o.total_amount.toLocaleString() }}</span>
                </div>
              </div>

              <!-- actions -->
              <div class="justify-self-end flex md:block gap-2">
                <button class="border border-ink px-4 py-2 text-sm font-semibold hover:bg-secondary/30 transition"
                  @click="toggleExpand(o.id)">
                  {{ expanded.has(o.id) ? 'Ocultar' : 'Ver detalle' }}
                </button>
              </div>
            </div>

            <!-- detail -->
            <div v-if="expanded.has(o.id)" class="border-t border-ink/10 p-4 md:p-5">
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead>
                    <tr class="text-left text-ink/60">
                      <th class="py-2 pr-4">Producto</th>
                      <th class="py-2 pr-4">Cant.</th>
                      <th class="py-2 pr-4">Precio</th>
                      <th class="py-2 pr-4">Descuento</th>
                      <th class="py-2 pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="it in itemsByOrder[o.id] || []" :key="it.id" class="border-t border-ink/10">
                      <td class="py-3 pr-4">
                        <div class="flex items-center gap-3 min-w-0">
                          <img :src="articlesById[it.analog_article_id]?.image_url"
                            class="h-10 w-10 object-cover border border-ink/30"
                            :alt="articlesById[it.analog_article_id]?.title" />
                          <div class="min-w-0">
                            <p class="font-semibold truncate">
                              {{ articlesById[it.analog_article_id]?.title }}
                            </p>
                            <p class="text-xs text-ink/60 truncate">
                              {{ articlesById[it.analog_article_id]?.artist }}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 pr-4">{{ it.quantity }}</td>
                      <td class="py-3 pr-4">{{ currency.symbol }} {{ it.unit_price.toLocaleString() }}</td>
                      <td class="py-3 pr-4">{{ it.discount_amount ? ('− ' + currency.symbol + ' ' +
                        it.discount_amount.toLocaleString()) : '—' }}</td>
                      <td class="py-3 pr-4 font-semibold">
                        {{ currency.symbol }} {{ (it.total_price).toLocaleString() }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div class="rounded border border-ink/20 p-3">
                  <p class="text-ink/60">Pago</p>
                  <p class="font-semibold">{{ paymentText(o.id) }}</p>
                </div>
                <div class="rounded border border-ink/20 p-3">
                  <p class="text-ink/60">Factura</p>
                  <p class="font-semibold">{{ invoiceText(o.id) }}</p>
                </div>
                <div class="rounded border border-ink/20 p-3">
                  <p class="text-ink/60">Estado del envío</p>
                  <p class="font-semibold">
                    {{ shippingText(o) }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-8 flex justify-center" v-if="hasMore">
          <button
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

/* currency */
const currency = { code: 'GTQ', symbol: 'Q' }

/* user (api-shaped) */
const user = {
  id: 101,
  username: 'bpmn',
  email: 'bpmn@example.com',
  first_name: 'Bueno',
  last_name: 'Nada',
  phone: '+502 5555 5555',
  is_active: true,
  is_verified: true,
  last_login: new Date().toISOString(),
  created_at: new Date(Date.now() - 86400 * 1000 * 400).toISOString(),
  total_orders: 6,
  total_spent: 5720,
}

/* addresses (api-shaped) */
const addressesApi = [
  { id: 1, user_id: 101, is_default: true, is_billing_default: false, is_shipping_default: true, address_line_1: '1a Avenida 123', address_line_2: 'Zona 1', city: 'Quetzaltenango', state: 'Quez', postal_code: '01001', country_id: 'GT', created_at: '', updated_at: '' },
  { id: 2, user_id: 101, is_default: false, is_billing_default: true, is_shipping_default: false, address_line_1: 'Calle 4 22-11', address_line_2: 'Apto 5', city: 'Quetzaltenango', state: 'Quez', postal_code: '01002', country_id: 'GT', created_at: '', updated_at: '' },
]
const addressById = Object.fromEntries(addressesApi.map(a => [a.id, a]))
const shipping = addressesApi.find(a => a.is_shipping_default)
const billing = addressesApi.find(a => a.is_billing_default)

/* products for joining */
const articlesById = {
  211: { id: 211, title: 'The Dark Side of the Moon', artist: 'Pink Floyd', image_url: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=1200&auto=format&fit=crop' },
  207: { id: 207, title: 'Abbey Road', artist: 'The Beatles', image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop' },
  203: { id: 203, title: '...And Justice for All', artist: 'Metallica', image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop' },
  212: { id: 212, title: 'Random Access Memories', artist: 'Daft Punk', image_url: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=1200&auto=format&fit=crop' },
}

/* order status lookup */
const statusOrder = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
const statusLabel = { pending: 'Pendiente', paid: 'Pagado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' }
const statusBadge = (id) => {
  const base = 'px-2 py-0.5 text-xs rounded'
  if (id === 'paid') return { label: statusLabel[id], cls: base + ' bg-ink text-cream' }
  if (id === 'shipped') return { label: statusLabel[id], cls: base + ' border border-ink text-ink' }
  if (id === 'delivered') return { label: statusLabel[id], cls: base + ' bg-brand text-cream' }
  if (id === 'cancelled') return { label: statusLabel[id], cls: base + ' bg-ink/70 text-cream' }
  return { label: statusLabel[id], cls: base + ' border border-ink/50 text-ink' }
}

/* orders (api-shaped) */
const ordersApi = [
  { id: 7001, order_number: 'BPMN-2025-001', user_id: 101, order_status_id: 'delivered', currency_id: 1, subtotal_amount: 900, tax_amount: 0, discount_amount: 0, shipping_cost: 35, total_amount: 935, shipping_address_id: 1, billing_address_id: 2, created_at: daysAgo(40), updated_at: daysAgo(35), shipped_at: daysAgo(38), delivered_at: daysAgo(35) },
  { id: 7002, order_number: 'BPMN-2025-002', user_id: 101, order_status_id: 'paid', currency_id: 1, subtotal_amount: 520, tax_amount: 0, discount_amount: 0, shipping_cost: 0, total_amount: 520, shipping_address_id: 1, billing_address_id: 2, created_at: daysAgo(18), updated_at: daysAgo(18) },
  { id: 7003, order_number: 'BPMN-2025-003', user_id: 101, order_status_id: 'shipped', currency_id: 1, subtotal_amount: 370, tax_amount: 0, discount_amount: 20, shipping_cost: 25, total_amount: 375, shipping_address_id: 1, billing_address_id: 2, created_at: daysAgo(8), updated_at: daysAgo(2), shipped_at: daysAgo(2) },
  { id: 7004, order_number: 'BPMN-2025-004', user_id: 101, order_status_id: 'pending', currency_id: 1, subtotal_amount: 760, tax_amount: 0, discount_amount: 0, shipping_cost: 35, total_amount: 795, shipping_address_id: 1, billing_address_id: 2, created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 7005, order_number: 'BPMN-2025-005', user_id: 101, order_status_id: 'cancelled', currency_id: 1, subtotal_amount: 310, tax_amount: 0, discount_amount: 0, shipping_cost: 0, total_amount: 310, shipping_address_id: 1, billing_address_id: 2, created_at: daysAgo(70), updated_at: daysAgo(69) },
]

/* items (api-shaped) */
const orderItemsApi = [
  { id: 1, order_id: 7001, analog_article_id: 207, quantity: 2, unit_price: 380, discount_amount: 0, total_price: 760, created_at: '' },
  { id: 2, order_id: 7001, analog_article_id: 212, quantity: 1, unit_price: 140, discount_amount: 0, total_price: 140, created_at: '' },
  { id: 3, order_id: 7002, analog_article_id: 211, quantity: 1, unit_price: 520, discount_amount: 0, total_price: 520, created_at: '' },
  { id: 4, order_id: 7003, analog_article_id: 203, quantity: 1, unit_price: 370, discount_amount: 20, total_price: 350, created_at: '' },
  { id: 5, order_id: 7004, analog_article_id: 211, quantity: 1, unit_price: 520, discount_amount: 0, total_price: 520, created_at: '' },
  { id: 6, order_id: 7004, analog_article_id: 203, quantity: 1, unit_price: 240, discount_amount: 0, total_price: 240, created_at: '' },
  { id: 7, order_id: 7005, analog_article_id: 212, quantity: 1, unit_price: 310, discount_amount: 0, total_price: 310, created_at: '' },
]

/* payments & invoices (api-shaped) */
const paymentsApi = [
  { id: 9901, order_id: 7002, payment_number: 'PAY-123', payment_method_id: 'card', payment_status_id: 'captured', amount: 520, transaction_reference: 'XYZ-001', processed_at: daysAgo(18) },
  { id: 9902, order_id: 7003, payment_number: 'PAY-124', payment_method_id: 'card', payment_status_id: 'captured', amount: 375, transaction_reference: 'XYZ-002', processed_at: daysAgo(8) },
  { id: 9903, order_id: 7001, payment_number: 'PAY-122', payment_method_id: 'card', payment_status_id: 'captured', amount: 935, transaction_reference: 'XYZ-000', processed_at: daysAgo(40) },
]
const invoicesApi = [
  { id: 8801, order_id: 7001, invoice_number: 'INV-1001', currency_id: 1 },
  { id: 8802, order_id: 7002, invoice_number: 'INV-1002', currency_id: 1 },
  { id: 8803, order_id: 7003, invoice_number: 'INV-1003', currency_id: 1 },
]

/* joins */
const itemsByOrder = orderItemsApi.reduce((acc, it) => {
  (acc[it.order_id] ||= []).push(it)
  return acc
}, {})

/* UI state */
const q = ref('')
const selectedStatuses = ref(new Set(statusOrder))
const sortBy = ref('new')
const visible = ref(6)
const expanded = ref(new Set())

/* derived */
const orders = computed(() => ordersApi)

const filtered = computed(() => {
  const qv = q.value.trim().toLowerCase()
  let arr = orders.value.filter(o => {
    const inStatus = selectedStatuses.value.has(o.order_status_id)
    const inText = !qv || o.order_number.toLowerCase().includes(qv)
    return inStatus && inText
  })
  if (sortBy.value === 'amount') {
    arr = arr.slice().sort((a, b) => b.total_amount - a.total_amount)
  } else if (sortBy.value === 'old') {
    arr = arr.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else {
    arr = arr.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  return arr
})

const paged = computed(() => filtered.value.slice(0, visible.value))
const hasMore = computed(() => visible.value < filtered.value.length)
const loadMore = () => (visible.value += 6)

/* status filter helpers */
const allStatusesSelected = computed(() => selectedStatuses.value.size === statusOrder.length)
const toggleStatus = (s) => {
  const set = new Set(selectedStatuses.value)
  set.has(s) ? set.delete(s) : set.add(s)
  if (!set.size) set.add(s)
  selectedStatuses.value = set
}
const selectAllStatuses = () => (selectedStatuses.value = new Set(statusOrder))

/* expand */
const toggleExpand = (id) => {
  const set = new Set(expanded.value)
  set.has(id) ? set.delete(id) : set.add(id)
  expanded.value = set
}

/* text helpers */
const paymentText = (orderId) => {
  const p = paymentsApi.find(p => p.order_id === orderId)
  if (!p) return '—'
  const label = p.payment_status_id === 'captured' ? 'Pagado' : p.payment_status_id
  return `${label} · ${p.payment_number}`
}
const invoiceText = (orderId) => {
  const i = invoicesApi.find(i => i.order_id === orderId)
  return i ? i.invoice_number : '—'
}
const shippingText = (o) => {
  if (o.order_status_id === 'delivered') return `Entregado ${formatDate(o.delivered_at)}`
  if (o.order_status_id === 'shipped') return `Enviado ${formatDate(o.shipped_at)}`
  if (o.order_status_id === 'paid') return 'Preparando envío'
  if (o.order_status_id === 'pending') return 'Pendiente de pago'
  return '—'
}

/* profile helpers */
const fullName = computed(() => [user.first_name, user.last_name].filter(Boolean).join(' '))
const initials = computed(() => (user.first_name?.[0] || 'U') + (user.last_name?.[0] || 'S'))

/* formatting */
function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return iso }
}
function formatDateTime(iso) {
  try { return new Date(iso).toLocaleString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString()
}

/* address formatting */
const addressText = (a) =>
  a ? `${a.address_line_1}${a.address_line_2 ? ', ' + a.address_line_2 : ''}, ${a.city}, ${a.state} ${a.postal_code}` : '—'
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
