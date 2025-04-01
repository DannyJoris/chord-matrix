import { Note, Chord } from 'tonal';

// C major triad
// "0_100010010000"    // C (0) with major triad chroma

// D#m7 or Ebm7 (same identifier!)
// "3_100100010010"    // D#/Eb (3) with minor seventh chroma

// F#dim or Gbdim (same identifier!)
// "6_100100100000"    // F#/Gb (6) with diminished triad chroma

// C  = 0
// C# = 1 (same as Db)
// D  = 2
// D# = 3 (same as Eb)
// E  = 4
// F  = 5
// F# = 6 (same as Gb)
// G  = 7
// G# = 8 (same as Ab)
// A  = 9
// A# = 10 (same as Bb)
// B  = 11

export const getChordId = (chord) => {
  if (!chord) return '';
  
  // Get normalized root note number (0-11)
  const rootChroma = Note.chroma(chord.tonic);
  
  if (chord.chroma) {
    // Combine root number with chord chroma
    return `${rootChroma}_${chord.chroma}`;
  }
  
  if (chord.notes) {
    return chord.notes
      .map(note => Note.chroma(note))
      .sort()
      .join('_');
  }

  return '';
};
