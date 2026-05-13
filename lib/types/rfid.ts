export type BridgeRequest =
  | { type: 'PING' }
  | { type: 'SCAN_START'; mode: 'single' }
  | { type: 'SCAN_CANCEL' };

export type BridgeErrorCode =
  | 'DEVICE_NOT_FOUND'
  | 'DRIVER_LOAD_FAILED'
  | 'SCAN_TIMEOUT'
  | 'PORT_IN_USE'
  | 'ORIGIN_REJECTED'
  | 'INTERNAL';

export type BridgeResponse =
  | { type: 'PONG' }
  | {
      type: 'STATUS';
      status: 'ready' | 'busy' | 'error';
      detail?: string;
    }
  | {
      type: 'SCAN_RESULT';
      uid: string;
      rssi?: number;
      scannedAt: string;
    }
  | {
      type: 'ERROR';
      code: BridgeErrorCode;
      message: string;
    };

export type BridgeHealthResponse =
  | {
      status: 'ok';
      driver: 'loaded';
      wsPort: number;
      version: string;
    }
  | {
      status: 'error';
      driver: 'failed' | 'port_in_use';
      message: string;
      port?: number;
    };

export type TagSource = 'qr' | 'rfid' | 'manual';
