import koffi from 'koffi';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DLL_DIR = 'C:\\Fujitsu Frontech\\RFID\\CounterSensorSlim64';
const DLL_DIR = process.env.RFID_DLL_DIR || DEFAULT_DLL_DIR;

const USB_HID_PORT = 0x200;

let lib = null;
let loadError = null;
let api = null;

export function loadDll() {
  if (lib) return { ok: true };
  try {
    const dllPath = path.join(DLL_DIR, 'RFRWUMPHID_Drv.dll');
    lib = koffi.load(dllPath);
    api = {
      RFRW_Open: lib.func('int RFRW_Open(int, int)'),
      RFRW_Close: lib.func('int RFRW_Close(int)'),
      RFRW_GetDllVersion: lib.func('int RFRW_GetDllVersion(_Out_ uint8_t *ver, int verSize)'),
      RFRW_CLRW_Transmit: lib.func(
        'int RFRW_CLRW_Transmit(int port, uint8_t *send, int sendLen, _Out_ uint8_t *recv, _Inout_ uint64_t *recvLen)'
      ),
    };
    return { ok: true };
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
    return { ok: false, error: loadError };
  }
}

export function openReader() {
  if (!api) return { ok: false, error: 'DLL not loaded' };
  try {
    const ret = api.RFRW_Open(USB_HID_PORT, 0);
    if (ret !== 0) return { ok: false, error: `RFRW_Open returned ${ret}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: 'RFRW_Open threw: ' + (e instanceof Error ? e.message : String(e)) };
  }
}

export function closeReader() {
  if (!api) return;
  try {
    api.RFRW_Close(USB_HID_PORT);
  } catch {}
}

export function getDllVersion() {
  if (!api) return { ok: false, error: 'DLL not loaded' };
  try {
    const ver = Buffer.alloc(8);
    const ret = api.RFRW_GetDllVersion(ver, ver.length);
    if (ret !== 0) return { ok: false, error: `RFRW_GetDllVersion returned ${ret}` };
    return {
      ok: true,
      version: Array.from(ver)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    };
  } catch (e) {
    return {
      ok: false,
      error: 'RFRW_GetDllVersion threw: ' + (e instanceof Error ? e.message : String(e)),
    };
  }
}

function transmitOnce(sendBytes) {
  const send = Buffer.from(sendBytes);
  const recv = Buffer.alloc(1024);
  const recvLenPtr = [recv.length];
  let ret;
  try {
    ret = api.RFRW_CLRW_Transmit(USB_HID_PORT, send, send.length, recv, recvLenPtr);
  } catch (e) {
    return {
      ok: false,
      error: 'RFRW_CLRW_Transmit threw: ' + (e instanceof Error ? e.message : String(e)),
    };
  }
  if (ret !== 0) {
    return { ok: false, error: `RFRW_CLRW_Transmit returned ${ret}` };
  }
  const len = recvLenPtr[0];
  return { ok: true, data: recv.subarray(0, len), len };
}

export function probeTransmit() {
  if (!api) return { ok: false, error: 'DLL not loaded' };
  return transmitOnce([0x00, 0x05, 0x16, 0x00]);
}

export function readEpcOnce(timeoutMs = 2000) {
  if (!api) return { ok: false, error: 'DLL not loaded' };

  const start = Date.now();
  let firstError = null;

  while (Date.now() - start < timeoutMs) {
    const result = transmitOnce([0x08, 0x01, 0x00, 0x00, 0x00, 0x02, 0x05, 0x01]);
    if (!result.ok) {
      firstError = result.error;
      break;
    }
    const len = result.len;
    if (len > 4) {
      const epc = result.data.subarray(2, len - 2);
      const uid = Array.from(epc)
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
      if (uid.length > 0 && !/^0+$/.test(uid)) {
        return { ok: true, uid };
      }
    }
    busyWait(150);
  }

  if (firstError) return { ok: false, error: firstError };
  return { ok: false, error: 'SCAN_TIMEOUT' };
}

function busyWait(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}
