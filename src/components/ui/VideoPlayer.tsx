import { AnimatePresence, m, useMotionValue, useTransform } from 'motion/react'
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as RPointerEvent,
} from 'react'
import { EASE_OUT, cx } from '../../lib'
import s from './VideoPlayer.module.scss'

type Props = {
  src: string
  poster: string
  title: string
  /** Small mono caption in the top bar, e.g. "Drama · Documentary" */
  meta?: string
  ringText?: string
  className?: string
}

const FPS = 25
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')
/** mm:ss:ff: film-style timecode */
const tc = (t: number) => {
  if (!Number.isFinite(t) || t < 0) t = 0
  return `${pad(t / 60)}:${pad(t % 60)}:${pad((t % 1) * FPS)}`
}

/**
 * Poster-first player: nothing heavy is downloaded until the visitor presses play.
 * Then a fully custom control layer takes over (no native browser chrome).
 */
export function VideoPlayer({ src, poster, title, meta, ringText = 'Přehrát • Play • Přehrát • Play • ', className }: Props) {
  const [started, setStarted] = useState(false)
  const ringId = `ring-${useId().replace(/[^\w-]/g, '')}`

  return (
    <div className={cx(s.player, className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {started ? (
          <m.div key="video" className={s.stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Player src={src} poster={poster} title={title} meta={meta} />
          </m.div>
        ) : (
          <m.button
            key="poster"
            type="button"
            className={s.poster}
            onClick={() => setStarted(true)}
            data-cursor="Přehrát"
            aria-label={`Přehrát: ${title}`}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <img src={poster} alt="" loading="lazy" decoding="async" />
            <span className={s.shade} />
            <span className={s.bar}>
              <span className={s.rec}>
                <i /> REC
              </span>
              <span>{title}</span>
            </span>
            <span className={s.ring}>
              <svg viewBox="0 0 200 200" aria-hidden>
                <defs>
                  <path id={ringId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <text>
                  <textPath href={`#${ringId}`}>{ringText}</textPath>
                </text>
              </svg>
              <span className={s.playBtn}>
                <Play size={26} fill="currentColor" />
              </span>
            </span>
          </m.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Player({ src, poster, title, meta }: { src: string; poster: string; title: string; meta?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const timeEl = useRef<HTMLSpanElement>(null)
  const idleTimer = useRef<number | undefined>(undefined)

  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [waiting, setWaiting] = useState(true)
  const [ended, setEnded] = useState(false)
  const [idle, setIdle] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null)
  const [flash, setFlash] = useState<{ id: number; icon: 'play' | 'pause' } | null>(null)

  const progress = useMotionValue(0)
  const buffered = useMotionValue(0)
  const headLeft = useTransform(progress, (v) => `${v * 100}%`)

  // Smooth progress + timecode while playing (timeupdate alone is only ~4 Hz)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const v = video.current
      if (v && v.duration) {
        progress.set(v.currentTime / v.duration)
        if (timeEl.current) timeEl.current.textContent = tc(v.currentTime)
        if (v.buffered.length) buffered.set(v.buffered.end(v.buffered.length - 1) / v.duration)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress, buffered])

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrap.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Auto-hide the chrome while playing
  const wake = useCallback(() => {
    setIdle(false)
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600)
  }, [])
  useEffect(() => () => window.clearTimeout(idleTimer.current), [])
  const chromeHidden = idle && playing && !scrubbing

  const toggle = useCallback(() => {
    const v = video.current
    if (!v) return
    if (v.paused || v.ended) {
      void v.play()
      setFlash({ id: Date.now(), icon: 'play' })
    } else {
      v.pause()
      setFlash({ id: Date.now(), icon: 'pause' })
    }
  }, [])

  const seekBy = (d: number) => {
    const v = video.current
    if (v) v.currentTime = Math.min(Math.max(0, v.currentTime + d), v.duration || 0)
  }

  const toggleMute = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    if (!v.muted && v.volume === 0) v.volume = 0.6
  }

  const toggleFullscreen = () => {
    const el = wrap.current
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else if (el.requestFullscreen) void el.requestFullscreen()
    else v?.webkitEnterFullscreen?.() // iOS Safari
  }

  const ratioAt = (clientX: number) => {
    const r = track.current?.getBoundingClientRect()
    if (!r) return 0
    return Math.min(Math.max((clientX - r.left) / r.width, 0), 1)
  }

  const onTrackDown = (e: RPointerEvent<HTMLDivElement>) => {
    const v = video.current
    if (!v || !v.duration) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setScrubbing(true)
    v.currentTime = ratioAt(e.clientX) * v.duration
    progress.set(ratioAt(e.clientX))
  }
  const onTrackMove = (e: RPointerEvent<HTMLDivElement>) => {
    const v = video.current
    const r = ratioAt(e.clientX)
    const rect = track.current?.getBoundingClientRect()
    if (rect) setHover({ x: r * rect.width, t: r * (v?.duration || 0) })
    if (scrubbing && v && v.duration) {
      v.currentTime = r * v.duration
      progress.set(r)
    }
  }
  const onTrackUp = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setScrubbing(false)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key.toLowerCase()
    const handled = [' ', 'k', 'arrowleft', 'arrowright', 'j', 'l', 'm', 'f'].includes(key)
    if (!handled) return
    e.preventDefault()
    wake()
    if (key === ' ' || key === 'k') toggle()
    if (key === 'arrowleft' || key === 'j') seekBy(-5)
    if (key === 'arrowright' || key === 'l') seekBy(5)
    if (key === 'm') toggleMute()
    if (key === 'f') toggleFullscreen()
  }

  return (
    <div
      ref={wrap}
      className={cx(s.ui, chromeHidden && s.hidden, fullscreen && s.fs)}
      onPointerMove={wake}
      onPointerLeave={() => playing && setIdle(true)}
      onKeyDown={onKey}
      tabIndex={0}
      role="region"
      aria-label={`Přehrávač: ${title}`}
    >
      <video
        ref={video}
        className={s.video}
        src={src}
        poster={poster}
        autoPlay
        playsInline
        preload="auto"
        onClick={toggle}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
          wake()
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setEnded(true)
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setMuted(e.currentTarget.muted)
          setVolume(e.currentTarget.volume)
        }}
        data-cursor={playing ? 'Pauza' : 'Přehrát'}
      />

      {/* center states */}
      <AnimatePresence>
        {flash && (
          <m.span
            key={flash.id}
            className={s.flash}
            initial={{ opacity: 0.9, scale: 0.7 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            onAnimationComplete={() => setFlash(null)}
            aria-hidden
          >
            {flash.icon === 'play' ? <Play size={30} fill="currentColor" /> : <Pause size={30} fill="currentColor" />}
          </m.span>
        )}
      </AnimatePresence>
      {waiting && !ended && <span className={s.spinner} aria-label="Načítání" />}
      {ended && (
        <button type="button" className={s.replay} onClick={toggle}>
          <RotateCcw size={22} /> Přehrát znovu
        </button>
      )}

      {/* top bar */}
      <div className={s.top}>
        <span className={s.rec}>
          <i data-on={playing || undefined} /> {playing ? 'PLAY' : 'PAUSE'}
        </span>
        <span>{title}</span>
        {meta && <span className={s.meta}>{meta}</span>}
      </div>

      {/* control bar */}
      <div className={s.controls}>
        <div
          ref={track}
          className={s.track}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onPointerLeave={() => !scrubbing && setHover(null)}
          role="slider"
          tabIndex={0}
          aria-label="Pozice videa"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round((video.current?.currentTime ?? 0))}
          aria-valuetext={tc(video.current?.currentTime ?? 0)}
        >
          <div className={s.rail}>
            <m.i className={s.buffered} style={{ scaleX: buffered }} />
            <m.i className={s.fill} style={{ scaleX: progress }} />
          </div>
          <m.i className={s.head} style={{ left: headLeft }} />
          {hover && (
            <span className={s.tip} style={{ left: hover.x }}>
              {tc(hover.t)}
            </span>
          )}
        </div>

        <div className={s.row}>
          <button type="button" className={s.btn} onClick={toggle} aria-label={playing ? 'Pauza' : 'Přehrát'}>
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          <div className={s.volume}>
            <button type="button" className={s.btn} onClick={toggleMute} aria-label={muted ? 'Zapnout zvuk' : 'Ztlumit'}>
              {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = video.current
                if (!v) return
                v.volume = Number(e.target.value)
                v.muted = v.volume === 0
              }}
              aria-label="Hlasitost"
              style={{ ['--vol' as string]: `${(muted ? 0 : volume) * 100}%` }}
            />
          </div>

          <span className={s.time}>
            <span ref={timeEl}>00:00:00</span>
            <i>/</i>
            {tc(duration)}
          </span>

          <span className={s.spacer} />
          <span className={s.badge}>25 FPS</span>

          <button type="button" className={s.btn} onClick={toggleFullscreen} aria-label={fullscreen ? 'Ukončit celou obrazovku' : 'Celá obrazovka'}>
            {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
