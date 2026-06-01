// songs.js - Preloaded song database for PianoKeyboard

const SONGS = [
  {
    id: "twinkle",
    title: "반짝반짝 작은별 (Twinkle Twinkle Little Star)",
    bpm: 90,
    timeSignature: "4/4",
    measures: [
      // Measure 1
      [
        { keys: ["c/4"], duration: "q" },
        { keys: ["c/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" }
      ],
      // Measure 2
      [
        { keys: ["a/4"], duration: "q" },
        { keys: ["a/4"], duration: "q" },
        { keys: ["g/4"], duration: "h" }
      ],
      // Measure 3
      [
        { keys: ["f/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" }
      ],
      // Measure 4
      [
        { keys: ["d/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["c/4"], duration: "h" }
      ],
      // Measure 5
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" }
      ],
      // Measure 6
      [
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["d/4"], duration: "h" }
      ],
      // Measure 7
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" }
      ],
      // Measure 8
      [
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["d/4"], duration: "h" }
      ],
      // Measure 9
      [
        { keys: ["c/4"], duration: "q" },
        { keys: ["c/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" }
      ],
      // Measure 10
      [
        { keys: ["a/4"], duration: "q" },
        { keys: ["a/4"], duration: "q" },
        { keys: ["g/4"], duration: "h" }
      ],
      // Measure 11
      [
        { keys: ["f/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" }
      ],
      // Measure 12
      [
        { keys: ["d/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["c/4"], duration: "h" }
      ]
    ]
  },
  {
    id: "butterfly",
    title: "나비야 (Spring Breeze / Butterfly)",
    bpm: 100,
    timeSignature: "4/4",
    measures: [
      // Measure 1: G4 E4 E4 -
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "h" }
      ],
      // Measure 2: F4 D4 D4 -
      [
        { keys: ["f/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["d/4"], duration: "h" }
      ],
      // Measure 3: C4 D4 E4 F4
      [
        { keys: ["c/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" }
      ],
      // Measure 4: G4 G4 G4 -
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "h" }
      ],
      // Measure 5: G4 E4 E4 E4
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" }
      ],
      // Measure 6: F4 D4 D4 D4
      [
        { keys: ["f/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" }
      ],
      // Measure 7: C4 E4 G4 G4
      [
        { keys: ["c/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" }
      ],
      // Measure 8: E4 E4 E4 -
      [
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["e/4"], duration: "h" }
      ]
    ]
  },
  {
    id: "hometown",
    title: "고향의 봄 (Hometown Spring - 나의 살던 고향은)",
    bpm: 80,
    timeSignature: "4/4",
    measures: [
      // Measure 1: 나의 살던
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["f/4"], duration: "q" }
      ],
      // Measure 2: 고향은
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["a/4"], duration: "q" },
        { keys: ["a/4"], duration: "h" }
      ],
      // Measure 3: 꽃피는 산
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["c/5"], duration: "q" },
        { keys: ["c/5"], duration: "q" },
        { keys: ["a/4"], duration: "q" }
      ],
      // Measure 4: 골 - (쉼)
      [
        { keys: ["g/4"], duration: "h" },
        { keys: ["b/4r"], duration: "h", type: "r" } // Half rest (represented as rest in B4 line)
      ],
      // Measure 5: 복숭아꽃
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["a/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" }
      ],
      // Measure 6: 살구꽃
      [
        { keys: ["d/4"], duration: "q" },
        { keys: ["c/4"], duration: "q" },
        { keys: ["d/4"], duration: "h" }
      ],
      // Measure 7: 아기진달
      [
        { keys: ["e/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["a/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" }
      ],
      // Measure 8: 래 - (쉼)
      [
        { keys: ["e/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["c/4"], duration: "h" }
      ],
      // Measure 9: 울긋불긋
      [
        { keys: ["c/5"], duration: "q" },
        { keys: ["c/5"], duration: "q" },
        { keys: ["a/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" }
      ],
      // Measure 10: 꽃대궐
      [
        { keys: ["a/4"], duration: "q" },
        { keys: ["g/4"], duration: "q" },
        { keys: ["e/4"], duration: "h" }
      ],
      // Measure 11: 차리인 동
      [
        { keys: ["d/4"], duration: "q" },
        { keys: ["c/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" }
      ],
      // Measure 12: 네 - (쉼)
      [
        { keys: ["g/4"], duration: "h" },
        { keys: ["b/4r"], duration: "h", type: "r" }
      ],
      // Measure 13: 그 속에서
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["c/5"], duration: "q" },
        { keys: ["c/5"], duration: "q" },
        { keys: ["a/4"], duration: "q" }
      ],
      // Measure 14: 놀던 때
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["a/4"], duration: "q" },
        { keys: ["g/4"], duration: "h" }
      ],
      // Measure 15: 그립습니다
      [
        { keys: ["g/4"], duration: "q" },
        { keys: ["e/4"], duration: "q" },
        { keys: ["d/4"], duration: "q" },
        { keys: ["c/4"], duration: "q" }
      ],
      // Measure 16: 다 - (쉼)
      [
        { keys: ["c/4"], duration: "h" },
        { keys: ["b/4r"], duration: "h", type: "r" }
      ]
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SONGS };
}
