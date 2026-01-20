importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 1. CONFIGURAÇÃO (🚨 Substitua pelas suas chaves reais)
const firebaseConfig = {
 apiKey: "AIzaSyAWPLRTgbBWhwPGf6yK_R85sh6NYSmqPvY",
    authDomain: "app-create-a3dfd.firebaseapp.com",
    projectId: "app-create-a3dfd",
    storageBucket: "app-create-a3dfd.firebasestorage.app",
    messagingSenderId: "129112776900",
    appId: "1:129112776900:web:360f27176f339a3dec2991",
};

// 2. VERSIONAMENTO E LIMPEZA DE CACHE
const CACHE_NAME = 'fcm-sw-cache-v1.1.2';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith('fcm-sw-cache-') && cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. RECEBIMENTO E EXIBIÇÃO (EVITA DUPLICIDADE)
messaging.onBackgroundMessage((payload) => {
    const { title, body, icon, chatId } = payload.data;

    const notificationOptions = {
        body: body,
        icon: icon && icon !== "" ? icon : DEFAULT_AVATAR,
        // 💡 A TAG evita que a mensagem apareça 2 vezes. 
        // Se houver uma notificação aberta do mesmo chat, ela apenas atualiza o texto.
        tag: chatId || 'new-msg', 
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: '/' }
    };

    return self.registration.showNotification(title, notificationOptions);
});

// 4. CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});