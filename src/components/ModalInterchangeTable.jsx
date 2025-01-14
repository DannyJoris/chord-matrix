import React from 'react';
import { Chord, Scale } from 'tonal';
import { replaceAccidental } from '../utils/notes';
import { useChordContext } from '../context/ChordContext';

export const ModalInterchangeTable = () => {
  const { 
    tonic,
    scale,
    modalInterchangeScale,
    diatonicNotes,
    modalInterchangeDiatonicNotes,
    isDiatonicAddRoman
  } = useChordContext();

  if (!diatonicNotes.length || !modalInterchangeDiatonicNotes.length) return null;


  const getDiatonicTriads = (scaleNotes) => {    
    // Get triad for each scale degree
    return scaleNotes.map((note, index) => {
      // Stack thirds from the scale
      const third = scaleNotes[(index + 2) % 7];
      const fifth = scaleNotes[(index + 4) % 7];
      const notes = [note, third, fifth];
      
      // Use Chord.detect to get the chord type
      const chordTypes = Chord.detect(notes);
      const chord = Chord.get(chordTypes[0]);
      
      return chord;
    });
  };

  // Get triads for diatonic scale
  const diatonicTriads = getDiatonicTriads(diatonicNotes);

  // Get triads for modal interchange scale
  const modalInterchangeTriads = getDiatonicTriads(modalInterchangeDiatonicNotes);

  return (
    <div className="table-container-wrapper">
      <div className="table-container">
        <h3 className="h5 mb-3">Modal Interchange: {scale} → {modalInterchangeScale}</h3>
        <table className="table table-bordered" style={{ width: '680px' }}>
          <tbody>
            <tr>
              {diatonicTriads.map((chord, i) => {
                const roman = isDiatonicAddRoman(chord);
                return (
                  <td key={`diatonic-${i}`} className="cell-diatonic">
                    {roman && (
                      <span className="badge badge-top-right rounded-pill bg-info">
                        {roman}
                      </span>
                    )}
                    {chord.notes.map(n => replaceAccidental(n)).join(' ')}
                  </td>
                );
              })}
            </tr>
            <tr>
              {modalInterchangeTriads.map((chord, i) => {
                const roman = isDiatonicAddRoman(chord, true);
                return (
                  <td key={`modal-${i}`} className="cell-modal-interchange">
                    {roman && (
                      <span className="badge badge-top-right rounded-pill bg-modal-interchange">
                        {roman}
                      </span>
                    )}
                    {chord.notes.map(n => replaceAccidental(n)).join(' ')}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
