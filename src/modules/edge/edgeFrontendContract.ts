export const EDGE_EXTERNAL_SOURCE = Object.freeze({
  package:'edge.zip',
  frontendRoot:'artifacts/edge-web/src',
  apiSpec:'lib/api-spec/openapi.yaml',
  runtimeBackendIntegrated:false,
  sessionBridge:'EDGE SESSION INTEGRATION REQUIRED',
});

export const EDGE_API_CAPABILITIES = Object.freeze({
  session:['GET /v1/auth/me', 'GET /v1/auth/siwe/nonce', 'POST /v1/auth/siwe/verify'],
  placement:['GET /v1/assessment/placement/questions', 'POST /v1/assessment/placement/submit', 'GET /v1/assessment/placement/result'],
  learning:['GET /v1/content/categories', 'GET /v1/content/categories/{categoryId}/modules', 'GET /v1/content/modules/{moduleId}/lessons', 'GET /v1/content/lessons/{lessonId}', 'POST /v1/content/lessons/{lessonId}/complete'],
  assessment:['POST /v1/content/lessons/{lessonId}/quiz-submit', 'GET /v1/content/lessons/{lessonId}/quiz-result'],
  scenarios:['GET /v1/scenarios/{ref}', 'POST /v1/scenarios/{ref}/start', 'POST /v1/scenarios/sessions/{session_id}/choose', 'GET /v1/scenarios/sessions/{session_id}/result'],
  path:['GET /v1/learning-path/roles', 'POST /v1/learning-path/role', 'GET /v1/learning-path/me'],
  credentials:['GET /v1/credentials/me', 'GET /v1/credentials/summary', 'GET /v1/credentials/{credentialId}/verify', 'GET /v1/verify/{verifiableId}'],
  leaderboard:['GET /v1/content/leaderboard'],
  eligibility:['GET /v1/eligibility/me'],
});

export type EdgeView = 'dashboard' | 'placement' | 'role' | 'learn' | 'catalogue' | 'category' | 'module' | 'lesson' | 'quiz' | 'scenario' | 'credentials' | 'verify' | 'leaderboard' | 'eligibility' | 'progress';

export function edgeViewFromRoute(pathname: string, requested: string | null): EdgeView {
  if (pathname === '/profile/certificates' || pathname === '/certificates') return 'credentials';
  if (['placement','role','learn','catalogue','category','module','lesson','quiz','scenario','credentials','verify','leaderboard','eligibility','progress'].includes(requested ?? '')) return requested as EdgeView;
  return 'dashboard';
}
