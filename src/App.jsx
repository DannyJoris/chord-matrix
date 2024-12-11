import React, { useState, useMemo } from 'react';
import { Chord, Note, Progression, Scale } from 'tonal';
import { useWakeLock } from './hooks/useWakeLock';

const getChromaticNotes = () => {
  let note = 'C';
  let chromaticNotes = [note];
  // Generate the next 11 notes in the chromatic scale
  for (let i = 0; i < 11; i++) {
    note = Note.enharmonic(Note.simplify(Note.transpose(note, '2m')));
    chromaticNotes.push(note);
  }
  return chromaticNotes;
};

const replaceAccidental = (note) => note.replace('#', '♯').replace('b', '♭');

const getTonicWithEnharmonic = (tonic = '') =>
  `${tonic}${tonic.length > 1 ? ' / ' + Note.enharmonic(tonic) : ''}`;

const getScales = () => {
  return [
    'ionian',
    'dorian',
    'phrygian',
    'lydian',
    'mixolydian',
    'aeolian',
    'locrian',
  ];
};

const mapToAllFlats = (notes = []) => {
  return notes.map(note => note.includes('#') ? Note.enharmonic(note) : note);
};

const getChordMatrix = () => {
  const chromaticNotes = getChromaticNotes();
  return chromaticNotes.map(note => {
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

// App Component.
const App = () => {
  const chords = useMemo(() => getChordMatrix(), []);
  const [activeCells, setActiveCells] = useState([]);
  const [tonic, setTonic] = useState('');
  const [scale, setScale] = useState('');
  const [diatonicNotes, setDiatonicNotes] = useState([]);
  const [diatonicNotesFlat, setDiatonicNotesFlat] = useState([]);
  const [preventSleep, handlePreventSleep] = useWakeLock();

  const cellIsActive = (i, j) => activeCells.includes(`${i}-${j}`);

  const handleCellToggle = (i, j) => setActiveCells(activeCells =>
    activeCells.includes(`${i}-${j}`) ?
      [...activeCells.filter(item => item !== `${i}-${j}`)] : [...activeCells, `${i}-${j}`]
  );

  const handleTonic = (e) => setTonic(e.target.value);

  const handleScale = (e) => setScale(e.target.value);

  const handleShowDiatonic = (e) => {
    e.preventDefault();
    if (tonic && scale) {
      const scaleObj = Scale.get(`${tonic} ${scale}`);
      const notes = mapToAllFlats(scaleObj.notes);
      setDiatonicNotesFlat(notes);
      setDiatonicNotes(scaleObj.notes);
    }
    else {
      setDiatonicNotesFlat([]);
      setDiatonicNotes([]);
    }
  };

  // Check if every note in the chord is present in the scale
  const isDiatonic = (chord) => {
    return mapToAllFlats(chord.notes).every(note => diatonicNotesFlat.includes(note));
  };

  const isDiatonicAddRoman = (chord) => {
    if (!['M', 'm', 'dim', '7', 'maj7', 'm7', 'm7b5'].includes(chord.aliases[0])) {
      return;
    }
    if (isDiatonic(chord)) {
      const flatFirst = mapToAllFlats(chord.notes)[0];
      const position = diatonicNotesFlat.indexOf(flatFirst);
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      let roman = romans[position];
      if (chord.quality === 'Minor') {
        roman = roman.toLowerCase();
      }
      if (chord.quality === 'Diminished' && chord.notes.length === 3) {
        roman = `${roman.toLowerCase()}°`;
      }
      if (chord.quality === 'Augmented') {
        roman = `${roman}°`;
      }
      if (chord.aliases.includes('7')) {
        roman = `${roman}7`;
      }
      if (chord.aliases.includes('m7')) {
        roman = `${roman}m7`;
      }
      if (chord.aliases.includes('Δ')) {
        roman = `${roman}Δ`;
      }
      if (chord.aliases.includes('ø')) {
        roman = `${roman.toLowerCase()}ø`;
      }
      return roman;
    }
  };

  return (
    <>
      <form className="form-elements" onSubmit={handleShowDiatonic}>
        <div className="form-group-left">
          <div>
            <label
              className="form-check-label"
              htmlFor="tonic"
            >
              Tonic
            </label>
            <select
              id="tonic"
              className="form-select"
              onChange={handleTonic}
            >
              <option value="">-- Select tonic --</option>
              {getChromaticNotes().map(note => (
                <option
                  key={note}
                  value={note}
                >
                  {replaceAccidental(getTonicWithEnharmonic(note))}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="form-check-label"
              htmlFor="scale"
            >
              Scale
            </label>
            <select
              id="scale"
              className="form-select"
              onChange={handleScale}
            >
              <option value="">-- Select scale --</option>
              {getScales().map(scale => (
                <option
                  key={scale}
                  value={scale}
                >
                  {scale}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Show diatonic chords
            </button>
          </div>
          {diatonicNotes.length ? (
            <div>
              <h3>Diatonic notes</h3>
              {diatonicNotes.map((note) => replaceAccidental(Note.simplify(note))).join(' ')}
            </div>
          ) : null}
        </div>
        <div className="form-group-right">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="preventSleepToggle"
              checked={preventSleep}
              onChange={handlePreventSleep}
            />
            <label className="form-check-label" htmlFor="preventSleepToggle">
              Prevent Sleep
            </label>
          </div>
        </div>
      </form>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th key="empty"></th>
            {chords[0].map((set, i) => (
              <th key={i}>
                <div>{set.aliases[0]}</div>
                <span className="intervals">{set.intervals.join(' ')}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chords.map((noteSet, i) => (
            <tr key={i}>
              <td>
                {replaceAccidental(getTonicWithEnharmonic(noteSet[0].tonic))}
              </td>
              {noteSet.map((chord, j) => (
                <td
                  key={j}
                  onClick={() => handleCellToggle(i, j)}
                  className={[
                    cellIsActive(i, j) ? 'cell-toggle' : '',
                    isDiatonic(chord) ? 'cell-diatonic' : ''
                  ].join(' ')}
                >
                  {isDiatonic(chord) ? (
                    <span className="badge rounded-pill bg-info">
                      {isDiatonicAddRoman(chord)}
                    </span>
                  ) : null}
                  {chord.notes.map((note) => replaceAccidental(Note.simplify(note))).join(' ')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
};

export default App;
