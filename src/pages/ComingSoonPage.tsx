import { ArrowLeft, Clock3 } from '@icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';

const titles: Record<string,string> = {
  '/qora/social-rewards': 'Social rewards · Coming soon',
  '/qora/circles': 'QORA Circles · Coming soon',
  '/qora/avatar': 'Adaptive avatar · Coming soon',
};

export function ComingSoonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const title = titles[location.pathname] ?? 'Coming soon';
  const description = 'This capability is not operational yet. It has not been redirected to an unrelated feature.';
  return <AppShell title={title} showBack>
    <section className="coming-soon-state">
      <span><Clock3 size={28}/></span>
      <h1>{title}</h1>
      <p>{description}</p>
      <button onClick={() => navigate(-1)}><ArrowLeft size={17}/>Go back</button>
    </section>
  </AppShell>;
}
