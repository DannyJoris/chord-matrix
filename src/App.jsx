import React from 'react';
import { useWakeLock } from './hooks/useWakeLock';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { replaceAccidental } from './utils/notes';
import { updateURL } from './utils/url';
import { useChordContext } from './context/ChordContext';
import { ChordForm } from './components/ChordForm';
import { SeventhChordTable } from './components/SeventhChordTable';

const App = () => {
  const {
    tonic,
    scale,
    activeCells,
    setActiveCells,
    highlight,
    chords,
    activeId,
    setActiveId,
    removeMode,
    setRemoveMode,
    isDiatonic,
    nonDiatonicCounter,
    isDiatonicAddRoman
  } = useChordContext();
  
  const [preventSleep, handlePreventSleep] = useWakeLock();

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
            {activeCells.map(cell => (
              <React.Fragment key={cell}>
                {renderChordItem(cell)}
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>
      <ChordForm
        preventSleep={preventSleep}
        onPreventSleepChange={handlePreventSleep}
      />
      <div className="table-container-wrapper">
        <div className="table-container">
          <table className="table table-bordered mb-4 overflow-table">
            <thead>
              <tr>
                <th key="empty"></th>
                {chords[0].map((set, i) => (
                  <th key={`header-${i}`}>
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
        <SeventhChordTable />
      </div>
    </main>
  )
};

export default App;
