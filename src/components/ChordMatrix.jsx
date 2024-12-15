import React from 'react';
import { useChordContext } from '../context/ChordContext';
import { replaceAccidental } from '../utils/notes';

export const ChordMatrix = ({ handleCellToggle, cellIsActive }) => {
  const { chords, highlight, activeCells, isDiatonic, isDiatonicAddRoman, nonDiatonicCounter } = useChordContext();

  return (
    <div className="table-container-wrapper">
      <div className="table-container">
        <table className="table table-bordered mb-4 overflow-table">
          <thead>
            <tr>
              <th key="empty"></th>
              {chords[0].map((set, i) => (
                <th key={`header-${i}`}>
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
                        highlight ? 'highlight' : '',
                        diatonic ? 'cell-diatonic' : '',
                        nonDiatonicCounter(chord) === 1 && highlight ? 'cell-non-diatonic-1' : ''
                      ].join(' ')}
                    >
                      {cellIsActive(i, j) && (
                        <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
                          {activeCells.indexOf(`${i}-${j}`) + 1}
                        </span>
                      )}
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
      </div>
    </div>
  );
};
