import React from 'react';
import { getSelectedNotes, getScales, replaceAccidental } from '../utils/notes';
import { useChordContext } from '../context/ChordContext';
import { updateURL } from '../utils/url';

export const ChordForm = ({ preventSleep, onPreventSleepChange }) => {
  const {
    tonic,
    setTonic,
    scale,
    setScale,
    modalInterchangeScale,
    setModalInterchangeScale,
    activeChords,
    highlight,
    setHighlight,
    diatonicNotes,
    modalInterchangeDiatonicNotes
  } = useChordContext();

  const handleTonic = (e) => {
    const value = e.target.value;
    setTonic(value);
    updateURL(value, scale, activeChords, highlight, modalInterchangeScale);
  };

  const handleScale = (e) => {
    const value = e.target.value;
    setScale(value);
    updateURL(tonic, value, activeChords, highlight, modalInterchangeScale);
  };

  const handleHighlight = (e) => {
    const newHighlight = e.target.checked;
    setHighlight(newHighlight);
    updateURL(tonic, scale, activeChords, newHighlight, modalInterchangeScale);
  };

  const handleModalInterchange = (e) => {
    const value = e.target.value;
    setModalInterchangeScale(value);
    updateURL(tonic, scale, activeChords, highlight, value);
  };

  return (
    <form className="form">
      <div className="form-group-left">
        <div className="form-group-tonic">
          <label className="form-check-label" htmlFor="tonic">
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
              <option key={`note-${note}`} value={note}>
                {replaceAccidental(note)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group-scales">
          <div className="form-group-scales-scale">
            <div>
              <label className="form-check-label" htmlFor="scale">
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
                  <option key={`scale-${scale}`} value={scale}>
                    {scale}
                  </option>
                ))}
              </select>
            </div>
            {diatonicNotes.length ? (
              <div>
                <div>Diatonic notes</div>
                <div className="diatonic-notes">
                  {diatonicNotes.map((note, index) => (
                    <span key={`diatonic-${note}-${index}`}>
                      {replaceAccidental(note)}{index < diatonicNotes.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="form-group-scales-modal-interchange d-flex gap-2">
            <div>
              <label className="form-check-label" htmlFor="modal-interchange">
                Modal interchange
              </label>
              <select
                id="modal-interchange"
                className="form-select"
                onChange={handleModalInterchange}
                value={modalInterchangeScale}
              >
                <option value="">-- Select scale --</option>
                {getScales().map(scale => (
                  <option key={`scale-${scale}`} value={scale}>
                    {scale}
                  </option>
                ))}
              </select>
            </div>
            {modalInterchangeDiatonicNotes.length ? (
              <div>
                <div>Diatonic notes</div>
                <div className="diatonic-notes">
                  {modalInterchangeDiatonicNotes.map((note, index) => (
                    <span key={`diatonic-${note}-${index}`}>
                      {replaceAccidental(note)}{index < modalInterchangeDiatonicNotes.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
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
            onChange={onPreventSleepChange}
          />
          <label className="form-check-label" htmlFor="preventSleepToggle">
            Prevent Sleep
          </label>
        </div>
      </div>
    </form>
  );
};
