export const updateURL = (updates = {}) => {
  const params = new URLSearchParams();
  
  const paramMap = {
    tonic: 'to',
    scale: 's',
    chordIds: 'ch',
    highlight: 'hl',
    modalInterchangeScale: 'mis',
    triadRomans: 'tr',
    seventhRomans: 'sr',
    title: 't'
  };

  // Get current params
  const current = getInitialParamsFromURL();
  const merged = { ...current, ...updates };

  // Set params based on merged values
  Object.entries(merged).forEach(([key, value]) => {
    const paramKey = paramMap[key];
    if (!paramKey) return;

    if (key === 'chordIds' && value.length) {
      params.set(paramKey, value.join(','));
    } else if (typeof value === 'boolean' && value) {
      params.set(paramKey, '1');
    } else if (value) {
      params.set(paramKey, value);
    }
  });
  
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
