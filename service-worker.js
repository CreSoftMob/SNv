importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAWPLRTgbBWhwPGf6yK_R85sh6NYSmqPvY",
  authDomain: "app-create-a3dfd.firebaseapp.com",
  projectId: "app-create-a3dfd",
  storageBucket: "app-create-a3dfd.firebasestorage.app",
  messagingSenderId: "129112776900",
  appId: "1:129112776900:web:360f27176f339a3dec2991",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const VERSION = 'v6.5'; // Incrementado para forçar atualização
const BASE_URL = 'https://samenext.com.br/';
const LOGO_PADRAO_APP = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'; 
const BADGE_ICON = 'https://cdn-icons-png.flaticon.com/128/4926/4926586.png';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== VERSION) && caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// Lida com mensagens quando o app está em segundo plano
messaging.onBackgroundMessage((payload) => {
    const title = payload.data?.title || payload.notification?.title || "Samenext";
    const body = payload.data?.body || payload.notification?.body || "";
    const icon = payload.data?.icon || payload.notification?.icon || LOGO_PADRAO_APP;

    const notificationOptions = {
        body: body,
        icon: icon,
        badge: BADGE_ICON,
        tag: payload.data?.chatId || 'default-tag',
        renotify: true,
        data: {
            url: BASE_URL // Forçamos a URL base aqui também
        }
    };

    return self.registration.showNotification(title, notificationOptions);
});

// Lida com o clique na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se houver uma aba aberta no nosso domínio, foca nela e recarrega a home
            for (let client of windowClients) {
                if (client.url.includes('samenext.com.br') && 'focus' in client) {
                    return client.navigate(BASE_URL).then(c => c?.focus());
                }
            }
            // Se não houver aba aberta, abre uma nova na home
            if (clients.openWindow) {
                return clients.openWindow(BASE_URL);
            }
        })
    );
});
