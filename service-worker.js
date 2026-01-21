importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 1. CONFIGURAÇÃO (🚨 Substitua com seus dados reais)
const firebaseConfig = {
   apiKey: "AIzaSyAWPLRTgbBWhwPGf6yK_R85sh6NYSmqPvY",
  authDomain: "app-create-a3dfd.firebaseapp.com",
  projectId: "app-create-a3dfd",
  storageBucket: "app-create-a3dfd.firebasestorage.app",
  messagingSenderId: "129112776900",
  appId: "1:129112776900:web:360f27176f339a3dec2991",
};

// 2. VERSÃO E LINKS (🚨 Troque o link abaixo pelo logo do seu app)
const VERSION = 'v1.2.0'; 
const LOGO_APP = 'https://cresoftmob.github.io/img/logo.jpeg'; 
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/128/18827/18827926.png';

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. INSTALAÇÃO E LIMPEZA DE CACHE
self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== VERSION) && caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// 4. EXIBIÇÃO DA NOTIFICAÇÃO
messaging.onBackgroundMessage((payload) => {
    const { title, body, icon, chatId } = payload.data;

    const options = {
        body: body,
        icon: icon && icon !== "" ? icon : LOGO_APP, // Foto de quem enviou (ou logo do app)
        badge: LOGO_APP, // 🏆 ISSO TIRA O SINO E COLOCA SEU LOGO
        tag: chatId || 'chat-tag', // 🏆 ISSO EVITA DUPLICIDADE
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: '/' }
    };

    return self.registration.showNotification(title, options);
});

// 5. CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (let c of clients) {
                if (c.url === '/' && 'focus' in c) return c.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
