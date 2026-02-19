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

const VERSION = 'v3.1';
const LOGO_PADRAO = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png';
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

    // Ajuste 1: Priorizamos os dados (payload.data) pois são mais flexíveis no background
    const title = payload.data?.title || payload.notification?.title || "Nova Mensagem";
    const body = payload.data?.body || payload.notification?.body || "";
    const chatId = payload.data?.chatId || 'geral';
    const senderIcon = payload.data?.icon || LOGO_PADRAO;
    
    // Garante que a URL seja absoluta ou tratada corretamente no clique
    const clickUrl = payload.data?.url || '/'; 

    const notificationOptions = {
        body: body,
        icon: senderIcon,
        badge: BADGE_ICON,
        tag: chatId,
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
            url: clickUrl
        },
        actions: [
            { action: 'open', title: 'Visualizar' }
        ]
    };

    // Ajuste 2: Se 'notification' já existe no payload, o Firebase no Android 
    // costuma exibir sozinho. Se não, forçamos a exibição manual.
    if (!payload.notification) {
        return self.registration.showNotification(title, notificationOptions);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Pegamos a URL base para comparar com as abas abertas
    const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 1. Verifica se já existe uma aba com essa URL exata aberta
            for (let client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // 2. Se não houver a URL exata, mas houver uma aba do app aberta, navega nela
            if (windowClients.length > 0) {
                const client = windowClients[0];
                return client.navigate(targetUrl).then(c => c?.focus());
            }
            // 3. Se tudo estiver fechado, abre nova janela
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
