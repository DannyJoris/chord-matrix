import React, { useState, useMemo, useEffect } from 'react';
import { Chord, Note, Progression, Scale } from 'tonal';
import { useWakeLock } from './hooks/useWakeLock';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { getChromaticNotes, getSelectedNotes, getScales, replaceAccidental } from './utils/notes';
import { updateURL, getInitialParamsFromURL } from './utils/url';

const getChordMatrix = (tonic, scale) => {
  const chromaticNotes = getChromaticNotes();

  // Get the scale notes to determine sharp/flat preference
  const scaleNotes = scale && tonic ? Scale.get(`${tonic} ${scale}`).notes : [];
  const useFlats = scaleNotes.some(note => note.includes('b'));

  // Convert row headers based on scale preference
  const rowNotes = chromaticNotes.map(note => {
    if (useFlats && note.includes('#')) {
      return Note.enharmonic(note);
    }
    return note;
  });

  return rowNotes.map(note => {
    return [
      Chord.getChord('M', note),
      Chord.getChord('m', note),
      Chord.getChord('dim', note),
      Chord.getChord('7', note),
      Chord.getChord('maj7', note),
      Chord.getChord('m7', note),
      Chord.getChord('mM7', note),
      Chord.getChord('m7b5', note),
      Chord.getChord('aug', note),
      Chord.getChord('sus4', note),
      Chord.getChord('sus2', note),
      Chord.getChord('add9', note),
      Chord.getChord('madd9', note),
      Chord.getChord('maj13', note),
      Chord.getChord('13', note),
    ];
  });
};

