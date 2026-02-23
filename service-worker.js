// firebase-messaging-sw.js

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

const VERSION = 'v5.1'; 
const BASE_URL = 'https://samenext.com.br';
const LOGO_PADRAO_APP = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'; 
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

    const title = payload.data?.title || payload.notification?.title || "Samenext";
    const body = payload.data?.body || payload.notification?.body || "";
    
    // LÓGICA DE ÍCONE DINÂMICO:
    // 1. Tenta pegar a foto do usuário (vindo do data.image ou data.icon ou notification.icon)
    // 2. Se não existir, usa o logo padrão do app.
    const userPhoto = payload.data?.image || payload.data?.icon || payload.notification?.icon || LOGO_PADRAO_APP;

    // Tratamento de URL
    let finalUrl = payload.data?.url || '/';
    if (!finalUrl.startsWith('http')) {
        finalUrl = new URL(finalUrl, BASE_URL).href;
    }

    const notificationOptions = {
        body: body,
        icon: userPhoto,      // Foto do perfil (ou logo se não houver foto)
        badge: BADGE_ICON,    // SEMPRE o ícone do app (barra de status)
        tag: payload.data?.chatId || 'geral',
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
            url: finalUrl
        },
        actions: [
            { action: 'open', title: 'Visualizar' }
        ]
    };

    return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || BASE_URL;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se houver janela aberta do site, navega nela e foca
            for (let client of windowClients) {
                if (client.url.includes('samenext.com.br') && 'focus' in client) {
                    return client.navigate(targetUrl).then(c => c?.focus());
                }
            }
            // Se não, abre nova
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
