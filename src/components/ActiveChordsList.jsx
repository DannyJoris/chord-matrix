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

export const ActiveChordsList = () => {
  const {
    tonic,
    scale,
    activeCells,
    setActiveCells,
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

  const getChordData = (cell) => {
    const [i, j] = cell.split('-').map(Number);
    const chord = chords[i]?.[j];
    
    if (!chord) return null;

    return {
      cell,
      info: getChordInfo(chord),
      chord,
      diatonic: isDiatonic(chord),
      modalInterchangeDiatonic: isModalInterchangeDiatonic(chord),
      nonDiatonicCount: nonDiatonicCounter(chord)
    };
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setActiveCells((items) => {
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
      {activeCells.length ? (
        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted">
            Drag to reorder
          </div>
          <button 
            className={`btn btn-sm btn-link ${removeMode ? '' : 'text-danger'}`}
            onClick={toggleRemoveMode}
          >
            {removeMode ? 'Done' : `Remove chord${activeCells.length > 1 ? 's' : ''}`}
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
            items={activeCells}
            strategy={rectSortingStrategy}
          >
            <ul className="active-chords-list">
              {activeCells.map(cell => {
                const [i, j] = cell.split('-').map(Number);
                return (
                  <SortableChordItem
                    key={cell}
                    {...getChordData(cell)}
                    highlight={highlight}
                  />
                );
              })}
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
          {activeCells.map(cell => (
            <React.Fragment key={cell}>
              <ChordItem 
                {...getChordData(cell)}
                highlight={highlight}
              />
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};