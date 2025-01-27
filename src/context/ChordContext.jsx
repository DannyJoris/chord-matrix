import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Scale, Note } from 'tonal';
import { getInitialParamsFromURL } from '../utils/url';
import { getChordMatrix } from '../utils/chordMatrix';
import { useURLState } from '../hooks/useURLState';

const ChordContext = createContext(null);

export const ChordProvider = ({ children }) => {
  const initialParams = getInitialParamsFromURL();
  
  const [tonic, setTonic] = useURLState(initialParams.tonic, 'tonic');
  const [scale, setScale] = useURLState(initialParams.scale, 'scale');
  const [modalInterchangeScale, setModalInterchangeScale] = useURLState(initialParams.modalInterchangeScale, 'modalInterchangeScale');
  const [activeChords, setActiveChords] = useURLState(initialParams.chordIds, 'chordIds');
  const [highlight, setHighlight] = useURLState(initialParams.highlight, 'highlight');
  const [triadRomans, setTriadRomans] = useURLState(initialParams.triadRomans, 'triadRomans');
  const [seventhRomans, setSeventhRomans] = useURLState(initialParams.seventhRomans, 'seventhRomans');
  const [title, setTitle] = useURLState(initialParams.title, 'title');
  
  const [diatonicNotes, setDiatonicNotes] = useState([]);
  const [normalizedDiatonicNotes, setNormalizedDiatonicNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [removeMode, setRemoveMode] = useState(false);
  const [modalInterchangeDiatonicNotes, setModalInterchangeDiatonicNotes] = useState([]);
  const [normalizedModalInterchangeDiatonicNotes, setNormalizedModalInterchangeDiatonicNotes] = useState([]);
  const [showAllRomans, setShowAllRomans] = useState(initialParams.showAllRomans);

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
    if (tonic && modalInterchangeScale) {
      const scaleObj = Scale.get(`${tonic} ${modalInterchangeScale}`);
      const notes = scaleObj.notes;
      const normalizedNotes = notes.map(note => Note.simplify(note));
      setNormalizedModalInterchangeDiatonicNotes(normalizedNotes);
      setModalInterchangeDiatonicNotes(notes);
    } else {
      setNormalizedModalInterchangeDiatonicNotes([]);
      setModalInterchangeDiatonicNotes([]);
    }
  }, [tonic, modalInterchangeScale]);

  useEffect(() => {
    if (!activeChords.length) {
      setRemoveMode(false);
    }
  }, [activeChords]);

  const isDiatonic = (chord) => {
    const normalizedChordNotes = chord.notes.map(note => Note.simplify(note));
    return normalizedChordNotes.every(note =>
      normalizedDiatonicNotes.some(dNote =>
        Note.enharmonic(note) === dNote || note === dNote
      )
    );
  };

  const isModalInterchangeDiatonic = (chord) => {
    const normalizedChordNotes = chord.notes.map(note => Note.simplify(note));
    return normalizedChordNotes.every(note =>
      normalizedModalInterchangeDiatonicNotes.some(dNote =>
        Note.enharmonic(note) === dNote || note === dNote
      )
    );
  };

  const isDiatonicAddRoman = (chord, isModalInterchange = false) => {
    if (!['M', 'm', 'dim', '7', 'maj7', 'm7', 'm7b5'].includes(chord.aliases[0])) {
      return null;
    }

    const normalizedScaleNotes = isModalInterchange ? normalizedModalInterchangeDiatonicNotes : normalizedDiatonicNotes;

    if (isModalInterchange ? isModalInterchangeDiatonic(chord) : isDiatonic(chord)) {
      const normalizedChordRoot = Note.simplify(chord.tonic);
      const position = normalizedScaleNotes.findIndex(note =>
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

  const nonDiatonicCounter = (chord) => {
    const normalizedChordNotes = chord.notes.map(note => Note.simplify(note));
    return normalizedChordNotes.filter(note =>
      !normalizedDiatonicNotes.some(dNote =>
        Note.enharmonic(note) === dNote || note === dNote
      )
    ).length;
  };

  const chordIsActive = (chordId) => activeChords.includes(chordId);

  const handleChordToggle = useCallback((chordId) => {
    setActiveChords(prevChords => {
      if (prevChords.includes(chordId)) {
        return prevChords.filter(id => id !== chordId);
      }
      return [...prevChords, chordId];
    });
  }, [setActiveChords]);

  const value = {
    tonic,
    setTonic,
    scale,
    setScale,
    modalInterchangeScale,
    setModalInterchangeScale,
    activeChords,
    setActiveChords,
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
    isDiatonicAddRoman,
    modalInterchangeDiatonicNotes,
    normalizedModalInterchangeDiatonicNotes,
    isModalInterchangeDiatonic,
    chordIsActive,
    handleChordToggle,
    showAllRomans,
    setShowAllRomans,
    triadRomans,
    setTriadRomans,
    seventhRomans,
    setSeventhRomans,
    title,
    setTitle
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
