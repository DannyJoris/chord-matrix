import { useState, useCallback } from 'react';
import { updateURL } from '../utils/url';

export const useURLState = (initialState, key) => {
  const [state, setState] = useState(initialState);

  const setValue = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(state) : value;
    setState(newValue);
    updateURL({ [key]: newValue });
  }, [key, state]);

  return [state, setValue];
}; 
