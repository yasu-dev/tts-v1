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
        'int RFRW_CLRW_Transmit(int port, int sendLen, uint8_t *send, _Inout_ int *recvLen, _Out_ uint8_t *recv)'
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
    // 引数順序は DLL ディスアセンブル解析結果に基づく:
    //   (int port, int sendLen, uint8_t *send, int *recvLen, uint8_t *recv)
    ret = api.RFRW_CLRW_Transmit(USB_HID_PORT, send.length, send, recvLenPtr, recv);
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

// レスポンス形式: [00 NN] [UID1 14bytes] [UID2 14bytes] ... [90 00]
//   NN = 検出枚数 (00 = 検出なし、01 以上 = 検出あり)
//   各 UID は 14 bytes 固定長 (TFU-RW811A 仕様: 112bit EPC)
//   末尾 90 00 は ACK
const TAG_BYTE_LEN = 14;

export function readEpcOnce(timeoutMs = 2000) {
  if (!api) return { ok: false, error: 'DLL not loaded' };

  const start = Date.now();
  let firstError = null;
  let discardedCount = 0;

  while (Date.now() - start < timeoutMs) {
    const result = transmitOnce([0x08, 0x01, 0x00, 0x00, 0x00, 0x02, 0x05, 0x01]);
    if (!result.ok) {
      firstError = result.error;
      break;
    }
    const data = result.data;
    const len = result.len;
    // 最低: header(2) + 1 UID(14) + ACK(2) = 18 bytes 必要
    if (len >= 18) {
      const numTags = data[1];
      if (numTags > 0 && len >= 2 + TAG_BYTE_LEN + 2) {
        // 最初の 1 件のみ採用 (設計書 §3.5 E1)
        const firstUid = data.subarray(2, 2 + TAG_BYTE_LEN);
        const uid = Array.from(firstUid)
          .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
          .join('');
        if (uid.length > 0 && !/^0+$/.test(uid)) {
          return { ok: true, uid, numTags, discarded: numTags - 1 };
        }
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
