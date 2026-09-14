'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Service Worker terdaftar
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Versi baru Second Brain PWA tersedia.');
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('Pendaftaran Service Worker gagal:', error);
        });
    }
  }, []);

  return null;
}
