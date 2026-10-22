import type { QoraPresentationContext } from '../shell/QoraShellContext';
import type { PathPreference } from './pathPreference';

export interface PathQoraGuidance {
  presentation: QoraPresentationContext;
  initialPrompt: string;
}

export const pathQoraGuidance: Readonly<Record<PathPreference, PathQoraGuidance>> = {
  investment: {
    presentation: {
      kind: 'path',
      id: 'investment',
      eyebrow: 'QORA · Investment Path',
      title: 'Investment Path guidance',
      description: 'Build a disciplined capital plan before committing to higher-risk positions.',
      planningFocus: 'I can help you define allocation goals, risk boundaries, and a first review step.',
    },
    initialPrompt: 'I selected the Investment Path. Help me define an investment objective, risk boundaries, and practical next steps.',
  },
  stockholder: {
    presentation: {
      kind: 'path',
      id: 'stockholder',
      eyebrow: 'QORA · Stockholder Path',
      title: 'Stockholder Path guidance',
      description: 'Understand ownership, participation, and long-term value responsibilities.',
      planningFocus: 'I can help you review ownership goals, participation choices, and readiness questions.',
    },
    initialPrompt: 'I selected the Stockholder Path. Explain the ownership journey and help me prepare a responsible participation plan.',
  },
  earn: {
    presentation: {
      kind: 'path',
      id: 'earn',
      eyebrow: 'QORA · Earn Path',
      title: 'Earn Path guidance',
      description: 'Explore sustainable reward opportunities that match your current readiness.',
      planningFocus: 'I can help you compare earning objectives, requirements, and a measured next step.',
    },
    initialPrompt: 'I selected the Earn Path. Help me clarify an earning objective, its requirements, and a sustainable next step.',
  },
  learn: {
    presentation: {
      kind: 'path',
      id: 'learn',
      eyebrow: 'QORA · Learn Path',
      title: 'Learn Path guidance',
      description: 'Build knowledge and readiness before higher-risk actions.',
      planningFocus: 'I can help you choose a learning objective and prepare the next steps.',
    },
    initialPrompt: 'I selected the Learn Path. Help me choose a learning objective and prepare a focused next-step plan.',
  },
  development: {
    presentation: {
      kind: 'path',
      id: 'development',
      eyebrow: 'QORA · Development Path',
      title: 'Development Path guidance',
      description: 'Turn capability goals into a practical build-and-contribute roadmap.',
      planningFocus: 'I can help you define a development outcome, milestones, and a safe starting task.',
    },
    initialPrompt: 'I selected the Development Path. Help me define a development outcome, milestones, and a practical starting task.',
  },
};

export function getPathQoraGuidance(path: PathPreference) {
  return pathQoraGuidance[path];
}
