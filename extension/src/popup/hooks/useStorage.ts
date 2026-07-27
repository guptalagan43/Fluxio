// src/popup/hooks/useStorage.ts
// React hook subscribing to chrome.storage.onChanged for live UI re-renders.

import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, initialValue: T): T {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    // Initial read
    chrome.storage.local.get(key).then((result) => {
      if (result[key] !== undefined) {
        setValue(result[key] as T);
      }
    });

    // Storage listener
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[key]) {
        setValue(changes[key].newValue as T);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [key]);

  return value;
}
