export function RouteLoading() {
  return (
    <div className="s3-route-pending" role="status" aria-live="polite" aria-label="Preparing ETERNITY route">
      <span className="s3-route-pending__line" aria-hidden="true"/>
      <span className="sr-only">Preparing ETERNITY route…</span>
    </div>
  );
}
