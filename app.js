// app.js - Main application manager and orchestration

class AppManager {
  constructor() {
    this.currentMode = "practice"; // "practice", "autoplay", "freeplay"
    this.activeSong = null;
    this.playhead = 0;
    this.isPlaying = false;
    this.autoplayTimeout = null;
    this.audioStarted = false;
  }

  init() {
    // 1. Initialize Keyboard rendering
    window.keyboardManager.init(
      "piano-keyboard-render",
      this.handleKeyPress.bind(this),
      this.handleKeyRelease.bind(this)
    );

    // 2. Initialize Score Renderer
    window.scoreRenderer.init("sheet-music-render");

    // 3. Load Songs into Selector
    this.loadSongsSelector();

    // 4. Bind UI Event Listeners
    this.bindEvents();

    // 5. Load default song
    this.loadSongById(SONGS[0].id);

    console.log("PianoKeyboard application initialized");
  }

  loadSongsSelector() {
    const selector = document.getElementById("song-select");
    if (!selector) return;

    selector.innerHTML = "";
    SONGS.forEach(song => {
      const opt = document.createElement("option");
      opt.value = song.id;
      opt.textContent = song.title;
      selector.appendChild(opt);
    });
  }

  bindEvents() {
    // Audio Context Starter Button
    const startAudioBtn = document.getElementById("start-audio-btn");
    if (startAudioBtn) {
      startAudioBtn.addEventListener("click", () => this.startAudio());
    }

    // Song Selection Change
    const songSelect = document.getElementById("song-select");
    if (songSelect) {
      songSelect.addEventListener("change", (e) => {
        this.loadSongById(e.target.value);
      });
    }

    // Restart Song Button
    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        this.restartSong();
      });
    }

    // Mode Selection Click
    const modeButtons = document.querySelectorAll(".mode-btn");
    modeButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const mode = btn.closest(".mode-btn").dataset.mode;
        this.changeMode(mode);
        
        modeButtons.forEach(b => b.classList.remove("active"));
        btn.closest(".mode-btn").classList.add("active");
      });
    });

    // Keyboard Layout Switcher
    const layoutOptions = document.querySelectorAll(".toggle-option");
    layoutOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        const layout = opt.dataset.layout;
        window.keyboardManager.setLayout(layout);
        
        // Re-render sheet music to update notehead labels!
        if (this.activeSong) {
          window.scoreRenderer.renderSong(this.activeSong);
          this.updateHighlightState();
        }

        layoutOptions.forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
      });
    });

    // Sound Selector
    const soundSelect = document.getElementById("sound-select");
    if (soundSelect) {
      soundSelect.addEventListener("change", (e) => {
        if (this.audioStarted) {
          window.audioEngine.createSynth(e.target.value);
        }
      });
    }

    // Custom MIDI file upload
    const midiUpload = document.getElementById("midi-upload");
    const dropZone = document.getElementById("drop-zone");

    if (midiUpload && dropZone) {
      dropZone.addEventListener("click", () => midiUpload.click());

      // Drag and drop events
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "var(--accent-color)";
      });

      dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "var(--panel-border)";
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "var(--panel-border)";
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.handleMidiFile(files[0]);
        }
      });

      midiUpload.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          this.handleMidiFile(files[0]);
        }
      });
    }
  }

  async startAudio() {
    if (this.audioStarted) return;

    const startAudioBtn = document.getElementById("start-audio-btn");
    const statusIndicator = document.getElementById("status-indicator");

    try {
      startAudioBtn.textContent = "⏳ 초기화 중...";
      await window.audioEngine.init();
      
      // Sync initial sound choice
      const soundType = document.getElementById("sound-select").value;
      window.audioEngine.createSynth(soundType);

      this.audioStarted = true;
      startAudioBtn.textContent = "✅ 오디오 연결됨";
      startAudioBtn.classList.remove("btn-primary");
      startAudioBtn.classList.add("btn-danger");
      startAudioBtn.style.opacity = "0.7";

      statusIndicator.textContent = "연주 가능";
      statusIndicator.className = "status-badge ready";
    } catch (e) {
      console.error(e);
      startAudioBtn.textContent = "❌ 오류 발생";
      statusIndicator.textContent = "오류 발생";
      statusIndicator.className = "status-badge error";
    }
  }

  loadSongById(songId) {
    this.stopAutoplay();
    
    const song = SONGS.find(s => s.id === songId);
    if (song) {
      this.activeSong = song;
      this.playhead = 0;
      window.scoreRenderer.renderSong(song);
      this.skipRestsAndForward();
      this.updateHighlightState();
    }
  }

  changeMode(mode) {
    this.stopAutoplay();
    this.currentMode = mode;
    this.playhead = 0;

    if (mode === "freeplay") {
      // Clear highlights in free play
      window.scoreRenderer.highlightNote(-1);
      window.keyboardManager.highlightTargetKey(null, false);
    } else {
      // Reset playhead and highlight for practice/autoplay
      this.skipRestsAndForward();
      this.updateHighlightState();
      
      if (mode === "autoplay") {
        this.startAutoplay();
      }
    }
  }

  /**
   * Safe forward playhead over rest notes (VexFlow rest note elements do not need keys)
   */
  skipRestsAndForward() {
    if (!this.activeSong) return;
    
    const totalNotes = window.scoreRenderer.getSongLength();
    while (this.playhead < totalNotes) {
      const noteInfo = window.scoreRenderer.getNoteInfo(this.playhead);
      if (noteInfo && noteInfo.isRest) {
        this.playhead++;
      } else {
        break; // Stop at first playing note
      }
    }
  }

  updateHighlightState() {
    if (this.currentMode === "freeplay" || !this.activeSong) return;

    const totalNotes = window.scoreRenderer.getSongLength();
    if (this.playhead >= totalNotes) {
      // Song finished!
      window.scoreRenderer.highlightNote(-1);
      window.keyboardManager.highlightTargetKey(null, false);
      
      if (this.currentMode === "autoplay") {
        this.stopAutoplay();
      }
      
      // Delay alert slightly to let rendering catch up
      setTimeout(() => {
        alert("🎉 완곡을 축하합니다! 참 잘하셨어요.");
        this.resetSong();
      }, 300);
      return;
    }

    // Highlight current note on sheet music
    window.scoreRenderer.highlightNote(this.playhead);

    // Highlight corresponding target key on virtual piano
    const noteInfo = window.scoreRenderer.getNoteInfo(this.playhead);
    if (noteInfo && noteInfo.pitchNames.length > 0) {
      window.keyboardManager.highlightTargetKey(null, false); // Clear others
      noteInfo.pitchNames.forEach(pitch => {
        window.keyboardManager.highlightTargetKey(pitch, true);
      });
    }
  }

  resetSong() {
    this.playhead = 0;
    this.skipRestsAndForward();
    this.updateHighlightState();
  }

  restartSong() {
    const wasPlaying = this.isPlaying;
    this.stopAutoplay();
    this.playhead = 0;
    this.skipRestsAndForward();
    this.updateHighlightState();
    
    if (this.currentMode === "autoplay" && wasPlaying) {
      this.startAutoplay();
    }
  }

  /**
   * Handle piano key strike (physical keyboard or virtual piano press)
   */
  handleKeyPress(pitch) {
    // 1. Play Note Sound
    if (this.audioStarted) {
      window.audioEngine.triggerAttack(pitch);
    } else {
      // Auto start audio context on first click/keypress
      this.startAudio().then(() => {
        window.audioEngine.triggerAttack(pitch);
      });
    }

    // 2. Practice Mode progression matching
    if (this.currentMode === "practice" && this.activeSong) {
      const noteInfo = window.scoreRenderer.getNoteInfo(this.playhead);
      if (noteInfo && noteInfo.pitchNames.length > 0) {
        // Chord matching: check if the hit pitch is part of the chord
        const isMatch = noteInfo.pitchNames.some(p => p.toUpperCase() === pitch.toUpperCase());

        if (isMatch) {
          // If playing chord, we advance if the user hits any of the notes
          // (Can be hardened to require all notes in chord to be played simultaneously, 
          // but single key progress is much better for typing piano!).
          this.playhead++;
          this.skipRestsAndForward();
          this.updateHighlightState();
        } else {
          // Visual red shake or indicator
          window.scoreRenderer.markNoteError(this.playhead);
        }
      }
    }
  }

  handleKeyRelease(pitch) {
    if (this.audioStarted) {
      window.audioEngine.triggerRelease(pitch);
    }
  }

  /**
   * Autoplay Loop
   */
  startAutoplay() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playhead = 0;
    this.skipRestsAndForward();
    this.updateHighlightState();
    this.autoplayNextStep();
  }

  stopAutoplay() {
    this.isPlaying = false;
    if (this.autoplayTimeout) {
      clearTimeout(this.autoplayTimeout);
      this.autoplayTimeout = null;
    }
    if (this.audioStarted) {
      window.audioEngine.stopAll();
    }
  }

  autoplayNextStep() {
    if (!this.isPlaying || !this.activeSong) return;

    const totalNotes = window.scoreRenderer.getSongLength();
    if (this.playhead >= totalNotes) {
      this.updateHighlightState(); // Will trigger song completion
      return;
    }

    const noteInfo = window.scoreRenderer.getNoteInfo(this.playhead);
    if (!noteInfo) return;

    const bpm = this.activeSong.bpm;
    const quarterNoteDuration = 60 / bpm; // In seconds
    
    const durationMap = { "w": 4, "h": 2, "q": 1, "8": 0.5, "16": 0.25 };
    const multiplier = durationMap[noteInfo.duration] || 1;
    const noteDurationSec = multiplier * quarterNoteDuration;

    if (!noteInfo.isRest && this.audioStarted) {
      // Play notes (can trigger multiple for chords)
      noteInfo.pitchNames.forEach(pitch => {
        window.audioEngine.playNote(pitch, `${multiplier * 1000}ms`);
        
        // Show visual state on keyboard
        window.keyboardManager.setVisualKeyState(pitch, true);
        setTimeout(() => {
          window.keyboardManager.setVisualKeyState(pitch, false);
        }, noteDurationSec * 1000 - 50);
      });
    }

    // Schedule next playhead advance
    this.autoplayTimeout = setTimeout(() => {
      this.playhead++;
      this.skipRestsAndForward();
      this.updateHighlightState();
      this.autoplayNextStep();
    }, noteDurationSec * 1000);
  }

  /**
   * Process custom MIDI file upload
   */
  async handleMidiFile(file) {
    const statusIndicator = document.getElementById("status-indicator");
    statusIndicator.textContent = "파싱 중...";
    statusIndicator.className = "status-badge loading";

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Use global Midi parser from @tonejs/midi
          const parsedMidi = new Midi(arrayBuffer);
          
          // Transcribe using our midi_parser.js
          const transcribedSong = window.midiParser.transcribeMidi(parsedMidi);

          // Add to SONGS list (remove previous custom upload if exists)
          const customIdx = SONGS.findIndex(s => s.id.startsWith("custom_midi_"));
          if (customIdx >= 0) {
            SONGS.splice(customIdx, 1);
          }
          SONGS.push(transcribedSong);

          // Re-load select options
          this.loadSongsSelector();

          // Select the new uploaded song
          const songSelect = document.getElementById("song-select");
          songSelect.value = transcribedSong.id;
          this.loadSongById(transcribedSong.id);

          statusIndicator.textContent = "로딩 완료";
          statusIndicator.className = "status-badge ready";
        } catch (err) {
          console.error(err);
          alert("MIDI 파일 파싱 또는 오선지 악보 변환에 실패했습니다. 단순한 단선율 멜로디 파일을 업로드해 보세요.");
          statusIndicator.textContent = "오류 발생";
          statusIndicator.className = "status-badge error";
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (e) {
      console.error(e);
      statusIndicator.textContent = "오류 발생";
      statusIndicator.className = "status-badge error";
    }
  }
}

// Instantiate and start on load
window.addEventListener("DOMContentLoaded", () => {
  window.appManager = new AppManager();
  window.appManager.init();
});
