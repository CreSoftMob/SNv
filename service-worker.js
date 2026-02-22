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

const VERSION = 'v3.2'; // Incrementei a versão para forçar atualização no navegador
const LOGO_APP = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'; // Seu ícone do APP
const BADGE_ICON = 'https://cdn-icons-png.flaticon.com/128/4926/4926586.png'; // O ícone da barra de status

self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== VERSION) && caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// Lógica de recebimento em background
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensagem recebida:', payload);

    // Extraímos os dados
    const title = payload.data?.title || payload.notification?.title || "Nova Mensagem";
    const body = payload.data?.body || payload.notification?.body || "";
    
    // IMPORTANTE: Aqui definimos que o ícone da notificação SERÁ o logo do seu APP
    // Se você quiser a foto do usuário, use payload.data.icon. 
    // Como você quer o ícone do APP, fixamos o LOGO_APP aqui.
    const appIcon = LOGO_APP; 

    const notificationOptions = {
        body: body,
        icon: appIcon,      // O ícone principal (Logo do seu App)
        badge: BADGE_ICON,  // O ícone que aparece na barra de notificações (Android)
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

    // Forçamos a exibição manual para sobrescrever o padrão do navegador
    return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (windowClients.length > 0) {
                const client = windowClients[0];
                return client.navigate(targetUrl).then(c => c?.focus());
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
