export const getChromaticNotes = () => {
  return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
};

export const getSelectedNotes = () => {
  return ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
};

export const getScales = () => {
  return [
    ...getDiatonicScales(),
    ...getHepatonicScales(),
  ];
};

export const getDiatonicScales = () => {
  return ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
};

export const getHepatonicScales = () => {
  return ['melodic minor', 'harmonic minor', 'harmonic major'];
};

export const replaceAccidental = (note) => note.replaceAll('#', '♯').replaceAll('b', '♭');