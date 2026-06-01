// keyboard.js - Keyboard mapping and virtual keyboard rendering

const KEY_MAP = {
  // Octave 3 (G3 - B3)
  "KeyQ": { pitch: "G3", ko: "ㅂ", koShift: "ㅃ", en: "q", enShift: "Q", type: "white", midi: 55 },
  "Shift+KeyQ": { pitch: "G#3", ko: "ㅃ", koShift: "ㅃ", en: "Q", enShift: "Q", type: "black", midi: 56 },
  "KeyW": { pitch: "A3", ko: "ㅈ", koShift: "ㅉ", en: "w", enShift: "W", type: "white", midi: 57 },
  "Shift+KeyW": { pitch: "A#3", ko: "ㅉ", koShift: "ㅉ", en: "W", enShift: "W", type: "black", midi: 58 },
  "KeyE": { pitch: "B3", ko: "ㄷ", koShift: "ㄸ", en: "e", enShift: "E", type: "white", midi: 59 },

  // Octave 4 (C4 - B4)
  "KeyR": { pitch: "C4", ko: "ㄱ", koShift: "ㄲ", en: "r", enShift: "R", type: "white", midi: 60 },
  "Shift+KeyR": { pitch: "C#4", ko: "ㄲ", koShift: "ㄲ", en: "R", enShift: "R", type: "black", midi: 61 },
  "KeyT": { pitch: "D4", ko: "ㅅ", koShift: "ㅆ", en: "t", enShift: "T", type: "white", midi: 62 },
  "Shift+KeyT": { pitch: "D#4", ko: "ㅆ", koShift: "ㅆ", en: "T", enShift: "T", type: "black", midi: 63 },
  "KeyY": { pitch: "E4", ko: "ㅛ", koShift: "ㅛ", en: "y", enShift: "Y", type: "white", midi: 64 },
  "KeyU": { pitch: "F4", ko: "ㅕ", koShift: "ㅕ*", en: "u", enShift: "U", type: "white", midi: 65 },
  "Shift+KeyU": { pitch: "F#4", ko: "ㅕ*", koShift: "ㅕ*", en: "U", enShift: "U", type: "black", midi: 66 },
  "KeyI": { pitch: "G4", ko: "ㅑ", koShift: "ㅑ*", en: "i", enShift: "I", type: "white", midi: 67 },
  "Shift+KeyI": { pitch: "G#4", ko: "ㅑ*", koShift: "ㅑ*", en: "I", enShift: "I", type: "black", midi: 68 },
  "KeyO": { pitch: "A4", ko: "ㅐ", koShift: "ㅒ", en: "o", enShift: "O", type: "white", midi: 69 },
  "Shift+KeyO": { pitch: "A#4", ko: "ㅒ", koShift: "ㅒ", en: "O", enShift: "O", type: "black", midi: 70 },
  "KeyP": { pitch: "B4", ko: "ㅔ", koShift: "ㅖ", en: "p", enShift: "P", type: "white", midi: 71 },

  // Octave 5 (C5 - A#5)
  "Digit7": { pitch: "C5", ko: "7", koShift: "&", en: "7", enShift: "&", type: "white", midi: 72 },
  "Shift+Digit7": { pitch: "C#5", ko: "&", koShift: "&", en: "&", enShift: "&", type: "black", midi: 73 },
  "Digit8": { pitch: "D5", ko: "8", koShift: "*", en: "8", enShift: "*", type: "white", midi: 74 },
  "Shift+Digit8": { pitch: "D#5", ko: "*", koShift: "*", en: "*", enShift: "*", type: "black", midi: 75 },
  "Digit9": { pitch: "E5", ko: "9", koShift: "(", en: "9", enShift: "(", type: "white", midi: 76 },
  "Digit0": { pitch: "F5", ko: "0", koShift: ")", en: "0", enShift: ")", type: "white", midi: 77 },
  "Shift+Digit0": { pitch: "F#5", ko: ")", koShift: ")", en: ")", enShift: ")", type: "black", midi: 78 },
  "Minus": { pitch: "G5", ko: "-", koShift: "_", en: "-", enShift: "_", type: "white", midi: 79 },
  "Shift+Minus": { pitch: "G#5", ko: "_", koShift: "_", en: "_", enShift: "_", type: "black", midi: 80 },
  "Equal": { pitch: "A5", ko: "=", koShift: "+", en: "=", enShift: "+", type: "white", midi: 81 },
  "Shift+Equal": { pitch: "A#5", ko: "+", koShift: "+", en: "+", enShift: "+", type: "black", midi: 82 }
};

// Pitch-to-key translation map for sheet music notehead rendering
const PITCH_TO_KEY = {};
Object.entries(KEY_MAP).forEach(([code, data]) => {
  PITCH_TO_KEY[data.pitch] = {
    code: code.replace("Shift+", ""),
    shift: code.includes("Shift+"),
    ko: data.ko,
    en: data.en
  };
});

class KeyboardManager {
  constructor() {
    this.layout = "ko"; // "ko" (Korean) or "en" (English QWERTY)
    this.onKeyPressCallback = null;
    this.onKeyReleaseCallback = null;
    this.activeCodes = new Set();
  }

  setLayout(layout) {
    this.layout = layout;
    this.updateLabels();
  }

  getNoteChar(pitch) {
    const data = PITCH_TO_KEY[pitch.toUpperCase().replace("#", "#")];
    if (!data) return "";
    return this.layout === "ko" ? data.ko : data.en;
  }

