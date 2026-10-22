export function revealLocalNavSelection(container: HTMLElement, selector: string): boolean {
  const active = container.querySelector<HTMLElement>(selector);
  if (!active) return false;
  const navRect = container.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const delta = activeRect.left < navRect.left
    ? activeRect.left - navRect.left
    : activeRect.right > navRect.right
      ? activeRect.right - navRect.right
      : 0;
  if (Math.abs(delta) <= 1) return false;
  container.scrollTo({ left:Math.max(0, container.scrollLeft + delta), behavior:'auto' });
  return true;
}
