import { useEffect, type RefObject } from 'react'

/** Pauses an autoplaying, muted background video while it is off screen (saves decoding + GPU work) and keeps looping videos looping. */
export function useVideoInView(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {})
        else v.pause()
      },
      { rootMargin: '100px' },
    )
    io.observe(v)
    // Safety net: Safari occasionally fires `ended` on looping videos (notably WebM) instead of restarting.
    const restart = () => {
      if (!v.loop) return
      v.currentTime = 0
      void v.play().catch(() => {})
    }
    v.addEventListener('ended', restart)
    return () => {
      io.disconnect()
      v.removeEventListener('ended', restart)
    }
  }, [ref])
}