  getPitchByCode(code, shiftKey) {
    const lookupKey = shiftKey ? `Shift+${code}` : code;
    const match = KEY_MAP[lookupKey];
    if (match) return match.pitch;
    
    // Fallback if shift key is pressed but no shift entry exists
    if (shiftKey) {
      const normalMatch = KEY_MAP[code];
      if (normalMatch) return normalMatch.pitch;
    }
    return null;
  }

  init(pianoContainerId, onKeyPress, onKeyRelease) {
    this.onKeyPressCallback = onKeyPress;
    this.onKeyReleaseCallback = onKeyRelease;
    this.renderPiano(pianoContainerId);
    this.bindEvents();
  }

  renderPiano(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    const piano = document.createElement("div");
    piano.className = "piano";
    
    // We sort the notes in MIDI note order so they render from left to right
    const sortedKeys = Object.values(KEY_MAP)
      // Filter out duplicate pitch shifts
      .filter((v, i, self) => self.findIndex(t => t.pitch === v.pitch) === i)
      .sort((a, b) => a.midi - b.midi);

    sortedKeys.forEach(keyData => {
      const keyEl = document.createElement("div");
      keyEl.className = `piano-key ${keyData.type}`;
      keyEl.dataset.pitch = keyData.pitch;
      keyEl.dataset.midi = keyData.midi;

      // Add visual labels
      const label = document.createElement("span");
      label.className = "key-label";
      keyEl.appendChild(label);

      // Mouse and Touch events
      const triggerPress = () => {
        keyEl.classList.add("active");
        if (this.onKeyPressCallback) this.onKeyPressCallback(keyData.pitch);
      };
      
      const triggerRelease = () => {
        keyEl.classList.remove("active");
        if (this.onKeyReleaseCallback) this.onKeyReleaseCallback(keyData.pitch);
      };

      keyEl.addEventListener("mousedown", (e) => {
        e.preventDefault();
        triggerPress();
      });
      
      window.addEventListener("mouseup", () => {
        if (keyEl.classList.contains("active")) {
          triggerRelease();
        }
      });

      // Touch events
      keyEl.addEventListener("touchstart", (e) => {
        e.preventDefault();
        triggerPress();
      });
      keyEl.addEventListener("touchend", (e) => {
        e.preventDefault();
        triggerRelease();
      });

      piano.appendChild(keyEl);
    });

    container.appendChild(piano);
    this.updateLabels();
  }

  updateLabels() {
    const keys = document.querySelectorAll(".piano-key");
    keys.forEach(keyEl => {
      const pitch = keyEl.dataset.pitch;
      // Find matching key mapping
      const keyDataEntry = Object.entries(KEY_MAP).find(([code, data]) => data.pitch === pitch);
      if (!keyDataEntry) return;

      const [code, data] = keyDataEntry;
      const labelEl = keyEl.querySelector(".key-label");
      
      if (this.layout === "ko") {
        labelEl.innerHTML = `${data.ko}<br><span class="key-secondary-label">${pitch}</span>`;
      } else {
        labelEl.innerHTML = `${data.en}<br><span class="key-secondary-label">${pitch}</span>`;
      }
    });
  }

  bindEvents() {
    window.addEventListener("keydown", (e) => {
      // Ignore text input field typing
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Prevent default page scrolling for space/arrow keys if needed, and number keys
      if (e.code.startsWith("Digit") || e.code === "Minus" || e.code === "Equal") {
        e.preventDefault();
      }

      const code = e.code;
      if (this.activeCodes.has(code)) return; // Prevent key repeat

      const pitch = this.getPitchByCode(code, e.shiftKey);
      if (pitch) {
        this.activeCodes.add(code);
        this.setVisualKeyState(pitch, true);
        if (this.onKeyPressCallback) {
          this.onKeyPressCallback(pitch);
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      const code = e.code;
      this.activeCodes.delete(code);

      // Release note (look up with shift key first, or release both shifts and normal)
      const pitchWithShift = this.getPitchByCode(code, true);
      const pitchNormal = this.getPitchByCode(code, false);

      if (pitchWithShift) {
        this.setVisualKeyState(pitchWithShift, false);
        if (this.onKeyReleaseCallback) this.onKeyReleaseCallback(pitchWithShift);
      }
      if (pitchNormal && pitchNormal !== pitchWithShift) {
        this.setVisualKeyState(pitchNormal, false);
        if (this.onKeyReleaseCallback) this.onKeyReleaseCallback(pitchNormal);
      }
    });
  }

  setVisualKeyState(pitch, isActive) {
    const keyEl = document.querySelector(`.piano-key[data-pitch="${pitch}"]`);
    if (keyEl) {
      if (isActive) {
        keyEl.classList.add("active");
      } else {
        keyEl.classList.remove("active");
      }
    }
  }

  highlightTargetKey(pitch, isHighlight) {
    // Clear all highlights if pitch is null
    if (!pitch) {
      document.querySelectorAll(".piano-key").forEach(k => k.classList.remove("highlight-target"));
      return;
    }
    const keyEl = document.querySelector(`.piano-key[data-pitch="${pitch}"]`);
    if (keyEl) {
      if (isHighlight) {
        keyEl.classList.add("highlight-target");
      } else {
        keyEl.classList.remove("highlight-target");
      }
    }
  }
}

window.keyboardManager = new KeyboardManager();
