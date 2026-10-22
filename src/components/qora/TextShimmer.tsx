export function TextShimmer({ children = 'QORA is grounding your request…' }: { children?: string }) {
  return <p className="s3-text-shimmer" role="status" aria-live="polite">{children}</p>;
}
