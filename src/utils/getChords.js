import { Chord } from 'tonal';

export const getChords = (note) => {
  return [
    Chord.getChord('M', note),
    Chord.getChord('m', note),
    Chord.getChord('dim', note),
    Chord.getChord('7', note),
    Chord.getChord('maj7', note),
    Chord.getChord('m7', note),
    Chord.getChord('mM7', note),
    Chord.getChord('m7b5', note),
    Chord.getChord('5', note),
    Chord.getChord('aug', note),
    Chord.getChord('sus4', note),
    Chord.getChord('sus2', note),
    Chord.getChord('add9', note),
    Chord.getChord('madd9', note),
    Chord.getChord('maj9', note),
    Chord.getChord('9', note),
    Chord.getChord('m9', note),
    Chord.getChord('11', note),
    Chord.getChord('maj13', note),
    Chord.getChord('13', note),
  ];
};