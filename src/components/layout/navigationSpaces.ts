export type NavigationSpace = 'journey' | 'world' | 'qora' | 'economy' | 'passport';

const routeGroups: Record<NavigationSpace, string[]> = {
  journey: ['/home', '/missions'],
  world: ['/world', '/fan', '/forecast', '/era', '/community', '/readiness', '/trust-score', '/certificates'],
  qora: ['/qora'],
  economy: ['/economy', '/assets', '/earn', '/generator', '/swap', '/shield', '/stock'],
  passport: ['/passport', '/profile', '/eid', '/achievements', '/progress', '/leaderboard'],
};

export function isSpaceActive(pathname: string, space: NavigationSpace) {
  return routeGroups[space].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
