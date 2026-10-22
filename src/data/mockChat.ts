import type { ChatMessage } from '../lib/types';

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'msg_001',
    role: 'qora',
    content: "Hello, Alex. I'm QORA Agent — your guide inside the Eternity ecosystem. I can help you understand your assets, use features, and find your next best action. What would you like to do today?",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];

export const qoraSuggestedPrompts = [
  'What should I do today?',
  'Show my assets',
  'Show my insurance',
  'Show my rewards',
  'Am I ready to vote?',
  'Explain ETER simply',
  'Help me invite someone',
  'Show my FAN status',
  'Show my Forecast entries',
  'Show my EES stocks',
  'What should I learn next?',
];
