import { getChords } from './getChords';

export const getQuiz1 = () => {
  const chords = getChords('C');
  return chords.map(chord => ({
    alias: chord.aliases[0],
    intervals: chord.intervals,
  }));
};
