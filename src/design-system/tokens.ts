export const colorRoles = [
  { token: '--color-brand', label: 'Brand', use: 'Primary action, focus and active navigation' },
  { token: '--color-positive', label: 'Positive', use: 'Confirmed, earned and healthy states' },
  { token: '--color-caution', label: 'Caution', use: 'Forecast, pending risk and attention' },
  { token: '--color-negative', label: 'Negative', use: 'Failure, destructive and irreversible states' },
  { token: '--surface-canvas', label: 'Canvas', use: 'Application background' },
  { token: '--surface-default', label: 'Surface', use: 'Cards, controls and content groups' },
  { token: '--content-primary', label: 'Content', use: 'Primary text and high-emphasis icons' },
  { token: '--content-secondary', label: 'Muted', use: 'Supporting copy and metadata' },
] as const;

export const spacingTokens = [
  ['1', '4px'], ['2', '8px'], ['3', '12px'], ['4', '16px'], ['5', '20px'], ['6', '24px'], ['8', '32px'], ['10', '40px'], ['12', '48px'], ['16', '64px'],
] as const;

export const motionTokens = [
  { token: '--motion-instant', value: '100ms', use: 'Press response' },
  { token: '--motion-fast', value: '160ms', use: 'Hover and control state' },
  { token: '--motion-standard', value: '220ms', use: 'Content transition' },
  { token: '--motion-slow', value: '320ms', use: 'Modal and route entrance' },
] as const;

export const layerTokens = [
  ['Base', '0'], ['Raised', '10'], ['Sticky header', '40'], ['Navigation', '50'], ['Popover', '100'], ['Modal', '1000'], ['Toast', '1100'],
] as const;
