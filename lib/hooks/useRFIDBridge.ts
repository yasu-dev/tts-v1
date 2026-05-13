'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger } from '@/lib/utils/logger';
import type { BridgeRequest, BridgeResponse } from '@/lib/types/rfid';

const logger = createLogger('lib/hooks/useRFIDBridge');

export type BridgeState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'scanning'
  | 'error'
  | 'disconnected';

export interface UseRFIDBridgeOptions {
  url: string;
  enabled: boolean;
  onScanSuccess?: (uid: string) => void;
  onError?: (code: string, message: string) => void;
}

export interface UseRFIDBridgeReturn {
  state: BridgeState;
  lastError: { code: string; message: string } | null;
  startScan: () => void;
  cancelScan: () => void;
  reconnect: () => void;
}

const RECONNECT_BACKOFF_MS = [1000, 2000, 4000, 8000, 16000];
const MAX_RECONNECT_ATTEMPTS = RECONNECT_BACKOFF_MS.length;

export function useRFIDBridge(options: UseRFIDBridgeOptions): UseRFIDBridgeReturn {
  const { url, enabled, onScanSuccess, onError } = options;
  const [state, setState] = useState<BridgeState>('idle');
  const [lastError, setLastError] = useState<{ code: string; message: string } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manuallyClosedRef = useRef(false);
  const onScanSuccessRef = useRef(onScanSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onErrorRef.current = onError;
  }, [onScanSuccess, onError]);

  const send = useCallback((req: BridgeRequest) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn('send aborted: socket not open', { state: ws?.readyState });
      return;
    }
    ws.send(JSON.stringify(req));
  }, []);

  const connect = useCallback(() => {
    if (!enabled) {
      logger.debug('connect skipped: feature disabled');
      return;
    }
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    setState('connecting');
    manuallyClosedRef.current = false;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'WebSocket constructor failed';
      logger.error('WebSocket constructor threw', { message });
      setState('error');
      setLastError({ code: 'CONNECT_FAILED', message });
      onErrorRef.current?.('CONNECT_FAILED', message);
      return;
    }

    wsRef.current = ws;

    ws.addEventListener('open', () => {
      logger.info('connected', { url });
      attemptRef.current = 0;
      setState('connected');
      setLastError(null);
    });

    ws.addEventListener('message', (ev) => {
      let msg: BridgeResponse;
      try {
        msg = JSON.parse(ev.data as string) as BridgeResponse;
      } catch {
        logger.warn('non-JSON message ignored');
        return;
      }
      switch (msg.type) {
        case 'PONG':
          return;
        case 'STATUS':
          if (msg.status === 'busy') setState('scanning');
          else if (msg.status === 'ready') setState('connected');
          else if (msg.status === 'error') setState('error');
          return;
        case 'SCAN_RESULT':
          logger.info('scan success', { uid: msg.uid });
          setState('connected');
          onScanSuccessRef.current?.(msg.uid);
          return;
        case 'ERROR':
          logger.warn('bridge error', { code: msg.code, message: msg.message });
          setState('error');
          setLastError({ code: msg.code, message: msg.message });
          onErrorRef.current?.(msg.code, msg.message);
          return;
      }
    });

    ws.addEventListener('error', () => {
      logger.warn('websocket error event');
    });

    ws.addEventListener('close', (ev) => {
      logger.info('disconnected', { code: ev.code, reason: ev.reason });
      wsRef.current = null;
      if (manuallyClosedRef.current) {
        setState('idle');
        return;
      }
      setState('disconnected');
      const attempt = attemptRef.current;
      if (attempt < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_BACKOFF_MS[attempt];
        attemptRef.current = attempt + 1;
        logger.info('scheduling reconnect', { attempt: attempt + 1, delay });
        reconnectTimerRef.current = setTimeout(() => connect(), delay);
      } else {
        logger.warn('reconnect attempts exhausted');
        setState('error');
        setLastError({
          code: 'RECONNECT_EXHAUSTED',
          message: 'Bridge reconnect attempts exhausted',
        });
        onErrorRef.current?.('RECONNECT_EXHAUSTED', 'Bridge reconnect attempts exhausted');
      }
    });
  }, [enabled, url]);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      manuallyClosedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, connect]);

  const startScan = useCallback(() => {
    send({ type: 'SCAN_START', mode: 'single' });
    setState('scanning');
  }, [send]);

  const cancelScan = useCallback(() => {
    send({ type: 'SCAN_CANCEL' });
    setState('connected');
  }, [send]);

  const reconnect = useCallback(() => {
    attemptRef.current = 0;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    connect();
  }, [connect]);

  return { state, lastError, startScan, cancelScan, reconnect };
}
