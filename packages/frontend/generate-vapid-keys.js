const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('==================');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('');
console.log('Add these to your .env.local file:');
console.log('WEB_PUSH_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('');
console.log('Also set your email:');
console.log('WEB_PUSH_EMAIL=your-email@example.com');

