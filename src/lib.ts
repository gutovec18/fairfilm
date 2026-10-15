export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const EASE_CINE = [0.7, 0, 0.2, 1] as const
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

export const media = (p: string) => `/media/${p}`

/** sessionStorage can throw in private mode / sandboxed frames */
export const session = {
  get(key: string) {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
}

/** requestIdleCallback with a Safari fallback. */
export function whenIdle(cb: () => void, timeout = 2000): number {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  return w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout }) : window.setTimeout(cb, 200)
}

export function cancelIdle(id: number) {
  const w = window as Window & { cancelIdleCallback?: (id: number) => void }
  if (w.cancelIdleCallback) w.cancelIdleCallback(id)
  else window.clearTimeout(id)
}

/** Resolves once the page has fully loaded and the main thread has had a moment of idle time. */
export function afterLoadIdle(timeout = 2500): Promise<void> {
  return new Promise((resolve) => {
    const go = () => whenIdle(() => resolve(), timeout)
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
  })
}
