export const updateURL = (
  tonic,
  scale,
  chordIds,
  highlight,
  modalInterchangeScale,
  triadRomans,
  seventhRomans,
  title
) => {
  const params = new URLSearchParams();
  if (tonic) params.set('to', tonic);
  if (scale) params.set('s', scale);
  if (chordIds.length) params.set('ch', chordIds.join(','));
  if (highlight) params.set('hl', '1');
  if (modalInterchangeScale) params.set('mis', modalInterchangeScale);
  if (triadRomans) params.set('tr', '1');
  if (seventhRomans) params.set('sr', '1');
  if (title) params.set('t', title);
  
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
};

export const getInitialParamsFromURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    tonic: searchParams.get('to') || '',
    scale: searchParams.get('s') || '',
    modalInterchangeScale: searchParams.get('mis') || '',
    chordIds: searchParams.get('ch')?.split(',').filter(Boolean) || [],
    highlight: searchParams.get('hl') === '1',
    triadRomans: searchParams.get('tr') === '1',
    seventhRomans: searchParams.get('sr') === '1',
    title: searchParams.get('t') || ''
  };
};
