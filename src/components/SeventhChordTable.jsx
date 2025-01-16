import React from 'react';
import { Chord } from 'tonal';
import { replaceAccidental } from '../utils/notes';
import { useChordContext } from '../context/ChordContext';

export const SeventhChordTable = () => {
  const { diatonicNotes, isDiatonicAddRoman } = useChordContext();

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
    <div className="table-container-wrapper">
      <div className="table-container">
        <table className="table table-bordered" style={{ width: '720px' }}>
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
                  <td key={`note-${i}-${j}`}>{replaceAccidental(note)}</td>
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
              <th>Triad inside 7th</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
