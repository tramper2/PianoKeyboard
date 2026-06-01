// vexflow_helper.js - VexFlow score rendering and SVG notehead overlay injection

const PITCH_COLORS = {
  "C": "hsl(0, 75%, 50%)",      // Red
  "C#": "hsl(15, 75%, 45%)",
  "D": "hsl(30, 80%, 50%)",      // Orange
  "D#": "hsl(45, 80%, 45%)",
  "E": "hsl(60, 80%, 40%)",      // Yellow-Green
  "F": "hsl(120, 65%, 40%)",     // Green
  "F#": "hsl(150, 65%, 38%)",
  "G": "hsl(180, 70%, 42%)",     // Teal
  "G#": "hsl(210, 70%, 45%)",
  "A": "hsl(240, 70%, 55%)",     // Blue
  "A#": "hsl(270, 70%, 55%)",
  "B": "hsl(300, 70%, 50%)"      // Magenta
};

function getPitchColor(pitch) {
  const noteName = pitch.replace(/\d+/, ""); // Strip octave number
  return PITCH_COLORS[noteName] || "hsl(260, 70%, 50%)";
}

class ScoreRenderer {
  constructor() {
    this.renderer = null;
    this.context = null;
    this.renderedNotes = []; // Flat list of render data for playback matching
    this.divId = "";
    this.currentSong = null;
    this.overlayGroup = null;
  }

  init(divId) {
    this.divId = divId;
  }

  clear() {
    const div = document.getElementById(this.divId);
    if (div) {
      div.innerHTML = "";
    }
    this.renderedNotes = [];
    this.renderer = null;
    this.context = null;
    this.overlayGroup = null;
  }

  /**
   * Render a song structure using VexFlow
   */
  renderSong(song) {
    this.clear();
    this.currentSong = song;

    const div = document.getElementById(this.divId);
    if (!div) return;

    const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam } = Vex.Flow;

    // Configuration
    const measuresPerSystem = 4;
    const systemWidth = 850;
    const systemHeight = 150;
    const padding = 20;

    // Calculate dimensions
    const totalMeasures = song.measures.length;
    const totalSystems = Math.ceil(totalMeasures / measuresPerSystem);
    const canvasWidth = systemWidth + padding * 2;
    const canvasHeight = totalSystems * systemHeight + padding * 2;

    // Initialize VexFlow Renderer
    this.renderer = new Renderer(div, Renderer.Backends.SVG);
    this.renderer.resize(canvasWidth, canvasHeight);
    this.context = this.renderer.getContext();
    
    // Clear backplane
    this.context.clear();

    let noteIndexCounter = 0;
    this.renderedNotes = [];

    // Render system by system
    for (let systemIdx = 0; systemIdx < totalSystems; systemIdx++) {
      const systemStartMeasure = systemIdx * measuresPerSystem;
      const systemEndMeasure = Math.min(systemStartMeasure + measuresPerSystem, totalMeasures);
      const systemMeasuresCount = systemEndMeasure - systemStartMeasure;

      const y = padding + systemIdx * systemHeight;
      const measureWidth = systemWidth / systemMeasuresCount;

      const stavesInSystem = [];
      const voicesInSystem = [];
      const notesInSystem = [];
      const beamsInSystem = [];

      for (let m = systemStartMeasure; m < systemEndMeasure; m++) {
        const x = padding + (m - systemStartMeasure) * measureWidth;
        const stave = new Stave(x, y, measureWidth);

        // First stave in the system gets Clef and Time Signature
        if (m === 0) {
          stave.addClef("treble").addTimeSignature(song.timeSignature);
        } else if (m === systemStartMeasure) {
          // First stave of subsequent lines gets a clef
          stave.addClef("treble");
        }

        // Draw stave lines
        stave.setContext(this.context).draw();
        stavesInSystem.push(stave);

        // Build notes for this measure
        const rawNotes = song.measures[m];
        const vfNotes = [];

        rawNotes.forEach(noteData => {
          const isRest = noteData.type === "r";
          
          const keys = noteData.keys.map(k => k.toLowerCase());
          const vfNote = new StaveNote({
            keys: keys,
            duration: noteData.duration + (isRest ? "r" : "")
          });

          if (!isRest) {
            // Apply accidentals and transparent noteheads
            keys.forEach((key, idx) => {
              // Add accidentals if note is sharp or flat
              const pitchPart = key.split("/")[0];
              if (pitchPart.includes("#") || pitchPart.includes("b")) {
                vfNote.addModifier(new Accidental(pitchPart.includes("#") ? "#" : "b"), idx);
              }

              // Set default notehead style to transparent so we can draw our custom SVG on top
              vfNote.setKeyStyle(idx, { fillStyle: "transparent", strokeStyle: "transparent" });
            });

            // Store render info for tracking
            const pitchNames = noteData.keys.map(k => {
              // Convert e.g., "c/4" -> "C4", "c#/4" -> "C#4"
              const parts = k.toUpperCase().split("/");
              return parts[0] + (parts[1] || "");
            });

            // Push to flat lookup list
            this.renderedNotes.push({
              index: noteIndexCounter,
              pitchNames: pitchNames,
              duration: noteData.duration,
              isRest: false,
              vfNote: vfNote // Keep reference to get rendering position later
            });
            noteIndexCounter++;
          } else {
            // Store rest note information
            this.renderedNotes.push({
              index: noteIndexCounter,
              pitchNames: [],
              duration: noteData.duration,
              isRest: true,
              vfNote: vfNote
            });
            noteIndexCounter++;
          }

          vfNotes.push(vfNote);
        });

        notesInSystem.push(vfNotes);

        // Create voice and add notes
        const voice = new Voice({
          num_beats: 4,
          beat_value: 4
        }).setMode(Voice.Mode.SOFT);
        
        voice.addTickables(vfNotes);
        voicesInSystem.push(voice);

        // Auto-beam notes if appropriate
        const beams = Beam.generateBeams(vfNotes);
        beamsInSystem.push(...beams);
      }

      // Format and render notes in the system staves
      for (let i = 0; i < stavesInSystem.length; i++) {
        new Formatter().joinVoices([voicesInSystem[i]]).format([voicesInSystem[i]], measureWidth - 50);
        voicesInSystem[i].draw(this.context, stavesInSystem[i]);
      }

      // Draw beams
      beamsInSystem.forEach(beam => beam.setContext(this.context).draw());
    }

