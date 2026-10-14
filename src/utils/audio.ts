/**
 * Web Audio API synthesizer for calm focus chimes (no external audio files required)
 */
export function playChime(type: 'focus_start' | 'focus_complete' | 'break_complete' = 'focus_complete'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (type === 'focus_complete') {
      // 3-tone peaceful meditation chime (E5 -> G#5 -> B5)
      const freqs = [659.25, 830.61, 987.77];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.25);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.25);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.25 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.25 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.25);
        osc.stop(ctx.currentTime + idx * 0.25 + 1.9);
      });
    } else if (type === 'focus_start') {
      // Gentle ascending prompt
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } else {
      // Break complete: soft double ding
      const freqs = [523.25, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.2);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.2);
        gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + idx * 0.2 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.2 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.2);
        osc.stop(ctx.currentTime + idx * 0.2 + 1.3);
      });
    }
  } catch (e) {
    console.warn('Audio chime playback omitted or blocked by autoplay policy:', e);
  }
}
