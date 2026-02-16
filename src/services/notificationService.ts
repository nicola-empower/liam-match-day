export async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
}

export function sendNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            icon: '/vite.svg',
            badge: '/vite.svg',
            ...options
        });
    }
}
