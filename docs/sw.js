/* ── TaxSage service worker ─────────────────────────────────────────────────
   Nigerian-network strategy:
   · App shell (hashed JS/CSS, icons) → cache-first (immutable content hashes)
   · access-codes.json → network-FIRST with cache fallback → admin revocations
     and gate-mode changes reach test devices as soon as connectivity allows
   · Navigations → network-first, falling back to cached shell when offline
   · Webfont CSS/binary → stale-while-revalidate
   Everything the app needs (records, payroll, engine) runs 100% locally;
   the SW only guarantees the shell itself loads on flaky 3G / in power-saving
   airplane-mode moments common on Nigerian mobile networks.
───────────────────────────────────────────────────────────────────────────── */
const VERSION = 'taxsage-v3'
const SHELL = VERSION + '-shell'
const RUNTIME = VERSION + '-runtime'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg']))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

const sameOrigin = (url) => new URL(url, self.location).origin === self.location.origin

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // provisioning file — admin truth; always try the network first
  if (sameOrigin(request.url) && url.pathname.endsWith('access-codes.json')) {
    e.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((res) => {
          const copy = res.clone()
          if (res.ok) caches.open(RUNTIME).then((c) => c.put(request, copy))
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // hashed build assets + fonts — cache-first
  if ((sameOrigin(request.url) && /\/assets\/|\.js$|\.css$|icon\.svg$|manifest/.test(url.pathname))
      || url.origin === 'https://fonts.googleapis.com'
      || url.origin === 'https://fonts.gstatic.com') {
    e.respondWith(
      caches.match(request).then((hit) => {
        const refresh = fetch(request)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              const copy = res.clone()
              caches.open(RUNTIME).then((c) => c.put(request, copy))
            }
            return res
          })
          .catch(() => hit)
        return hit || refresh
      })
    )
    return
  }

  // navigations & everything else — network-first, shell fallback offline
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          if (res.ok) caches.open(SHELL).then((c) => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  // default: network with cache fallback
  e.respondWith(fetch(request).catch(() => caches.match(request)))
})