// App Component.
const App = () => {
  // Get initial values from URL params
  const initialParams = getInitialParamsFromURL();
  const [tonic, setTonic] = useState(initialParams.tonic);
  const [scale, setScale] = useState(initialParams.scale);
  const [activeCells, setActiveCells] = useState(initialParams.cells);
  const [highlight, setHighlight] = useState(initialParams.highlight);
  const chords = useMemo(() => getChordMatrix(tonic, scale), [tonic, scale]);
  const [diatonicNotes, setDiatonicNotes] = useState([]);
  const [normalizedDiatonicNotes, setNormalizedDiatonicNotes] = useState([]);
  const [preventSleep, handlePreventSleep] = useWakeLock();
  const [activeId, setActiveId] = useState(null);
  const [removeMode, setRemoveMode] = useState(false);

  const cellIsActive = (i, j) => activeCells.includes(`${i}-${j}`);

  const handleCellToggle = (i, j) => {
    const cellId = `${i}-${j}`;
    setActiveCells(activeCells => {
      const newActiveCells = activeCells.includes(cellId)
        ? activeCells.filter(item => item !== cellId)
        : [...activeCells, cellId];
      updateURL(tonic, scale, newActiveCells, highlight);
      return newActiveCells;
    });
  };

  const handleTonic = (e) => {
    const value = e.target.value;
    setTonic(value);
    updateURL(value, scale, activeCells, highlight);
  };

  const handleScale = (e) => {
    const value = e.target.value;
    setScale(value);
    updateURL(tonic, value, activeCells, highlight);
  };

  const handleHighlight = (e) => {
    const newHighlight = e.target.checked;
    setHighlight(newHighlight);
    updateURL(tonic, scale, activeCells, newHighlight);
  };

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
      const normalizedChordRoot = Note.simplify(chord.notes[0]);
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

  const getSeventhChordTable = (diatonicNotes) => {
    if (!diatonicNotes.length) return null;

    const rows = [];
    // Create 4 rows, each starting from a different position in the scale
    for (let rowCount = 0; rowCount < 4; rowCount++) {
      const row = [];
      for (let colCount = 0; colCount < 7; colCount++) {
        const noteIndex = (rowCount * 2 + colCount) % 7;
        row.push(diatonicNotes[noteIndex]);
      }
      rows.push(row);
    }

    // Create seventh chords from columns
    const seventhChords = [];
    const triads = [];
    for (let col = 0; col < 7; col++) {
      const chordNotes = rows.map(row => row[col]);
      // Use Chord.detect to get the chord symbol
      const chordTypes = Chord.detect(chordNotes);
      const chord = Chord.get(chordTypes[0]);
      // Get upper structure triad by using only last 3 notes of the column
      const triadNotes = chordNotes.slice(-3);
      const triadTypes = Chord.detect(triadNotes);
      const triad = Chord.get(triadTypes[0]);
      seventhChords.push(isDiatonicAddRoman(chord));
      triads.push(triad.aliases[0]);
    }

    return (
      <table className="table table-bordered" style={{ width: '680px' }}>
        <tbody>
          <tr>
            {seventhChords.map((roman, i) => (
              <td key={i}><span className="badge rounded-pill bg-info">{roman}</span></td>
            ))}
            <th>7th Chord</th>
          </tr>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((note, j) => (
                <td key={j}>{replaceAccidental(note)}</td>
              ))}
              <th></th>
            </tr>
          ))}
          <tr>
            {triads.map((triad, i) => (
              <td key={i}><span className="badge rounded-pill bg-info">{triad}</span></td>
            ))}
            <th>Triad inside 7th</th>
          </tr>
        </tbody>
      </table>
    );
  };

  const getChordInfo = (i, j) => {
    if (!chords[i] || !chords[i][j]) return null;

    const chord = chords[i][j];
    const roman = isDiatonicAddRoman(chord);
    const notes = chord.notes.map(note => replaceAccidental(note)).join(' ');

    return {
      tonic: replaceAccidental(chord.tonic),
      type: chord.aliases[0],
      roman,
      notes
    };
  };

  // Create a new SortableItem component
  const SortableChordItem = ({ cell, info, chord, diatonic, nonDiatonicCount, highlight }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cell });
    if (!cell) return null;
    const [i, j] = cell.split('-').map(Number);
    const [width, setWidth] = React.useState(null);
    const itemRef = React.useRef(null);
    
    React.useEffect(() => {
      if (itemRef.current && !width) {
        setWidth(itemRef.current.getBoundingClientRect().width);
      }
    }, []);
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li
        ref={(el) => {
          setNodeRef(el);
          itemRef.current = el;
        }}
        style={style}
        {...attributes}
        {...listeners}
        className={[
          'active-chords-list-item',
          isDragging ? 'dragging' : '',
          highlight ? 'highlight' : '',
          diatonic ? 'cell-diatonic' : '',
          nonDiatonicCount === 1 && highlight ? 'cell-non-diatonic-1' : ''
        ].join(' ')}
      >
        {cellIsActive(i, j) && (
          <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
            {activeCells.indexOf(`${i}-${j}`) + 1}
          </span>
        )}
        <strong>{info.tonic}{info.type}</strong>
        {info.roman && <span className="badge badge-top-right rounded-pill bg-info ms-2">{info.roman}</span>}
        <div className="mt-2">{info.notes}</div>
      </li>
    );
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setActiveCells((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        updateURL(tonic, scale, newItems, highlight);
        return newItems;
      });
    }
  };

  const renderChordItem = (cell) => {
    if (!cell) return null;
    const [i, j] = cell.split('-').map(Number);
    const info = getChordInfo(i, j);
    if (!info) return null;

    const chord = chords[i][j];
    const diatonic = isDiatonic(chord);
    const nonDiatonicCount = nonDiatonicCounter(chord);

    return (
      <li className={[
        'active-chords-list-item',
        'active-chords-list-item-remove-mode',
        diatonic ? 'cell-diatonic' : '',
        nonDiatonicCount === 1 && highlight ? 'cell-non-diatonic-1' : ''
      ].join(' ')}>
        <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
          {activeCells.indexOf(cell) + 1}
        </span>
        <strong>{info.tonic}{info.type}</strong>
        {info.roman && <span className="badge badge-top-right rounded-pill bg-info ms-2">{info.roman}</span>}
        <div className="mt-2">{info.notes}</div>
        {removeMode && (
          <button className="btn btn-sm btn-link text-danger px-0" onClick={() => handleRemoveChord(cell)}>
            Remove
          </button>
        )}
      </li>
    );
  };

  const toggleRemoveMode = () => {
    setRemoveMode(prev => !prev);
  };

  const handleRemoveChord = (cell) => {
    if (!removeMode) return;
    console.log('remove chord', cell);
    setActiveCells(cells => {
      const newCells = cells.filter(c => c !== cell);
      updateURL(tonic, scale, newCells, highlight);
      return newCells;
    });
  };

  return (
    <main className="main p-4">
      <div className="active-chords-list-container">
        {activeCells.length ? (
          <div className="d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Drag to reorder
            </div>
            <button 
              className={`btn btn-sm btn-link ${removeMode ? '' : 'text-danger'}`}
              onClick={toggleRemoveMode}
            >
              {removeMode ? 'Done' : `Remove chord${activeCells.length > 1 ? 's' : ''}`}
            </button>
          </div>
        ) : null}
        {!removeMode ? (
          <DndContext 
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[
              restrictToParentElement
            ]}
          >
            <SortableContext 
              items={activeCells}
              strategy={rectSortingStrategy}
            >
              <ul className="active-chords-list">
                {activeCells.map(cell => (
                  <SortableChordItem
                    key={cell}
                    cell={cell}
                    info={getChordInfo(...cell.split('-').map(Number))}
                    chord={chords[cell.split('-')[0]][cell.split('-')[1]]}
                    diatonic={isDiatonic(chords[cell.split('-')[0]][cell.split('-')[1]])}
                    nonDiatonicCount={nonDiatonicCounter(chords[cell.split('-')[0]][cell.split('-')[1]])}
                    highlight={highlight}
                  />
                ))}
              </ul>
            </SortableContext>
            <DragOverlay>
              {activeId ? renderChordItem(activeId) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <ul className="active-chords-list">
            {activeCells.map(cell => renderChordItem(cell))}
          </ul>
        )}
      </div>
      <form className="form">
        <div className="form-group-left">
          <div>
            <label
              className="form-check-label"
              htmlFor="tonic"
            >
              Tonic
            </label>
            <select
              id="tonic"
              className="form-select"
              onChange={handleTonic}
              value={tonic}
            >
              <option value="">-- Select tonic --</option>
              {getSelectedNotes().map(note => (
                <option
                  key={note}
                  value={note}
                >
                  {replaceAccidental(note)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="form-check-label"
              htmlFor="scale"
            >
              Scale
            </label>
            <select
              id="scale"
              className="form-select"
              onChange={handleScale}
              value={scale}
            >
              <option value="">-- Select scale --</option>
              {getScales().map(scale => (
                <option
                  key={scale}
                  value={scale}
                >
                  {scale}
                </option>
              ))}
            </select>
          </div>
          {diatonicNotes.length ? (
            <div>
              <h3 className="h5">Diatonic notes</h3>
              {diatonicNotes.map((note) => replaceAccidental(note)).join(' ')}
            </div>
          ) : null}
        </div>
        <div className="form-group-right">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="highlight"
              checked={highlight}
              onChange={handleHighlight}
            />
            <label className="form-check-label" htmlFor="highlight">
              Highlight chords with 1 non-diatonic note
            </label>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="preventSleepToggle"
              checked={preventSleep}
              onChange={handlePreventSleep}
            />
            <label className="form-check-label" htmlFor="preventSleepToggle">
              Prevent Sleep
            </label>
          </div>
        </div>
      </form>
      <div className="table-container-wrapper">
        <div className="table-container">
          <table className="table table-bordered mb-4 overflow-table">
            <thead>
              <tr>
                <th key="empty"></th>
                {chords[0].map((set, i) => (
                  <th key={i}>
                    <div>{set.aliases[0]}</div>
                    <span className="intervals">{set.intervals.join(' ')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chords.map((noteSet, i) => (
                <tr key={i}>
                  <th>
                    {replaceAccidental(noteSet[0].tonic)}
                  </th>
                  {noteSet.map((chord, j) => {
                    const chordNotes = chord.notes.map((note) => replaceAccidental(note)).join(' ');
                    const roman = isDiatonicAddRoman(chord);
                    const diatonic = isDiatonic(chord);
                    return (
                      <td
                        key={j}
                        onClick={() => handleCellToggle(i, j)}
                        className={[
                          cellIsActive(i, j) ? 'cell-toggle' : '',
                          highlight ? 'highlight' : '',
                          diatonic ? 'cell-diatonic' : '',
                          nonDiatonicCounter(chord) === 1 && highlight ? 'cell-non-diatonic-1' : ''
                        ].join(' ')}
                      >
                        {cellIsActive(i, j) && (
                          <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
                            {activeCells.indexOf(`${i}-${j}`) + 1}
                          </span>
                        )}
                        {roman ? (
                          <span className="badge badge-top-right rounded-pill bg-info">
                            {roman}
                          </span>
                        ) : null}
                        {chordNotes}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="d-flex gap-4 mt-4">
        <div className="table-container-wrapper">
          <div className="table-container">
            {getSeventhChordTable(diatonicNotes)}
          </div>
        </div>
      </div>
    </main>
  )
};

export default App;
