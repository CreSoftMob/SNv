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

const VERSION = 'v4.0'; // Incrementado para forçar atualização do cache
const LOGO_PADRAO = 'https://cdn-icons-png.flaticon.com/512/18827/18827925.png'; // Usei 512px para melhor qualidade
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

// Interceptador de mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensagem recebida:', payload);

    // Prioriza dados enviados no campo 'data' para evitar que o Android use o padrão do sistema
    const notificationTitle = payload.data?.title || payload.notification?.title || "Nova Mensagem";
    
    const notificationOptions = {
        body: payload.data?.body || payload.notification?.body || "",
        icon: payload.data?.image || payload.data?.icon || LOGO_PADRAO, // Tenta pegar imagem do envio ou usa o padrão
        badge: BADGE_ICON, // Ícone da barra de status (deve ser branco com fundo transparente)
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

    // Força a exibição da notificação com as nossas configurações
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lógica de clique na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Determina a URL de destino
    const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 1. Tenta focar em uma aba que já está na URL correta
            for (let client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // 2. Se houver qualquer aba do app aberta, navega nela
            if (windowClients.length > 0) {
                const client = windowClients[0];
                return client.navigate(targetUrl).then(c => c?.focus());
            }
            // 3. Se o app estiver fechado, abre nova janela
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
