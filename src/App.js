// const { useState, useMemo } = React;
import React, { useState, useMemo } from 'react';
import { Chord, Note, Scale } from 'tonal';
// import Chord from '@tonaljs/chord';
// import { Note } from '@tonaljs/tonal';
// import Scale from '@tonaljs/scale';

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

const getTonicWithEnharmonic = (tonic = '') => {
  return `${tonic}${tonic.length > 1 ? ' / ' + Note.enharmonic(tonic) : ''}`;
};

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

  const cellIsActive = (i, j) => activeCells.includes(`${i}-${j}`);

  const handleCellToggle = (i, j) => setActiveCells(activeCells =>
    activeCells.includes(`${i}-${j}`) ?
      [...activeCells.filter(item => item !== `${i}-${j}`)] : [...activeCells, `${i}-${j}`]
  );

  const handleTonic = (e) => setTonic(e.target.value);

  const handleScale = (e) => setScale(e.target.value);

  const handleShowDiatonic = () => {
    if (tonic && scale) {
      const scaleObj = Scale.get(`${tonic} ${scale}`);
      const notes = mapToAllFlats(scaleObj.notes);
      setDiatonicNotesFlat(notes);
      setDiatonicNotes(scaleObj.notes);
    }
    else {
      setDiatonicNotes([]);
    }
  };

  const isDiatonic = (chord) => {
    // Check if every note in the chord is present in the scale
    return mapToAllFlats(chord.notes).every(note => diatonicNotesFlat.includes(note));
  };

  return (
    <>
      <div className="form-elements">
        <div>
          <label className="form-check-label" htmlFor="tonic">Tonic</label>
          <select id="tonic" className="form-select" onChange={handleTonic}>
            <option value="">-- Select tonic --</option>
            {getChromaticNotes().map(note => <option key={note} value={note}>{getTonicWithEnharmonic(note)}</option>)}
          </select>
        </div>
        <div>
          <label className="form-check-label" htmlFor="scale">Scale</label>
          <select id="scale" className="form-select" onChange={handleScale}>
            <option value="">-- Select scale --</option>
            {getScales().map(scale => <option key={scale} value={scale}>{scale}</option>)}
          </select>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleShowDiatonic}>Show diatonic chords</button>
        </div>
        {diatonicNotes.length ? (
          <div>
            <h3>Diatonic notes</h3>
            {diatonicNotes.map(note => Note.simplify(note)).join(' ')}
          </div>
        ) : null}
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th key="empty"></th>
            {chords[0].map((set, i) => (<th key={i}>{set.aliases[0]}</th>))}
          </tr>
        </thead>
        <tbody>
          {chords.map((noteSet, i) => (
            <tr key={i}>
              <td>
                {getTonicWithEnharmonic(noteSet[0].tonic)}
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
                  {chord.notes.map(n => Note.simplify(n)).join(' ')}
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
