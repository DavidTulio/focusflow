/* ============================================================
   SOUND.JS — Session Completion Sound
   FocusFlow Pomodoro Timer

   Uses the Web Audio API to generate a gentle 3-tone chime
   when a session ends. No external audio files needed — the
   sound is generated entirely in the browser.

   TO CUSTOMIZE THE SOUND:
   - Change the frequencies array for different notes
     (e.g. [440, 550, 660] for a different chord)
   - Change osc.type for a different waveform:
     'sine' (soft), 'triangle' (slightly brighter),
     'square' (buzzy), 'sawtooth' (harsh)
   - Adjust the gain value (0.18) for volume (0 to 1)
   - Adjust timing (i * 0.18) for faster/slower chime
   ============================================================ */

'use strict';

/**
 * Play a short 3-note chime using the Web Audio API.
 * Called by timer.js when a session reaches zero.
 * Fails silently if the browser doesn't support Web Audio.
 */
function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Three ascending notes (C5, E5, G5 — a C major chord)
    const frequencies = [523.25, 659.25, 783.99];

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode   = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type            = 'sine';

      // Stagger the notes so they play one after another
      const startTime = ctx.currentTime + i * 0.18;

      // Fade in quickly, then fade out smoothly
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0,    startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.45);
    });

  } catch (e) {
    // Web Audio not available (old browser or blocked) — ignore
  }
}
