


// Nombre de la caché
 const CACHE_NAME = 'mi-app-cache-v1';

// Archivos que se van a cachear
const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
    '/script.js',
    '/icons/MIY_Mesa de trabajo 1.png',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.0.0/dist/index.global.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.3/font/bootstrap-icons.min.css',
    'https://fonts.googleapis.com/css2?family=Audiowide&family=Kanit:wght@200&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    "/fea73797a9703e6a1d82202e05724c93.jpg",
    "/61371619_10157106365389647_5488666375461273600_n.jpg",
    "/8518727.jpg",
    "/nubes-tormenta.jpg"
];

// Instalación del Service Worker y caché de archivos
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Archivos en caché');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercepción de las solicitudes de la red
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response; // Retorna desde la caché
                }
                return fetch(event.request); // Realiza la solicitud a la red
            })
    );
});

// Activación del Service Worker y eliminación de cachés antiguas
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

/* elf.addEventListener('push', event => {
    console.log('Push event received:', event);
  
    const data = event.data ? event.data.json() : { title: 'Default Title', body: 'Default Body' };
  
    const options = {
      body: data.body,
    
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });  
 */
  // service-worker.js
self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Push recibido:', data);

    const options = {
        body: data.body,
        icon: 'path/to/icon.png' // Cambia esto por la ruta a tu icono
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
