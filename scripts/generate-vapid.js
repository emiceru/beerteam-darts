const webpush = require('web-push');
const fs = require('fs');

console.log('🔐 Generando claves VAPID para notificaciones push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

const envContent = `
# Claves VAPID para notificaciones push
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
NEXT_PUBLIC_VAPID_KEY=${vapidKeys.publicKey}
`;

// Escribir a archivo temporal
fs.writeFileSync('vapid-keys.txt', envContent);

console.log('✅ Claves VAPID generadas exitosamente!');
console.log('📝 Claves guardadas en: vapid-keys.txt');
console.log('💡 Copia estas variables a tu archivo .env.local');
console.log('\n' + envContent); 