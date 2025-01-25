import React, { useState } from 'react';
import { useChordContext } from '../context/ChordContext';
import { updateURL } from '../utils/url';

export const Title = () => {
  const { title, setTitle, tonic, scale, activeChords, highlight, modalInterchangeScale, triadRomans, seventhRomans } = useChordContext();
  const [isEditing, setIsEditing] = useState(!title);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateURL(tonic, scale, activeChords, highlight, modalInterchangeScale, triadRomans, seventhRomans, newTitle);
  };

  const handleDone = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mb-3" style={{ maxWidth: '400px' }}>
        <label htmlFor="title" className="form-label">Title</label>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={handleTitleChange}
          />
          <button onClick={handleDone} className="btn btn-sm btn-link px-0 ms-0">done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      {title ? (
        <>
          <h1 className="h3 mb-0">{title}</h1>
          <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-link my-0 py-0">edit</button>
        </>
      ) : (
        <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-link mx-0 px-0">Add title</button>
      )}
    </div>
  );
};
