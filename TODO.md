# TODO

## UI Improvements
- Update cell styling to fit badges better

## Scale Comparison Table
- Update/fix scale comparison badges
  - Add proper accidentals (♯/♭) to Roman numerals where needed
  - Reference: `src/context/ChordContext.jsx` lines 80-120 (isDiatonicAddRoman function)
  - Ensure badges are properly positioned with updated cell styling
  - Consider different badge colors for different scale degrees
  - Make chords in the table clickable
  - Add 7th chords to the table

## Internal Logic  
- Update internal identifier for selected chord
  - Currently using basic string format ("i-j")
  - Switch to more semantic identifier
  - Update all related components that use cell identifiers
  - Reference: `src/components/ChordMatrix.jsx` lines 37-73 