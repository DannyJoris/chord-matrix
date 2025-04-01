import React from 'react';
import { useChordContext } from '../context/ChordContext';
import { ChordDisplay } from './ChordDisplay';

export const ChordItem = ({
  cell,
  info,
  diatonic,
  nonDiatonicCount,
  highlight,
  modalInterchangeDiatonic
}) => {
  const { 
    activeChords, 
    setActiveChords, 
    removeMode,
  } = useChordContext();

  if (!info) return null;

  const handleRemoveChord = () => {
    if (!removeMode) return;
    setActiveChords(prevChords => prevChords.filter(c => c !== cell));
  };

  return (
    <li className={[
      'active-chords-list-item',
      'active-chords-list-item-remove-mode',
      diatonic ? 'cell-diatonic' : '',
      modalInterchangeDiatonic ? 'cell-modal-interchange' : '',
      nonDiatonicCount === 1 && highlight ? 'cell-non-diatonic-1' : ''
    ].join(' ')}>
      <ChordDisplay
        cell={cell}
        info={info}
        index={activeChords.indexOf(cell) + 1}
      />
      {removeMode && (
        <button className="btn btn-sm btn-link text-danger px-0" onClick={handleRemoveChord}>
          Remove
        </button>
      )}
    </li>
  );
};
