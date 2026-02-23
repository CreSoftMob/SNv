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

// INCREMENTE ESTA VERSÃO SEMPRE QUE MUDAR O CÓDIGO (ex: v4.1, v4.2)
const VERSION = 'v5.0'; 
const BASE_URL = 'https://samenext.com.br';
const LOGO_APP = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'; 
const BADGE_ICON = 'https://cdn-icons-png.flaticon.com/128/4926/4926586.png'; 

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== VERSION) && caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// Lógica de recebimento da mensagem
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensagem recebida:', payload);

    const title = payload.data?.title || payload.notification?.title || "Samenext";
    const body = payload.data?.body || payload.notification?.body || "Você tem uma nova atualização.";
    
    // Tratamento da URL para garantir que nunca dê erro no clique
    let finalUrl = payload.data?.url || '/';
    if (!finalUrl.startsWith('http')) {
        finalUrl = new URL(finalUrl, BASE_URL).href;
    }

    const notificationOptions = {
        body: body,
        icon: LOGO_APP,      // Ícone grande (Logo do App)
        badge: BADGE_ICON,   // Ícone da barra de status (Obrigatório para Android)
        tag: payload.data?.chatId || 'geral',
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
            url: finalUrl
        }
    };

    // Forçamos o navegador a usar nossas configurações (incluindo o ícone)
    return self.registration.showNotification(title, notificationOptions);
});

// Lógica de clique corrigida para samenext.com.br
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || BASE_URL;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se já houver uma aba aberta, foca nela e navega
            for (let client of windowClients) {
                if ('focus' in client) {
                    return client.navigate(targetUrl).then(c => c?.focus());
                }
            }
            // Se não houver nada aberto, abre uma nova janela
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
