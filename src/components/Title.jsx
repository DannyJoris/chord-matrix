import React, { useState, useEffect } from 'react';
import { useChordContext } from '../context/ChordContext';

export const Title = () => {
  const { title, setTitle } = useChordContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const handleTitleChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleDone = () => {
    setTitle(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter') {
      handleDone();
    }
  };

  useEffect(() => {
    setEditValue(title);
  }, [title, isEditing]);

  if (isEditing) {
    return (
      <div className="mb-3" style={{ maxWidth: '400px' }}>
        <label htmlFor="title" className="form-label">Title</label>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            className="form-control"
            id="title"
            value={editValue}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button onClick={handleDone} className="btn btn-sm btn-link px-0 mx-1">save</button>
          <button onClick={handleCancel} className="btn btn-sm btn-link px-0 mx-1">cancel</button>
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
