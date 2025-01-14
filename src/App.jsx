import React from 'react';
import { useWakeLock } from './hooks/useWakeLock';
import { updateURL } from './utils/url';
import { useChordContext } from './context/ChordContext';
import { ChordForm } from './components/ChordForm';
import { SeventhChordTable } from './components/SeventhChordTable';
import { ActiveChordsList } from './components/ActiveChordsList';
import { ChordMatrix } from './components/ChordMatrix';
import { ModalInterchangeTable } from './components/ModalInterchangeTable';

const App = () => {
  const {
    tonic,
    scale,
    activeCells,
    setActiveCells,
    highlight,
    modalInterchangeScale
  } = useChordContext();
  
  const [preventSleep, handlePreventSleep] = useWakeLock();

  const cellIsActive = (i, j) => activeCells.includes(`${i}-${j}`);

  const handleCellToggle = (i, j) => {
    const cellId = `${i}-${j}`;
    setActiveCells(activeCells => {
      const newActiveCells = activeCells.includes(cellId)
        ? activeCells.filter(item => item !== cellId)
        : [...activeCells, cellId];
      updateURL(tonic, scale, newActiveCells, highlight, modalInterchangeScale);
      return newActiveCells;
    });
  };

  return (
    <main className="main p-4">
      <ActiveChordsList />
      <ChordForm
        preventSleep={preventSleep}
        onPreventSleepChange={handlePreventSleep}
      />
      <ChordMatrix 
        handleCellToggle={handleCellToggle}
        cellIsActive={cellIsActive}
      />
      <div className="d-flex gap-4 mt-4">
        <ModalInterchangeTable />
      </div>
      <div className="d-flex gap-4 mt-4">
        <SeventhChordTable />
      </div>
    </main>
  )
};

export default App;
