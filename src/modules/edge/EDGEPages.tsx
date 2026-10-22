import { lazy, Suspense } from 'react';
import { ArrowRight, Award, BookOpen, Check, Lock, Play, ShieldCheck } from '@icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { mockCertificates, mockTrustScore } from '../../data/mockAssets';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';
import { EDGE_WALLET_APPROVAL_LESSON } from './edgeProduct';

const paths = [
  { label: 'Web3 safety', progress: 85, icon: ShieldCheck },
  { label: 'Features', progress: 70, icon: BookOpen },
  { label: 'Governance', progress: 40, icon: Award },
  { label: 'Mentor', progress: 0, icon: Lock },
];

function LegacyReadinessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTopic = searchParams.get('topic');
  const activePath = requestedTopic === 'safety' ? paths[0] : paths[1];
  return <AppShell title="EDGE" showBack><div className="vf-edge-page">
    <section className="vf-edge-continue"><div className="vf-edge-visual"><span><BookOpen size={34}/></span><i style={{ width: `${activePath.progress}%` }}/></div><div><small>{requestedTopic === 'safety' ? 'Safety learning' : 'Continue learning'}</small><h1>{activePath.label}</h1><span>2 min · {activePath.progress}%</span><button type="button"><Play size={17}/>Continue</button></div></section>
    <section className="vf-edge-paths"><header><h2>Your paths</h2><span className="vf-trust-score">{mockTrustScore.score}<small>Trust</small></span></header><div>{paths.map(({ label, progress, icon: Icon }) => <button key={label} disabled={progress === 0}><span><Icon size={20}/></span><strong>{label}</strong><div><i style={{ width: `${progress}%` }}/></div><small>{progress ? `${progress}%` : 'Locked'}</small></button>)}</div></section>
    <section className="vf-edge-recommended"><span><ShieldCheck size={24}/></span><div><small>Recommended</small><strong>{EDGE_WALLET_APPROVAL_LESSON.title}</strong><em>{EDGE_WALLET_APPROVAL_LESSON.durationMinutes} min</em></div><button>Start<ArrowRight size={16}/></button></section>
    <section className="vf-edge-articles"><span><BookOpen size={24}/></span><div><small>Community knowledge</small><strong>Articles</strong><p>Read qualified perspectives, discover top Echoed work and follow practical ideas.</p></div><button onClick={() => navigate('/readiness/articles')}>Explore articles<ArrowRight size={16}/></button></section>
    <section className="vf-edge-certificates"><header><h2>Certificates</h2><button onClick={() => navigate('/profile/certificates')}>View all</button></header><div>{mockCertificates.slice(0, 2).map((cert) => <button key={cert.id}><span><Award size={21}/><i><Check size={10}/></i></span><strong>{cert.name}</strong><small>{cert.level}</small></button>)}</div></section>
  </div></AppShell>;
}

const SpecialEdgePage = lazy(async () => {
  const module = await import('../../special3/products/edge/SpecialEdgePage');
  return { default:module.SpecialEdgePage };
});

export function ReadinessPage() {
  if (!isSpecialProductPresentationEnabled('EDGE')) return <LegacyReadinessPage/>;
  return <Suspense fallback={<AppShell title="EDGE"><div data-special3 role="status">Loading EDGE presentation…</div></AppShell>}><SpecialEdgePage/></Suspense>;
}

export function TrustScorePage() {
  return <AppShell title="Trust" showBack><div className="vf-trust-page"><section><div className="vf-trust-ring" style={{ '--trust-progress': `${mockTrustScore.score * 3.6}deg` } as React.CSSProperties}><span><strong>{mockTrustScore.score}</strong><small>Trust</small></span></div><h1>{mockTrustScore.level}</h1></section><div>{mockTrustScore.factors.map((factor) => <article key={factor.label}><header><strong>{factor.label}</strong><span>{factor.value}/{factor.max}</span></header><div><i style={{ width: `${(factor.value / factor.max) * 100}%` }}/></div></article>)}</div></div></AppShell>;
}
