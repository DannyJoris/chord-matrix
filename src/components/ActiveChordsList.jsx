import React from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { useChordContext } from '../context/ChordContext';
import { updateURL } from '../utils/url';
import { replaceAccidental } from '../utils/notes';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableChordItem } from './SortableChordItem';
import { ChordItem } from './ChordItem';
import { getChordId } from '../utils/chordIdentifier';

export const ActiveChordsList = () => {
  const {
    tonic,
    scale,
    activeChords,
    setActiveChords,
    highlight,
    chords,
    activeId,
    setActiveId,
    removeMode,
    setRemoveMode,
    isDiatonic,
    nonDiatonicCounter,
    modalInterchangeScale,
    isModalInterchangeDiatonic,
    isDiatonicAddRoman
  } = useChordContext();

  const getChordInfo = (chord) => {
    if (!chord) return null;

    const roman = isDiatonicAddRoman(chord);
    const notes = chord.notes.map(note => replaceAccidental(note)).join(' ');

    return {
      tonic: replaceAccidental(chord.tonic),
      type: chord.aliases[0],
      roman,
      notes
    };
  };

  const getChordData = (chordId) => {
    // Find the chord in the matrix by matching its identifier
    for (const row of chords) {
      for (const chord of row) {
        if (getChordId(chord) === chordId) {
          return {
            cell: chordId,
            info: getChordInfo(chord),
            chord,
            diatonic: isDiatonic(chord),
            modalInterchangeDiatonic: isModalInterchangeDiatonic(chord),
            nonDiatonicCount: nonDiatonicCounter(chord)
          };
        }
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setActiveChords((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        updateURL(tonic, scale, newItems, highlight, modalInterchangeScale);
        return newItems;
      });
    }
  };

  const toggleRemoveMode = () => {
    setRemoveMode(prev => !prev);
  };

  return (
    <div className="active-chords-list-container mb-2">
      {activeChords.length ? (
        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted">
            Drag to reorder
          </div>
          <button 
            className={`btn btn-sm btn-link ${removeMode ? '' : 'text-danger'}`}
            onClick={toggleRemoveMode}
          >
            {removeMode ? 'Done' : `Remove chord${activeChords.length > 1 ? 's' : ''}`}
          </button>
        </div>
      ) : null}
      {!removeMode ? (
        <DndContext 
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <SortableContext 
            items={activeChords}
            strategy={rectSortingStrategy}
          >
            <ul className="active-chords-list">
              {activeChords.map(chordId => (
                <SortableChordItem
                  key={chordId}
                  {...getChordData(chordId)}
                  highlight={highlight}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <ChordItem 
                {...getChordData(activeId)}
                highlight={highlight}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <ul className="active-chords-list">
          {activeChords.map(chordId => (
            <React.Fragment key={chordId}>
              <ChordItem 
                {...getChordData(chordId)}
                highlight={highlight}
              />
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};
