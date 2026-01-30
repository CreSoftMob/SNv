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

const VERSION = 'v2.6'; 
// 💡 DICA: Para o badge, tente usar uma versão PNG BRANCA com fundo transparente depois.
const LOGO_APP = 'https://cdn-icons-png.flaticon.com/128/4926/4926586.png'; 
const LOGO_APP1 = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()));

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== VERSION) && caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

messaging.onBackgroundMessage((payload) => {
    // 💡 A Cloud Function envia os dados no objeto 'data'
    const { title, body, icon, chatId } = payload.data;

    const options = {
        body: body,
        icon: icon && icon !== "" ? icon : LOGO_APP1, // Foto do remetente
        badge: LOGO_APP,                             // Ícone da barra de status
        tag: chatId || 'chat-tag',                   // Agrupa mensagens do mesmo chat
        renotify: true,                              // Avisa novamente se chegar mensagem nova na mesma tag
        vibrate: [200, 100, 200],
        data: { url: '/' }
    };

    return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let c of windowClients) {
                if (c.url === '/' && 'focus' in c) return c.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
