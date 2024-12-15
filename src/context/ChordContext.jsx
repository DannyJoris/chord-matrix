import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Scale, Note } from 'tonal';
import { getInitialParamsFromURL } from '../utils/url';
import { getChordMatrix } from '../utils/chordMatrix';

const ChordContext = createContext(null);

export const ChordProvider = ({ children }) => {
  const initialParams = getInitialParamsFromURL();
  const [tonic, setTonic] = useState(initialParams.tonic);
  const [scale, setScale] = useState(initialParams.scale);
  const [activeCells, setActiveCells] = useState(initialParams.cells);
  const [highlight, setHighlight] = useState(initialParams.highlight);
  const [diatonicNotes, setDiatonicNotes] = useState([]);
  const [normalizedDiatonicNotes, setNormalizedDiatonicNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [removeMode, setRemoveMode] = useState(false);

  const chords = useMemo(() => getChordMatrix(tonic, scale), [tonic, scale]);

  useEffect(() => {
    if (tonic && scale) {
      const scaleObj = Scale.get(`${tonic} ${scale}`);
      const notes = scaleObj.notes;
      const normalizedNotes = notes.map(note => Note.simplify(note));
      setNormalizedDiatonicNotes(normalizedNotes);
      setDiatonicNotes(notes);
    } else {
      setNormalizedDiatonicNotes([]);
      setDiatonicNotes([]);
    }
  }, [tonic, scale]);

  useEffect(() => {
    if (!activeCells.length) {
      setRemoveMode(false);
    }
  }, [activeCells]);

  const value = {
    tonic,
    setTonic,
    scale,
    setScale,
    activeCells,
    setActiveCells,
    highlight,
    setHighlight,
    diatonicNotes,
    normalizedDiatonicNotes,
    chords,
    activeId,
    setActiveId,
    removeMode,
    setRemoveMode
  };

  return (
    <ChordContext.Provider value={value}>
      {children}
    </ChordContext.Provider>
  );
};

export const useChordContext = () => {
  const context = useContext(ChordContext);
  if (!context) {
    throw new Error('useChordContext must be used within a ChordProvider');
  }
  return context;
};
