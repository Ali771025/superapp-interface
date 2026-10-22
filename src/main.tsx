import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './special3/tokens/generated.css';
import './special3/products/qora/qora.css';
import App from './App.tsx';
import './styles/modules/product-surfaces.css';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/themes.css';
import './styles/typography.css';
import './styles/utilities.css';
import './styles/components/surfaces.css';
import './styles/components/controls.css';
import './styles/components/navigation.css';
import './styles/components/overlays.css';
// Historical rollback explorer stylesheet: ./styles/components/explorer.css
import './styles/layout.css';
// Historical rollback workspace stylesheet: ./styles/modules/workspaces.css
import './styles/modules/adaptive-fixes.css';
// Historical rollback styles remain in source and in their dedicated harnesses:
// ./styles/modules/journey-orchestration.css
// ./styles/modules/v-next.css
// ./styles/modules/experience-refinement.css
// ./styles/modules/mobile-unified-shell.css
// ./styles/modules/release-polish.css
import './special3/foundations/visual-foundations.css';
import './special3/reconstruction/phase17-5b.css';
import './special3/reconstruction/run-a-theme.css';
import { applyLanguage } from './lib/language';

applyLanguage('en');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
