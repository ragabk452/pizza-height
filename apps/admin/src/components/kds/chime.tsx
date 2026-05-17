'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const STORAGE_KEY = 'pizza-height-kds-chime-muted';

// useSyncExternalStore plumbing — subscribes to localStorage so the mute
// state syncs across tabs and avoids the setState-in-effect lint rule
// (which would otherwise fire for the typical mount-time hydrate pattern).
function readMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function subscribeMuted(notify: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) notify();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

function useMutedPref() {
  return useSyncExternalStore(
    subscribeMuted,
    readMuted,
    // Server snapshot: chime starts un-muted; the real preference loads on
    // the client without a hydration warning because the value is read via
    // the store, not from initial render-time state.
    () => false,
  );
}

/**
 * Returns a `play` function that emits a brief two-tone chime via the Web
 * Audio API — no audio file to ship, no autoplay-policy gotchas after the
 * first user interaction (the toggle button counts).
 */
function useChime(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  function play() {
    if (muted) return;
    if (typeof window === 'undefined') return;
    try {
      if (!ctxRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      // Chrome/Edge start the AudioContext in `suspended` state until a
      // user gesture. Without resume(), the first chime is silent even
      // though scheduling succeeds. Once unlocked by the first gesture
      // (toggle, fullscreen click, etc.) every later chime is audible.
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const now = ctx.currentTime;
      // Two short sine tones a fifth apart — pleasant, not alarming.
      [880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = now + i * 0.18;
        const end = start + 0.18;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.start(start);
        osc.stop(end + 0.02);
      });
    } catch {
      // Audio context blocked or browser doesn't support it — silent fail.
    }
  }

  return play;
}

interface ChimeProps {
  /** External trigger — incremented by the parent on every new order. */
  trigger: number;
}

/** Audio chime + mute toggle for the KDS. State persists in localStorage. */
export function Chime({ trigger }: ChimeProps) {
  const muted = useMutedPref();
  const play = useChime(muted);

  // Fire the chime whenever `trigger` increments — but skip the initial
  // mount so just loading the page doesn't beep.
  const lastTrigger = useRef(trigger);
  useEffect(() => {
    if (trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;
    play();
  }, [trigger, play]);

  function toggle() {
    const next = !muted;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      // useSyncExternalStore only re-runs subscribe callbacks for `storage`
      // events from OTHER tabs, so dispatch one manually for this tab.
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: next ? '1' : '0' }),
      );
    } catch {
      // ignore
    }
    // Confirm un-mute with a chime (this also primes the AudioContext).
    if (!next) setTimeout(play, 50);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? 'Unmute new-order chime' : 'Mute new-order chime'}
      className="text-muted hover:text-primary border-border hover:border-primary/40 inline-flex size-10 items-center justify-center rounded-xl border transition-colors"
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}
