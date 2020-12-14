const staticAnyxz = "Anyxz-site-v1"
const assets = [
  "/",
  "/index.html",
  "/styles.css",
  "/index.js",
  "/assets/favicon.png",
  "/assets/folder-search.svg",
  "/assets/loading.jpg",
  "/assets/loadingx.jpg",
  "/assets/nwoc-logo.png",
  "/assets/powered-by-vercel.svg",
  "/js/bootstrap.min.js",
  "/js/ml5.min.js",
  "/js/p5.dom.min.js",
  "/js/popper.min.js",
  "/button.css",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticAnyxz).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })