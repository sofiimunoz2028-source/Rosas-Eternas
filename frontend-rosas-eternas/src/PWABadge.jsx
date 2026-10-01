import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  const period = 60 * 60 * 1000
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target
          if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-wine/15 bg-white p-4 shadow-lg" role="status">
      <p className="text-sm">
        {offlineReady
          ? 'La app ya puede usarse sin conexión.'
          : 'Hay una versión nueva. Recarga para actualizar.'}
      </p>
      <div className="mt-3 flex gap-2">
        {needRefresh && (
          <button type="button" className="rounded-full bg-wine px-3 py-1 text-sm text-cream" onClick={() => updateServiceWorker(true)}>
            Recargar
          </button>
        )}
        <button type="button" className="rounded-full border px-3 py-1 text-sm" onClick={() => { setOfflineReady(false); setNeedRefresh(false); }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default PWABadge

function registerPeriodicSync(period, swUrl, r) {
  if (period <= 0) return
  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return
    const resp = await fetch(swUrl, { cache: 'no-store' })
    if (resp?.status === 200) await r.update()
  }, period)
}
