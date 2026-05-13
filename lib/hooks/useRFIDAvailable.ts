'use client';

import { useEffect, useState } from 'react';
import { rfidEnabled } from '@/lib/env';

export function useRFIDAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!rfidEnabled) return;
    if (typeof navigator === 'undefined') return;

    const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData;
    const isWindows = uaData?.platform === 'Windows' || /Windows NT/.test(navigator.userAgent);

    setAvailable(isWindows);
  }, []);

  return available;
}
