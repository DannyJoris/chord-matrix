import { Note, Interval } from 'tonal';
import { replaceAccidental } from './notes';

export const addRoman = (chord, position, tonic) => {
  let roman = '';
  const majorRomans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const majorSemitones = [0, 2, 4, 5, 7, 9, 11];

  const alias = chord.aliases[0];
  const firstNote = chord.notes[0];
  const distance = Note.distance(tonic, firstNote);
  const semitones = Interval.semitones(distance);

  if (semitones < majorSemitones[position]) {
    roman += replaceAccidental('b');
  } else if (semitones > majorSemitones[position]) {
    roman += replaceAccidental('#');
  }

  roman += ['Major', 'Augmented'].includes(chord.quality) ? majorRomans[position] : majorRomans[position].toLowerCase();
  roman += ' ';
  roman += ['M', 'm'].includes(alias) ? '' : alias;

  return roman;
};
