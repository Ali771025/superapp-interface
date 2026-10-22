import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { resolveRuntimeBinding, stateFromHash } from '../convergence/runtimeBindings';
import { ModuleLocalNav, QoraContextStage } from './EternitySharedUI';
import { ProductContent, resolveSpec } from './internal/modules/ProductModuleContent';
import { InternalPatternRenderer } from './internal/patterns/PatternFrame';
import { resolveRunBSurfaceContract } from './internal/surfaceRegistry';
import { getModuleNavigation } from './moduleNavigation';
import './current-design-pages.css';
import './internal/internal-patterns.css';

export function CurrentDesignProductPage() {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const baseSpec = resolveSpec(location.pathname);
  const queryView = searchParams.get('view');
  const spec = baseSpec.family === 'edge' && queryView ? { ...baseSpec, view: queryView } : baseSpec;
  const canonicalState = stateFromHash(location.hash, 'overview');
  const binding = resolveRuntimeBinding(location.pathname, canonicalState);
  const contract = resolveRunBSurfaceContract(location.pathname);

  if (!contract) return <AppShell title={spec.title} wide showJourneyPresence={false}>
    <article className={`cd-page cd-page--${spec.family}`} data-current-design-renderer="phase17.5b.5.3.2" data-family={spec.family} data-view={spec.view} data-route={location.pathname} data-wireframe-id={binding.wireframeId} data-canonical-state={binding.state} data-resolved-component={binding.component}>
      <QoraContextStage title={spec.title} insight={spec.description}/>
      <ModuleLocalNav items={getModuleNavigation(spec.family)} family={spec.family}/>
      <ProductContent spec={spec} params={params} binding={binding}/>
    </article>
  </AppShell>;

  return <AppShell title={spec.title} wide showJourneyPresence={false}>
    <article
      className={`cd-page cd-page--${spec.family}`}
      data-current-design-renderer="run-b.pattern-orchestrator"
      data-family={spec.family}
      data-view={spec.view}
      data-route={location.pathname}
      data-wireframe-id={binding.wireframeId}
      data-canonical-state={binding.state}
      data-resolved-component={binding.component}
      data-run-b-contract={contract?.route ?? 'UNSCOPED'}
    >
      <InternalPatternRenderer
        contract={contract}
        family={spec.family}
        title={spec.title}
        description={spec.description}
      >
        <ProductContent spec={spec} params={params} binding={binding}/>
      </InternalPatternRenderer>
    </article>
  </AppShell>;
}
