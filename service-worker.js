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

const VERSION = 'v4.0'; // Versão atualizada
// Use URLs absolutas e seguras (HTTPS) para os ícones
const LOGO_APP = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'; 
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

    const title = payload.data?.title || payload.notification?.title || "Nova Mensagem";
    const body = payload.data?.body || payload.notification?.body || "";
    
    // Forçamos a URL a ser sempre válida para evitar erro no clique
    let clickUrl = payload.data?.url || '/';
    if (!clickUrl.startsWith('http')) {
        clickUrl = new URL(clickUrl, self.location.origin).href;
    }

    const notificationOptions = {
        body: body,
        icon: LOGO_APP,      // Logo principal do seu App
        badge: BADGE_ICON,   // Ícone pequeno da barra de tarefas (Android)
        tag: payload.data?.chatId || 'geral',
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
            url: clickUrl    // Armazenamos a URL completa aqui
        },
        actions: [
            { action: 'open', title: 'Abrir App' }
        ]
    };

    // O segredo para o ícone do App não falhar é usar o self.registration direto
    return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    notification.close(); // Fecha a notificação imediatamente

    // Recupera a URL que salvamos no 'data' acima
    const targetUrl = notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 1. Tenta achar uma aba já aberta com o mesmo domínio
            for (let client of windowClients) {
                if ('focus' in client) {
                    return client.navigate(targetUrl).then(c => c?.focus());
                }
            }
            // 2. Se não houver aba aberta, abre uma nova
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        }).catch(err => {
            console.error("Erro ao processar clique na notificação:", err);
        })
    );
});
