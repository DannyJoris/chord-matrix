import React from 'react';
import { useWakeLock } from './hooks/useWakeLock';
import { ChordForm } from './components/ChordForm';
import { SeventhChordTable } from './components/SeventhChordTable';
import { ActiveChordsList } from './components/ActiveChordsList';
import { ChordMatrix } from './components/ChordMatrix';
import { ModalInterchangeTable } from './components/ModalInterchangeTable';
import { ScaleType } from 'tonal';
const App = () => {
  const scales = ScaleType.names();
  console.log(scales);
  const [preventSleep, handlePreventSleep] = useWakeLock();

  return (
    <main className="main p-4">
      <ActiveChordsList />
      <ChordForm
        preventSleep={preventSleep}
        onPreventSleepChange={handlePreventSleep}
      />
      <ChordMatrix />
      <div className="d-flex gap-4 mt-4">
        <ModalInterchangeTable />
      </div>
      <div className="d-flex gap-4 mt-4">
        <ModalInterchangeTable showSevenths={true} width="1000px" />
      </div>
      <div className="d-flex gap-4 mt-4">
        <SeventhChordTable />
      </div>
    </main>
  )
};

export default App;
