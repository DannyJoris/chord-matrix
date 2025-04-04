export const getIntervals = () => [
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

export const getEnharmonicIntervals = () => [
  "1P",
  "2m/9m",               // 1 semitone
  "2M",                  // 2 semitones
  "2A/3m/9A/10m",        // 3 semitones
  "3M/10M",              // 4 semitones
  "4P/11P",              // 5 semitones
  "4A/5d/11A",           // 6 semitones (tritone)
  "5P/12P",              // 7 semitones
  "5A/6m",               // 8 semitones
  "6M/13m",              // 9 semitones
  "6A/7m/13M",           // 10 semitones
  "7M",                  // 11 semitones
  "8P",                  // 12 semitones
];
