/** Original, quiet pentatonic ambience. Begins only after a user gesture. */
export function createAmbience() {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.connect(master);
  const delay = context.createDelay(2);
  delay.delayTime.value = 0.68;
  const feedback = context.createGain();
  feedback.gain.value = 0.25;
  const wet = context.createGain();
  wet.gain.value = 0.2;
  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(master);
  const melody = [0, 7, 12, 16, 14, 7, 4, 9, 12, 7, 4, 2, 0, 7, 9, 4];
  const bass = [0, -3, -5, -7];
  let step = 0,
    nextTime = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  let playing = false;
  let disposed = false;
  const oscillators = new Set<OscillatorNode>();
  function note(
    semitone: number,
    when: number,
    duration: number,
    gain: number,
  ) {
    const oscillator = context.createOscillator(),
      envelope = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 261.6256 * 2 ** (semitone / 12);
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(gain, when + 0.08);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(envelope);
    envelope.connect(filter);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.05);
    oscillators.add(oscillator);
    oscillator.onended = () => {
      oscillators.delete(oscillator);
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
  function schedule() {
    if (context.state !== 'running') return;
    while (nextTime < context.currentTime + 0.4) {
      note(melody[step % melody.length], nextTime, 2.8, 0.12);
      if (step % 8 === 0) {
        const root = bass[Math.floor(step / 8) % bass.length];
        note(root - 12, nextTime, 6.5, 0.16);
        note(root - 5, nextTime + 0.12, 6.2, 0.055);
      }
      step++;
      nextTime += 0.82;
    }
  }
  const visibility = () => {
    if (document.hidden) {
      void context.suspend();
    } else if (playing) {
      nextTime = context.currentTime + 0.1;
      void context.resume();
    }
  };
  document.addEventListener('visibilitychange', visibility);
  return {
    async setPlaying(value: boolean) {
      if (disposed) return;
      playing = value;
      if (value) {
        await context.resume();
        if (disposed) return;
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setTargetAtTime(0.32, context.currentTime, 0.45);
        if (!timer) {
          nextTime = context.currentTime + 0.1;
          schedule();
          timer = setInterval(schedule, 200);
        }
      } else {
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setTargetAtTime(0, context.currentTime, 0.15);
        if (timer) clearInterval(timer);
        timer = undefined;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      playing = false;
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', visibility);
      for (const oscillator of oscillators) {
        try {
          oscillator.stop();
        } catch {}
      }
      if (context.state !== 'closed') void context.close().catch(() => {});
    },
  };
}
