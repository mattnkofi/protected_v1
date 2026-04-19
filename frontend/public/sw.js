self.addEventListener('push', event => {
  const { title, message, icon, action_url } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: { url: action_url }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) event.waitUntil(clients.openWindow(url));
});