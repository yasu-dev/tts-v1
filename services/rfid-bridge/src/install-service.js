import path from 'node:path';
import { fileURLToPath } from 'node:url';
import windowsServiceLib from 'node-windows';

const { Service } = windowsServiceLib;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svc = new Service({
  name: 'tts-rfid-bridge',
  description: 'Local WebSocket bridge for FUJITSU TFU-RW811A RFID reader (TTS demo).',
  script: path.join(__dirname, 'server.js'),
  nodeOptions: [],
  wait: 1,
  grow: 0.25,
  maxRestarts: 3,
  env: [{ name: 'NODE_ENV', value: 'production' }],
});

const cmd = process.argv[2];

svc.on('install', () => {
  console.log('[install-service] installed; starting...');
  svc.start();
});
svc.on('alreadyinstalled', () => {
  console.log('[install-service] already installed.');
});
svc.on('start', () => {
  console.log('[install-service] started.');
});
svc.on('uninstall', () => {
  console.log('[install-service] uninstalled.');
});
svc.on('error', (err) => {
  console.error('[install-service] error:', err);
  process.exit(1);
});

if (cmd === 'install') {
  svc.install();
} else if (cmd === 'uninstall') {
  svc.uninstall();
} else {
  console.error('Usage: node install-service.js install | uninstall');
  process.exit(2);
}
