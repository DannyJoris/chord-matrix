export const updateURL = (newTonic, newScale, newActiveCells, newHighlight) => {
  const params = new URLSearchParams();
  if (newTonic) params.set('tonic', newTonic);
  if (newScale) params.set('scale', newScale);
  if (newActiveCells.length) params.set('cells', newActiveCells.join(','));
  params.set('highlight', newHighlight.toString());
  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.pushState({}, '', newURL);
};

export const getInitialParamsFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    tonic: params.get('tonic') || '',
    scale: params.get('scale') || '',
    cells: params.get('cells') ? params.get('cells').split(',') : [],
    highlight: params.get('highlight') ? params.get('highlight') === 'true' : false
  };
};
