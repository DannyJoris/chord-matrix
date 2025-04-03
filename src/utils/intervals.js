import { getChords } from './getChords';

export const getAllIntervals = () => [
  "1P",
  "2m",
  "2M",
  "2A / 3m",
  "3M",
  "4P",
  "4A / 5d",
  "5P",
  "5A / 6m",
  "6M",
  "6A / 7m",
  "7M",
  "8P",
  "9m",
  "9M",
  "9A / 10m",
  "10M",
  "11P",
  "11A",
  "12P",
  "13m",
  "13M"
];

export const getIntervalsFromChords = () => {
  const chords = getChords();
  const naturalSortIntervals = (intervals) => {
    return [...intervals].sort((a, b) => {
      // Extract numeric part and quality part
      const numA = parseInt(a.match(/^\d+/)[0], 10);
      const numB = parseInt(b.match(/^\d+/)[0], 10);

      // If numbers differ, sort by number
      if (numA !== numB) {
        return numA - numB;
      }

      const qualityA = a.replace(/^\d+/, '');
      const qualityB = b.replace(/^\d+/, '');
      
      // Define order for qualities
      const qualityOrder = { 'P': 1, 'm': 2, 'M': 3, 'd': 4, 'A': 5 };
      return (qualityOrder[qualityA] || 99) - (qualityOrder[qualityB] || 99);
    });
  };

  // Collect all unique interval symbols from the chords
  const allIntervals = naturalSortIntervals(
    chords.reduce((acc, chord) => {
      chord.intervals.forEach(interval => {
        if (!acc.includes(interval)) {
          acc.push(interval);
        }
      });
      return acc;
    }, [])
  );

  return allIntervals;
};