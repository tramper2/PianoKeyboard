// audio.js - Audio synthesis using Tone.js

class AudioEngine {
  constructor() {
    this.synth = null;
    this.soundType = "piano";
    this.activeNotes = new Map();
    this.isReady = false;
  }

  async init() {
    if (this.isReady) return;

    // Start Tone.js audio context
    await Tone.start();
    console.log("Tone.js audio context started");
    
    this.createSynth("piano");
    this.isReady = true;
  }

  createSynth(type) {
    if (this.synth) {
      this.synth.dispose();
    }

    this.soundType = type;

    if (type === "piano") {
      // Custom synth mapping to replicate a piano decay
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle" // Mellow, warm wave
        },
        envelope: {
          attack: 0.005,  // Immediate strike
          decay: 1.2,     // Natural piano-like decay
          sustain: 0.1,   // Low sustain level
          release: 0.8    // Moderate release trail
        }
      }).toDestination();
    } else if (type === "organ") {
      // Organ sound with drawbar-like harmonics (additive sine waves)
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.08,
          decay: 0.1,
          sustain: 1.0,  // Organs do not decay while key is held
          release: 0.1
        }
      }).toDestination();
    } else if (type === "synth") {
      // Modern FM Synth sound
      this.synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2,
        modulationIndex: 3,
        oscillator: {
          type: "sawtooth"
        },
        envelope: {
          attack: 0.01,
          decay: 0.4,
          sustain: 0.2,
          release: 0.4
        },
        modulation: {
          type: "sine"
        },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.1,
          release: 0.2
        }
      }).toDestination();
    } else {
      // Basic sine wave
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5
        }
      }).toDestination();
    }

    // Set maximum polyphony to prevent clipping
    this.synth.maxPolyphony = 12;
    // Lower volume slightly to avoid clipping when playing chords
    this.synth.volume.value = -6;
  }

  /**
   * Play a note
   * @param {string} noteName - Note pitch, e.g. "C4", "D#5"
   * @param {string|number} duration - Time duration (e.g. "4n", "8n", or duration in seconds)
   */
  triggerAttack(noteName, time = Tone.now()) {
    if (!this.isReady) return;
    
    // Stop note if it's already playing to prevent duplicates
    this.triggerRelease(noteName);

    try {
      this.synth.triggerAttack(noteName, time);
      this.activeNotes.set(noteName, true);
    } catch (e) {
      console.warn(`Failed to play note: ${noteName}`, e);
    }
  }

  triggerRelease(noteName, time = Tone.now()) {
    if (!this.isReady) return;
    
    try {
      if (this.activeNotes.has(noteName)) {
        this.synth.triggerRelease(noteName, time);
        this.activeNotes.delete(noteName);
      }
    } catch (e) {
      console.warn(`Failed to release note: ${noteName}`, e);
    }
  }

  /**
   * Triggers note attack and release automatically
   */
  playNote(noteName, duration, time = Tone.now()) {
    if (!this.isReady) return;
    try {
      this.synth.triggerAttackRelease(noteName, duration, time);
    } catch (e) {
      console.warn(`Failed to play auto note: ${noteName}`, e);
    }
  }

  stopAll() {
    if (!this.isReady) return;
    try {
      this.synth.releaseAll();
      this.activeNotes.clear();
    } catch (e) {
      console.warn("Failed to stop all notes", e);
    }
  }
}

// Export global instance
window.audioEngine = new AudioEngine();
