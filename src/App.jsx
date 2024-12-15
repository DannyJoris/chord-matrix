import React from 'react';
import { useWakeLock } from './hooks/useWakeLock';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { replaceAccidental } from './utils/notes';
import { updateURL } from './utils/url';
import { useChordContext } from './context/ChordContext';
import { ChordForm } from './components/ChordForm';
import { SeventhChordTable } from './components/SeventhChordTable';
import { ActiveChordsList } from './components/ActiveChordsList';
import { ChordMatrix } from './components/ChordMatrix';

const App = () => {
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
    isDiatonicAddRoman
  } = useChordContext();
  
  const [preventSleep, handlePreventSleep] = useWakeLock();

  const cellIsActive = (i, j) => activeCells.includes(`${i}-${j}`);

  const handleCellToggle = (i, j) => {
    const cellId = `${i}-${j}`;
    setActiveCells(activeCells => {
      const newActiveCells = activeCells.includes(cellId)
        ? activeCells.filter(item => item !== cellId)
        : [...activeCells, cellId];
      updateURL(tonic, scale, newActiveCells, highlight);
      return newActiveCells;
    });
  };

  const getChordInfo = (i, j) => {
    if (!chords[i] || !chords[i][j]) return null;

    const chord = chords[i][j];
    const roman = isDiatonicAddRoman(chord);
    const notes = chord.notes.map(note => replaceAccidental(note)).join(' ');

    return {
      tonic: replaceAccidental(chord.tonic),
      type: chord.aliases[0],
      roman,
      notes
    };
  };

  return (
    <main className="main p-4">
      <ActiveChordsList
        getChordInfo={getChordInfo}
      />
      <ChordForm
        preventSleep={preventSleep}
        onPreventSleepChange={handlePreventSleep}
      />
      <ChordMatrix 
        handleCellToggle={handleCellToggle}
        cellIsActive={cellIsActive}
      />
      <div className="d-flex gap-4 mt-4">
        <SeventhChordTable />
      </div>
    </main>
  )
};

export default App;
