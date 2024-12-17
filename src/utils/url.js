export const updateURL = (tonic, scale, cells, highlight, modalInterchangeScale) => {
  const params = new URLSearchParams();
  if (tonic) params.set('tonic', tonic);
  if (scale) params.set('scale', scale);
  if (modalInterchangeScale) params.set('modalInterchangeScale', modalInterchangeScale);
  if (cells.length) params.set('cells', cells.join(','));
  if (highlight) params.set('highlight', highlight);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
};

export const getInitialParamsFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    tonic: params.get('tonic') || '',
    scale: params.get('scale') || '',
    modalInterchangeScale: params.get('modalInterchangeScale') || '',
    cells: params.get('cells')?.split(',').filter(Boolean) || [],
    highlight: params.get('highlight') === 'true'
  };
};
