import { Chord, Note, Scale } from 'tonal';
import { getChromaticNotes } from './notes';

export const getChordMatrix = (tonic, scale) => {
  const chromaticNotes = getChromaticNotes();

  // Get the scale notes to determine sharp/flat preference
  const scaleNotes = scale && tonic ? Scale.get(`${tonic} ${scale}`).notes : [];
  const useFlats = scaleNotes.some(note => note.includes('b'));

  // Convert row headers based on scale preference
  const rowNotes = chromaticNotes.map(note => {
    if (useFlats && note.includes('#')) {
      return Note.enharmonic(note);
    }
    return note;
  });

  return rowNotes.map(note => {
    return [
      Chord.getChord('M', note),
      Chord.getChord('m', note),
      Chord.getChord('dim', note),
      Chord.getChord('7', note),
      Chord.getChord('maj7', note),
      Chord.getChord('m7', note),
      Chord.getChord('mM7', note),
      Chord.getChord('m7b5', note),
      Chord.getChord('aug', note),
      Chord.getChord('sus4', note),
      Chord.getChord('sus2', note),
      Chord.getChord('add9', note),
      Chord.getChord('madd9', note),
      Chord.getChord('maj13', note),
      Chord.getChord('13', note),
    ];
  });
};
