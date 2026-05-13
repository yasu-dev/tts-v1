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
    const dllPath = path.join(DLL_DIR, 'FjRfrwCommVO.dll');
    lib = koffi.load(dllPath);
    api = {
      RFRW_Open: lib.func('int __stdcall RFRW_Open(int, int)'),
      RFRW_Close: lib.func('int __stdcall RFRW_Close(int)'),
      RFRW_GetDllVersion: lib.func(
        'int __stdcall RFRW_GetDllVersion(_Out_ uint8_t *ver, int verSize)'
      ),
      RFRW_CLRW_Transmit: lib.func(
        'int __stdcall RFRW_CLRW_Transmit(int port, const uint8_t *send, int sendLen, _Out_ uint8_t *recv, _Inout_ int *recvLen)'
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
  const ret = api.RFRW_Open(USB_HID_PORT, 0);
  if (ret !== 0) return { ok: false, error: `RFRW_Open returned ${ret}` };
  return { ok: true };
}

export function closeReader() {
  if (!api) return;
  try {
    api.RFRW_Close(USB_HID_PORT);
  } catch {}
}

export function getDllVersion() {
  if (!api) return { ok: false, error: 'DLL not loaded' };
  const ver = Buffer.alloc(8);
  const ret = api.RFRW_GetDllVersion(ver, ver.length);
  if (ret !== 0) return { ok: false, error: `RFRW_GetDllVersion returned ${ret}` };
  return {
    ok: true,
    version: Array.from(ver)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
  };
}

export function readEpcOnce(timeoutMs = 2000) {
  if (!api) return { ok: false, error: 'DLL not loaded' };
  const start = Date.now();
  const recv = Buffer.alloc(256);
  const recvLen = [recv.length];

  while (Date.now() - start < timeoutMs) {
    const send = Buffer.from([0x08, 0x01, 0x00, 0x00, 0x00, 0x02, 0x05, 0x01]);
    recvLen[0] = recv.length;
    const ret = api.RFRW_CLRW_Transmit(USB_HID_PORT, send, send.length, recv, recvLen);
    if (ret !== 0) return { ok: false, error: `RFRW_CLRW_Transmit returned ${ret}` };
    const len = recvLen[0];
    if (len > 4) {
      const epc = recv.subarray(2, len - 2);
      const uid = Array.from(epc)
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
      if (uid.length > 0 && !/^0+$/.test(uid)) {
        return { ok: true, uid };
      }
    }
    Sleep(150);
  }
  return { ok: false, error: 'SCAN_TIMEOUT' };
}

function Sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}
