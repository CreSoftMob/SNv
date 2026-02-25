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

const VERSION = 'v6.0'; // Incremente para garantir a atualização
const BASE_URL = 'https://samenext.com.br';
const LOGO_PADRAO_APP = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'; 
const BADGE_ICON = 'https://cdn-icons-png.flaticon.com/128/4926/4926586.png'; // Use o mesmo da function

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

    // Agora pegamos os dados que a Function envia no objeto 'data'
    const title = payload.data?.title || "Samenext";
    const body = payload.data?.body || "";
    const fotoPerfil = payload.data?.icon || LOGO_PADRAO_APP; // Aqui pega a foto do remetente
    const clickUrl = payload.data?.url || BASE_URL;

    const notificationOptions = {
        body: body,
        icon: fotoPerfil,     // Foto do Usuário
        badge: BADGE_ICON,    // Ícone do App na barra de status
        tag: payload.data?.chatId || 'geral',
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
            url: clickUrl
        }
    };

    return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || BASE_URL;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se já estiver no site, navega para o chat e foca
            for (let client of windowClients) {
                if (client.url.includes('samenext.com.br') && 'focus' in client) {
                    return client.navigate(targetUrl).then(c => c?.focus());
                }
            }
            // Se não, abre o site na URL do chat
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
