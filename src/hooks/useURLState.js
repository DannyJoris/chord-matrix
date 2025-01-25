import { useState, useCallback } from 'react';
import { updateURL } from '../utils/url';

export const useURLState = (initialState, key) => {
  const [state, setState] = useState(initialState);

  const setValue = useCallback((newValue) => {
    setState(newValue);
    updateURL({ [key]: newValue });
  }, [key]);

  return [state, setValue];
}; 
