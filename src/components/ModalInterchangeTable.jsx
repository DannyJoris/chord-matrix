import React from 'react';
import { Chord, Scale, Note, Interval } from 'tonal';
import { replaceAccidental, getScales, getHepatonicScales } from '../utils/notes';
import { useChordContext } from '../context/ChordContext';
import { getChordId } from '../utils/chordIdentifier';
import { addRoman } from '../utils/roman';

export const ModalInterchangeTable = ({ showSevenths = false, width }) => {
  const { 
    tonic,
    scale,
    modalInterchangeScale,
    isDiatonicAddRoman,
    activeChords,
    chordIsActive,
    handleChordToggle,
    nonDiatonicCounter,
    highlight
  } = useChordContext();

  if (!tonic) return null;

  const getScaleChords = (scaleName) => {    
    const scaleObj = Scale.get(`${tonic} ${scaleName}`);
    const scaleNotes = scaleObj.notes;
    
    return scaleNotes.map((note, index) => {
      const third = scaleNotes[(index + 2) % 7];
      const fifth = scaleNotes[(index + 4) % 7];
      const seventh = showSevenths ? scaleNotes[(index + 6) % 7] : null;
      const notes = seventh ? [note, third, fifth, seventh] : [note, third, fifth];
      
      const chordTypes = Chord.detect(notes);
      const chord = Chord.get(chordTypes[0]);
      chord.notes = notes;
      chord.tonic = note;
      
      return chord;
    });
  };

  const isDuplicateOnHighlightedScale = (chord, currentScale) => {
    const chordId = getChordId(chord);
    const isMainScale = currentScale === scale;
    const isModalScale = currentScale === modalInterchangeScale;
    
    // Main scale chords are never duplicates
    if (isMainScale) return false;
    
    // For modal scale chords, only check if they exist in main scale
    if (isModalScale) {
      const mainScaleTriads = getScaleChords(scale);
      return mainScaleTriads.some(mainChord => getChordId(mainChord) === chordId);
    }
    
    // For other scales, check if chord exists in either main or modal scale
    return getScales().some(otherScale => {
      if (otherScale === currentScale) return false;
      if (otherScale !== scale && otherScale !== modalInterchangeScale) return false;
      
      const otherTriads = getScaleChords(otherScale);
      return otherTriads.some(otherChord => getChordId(otherChord) === chordId);
    });
  };

  const isChordInScale = (chord, scaleName) => {
    if (!scaleName) return false;
    const scaleChords = getScaleChords(scaleName);
    return scaleChords.some(scaleChord => getChordId(scaleChord) === getChordId(chord));
  };

  return (
    <div className="table-container-wrapper">
      <div className="table-container">
        <h3 className="h5 mb-3">Modal Interchange {showSevenths ? '(Seventh Chords)' : '(Triads)'}</h3>
        <table className="table table-bordered table-modal-interchange" style={ width ? { width } : {}}>
          <tbody>
            {getScales().map(currentScale => {
              const triads = getScaleChords(currentScale);
              const isMainScale = currentScale === scale;
              const isModalScale = currentScale === modalInterchangeScale;
              
              return (
                <tr key={currentScale} className={currentScale === getHepatonicScales()[0] ? 'row-section-first-item' : ''}>
                  <th className="cell-with-left-border">
                    {isMainScale || isModalScale ? (
                      <div
                        className={[
                          'cell-left-border',
                          isMainScale ? 'cell-diatonic' : '',
                          isModalScale ? 'cell-modal-interchange' : '',
                        ].join(' ')}
                      ></div>
                      ) : null}
                    {currentScale}
                  </th>
                  {triads.map((chord, i) => {
                    const chordId = getChordId(chord);
                    const isActive = chordIsActive(chordId);
                    const roman = addRoman(chord, i, tonic);
                    return (
                      <td
                        key={`${currentScale}-${i}`}
                        onClick={() => handleChordToggle(chordId)}
                        className={[
                          isActive ? 'cell-toggle' : '',
                          isMainScale ? 'cell-diatonic' : isChordInScale(chord, scale) ? 'cell-diatonic' : '',
                          isModalScale ? 'cell-modal-interchange' : isChordInScale(chord, modalInterchangeScale) ? 'cell-modal-interchange' : '',
                          nonDiatonicCounter(chord) === 1 && highlight ? 'cell-non-diatonic-1' : '',
                          isDuplicateOnHighlightedScale(chord, currentScale) ? 'cell-duplicate' : ''
                        ].join(' ')}
                      >
                        {isActive && (
                          <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
                            {activeChords.indexOf(chordId) + 1}
                          </span>
                        )}
                        <span className="badge badge-top-right rounded-pill bg-info">
                          {roman}
                        </span>
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
