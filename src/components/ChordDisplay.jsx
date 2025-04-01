export const ChordDisplay = ({ info, index }) => {
  return (
    <>
      <span className="badge badge-top-left rounded-pill" style={{ backgroundColor: 'hotpink' }}>
        {index}
      </span>
      <strong>{info.tonic}{info.type}</strong>
      {info.roman && <span className="badge badge-top-right rounded-pill bg-info ms-2">{info.roman}</span>}
      <div className="mt-2">{info.notes}</div>
    </>
  );
}; 