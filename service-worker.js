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

const VERSION = 'v4.1'; // Incrementei para garantir o reload
const LOGO_PADRAO = 'https://cdn-icons-png.flaticon.com/512/18827/18827925.png';
const BADGE_ICON = 'https://cdn-icons-png.flaticon.com/128/4926/4926586.png';

self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== VERSION) && caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensagem recebida:', payload);

    const notificationTitle = payload.data?.title || payload.notification?.title || "Nova Mensagem";
    
    // --- LÓGICA PARA CAPTURAR A FOTO DO USUÁRIO ---
    // Tenta encontrar a foto em vários campos possíveis que o backend pode enviar
    const userPhoto = payload.data?.image || 
                      payload.data?.photoURL || 
                      payload.data?.senderPhoto || 
                      payload.notification?.image || 
                      LOGO_PADRAO;

    const notificationOptions = {
        body: payload.data?.body || payload.notification?.body || "",
        icon: userPhoto, // Aqui aparece a foto pequena ao lado do texto
        image: payload.data?.image, // Se for uma foto enviada no chat (imagem grande)
        badge: BADGE_ICON,
        tag: payload.data?.chatId || 'geral',
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
            url: payload.data?.url || '/' 
        },
        actions: [
            { action: 'open', title: 'Visualizar' }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lógica de clique (mantida igual, pois já estava correta)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) return client.focus();
            }
            if (windowClients.length > 0) {
                return windowClients[0].navigate(targetUrl).then(c => c?.focus());
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
