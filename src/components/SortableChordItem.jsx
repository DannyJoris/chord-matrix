import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useChordContext } from '../context/ChordContext';
import { ChordDisplay } from './ChordDisplay';

export const SortableChordItem = ({ cell, info, diatonic, modalInterchangeDiatonic, nonDiatonicCount, highlight }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cell });
  const { activeChords } = useChordContext();
  
  if (!cell) return null;
  
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
      <ChordDisplay
        cell={cell}
        info={info}
        index={activeChords.indexOf(cell) + 1}
      />
    </li>
  );
};
