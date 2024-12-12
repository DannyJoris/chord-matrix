import React, { useState, useMemo, useEffect } from 'react';
import { Chord, Note, Progression, Scale } from 'tonal';
import { useWakeLock } from './hooks/useWakeLock';

const getChromaticNotes = () => {
  return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
};

const getSelectedNotes = () => {
  return ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
};

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

const getChordMatrix = (tonic, scale) => {
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

const replaceAccidental = (note) => note.replaceAll('#', '♯').replaceAll('b', '♭');

// App Component.
const App = () => {
  const [tonic, setTonic] = useState('');
  const [scale, setScale] = useState('');
  const chords = useMemo(() => getChordMatrix(tonic, scale), [tonic, scale]);
  const [activeCells, setActiveCells] = useState([]);
  const [diatonicNotes, setDiatonicNotes] = useState([]);
  const [normalizedDiatonicNotes, setNormalizedDiatonicNotes] = useState([]);
  const [preventSleep, handlePreventSleep] = useWakeLock();

  const cellIsActive = (i, j) => activeCells.includes(`${i}-${j}`);

  const handleCellToggle = (i, j) => setActiveCells(activeCells =>
    activeCells.includes(`${i}-${j}`) ?
      [...activeCells.filter(item => item !== `${i}-${j}`)] : [...activeCells, `${i}-${j}`]
  );

  const handleTonic = (e) => setTonic(e.target.value);

  const handleScale = (e) => setScale(e.target.value);

  useEffect(() => {
    if (tonic && scale) {
      const scaleObj = Scale.get(`${tonic} ${scale}`);
      const notes = scaleObj.notes;
      const normalizedNotes = notes.map(note => Note.simplify(note));
      setNormalizedDiatonicNotes(normalizedNotes);
      setDiatonicNotes(notes);
    } else {
      setNormalizedDiatonicNotes([]);
      setDiatonicNotes([]);
    }
  }, [tonic, scale]);

  const isDiatonic = (chord) => {
    const normalizedChordNotes = chord.notes.map(note => Note.simplify(note));
    return normalizedChordNotes.every(note => 
      normalizedDiatonicNotes.some(dNote => 
        Note.enharmonic(note) === dNote || note === dNote
      )
    );
  };

  const isDiatonicAddRoman = (chord) => {
    if (!['M', 'm', 'dim', '7', 'maj7', 'm7', 'm7b5'].includes(chord.aliases[0])) {
      return null;
    }

    if (isDiatonic(chord)) {
      const normalizedChordRoot = Note.simplify(chord.notes[0]);
      const position = normalizedDiatonicNotes.findIndex(note => 
        Note.enharmonic(normalizedChordRoot) === note || normalizedChordRoot === note
      );

      if (position === -1) return null;
      
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      let roman = romans[position];
      
      if (!roman) return null;

      if (chord.quality === 'Minor') {
        roman = roman.toLowerCase();
      }
      if (chord.quality === 'Diminished' && chord.notes.length === 3) {
        roman = `${roman.toLowerCase()} dim`;
      }
      if (chord.quality === 'Augmented') {
        roman = `${roman}+`;
      }
      if (chord.aliases.includes('7')) {
        roman = `${roman} 7`;
      }
      if (chord.aliases.includes('m7')) {
        roman = `${roman} m7`;
      }
      if (chord.aliases.includes('maj7')) {
        roman = `${roman} maj7`;
      }
      if (chord.aliases.includes('m7b5')) {
        roman = `${roman.toLowerCase()} m7b5`;
      }
      return roman;
    }
    return null;
  };

  const getSeventhChordTable = (diatonicNotes) => {
    if (!diatonicNotes.length) return null;

    const rows = [];
    // Create 4 rows, each starting from a different position in the scale
    for (let rowCount = 0; rowCount < 4; rowCount++) {
      const row = [];
      for (let colCount = 0; colCount < 7; colCount++) {
        const noteIndex = (rowCount * 2 + colCount) % 7;
        row.push(diatonicNotes[noteIndex]);
      }
      rows.push(row);
    }

    // Create seventh chords from columns
    const seventhChords = [];
    const triads = [];
    for (let col = 0; col < 7; col++) {
      const chordNotes = rows.map(row => row[col]);
      // Use Chord.detect to get the chord symbol
      const chordTypes = Chord.detect(chordNotes);
      const chord = Chord.get(chordTypes[0]);
      // Get upper structure triad by using only last 3 notes of the column
      const triadNotes = chordNotes.slice(-3);
      const triadTypes = Chord.detect(triadNotes);
      const triad = Chord.get(triadTypes[0]);
      seventhChords.push(chord);
      triads.push(triad);
    }

    return (
      <table className="table table-bordered mt-4" style={{ width: '620px' }}>
        <tbody>
          <tr>
            <th>Chord</th>
            {seventhChords.map((chord, i) => (
              <td key={i}><span className="badge rounded-pill bg-info">{chord.symbol}</span></td>
            ))}
          </tr>
          {rows.map((row, i) => (
            <tr key={i}>
              <th></th>
              {row.map((note, j) => (
                <td key={j}>{replaceAccidental(note)}</td>
              ))}
            </tr>
          ))}
          <tr>
            <th>Upper structure</th>
            {triads.map((chord, i) => (
              <td key={i}><span className="badge rounded-pill bg-info">{chord.symbol}</span></td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="pb-4">
      <form className="form-elements">
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
              {getSelectedNotes().map(note => (
                <option
                  key={note}
                  value={note}
                >
                  {replaceAccidental(note)}
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
          {diatonicNotes.length ? (
            <div>
              <h3>Diatonic notes</h3>
              {diatonicNotes.map((note) => replaceAccidental(note)).join(' ')}
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
      <table className="table table-bordered mb-4">
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
                {replaceAccidental(noteSet[0].tonic)}
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
                    <span className="badge badge-top-right rounded-pill bg-info">
                      {isDiatonicAddRoman(chord)}
                    </span>
                  ) : null}
                  {chord.notes.map((note) => replaceAccidental(note)).join(' ')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {getSeventhChordTable(diatonicNotes)}
    </div>
  )
};

export default App;
