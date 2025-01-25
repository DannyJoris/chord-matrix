export const updateURL = (
  tonic,
  scale,
  chordIds,
  highlight,
  modalInterchangeScale,
  triadRomans,
  seventhRomans
) => {
  const params = new URLSearchParams();
  if (tonic) params.set('tonic', tonic);
  if (scale) params.set('scale', scale);
  if (chordIds.length) params.set('chords', chordIds.join(','));
  if (highlight) params.set('highlight', highlight);
  if (modalInterchangeScale) params.set('modalInterchangeScale', modalInterchangeScale);
  if (triadRomans) params.set('triadRomans', triadRomans);
  if (seventhRomans) params.set('seventhRomans', seventhRomans);
  
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
};

export const getInitialParamsFromURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    tonic: searchParams.get('tonic') || '',
    scale: searchParams.get('scale') || '',
    modalInterchangeScale: searchParams.get('modalInterchangeScale') || '',
    chordIds: searchParams.get('chords')?.split(',').filter(Boolean) || [],
    highlight: searchParams.get('highlight') === 'true',
    triadRomans: searchParams.get('triadRomans') === 'true' || false,
    seventhRomans: searchParams.get('seventhRomans') === 'true' || false
  };
};
