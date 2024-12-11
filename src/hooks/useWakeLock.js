import { useState, useCallback } from 'react';

export const useWakeLock = () => {
  const [preventSleep, setPreventSleep] = useState(false);

  const handlePreventSleep = useCallback(() => {
    setPreventSleep(prev => !prev);
    
    const enableWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const lock = await navigator.wakeLock.request('screen');
          window.wakeLock = lock;
          lock.addEventListener('release', () => {
            console.log('Wake Lock was released');
            setPreventSleep(false);
          });
        } catch (err) {
          console.error(`Wake Lock error: ${err.name}, ${err.message}`);
          setPreventSleep(false);
        }
      } else {
        console.warn('Wake Lock API not supported in this browser.');
        setPreventSleep(false);
      }
    };

    const disableWakeLock = async () => {
      if (window.wakeLock) {
        try {
          await window.wakeLock.release();
          window.wakeLock = null;
        } catch (err) {
          console.error(`Wake Lock release error: ${err.name}, ${err.message}`);
        }
      }
    };

    if (!preventSleep) {
      enableWakeLock();
    } else {
      disableWakeLock();
    }
  }, [preventSleep]);

  return [preventSleep, handlePreventSleep];
}; 