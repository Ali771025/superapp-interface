/** Pure presentation resolver shared by runtime and source configuration tests. */
export function resolveProductPresentationEnabled(shellEnabled: boolean, value: string | undefined) {
  return shellEnabled && value !== 'legacy';
}
