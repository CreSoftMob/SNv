importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 1. Configuração do Firebase
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

// 2. Constantes de UI
const VERSION = 'v3.1';
const LOGO_PADRAO = 'https://cdn-icons-png.flaticon.com/128/18827/18827925.png'; // Ícone do App
const BADGE_ICON = 'https://cdn-icons-png.flaticon.com/128/4926/4926586.png';  // Ícone monocromático (Android)

// 3. Ciclo de Vida do SW
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== VERSION) && caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// 4. Tratamento de Mensagem em Segundo Plano (Background)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensagem recebida em background:', payload);

    // Se o payload já vier com o objeto "notification" preenchido pela Cloud Function,
    // o navegador PODE exibir automaticamente. Para evitar duplicidade e garantir 
    // personalização (como agrupar por tag), verificamos:
    
    const title = payload.notification?.title || payload.data?.title || "Nova Mensagem";
    const body = payload.notification?.body || payload.data?.body || "";
    
    // Pegamos os dados extras enviados na Cloud Function
    const chatId = payload.data?.chatId || 'geral';
    const senderIcon = payload.data?.icon || LOGO_PADRAO;
    const clickUrl = payload.data?.url || `/chat/${chatId}`;

    const notificationOptions = {
        body: body,
        icon: senderIcon,
        badge: BADGE_ICON,
        tag: chatId,            // IMPORTANTE: Agrupa mensagens do mesmo chat (não empilha 50 balões)
        renotify: true,         // Faz o celular vibrar mesmo se já houver notificação daquela tag
        vibrate: [200, 100, 200],
        data: {
            url: clickUrl       // Guardamos a URL para o evento de clique abaixo
        },
        actions: [
            { action: 'open', title: 'Visualizar' }
        ]
    };

    // Apenas chamamos showNotification se o navegador já não tiver exibido
    // (Prevenção de duplicidade em alguns navegadores Android)
    if (!payload.notification) {
        return self.registration.showNotification(title, notificationOptions);
    }
});

// 5. Lógica de Clique na Notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Fecha o banner ao clicar

    // Recupera a URL de destino (ex: /chat/123)
    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 1. Tenta encontrar uma aba que já esteja na URL do chat
            for (let client of windowClients) {
                const clientUrl = new URL(client.url).pathname;
                if (clientUrl.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // 2. Se não achou, mas tem o app aberto em outra tela, redireciona essa tela
            for (let client of windowClients) {
                if ('navigate' in client) {
                    return client.navigate(targetUrl).then(c => c?.focus());
                }
            }
            // 3. Se o app estiver fechado, abre uma nova janela
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
