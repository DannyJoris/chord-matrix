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

  const isDiatonic = (chord) => {
    const normalizedChordNotes = chord.notes.map(note => Note.simplify(note));
    return normalizedChordNotes.every(note =>
      normalizedDiatonicNotes.some(dNote =>
        Note.enharmonic(note) === dNote || note === dNote
      )
    );
  };

  const nonDiatonicCounter = (chord) => {
    const normalizedChordNotes = chord.notes.map(note => Note.simplify(note));
    return normalizedChordNotes.filter(note =>
      !normalizedDiatonicNotes.some(dNote =>
        Note.enharmonic(note) === dNote || note === dNote
      )
    ).length;
  };

  const isDiatonicAddRoman = (chord) => {
    if (!['M', 'm', 'dim', '7', 'maj7', 'm7', 'm7b5'].includes(chord.aliases[0])) {
      return null;
    }

    if (isDiatonic(chord)) {
      const normalizedChordRoot = Note.simplify(chord.tonic);
      const position = normalizedDiatonicNotes.findIndex(note =>
        Note.enharmonic(normalizedChordRoot) === note || normalizedChordRoot === note
      );

      if (position === -1) return null;
      
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      let roman = romans[position];
      
      if (!roman) return null;

      if (chord.quality === 'Minor') {
        roman = roman.toLowerCase();
      }
      if (chord.quality === 'Diminished' && chord.notes.length === 3) {
        roman = `${roman.toLowerCase()} dim`;
      }
      if (chord.quality === 'Augmented') {
        roman = `${roman}+`;
      }
      if (chord.aliases.includes('7')) {
        roman = `${roman} 7`;
      }
      if (chord.aliases.includes('m7')) {
        roman = `${roman} m7`;
      }
      if (chord.aliases.includes('maj7')) {
        roman = `${roman} maj7`;
      }
      if (chord.aliases.includes('m7b5')) {
        roman = `${roman.toLowerCase()} m7b5`;
      }
      return roman;
    }
    return null;
  };

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
    setRemoveMode,
    isDiatonic,
    nonDiatonicCounter,
    isDiatonicAddRoman
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
