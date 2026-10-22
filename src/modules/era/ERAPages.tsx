import { lazy, Suspense, type ReactNode } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ShieldAlert } from '@icons';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';
import { useLocation } from 'react-router-dom';

const SpecialEraPresentation=lazy(async()=>{const module=await import('../../special3/products/era/SpecialEraPages');return {default:module.SpecialEraPresentation}});
type SpecialEraView='overview'|'proposals'|'detail'|'create'|'funds';

function LegacyEraSuperseded(){return <AppShell title="ERA Governance" showBack wide><section className="vf-era-page" data-era-legacy="superseded"><div className="vf-era-detail-card" role="status"><ShieldAlert size={28}/><p className="eyebrow">Historical compatibility fallback</p><h2>Legacy ERA actions are superseded</h2><p>This boundary is read-only and non-transactional. Enable the SPECIAL 3.1 presentation to use provider-owned suggestion, review, voting, execution and fund flows.</p></div></section></AppShell>}
function Boundary({view,legacy}:{view:SpecialEraView;legacy:ReactNode}){return isSpecialProductPresentationEnabled('ERA')?<Suspense fallback={<AppShell title="ERA Governance"><div data-special3 role="status">Loading ERA presentation…</div></AppShell>}><SpecialEraPresentation view={view}/></Suspense>:legacy}

export const ERAPage=()=> <Boundary view="overview" legacy={<LegacyEraSuperseded/>}/>;
export const ProposalListPage=()=>{const route=useLocation();return <Boundary view={route.pathname==='/era/vote'?'detail':'proposals'} legacy={<LegacyEraSuperseded/>}/>};
export const ProposalDetailPage=()=> <Boundary view="detail" legacy={<LegacyEraSuperseded/>}/>;
export const CreateSuggestionPage=()=> <Boundary view="create" legacy={<LegacyEraSuperseded/>}/>;
export const EraFundsPage=()=> <Boundary view="funds" legacy={<LegacyEraSuperseded/>}/>;
