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

type IdleDeadlineLike = { timeRemaining: () => number; didTimeout: boolean }

// Last time the visitor scrolled, touched, clicked or typed. Heavy one-off work waits for a pause in that
// (plain mouse movement doesn't count: visitors rarely hold the mouse still, and nothing scrolls then).
let lastActivity = 0
if (typeof window !== 'undefined') {
  const mark = () => (lastActivity = performance.now())
  for (const e of ['scroll', 'wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'])
    window.addEventListener(e, mark, { passive: true, capture: true })
}

/**
 * Runs `cb` in a *quiet* moment: the browser is idle and the visitor hasn't scrolled,
 * touched or typed for `calmMs`. Use for unavoidable heavy chunks of work: nothing on screen is being
 * driven by the main thread then (video and CSS animations run on the compositor), so nothing stutters.
 * Falls back after `maxWaitMs`. Returns a cancel function.
 */
export function whenQuiet(cb: () => void, { calmMs = 500, maxWaitMs = 12000 } = {}): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: (d: IdleDeadlineLike) => void, o?: { timeout: number }) => number
    cancelIdleCallback?: (id: number) => void
  }
  const started = performance.now()
  let cancelled = false
  let id = 0
  const ready = () => performance.now() - lastActivity >= calmMs || performance.now() - started > maxWaitMs
  if (!w.requestIdleCallback) {
    const poll = () => {
      if (cancelled) return
      if (ready()) cb()
      else id = window.setTimeout(poll, 150)
    }
    id = window.setTimeout(poll, 150)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }
  const tick = (d: IdleDeadlineLike) => {
    if (cancelled) return
    if (ready() && (d.timeRemaining() > 8 || d.didTimeout)) cb()
    else id = w.requestIdleCallback!(tick, { timeout: 250 })
  }
  id = w.requestIdleCallback(tick, { timeout: 250 })
  return () => {
    cancelled = true
    w.cancelIdleCallback?.(id)
  }
}

/** Promise form of whenQuiet. */
export const quiet = (opts?: { calmMs?: number; maxWaitMs?: number }) => new Promise<void>((r) => whenQuiet(r, opts))
