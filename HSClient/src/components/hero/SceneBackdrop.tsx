export function SceneBackdrop() {
  return (
    <div className="scene-backdrop" aria-hidden="true">
      <span className="scene-backdrop__stars scene-backdrop__stars--far" />
      <span className="scene-backdrop__stars scene-backdrop__stars--near" />
      <span className="scene-backdrop__haze scene-backdrop__haze--upper" />
      <span className="scene-backdrop__forest scene-backdrop__forest--far" />
      <span className="scene-backdrop__forest scene-backdrop__forest--mid" />
      <span className="scene-backdrop__forest scene-backdrop__forest--near" />
      <span className="scene-backdrop__ground" />
    </div>
  );
}
