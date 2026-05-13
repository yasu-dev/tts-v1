import http from 'node:http';
import { WebSocketServer } from 'ws';
import pino from 'pino';
import {
  loadDll,
  openReader,
  closeReader,
  getDllVersion,
  readEpcOnce,
  probeTransmit,
} from './dll.js';

const WS_PORT = Number(process.env.RFID_WS_PORT || 17324);
const HEALTH_PORT = Number(process.env.RFID_HEALTH_PORT || 17325);
const READ_TIMEOUT_MS = Number(process.env.RFID_READ_TIMEOUT_MS || 2000);
const VERSION = '0.1.0';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3443',
  'https://triage-tag-system.netlify.app',
];
const EXTRA_ORIGINS = (process.env.RFID_BRIDGE_ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS]);

const logger = pino({ name: 'tts-rfid-bridge', level: process.env.RFID_LOG_LEVEL || 'info' });

let driverState = 'unknown';
let driverError = null;

const dllResult = loadDll();
if (!dllResult.ok) {
  driverState = 'failed';
  driverError = dllResult.error;
  logger.error({ event: 'dll_load_failed', error: dllResult.error });
} else {
  const openResult = openReader();
  if (!openResult.ok) {
    driverState = 'failed';
    driverError = openResult.error;
    logger.error({ event: 'reader_open_failed', error: openResult.error });
  } else {
    driverState = 'loaded';
    logger.info({ event: 'dll_loaded', dll_dir: process.env.RFID_DLL_DIR || 'default' });
    const ver = getDllVersion();
    if (ver.ok) logger.info({ event: 'dll_version', version: ver.version });
  }
}

let healthServer;
let wss;
let portInUse = false;

healthServer = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    if (portInUse) {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: 'error',
          driver: 'port_in_use',
          message: 'WebSocket port is in use by another process',
          port: WS_PORT,
        })
      );
      return;
    }
    if (driverState === 'loaded') {
      res.statusCode = 200;
      res.end(
        JSON.stringify({ status: 'ok', driver: 'loaded', wsPort: WS_PORT, version: VERSION })
      );
    } else {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: 'error',
          driver: 'failed',
          message: driverError || 'driver not loaded',
        })
      );
    }
    return;
  }
  res.statusCode = 404;
  res.end('Not Found');
});

healthServer.on('error', (err) => {
  logger.error({ event: 'health_server_error', error: err.message });
});
healthServer.listen(HEALTH_PORT, '127.0.0.1', () => {
  logger.info({ event: 'health_listening', port: HEALTH_PORT });
});

wss = new WebSocketServer({ host: '127.0.0.1', port: WS_PORT, verifyClient });
wss.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    portInUse = true;
    logger.error({ event: 'ws_port_in_use', port: WS_PORT });
  } else {
    logger.error({ event: 'ws_server_error', error: err.message });
  }
});
wss.on('listening', () => {
  logger.info({ event: 'ws_listening', port: WS_PORT });
});

function verifyClient(info, done) {
  const origin = info.req.headers.origin || '';
  if (!ALLOWED_ORIGINS.has(origin)) {
    logger.warn({
      event: 'origin_rejected',
      origin,
      ip: info.req.socket.remoteAddress,
    });
    done(false, 1008, 'Origin not allowed');
    return;
  }
  done(true);
}

wss.on('connection', (ws, req) => {
  const peer = req.socket.remoteAddress;
  logger.info({ event: 'client_connected', peer });
  let scanning = false;

  sendJson(ws, { type: 'STATUS', status: driverState === 'loaded' ? 'ready' : 'error' });

  ws.on('message', async (raw) => {
    let req2;
    try {
      req2 = JSON.parse(String(raw));
    } catch {
      logger.warn({ event: 'invalid_message' });
      return;
    }
    if (req2.type === 'PING') {
      sendJson(ws, { type: 'PONG' });
      return;
    }
    if (req2.type === 'SCAN_START') {
      if (driverState !== 'loaded') {
        sendJson(ws, {
          type: 'ERROR',
          code: 'DRIVER_LOAD_FAILED',
          message: driverError || 'driver not loaded',
        });
        return;
      }
      if (scanning) return;
      scanning = true;
      sendJson(ws, { type: 'STATUS', status: 'busy' });

      // diagnostic: try GetDllVersion first to verify any FFI call works
      const verResult = getDllVersion();
      logger.info({
        event: 'scan_probe_version',
        ok: verResult.ok,
        version: verResult.version,
        error: verResult.error,
      });

      // diagnostic: try ApiTrace's known-good 4-byte command before scanning
      const probeResult = probeTransmit();
      logger.info({
        event: 'scan_probe_transmit',
        ok: probeResult.ok,
        len: probeResult.len,
        error: probeResult.error,
      });
      if (!probeResult.ok) {
        scanning = false;
        sendJson(ws, {
          type: 'ERROR',
          code: 'INTERNAL',
          message: 'probe failed: ' + probeResult.error,
        });
        sendJson(ws, { type: 'STATUS', status: 'ready' });
        return;
      }

      const result = readEpcOnce(READ_TIMEOUT_MS);
      scanning = false;
      if (result.ok) {
        logger.info({ event: 'scan_success', uid: result.uid });
        sendJson(ws, {
          type: 'SCAN_RESULT',
          uid: result.uid,
          scannedAt: new Date().toISOString(),
        });
        sendJson(ws, { type: 'STATUS', status: 'ready' });
      } else {
        const isTimeout = result.error === 'SCAN_TIMEOUT';
        logger.warn({ event: 'scan_failed', error: result.error });
        sendJson(ws, {
          type: 'ERROR',
          code: isTimeout ? 'SCAN_TIMEOUT' : 'INTERNAL',
          message: result.error,
        });
        sendJson(ws, { type: 'STATUS', status: 'ready' });
      }
      return;
    }
    if (req2.type === 'SCAN_CANCEL') {
      scanning = false;
      sendJson(ws, { type: 'STATUS', status: 'ready' });
      return;
    }
  });

  ws.on('close', (code, reason) => {
    logger.info({ event: 'client_disconnected', code, reason: reason.toString() });
  });
});

function sendJson(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

function shutdown() {
  logger.info({ event: 'shutdown_begin' });
  try {
    closeReader();
  } catch {}
  wss?.close();
  healthServer?.close();
  setTimeout(() => process.exit(0), 200);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
