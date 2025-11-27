// --- 1. CONFIGURAÇÃO E IMPORTAÇÃO DO FIREBASE (Mantida) ---
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 🚨 SUBSTITUA PELAS SUAS CHAVES REAIS!
const firebaseConfig = {
    apiKey: "AIzaSyAWPLRTgbBWhwPGf6yK_R85sh6NYSmqPvY",
    authDomain: "app-create-a3dfd.firebaseapp.com",
    projectId: "app-create-a3dfd",
    storageBucket: "app-create-a3dfd.firebasestorage.app",
    messagingSenderId: "129112776900",
    appId: "1:129112776900:web:360f27176f339a3dec2991",
};

// 💡 Defina um NOME DE CACHE ÚNICO (VERSIONAMENTO)
// Altere esta variável sempre que fizer um novo deploy grande que mude os assets.
// Para um projeto Expo/React, o melhor é não usar cache estático aqui, mas a limpeza é útil.
const CACHE_NAME = 'fcm-sw-cache-v1.0.2'; // Versão atual

// Inicializa o Firebase no Service Worker
firebase.initializeApp(firebaseConfig);

// Obtém o serviço de mensageria
const messaging = firebase.messaging();


// --- 2. LÓGICA DE ATUALIZAÇÃO E CACHE ---

// Evento: INSTALL (Instalação do novo Service Worker)
self.addEventListener('install', (event) => {
    // 💡 A CHAVE AQUI: O novo SW entra em "waiting" (espera) para garantir que
    // o SW antigo finalize. Usar skipWaiting() força o novo SW a ativar imediatamente,
    // garantindo que ele assuma o controle sem a necessidade de fechar/reabrir a aba.
    event.waitUntil(self.skipWaiting());
    console.log('[SW] Versão ' + CACHE_NAME + ' instalada e forçada a ativar.');
});

// Evento: ACTIVATE (Ativação do Service Worker)
self.addEventListener('activate', (event) => {
    // 💡 LIMPEZA DE CACHE ANTIGO: Remove qualquer cache que não seja o CACHE_NAME atual.
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Verifica se o nome do cache NÃO é a versão atual
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('fcm-sw-cache')) {
                        console.log('[SW] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            // Reivindica o controle de todas as abas abertas pelo escopo do SW
            return self.clients.claim();
        })
    );
    console.log('[SW] Ativado e caches antigos limpos.');
});


// --- 3. LÓGICA DE MENSAGENS (Mantida) ---

// Evento: MESSAGE (Mensagem Push Recebida)
messaging.onBackgroundMessage((payload) => {
    // console.log('[firebase-messaging-sw.js] Mensagem de Fundo Recebida:', payload);

    const notificationTitle = payload.notification.title || 'Nova Mensagem';
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/favicon.ico', 
        tag: payload.data.chatId || 'message-tag', 
        data: {
            url: payload.data.url || '/', 
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Evento: NOTIFICATION CLICK (Notificação Clicada)
self.addEventListener('notificationclick', (event) => {
    const clickedNotification = event.notification;
    clickedNotification.close();

    const targetUrl = clickedNotification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    return client.focus().then(focusedClient => {
                        // Navega para a URL (se diferente da atual)
                        if (focusedClient.url !== targetUrl) {
                             focusedClient.navigate(targetUrl);
                        }
                    });
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
