import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="bg-wine px-4 py-2 text-center text-sm text-cream" role="status">
      Estás sin conexión. Puedes ver el catálogo que ya visitaste.
    </div>
  );
}
