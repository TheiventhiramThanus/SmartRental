// Simple digital car horn sound synthesizer using Web Audio API
export function playCarHorn() {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();

  const playBeep = (startTime: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Friendly car horn tone (around 800Hz is standard for car horns, often dual tone, but we'll stick to one clean tone or a mix)
    // A mix of two tones sounds more realistic: e.g. 400Hz and 500Hz
    // But request said "clean digital car horn tone", "peep peep".
    // A sine wave at ~880Hz (A5) or ~1000Hz makes a "peep".
    
    osc.type = 'triangle'; // Triangle has a bit more character than sine, good for "digital" beep
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3); // Decay

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  };

  // Play two beeps: "Peep Peep"
  const now = ctx.currentTime;
  playBeep(now);
  playBeep(now + 0.25); // Small gap
}
