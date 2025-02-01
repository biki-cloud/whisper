// プッシュ通知を受信したときの処理
self.addEventListener("push", (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url },
      icon: "/icon512_rounded.png",
      badge: "/icon512_rounded.png",
    }),
  );
});

// 通知がクリックされたときの処理
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      }),
  );
});
