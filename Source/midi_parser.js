// midi_parser.js - Parses MIDI files and transcribes them into quantized VexFlow measures

class MidiParser {
  /**
   * Convert MIDI Note number (e.g., 60) to VexFlow key format (e.g., "c/4")
   */
  midiToVexFlowKey(midiNumber) {
    const noteNames = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
    const pitchIndex = midiNumber % 12;
    const octave = Math.floor(midiNumber / 12) - 1;
    return `${noteNames[pitchIndex]}/${octave}`;
  }

  /**
   * Quantize ticks to valid VexFlow durations
   * Grid (16 ticks per 4/4 measure):
   * - 16 ticks = "w" (Whole Note)
   * - 8 ticks = "h" (Half Note)
   * - 4 ticks = "q" (Quarter Note)
   * - 2 ticks = "8" (Eighth Note)
   * - 1 tick = "16" (Sixteenth Note)
   */
  ticksToVexFlowDuration(ticks) {
    if (ticks >= 12) return { dur: "w", ticks: 16 };
    if (ticks >= 6) return { dur: "h", ticks: 8 };
    if (ticks >= 3) return { dur: "q", ticks: 4 };
    if (ticks >= 2) return { dur: "8", ticks: 2 };
    return { dur: "16", ticks: 1 };
  }

  /**
   * Helper to decompose a tick duration into VexFlow rest segments
   */
  createRestNotes(ticks) {
    const rests = [];
    let remainingTicks = ticks;

    while (remainingTicks > 0) {
      if (remainingTicks >= 16) {
        rests.push({ keys: ["b/4r"], duration: "w", type: "r" });
        remainingTicks -= 16;
      } else if (remainingTicks >= 8) {
        rests.push({ keys: ["b/4r"], duration: "h", type: "r" });
        remainingTicks -= 8;
      } else if (remainingTicks >= 4) {
        rests.push({ keys: ["b/4r"], duration: "q", type: "r" });
        remainingTicks -= 4;
      } else if (remainingTicks >= 2) {
        rests.push({ keys: ["b/4r"], duration: "8", type: "r" });
        remainingTicks -= 2;
      } else {
        rests.push({ keys: ["b/4r"], duration: "16", type: "r" });
        remainingTicks -= 1;
      }
    }
    return rests;
  }

  /**
   * Transcribe parsed MIDI data into VexFlow song format
   */
  transcribeMidi(midiData) {
    // Find track with the most notes
    let bestTrack = null;
    let maxNotes = 0;
    
    midiData.tracks.forEach(track => {
      if (track.notes.length > maxNotes) {
        maxNotes = track.notes.length;
        bestTrack = track;
      }
    });

    if (!bestTrack || bestTrack.notes.length === 0) {
      throw new Error("No MIDI tracks with notes found in this file.");
    }

    const bpm = Math.round(midiData.header.tempos[0]?.bpm || 120);
    const quarterNoteDuration = 60 / bpm; // duration in seconds
    const tickDuration = quarterNoteDuration / 4; // 16th note grid

    // Quantize all notes onto the grid
    const tickMap = {};
    let maxTick = 0;

    bestTrack.notes.forEach(note => {
      const startTick = Math.round(note.time / tickDuration);
      const durationTicks = Math.max(1, Math.round(note.duration / tickDuration));
      
      // Keep notes within keyboard range (G3 to A5 is midi 55 to 82)
      // If notes are outside, transpose them by octaves so they fit!
      let midiNoteNum = note.midi;
      while (midiNoteNum < 55) midiNoteNum += 12; // Transpose up
      while (midiNoteNum > 82) midiNoteNum -= 12; // Transpose down

      if (!tickMap[startTick]) {
        tickMap[startTick] = [];
      }

      tickMap[startTick].push({
        midi: midiNoteNum,
        durationTicks: durationTicks
      });

      const endTick = startTick + durationTicks;
      if (endTick > maxTick) {
        maxTick = endTick;
      }
    });

    // Make sure maxTick aligns with a full measure boundary (16 ticks)
    const ticksPerMeasure = 16;
    const totalMeasures = Math.ceil(maxTick / ticksPerMeasure);
    const finalTicksCount = totalMeasures * ticksPerMeasure;

    const measures = [];

    for (let m = 0; m < totalMeasures; m++) {
      const measureNotes = [];
      const measureStartTick = m * ticksPerMeasure;
      const measureEndTick = measureStartTick + ticksPerMeasure;

      let t = measureStartTick;
      while (t < measureEndTick) {
        if (tickMap[t] && tickMap[t].length > 0) {
          // Notes found at this tick! Build a chord
          const notesAtTick = tickMap[t];
          
          // Remove duplicate pitches in the chord
          const uniqueMidis = [...new Set(notesAtTick.map(n => n.midi))];
          
          // Determine duration from the longest note starting at this tick
          const longestDuration = Math.max(...notesAtTick.map(n => n.durationTicks));
          
          // Cap duration so it doesn't cross the measure boundary
          const availableTicks = measureEndTick - t;
          const cappedDuration = Math.min(longestDuration, availableTicks);
          
          // Get VexFlow duration representation
          const vfDur = this.ticksToVexFlowDuration(cappedDuration);
          
          const keys = uniqueMidis.map(midi => this.midiToVexFlowKey(midi));

          measureNotes.push({
            keys: keys,
            duration: vfDur.dur
          });

          // Advance timeline
          t += vfDur.ticks;
        } else {
          // Empty tick. Find the next tick with notes (or measure boundary)
          let nextNoteTick = t + 1;
          while (nextNoteTick < measureEndTick && (!tickMap[nextNoteTick] || tickMap[nextNoteTick].length === 0)) {
            nextNoteTick++;
          }

          const gapTicks = nextNoteTick - t;
          const rests = this.createRestNotes(gapTicks);
          measureNotes.push(...rests);

          t = nextNoteTick;
        }
      }

      measures.push(measureNotes);
    }

    return {
      id: "custom_midi_" + Date.now(),
      title: "사용자 업로드 악보 (Custom MIDI)",
      bpm: bpm,
      timeSignature: "4/4",
      measures: measures
    };
  }
}

window.midiParser = new MidiParser();
