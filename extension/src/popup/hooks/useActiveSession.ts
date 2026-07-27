// src/popup/hooks/useActiveSession.ts
// Custom React hook deriving active session for the currently active browser tab.

import { useState, useEffect } from 'react';
import type { Session } from '../../utils/types';

export function useActiveSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          const key = `session:${tab.id}`;
          const res = await chrome.storage.local.get(key);
          setSession((res[key] as Session) || null);
        }
      } catch (err) {
        console.error('[AI Token Tracker] Failed to query active tab session:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') return;

      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab?.id) {
          const key = `session:${tab.id}`;
          if (changes[key]) {
            setSession((changes[key].newValue as Session) || null);
          }
        }
      });
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return { session, loading };
}