    // Now, inject custom noteheads
    this.injectCustomNoteheads();
  }

  /**
   * Inject SVG text noteheads at the computed coordinates
   */
  injectCustomNoteheads() {
    const svgEl = document.querySelector(`#${this.divId} svg`);
    if (!svgEl) return;

    // Create our custom overlay group
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
    overlay.setAttribute("class", "svg-overlay");
    svgEl.appendChild(overlay);
    this.overlayGroup = overlay;

    // Draw custom overlay for each rendered note
    this.renderedNotes.forEach(noteInfo => {
      if (noteInfo.isRest) return;

      const vfNote = noteInfo.vfNote;
      const noteHeads = vfNote.getNoteHeads ? vfNote.getNoteHeads() : vfNote.noteHeads;
      if (!noteHeads) return;

      // Group elements for this specific note
      const noteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      noteGroup.setAttribute("class", "overlay-notehead-group");
      noteGroup.setAttribute("id", `notehead-group-${noteInfo.index}`);
      overlay.appendChild(noteGroup);

      noteHeads.forEach((noteHead, idx) => {
        const x = noteHead.getAbsoluteX();
        const y = noteHead.getY();
        const pitch = noteInfo.pitchNames[idx];
        
        // Look up corresponding computer keyboard character
        const char = window.keyboardManager.getNoteChar(pitch);

        // Create Circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "11");
        circle.setAttribute("fill", getPitchColor(pitch));
        circle.setAttribute("stroke", "#111827");
        circle.setAttribute("stroke-width", "1.5");
        noteGroup.appendChild(circle);

        // Create Text Label inside the Circle
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y + 0.5); // Micro adjustment for vertical centering
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("fill", "#ffffff");
        text.setAttribute("font-family", "'Outfit', sans-serif");
        text.setAttribute("font-weight", "800");
        text.setAttribute("font-size", "11px");
        text.textContent = char;
        noteGroup.appendChild(text);
      });
    });
  }

  /**
   * Highlight the note at target index
   * @param {number} activeIndex - Index of note to highlight
   */
  highlightNote(activeIndex) {
    // Clear previous highlights
    document.querySelectorAll(".overlay-notehead-group").forEach(el => {
      el.classList.remove("active");
      el.classList.remove("error");
    });

    // Handle playhead line
    let playheadLine = document.getElementById("playhead-line");
    if (!playheadLine && this.overlayGroup) {
      playheadLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      playheadLine.setAttribute("id", "playhead-line");
      playheadLine.setAttribute("stroke", "#ef4444"); // Red
      playheadLine.setAttribute("stroke-width", "2.5");
      playheadLine.setAttribute("stroke-linecap", "round");
      // Add subtle glow to the red line
      playheadLine.setAttribute("style", "filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.7)); transition: all 0.15s ease-out;");
      this.overlayGroup.appendChild(playheadLine);
    }

    if (activeIndex >= 0 && activeIndex < this.renderedNotes.length) {
      const activeGroup = document.getElementById(`notehead-group-${activeIndex}`);
      if (activeGroup) {
        activeGroup.classList.add("active");
        
        // Scroll container to keep active note in view
        const staveNote = this.renderedNotes[activeIndex].vfNote;
        const noteHeads = staveNote.getNoteHeads ? staveNote.getNoteHeads() : staveNote.noteHeads;
        if (noteHeads && noteHeads[0]) {
          const noteX = noteHeads[0].getAbsoluteX();
          
          // Update vertical red line position
          const stave = staveNote.getStave();
          if (stave && playheadLine) {
            const topY = stave.getYForLine(0) - 15;
            const bottomY = stave.getYForLine(4) + 15;
            playheadLine.setAttribute("x1", noteX);
            playheadLine.setAttribute("y1", topY);
            playheadLine.setAttribute("x2", noteX);
            playheadLine.setAttribute("y2", bottomY);
            playheadLine.setAttribute("opacity", "1");
          }

          const wrapper = document.querySelector(".sheet-music-wrapper");
          if (wrapper) {
            const scrollTarget = noteX - wrapper.clientWidth / 2;
            wrapper.scrollTo({
              left: scrollTarget,
              behavior: "smooth"
            });
          }
        }
      }
    } else {
      // Hide playhead line if inactive
      if (playheadLine) {
        playheadLine.setAttribute("opacity", "0");
      }
    }
  }

  /**
   * Set error highlight state on the current note
   */
  markNoteError(index) {
    const group = document.getElementById(`notehead-group-${index}`);
    if (group) {
      group.classList.add("error");
      setTimeout(() => {
        group.classList.remove("error");
      }, 500);
    }
  }

  /**
   * Gets details of the note at a specific index
   */
  getNoteInfo(index) {
    if (index >= 0 && index < this.renderedNotes.length) {
      return this.renderedNotes[index];
    }
    return null;
  }

  getSongLength() {
    return this.renderedNotes.length;
  }
}

window.scoreRenderer = new ScoreRenderer();
