// generate-vapid-keys.js
const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== Web Push VAPID Keys ===');
console.log('WEB_PUSH_EMAIL=your-email@example.com');
console.log('WEB_PUSH_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=' + vapidKeys.publicKey);