import React from 'react';
import { useChordContext } from '../context/ChordContext';
import { replaceAccidental } from '../utils/notes';
import { getChordId } from '../utils/chordIdentifier';

export const ChordMatrix = () => {
  const {
    chords,
    highlight,
    activeChords,
    isDiatonic,
    isDiatonicAddRoman,
    nonDiatonicCounter,
    isModalInterchangeDiatonic,
    chordIsActive,
    handleChordToggle
  } = useChordContext();

  return (
    <>
      <div className="small text-muted mb-2">
        Click to select chords
      </div>
      <div className="table-container-wrapper">
        <div className="table-container">
          <table className="table table-bordered mb-4 overflow-table">
            <thead>
              <tr>
                <th></th>
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
                    const modalInterchange = isModalInterchangeDiatonic(chord);
                    const chordId = getChordId(chord);
                    // const modalInterchangeRoman = isDiatonicAddRoman(chord, true);
                    return (
                      <td
                        key={j}
                        onClick={() => handleChordToggle(chordId)}
                        className={[
                          chordIsActive(chordId) ? 'cell-toggle' : '',
                          highlight ? 'highlight' : '',
                          diatonic ? 'cell-diatonic' : '',
                          modalInterchange ? 'cell-modal-interchange' : '',
                          nonDiatonicCounter(chord) === 1 && highlight ? 'cell-non-diatonic-1' : ''
                        ].join(' ')}
                      >
                        {chordIsActive(chordId) && (
                          <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
                            {activeChords.indexOf(chordId) + 1}
                          </span>
                        )}
                        {/* {modalInterchangeRoman ? (
                          <span className="badge badge-top-right rounded-pill bg-modal-interchange">
                            {modalInterchangeRoman}
                          </span>
                        ) : null} */}
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
    </>
  );
};
