import { useState, useCallback } from 'react';
import { updateURL } from '../utils/url';

export const useURLState = (initialState, key) => {
  const [state, setState] = useState(initialState);

  const setValue = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(state) : value;
    setState(newValue);
    // For arrays, ensure they're properly handled in the URL
    if (Array.isArray(newValue)) {
      updateURL({ [key]: [...newValue] });
    } else {
      updateURL({ [key]: newValue });
    }
  }, [key, state]);

  return [state, setValue];
}; 
