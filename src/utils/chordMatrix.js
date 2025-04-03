import { Note, Scale } from 'tonal';
import { getChromaticNotes } from './notes';
import { getChords } from './getChords';

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
    return getChords(note);
  });
};
