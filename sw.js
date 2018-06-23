importScripts('/idb.js');

const staticCache = 'foodle-static-v7.2';
const imagesCache = 'foodle-images-v0';
const allCaches = [staticCache, imagesCache];
const methods = ['POST', 'PUT', 'DELETE'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCache).then(function(cache) {
      return cache.addAll([
        '/',
        '/restaurant.html',
        '/idb.js',
        '/helpers-bundle.js',
        '/home-bundle.js',
        '/restaurant-bundle.js',
        '/styles.css'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(cacheName) {
            return (
              cacheName.startsWith('foodle-') && !allCaches.includes(cacheName)
            );
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return;
    }

    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }

  if (/^\/(restaurants|reviews)'/.test(requestUrl.pathname) && methods.includes(event.request.method)) {
    const req = event.request.clone();
    event.respondWith(fetch(req)).catch(console.log);//
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag == 'foodle-sync') {
    // event.waitUntil(doSomeStuff());
    console.log('syncing...', idb);
  } else {
    // unknown sync, may be old, best to unregister
    event.registration.unregister();
  }
});

function servePhoto(request) {
  const storageUrl = request.url;

  return caches.open(imagesCache).then(cache => 
    cache.match(storageUrl).then(response => {
      if (response) return response;
      return fetch(request).then(networkResponse => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    })
  );
}
