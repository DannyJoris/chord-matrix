import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useChordContext } from '../context/ChordContext';

export const SortableChordItem = ({ cell, info, chord, diatonic, modalInterchangeDiatonic, nonDiatonicCount, highlight }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cell });
  const { activeCells } = useChordContext();
  
  if (!cell) return null;
  const [i, j] = cell.split('-').map(Number);
  const itemRef = React.useRef(null);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        'active-chords-list-item',
        isDragging ? 'dragging' : '',
        highlight ? 'highlight' : '',
        diatonic ? 'cell-diatonic' : '',
        modalInterchangeDiatonic ? 'cell-modal-interchange' : '',
        nonDiatonicCount === 1 && highlight ? 'cell-non-diatonic-1' : ''
      ].join(' ')}
    >
      {activeCells.includes(`${i}-${j}`) && (
        <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
          {activeCells.indexOf(`${i}-${j}`) + 1}
        </span>
      )}
      <strong>{info.tonic}{info.type}</strong>
      {info.roman && <span className="badge badge-top-right rounded-pill bg-info ms-2">{info.roman}</span>}
      <div className="mt-2">{info.notes}</div>
    </li>
  );
};
