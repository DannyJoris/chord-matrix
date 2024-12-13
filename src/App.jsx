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
  // Get initial values from URL params
  const params = new URLSearchParams(window.location.search);
  const [tonic, setTonic] = useState(params.get('tonic') || '');
  const [scale, setScale] = useState(params.get('scale') || '');
  const [activeCells, setActiveCells] = useState(() => {
    const cells = params.get('cells');
    return cells ? cells.split(',') : [];
  });
  const chords = useMemo(() => getChordMatrix(tonic, scale), [tonic, scale]);
  const [diatonicNotes, setDiatonicNotes] = useState([]);
  const [normalizedDiatonicNotes, setNormalizedDiatonicNotes] = useState([]);
  const [preventSleep, handlePreventSleep] = useWakeLock();

  // Update URL when form values change
  const updateURL = (newTonic, newScale, newActiveCells) => {
    const params = new URLSearchParams();
    if (newTonic) params.set('tonic', newTonic);
    if (newScale) params.set('scale', newScale);
    if (newActiveCells.length) params.set('cells', newActiveCells.join(','));
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
  };

  const cellIsActive = (i, j) => activeCells.includes(`${i}-${j}`);

  const handleCellToggle = (i, j) => {
    const cellId = `${i}-${j}`;
    setActiveCells(activeCells => {
      const newActiveCells = activeCells.includes(cellId)
        ? activeCells.filter(item => item !== cellId)
        : [...activeCells, cellId];
      updateURL(tonic, scale, newActiveCells);
      return newActiveCells;
    });
  };

  const handleTonic = (e) => {
    const value = e.target.value;
    setTonic(value);
    updateURL(value, scale, activeCells);
  };

  const handleScale = (e) => {
    const value = e.target.value;
    setScale(value);
    updateURL(tonic, value, activeCells);
  };

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

  const nonDiatonicCounter = (chord) => {
    const normalizedChordNotes = chord.notes.map(note => Note.simplify(note));
    return normalizedChordNotes.filter(note =>
      !normalizedDiatonicNotes.some(dNote =>
        Note.enharmonic(note) === dNote || note === dNote
      )
    ).length;
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
      seventhChords.push(isDiatonicAddRoman(chord));
      triads.push(triad.aliases[0]);
    }

    return (
      <table className="table table-bordered" style={{ width: '680px' }}>
        <tbody>
          <tr>
            <th>7th Chord</th>
            {seventhChords.map((roman, i) => (
              <td key={i}><span className="badge rounded-pill bg-info">{roman}</span></td>
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
            <th>Triad inside 7th</th>
            {triads.map((triad, i) => (
              <td key={i}><span className="badge rounded-pill bg-info">{triad}</span></td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  const getChordInfo = (i, j) => {
    if (!chords[i] || !chords[i][j]) return null;

    const chord = chords[i][j];
    const roman = isDiatonicAddRoman(chord);
    const notes = chord.notes.map(note => replaceAccidental(note)).join(' ');

    return {
      tonic: replaceAccidental(chord.tonic),
      type: chord.aliases[0],
      roman,
      notes
    };
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
              value={tonic}
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
              value={scale}
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
              <th>
                {replaceAccidental(noteSet[0].tonic)}
              </th>
              {noteSet.map((chord, j) => {
                const chordNotes = chord.notes.map((note) => replaceAccidental(note)).join(' ');
                const roman = isDiatonicAddRoman(chord);
                const diatonic = isDiatonic(chord);
                return (
                  <td
                    key={j}
                    onClick={() => handleCellToggle(i, j)}
                    className={[
                      cellIsActive(i, j) ? 'cell-toggle' : '',
                      diatonic ? 'cell-diatonic' : '',
                      nonDiatonicCounter(chord) === 1 ? 'cell-non-diatonic-1' : ''
                    ].join(' ')}
                  >
                    {roman ? (
                      <span className="badge badge-top-right rounded-pill bg-info">
                        {roman}
                      </span>
                    ) : null}
                    {chordNotes}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex gap-4 mt-4">
        <div className="mt-4">
          {getSeventhChordTable(diatonicNotes)}
        </div>
        <div className="flex-grow-1 mt-4">
          <ul className="active-chords-list">
            {activeCells.map(cell => {
              const [i, j] = cell.split('-').map(Number);
              const info = getChordInfo(i, j);
              if (!info) return null;

              const chord = chords[i][j];
              const diatonic = isDiatonic(chord);
              const nonDiatonicCount = nonDiatonicCounter(chord);

              return (
                <li
                  key={cell}
                  className={[
                    'active-chords-list-item',
                    diatonic ? 'cell-diatonic' : '',
                    nonDiatonicCount === 1 ? 'cell-non-diatonic-1' : ''
                  ].join(' ')}
                >
                  <strong>{info.tonic}{info.type}</strong>
                  {info.roman && <span className="badge badge-top-right rounded-pill bg-info ms-2">{info.roman}</span>}
                  <div className="mt-2">{info.notes}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  )
};

export default App;
