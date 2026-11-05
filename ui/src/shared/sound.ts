export function playConnectionChime(enabled: boolean): void {
  if (!enabled || typeof window === "undefined") {
    return;
  }
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) {
    return;
  }

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.14);
    osc2.frequency.setValueAtTime(783.99, now + 0.05);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.29);
    osc2.stop(now + 0.29);

    window.setTimeout(() => {
      void ctx.close();
    }, 350);
  } catch {
    return;
  }
}
