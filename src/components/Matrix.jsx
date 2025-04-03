import { useWakeLock } from '../hooks/useWakeLock';
import { ChordForm } from './ChordForm';
import { SeventhChordTable } from './SeventhChordTable';
import { ActiveChordsList } from './ActiveChordsList';
import { ChordMatrix } from './ChordMatrix';
import { ModalInterchangeTable } from './ModalInterchangeTable';

const Matrix = () => {
  const [preventSleep, handlePreventSleep] = useWakeLock();
  return (
    <>
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
    </>
  );
};

export default Matrix;