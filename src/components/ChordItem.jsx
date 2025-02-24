import React from 'react';
import { useChordContext } from '../context/ChordContext';

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
      <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
        {activeChords.indexOf(cell) + 1}
      </span>
      <strong>{info.tonic}{info.type !== 'M' && info.type}</strong>
      {info.roman && <span className="badge badge-top-right rounded-pill bg-info ms-2">{info.roman}</span>}
      <div className="mt-2">{info.notes}</div>
      {removeMode && (
        <button className="btn btn-sm btn-link text-danger px-0" onClick={handleRemoveChord}>
          Remove
        </button>
      )}
    </li>
  );
};
