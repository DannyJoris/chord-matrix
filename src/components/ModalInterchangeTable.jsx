import React from 'react';
import { Chord, Scale } from 'tonal';
import { replaceAccidental, getScales } from '../utils/notes';
import { useChordContext } from '../context/ChordContext';

export const ModalInterchangeTable = () => {
  const { 
    tonic,
    scale,
    modalInterchangeScale,
    isDiatonicAddRoman
  } = useChordContext();

  if (!tonic) return null;

  const getScaleTriads = (scaleName) => {    
    const scaleObj = Scale.get(`${tonic} ${scaleName}`);
    const scaleNotes = scaleObj.notes;
    
    return scaleNotes.map((note, index) => {
      const third = scaleNotes[(index + 2) % 7];
      const fifth = scaleNotes[(index + 4) % 7];
      const notes = [note, third, fifth];
      
      const chordTypes = Chord.detect(notes);
      const chord = Chord.get(chordTypes[0]);
      
      return chord;
    });
  };

  return (
    <div className="table-container-wrapper">
      <div className="table-container">
        <h3 className="h5 mb-3">Scale Comparison</h3>
        <table className="table table-bordered table-modal-interchange">
          <tbody>
            {getScales().map(currentScale => {
              const triads = getScaleTriads(currentScale);
              const isMainScale = currentScale === scale;
              const isModalScale = currentScale === modalInterchangeScale;
              
              return (
                <tr key={currentScale}>
                  <th style={{ textTransform: 'capitalize' }}>{currentScale}</th>
                  {triads.map((chord, i) => {
                    const roman = isDiatonicAddRoman(chord, isModalScale);
                    return (
                      <td 
                        key={`${currentScale}-${i}`}
                        className={[
                          isMainScale ? 'cell-diatonic' : '',
                          isModalScale ? 'cell-modal-interchange' : ''
                        ].join(' ')}
                      >
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
