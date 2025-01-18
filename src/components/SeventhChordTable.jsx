import React, { useState } from 'react';
import { Chord } from 'tonal';
import { replaceAccidental } from '../utils/notes';
import { useChordContext } from '../context/ChordContext';

export const SeventhChordTable = () => {
  const { diatonicNotes, isDiatonicAddRoman } = useChordContext();
  const [triad1, setTriad1] = useState([]);
  const [triad2, setTriad2] = useState([]);

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

  const handleNoteHover = (i, j) => {
    // Triad.
    if ([0, 1, 2].includes(i)) {
      const noteIndex1 = rows[1].indexOf(rows[0][j]);
      const noteIndex2 = rows[2].indexOf(rows[1][j]);
      const noteIndex3 = rows[3].indexOf(rows[2][j]);
      setTriad1([[0, j], [1, j], [2, j], [1, noteIndex1], [2, noteIndex2], [3, noteIndex3]]);
    }

    // Upper structure triad.
    if ([1, 2, 3].includes(i)) {
      const noteIndex1 = rows[0].indexOf(rows[1][j]);
      const noteIndex2 = rows[1].indexOf(rows[2][j]);
      const noteIndex3 = rows[2].indexOf(rows[3][j]);
      setTriad2([[1, j], [2, j], [3, j], [0, noteIndex1], [1, noteIndex2], [2, noteIndex3]]);
    }
  };

  const handleNoteLeave = () => {
    setTriad1([]);
    setTriad2([]);
  };

  const isTriad1 = (i, j) => {
    return triad1.some(triad => triad[0] === i && triad[1] === j);
  };

  const isTriad2 = (i, j) => {
    return triad2.some(triad => triad[0] === i && triad[1] === j);
  };

  return (
    <div className="table-container-wrapper">
      <div className="table-container">
        <h3 className="h5 mb-3">Seventh Chords and Upper Structure Triads</h3>
        <p className="small text-muted">Hover table to see</p>
        <table className="table table-bordered" style={{ width: '790px' }}>
          <tbody>
            <tr>
              {seventhChords.map((roman, i) => (
                <td key={`seventh-${i}`}>
                  <span className="badge rounded-pill bg-info">{roman}</span>
                </td>
              ))}
              <th>7th Chord</th>
            </tr>
            {rows.map((row, i) => (
              <tr key={`row-${i}`}>
                {row.map((note, j) => (
                  <td
                    key={`note-${i}-${j}`}
                    onMouseEnter={() => handleNoteHover(i, j)}
                    onMouseLeave={handleNoteLeave}
                    className={[
                      isTriad1(i, j) ? 'cell-triad1' : '',
                      isTriad2(i, j) ? 'cell-triad2' : '',
                    ].join(' ')}
                  >
                    {replaceAccidental(note)}
                  </td>
                ))}
                <th></th>
              </tr>
            ))}
            <tr>
              {triads.map((triad, i) => (
                <td key={`triad-${i}`}>
                  <span className="badge rounded-pill bg-info">{triad}</span>
                </td>
              ))}
              <th>Upper Structure Triad</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
