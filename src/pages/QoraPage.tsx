import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, History, MessageSquareText, Plus, ShieldCheck, Tag, ThumbsDown, ThumbsUp } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { TextComposer } from '../components/qora/TextComposer';
import { TextShimmer } from '../components/qora/TextShimmer';
import { QoraActionCard } from '../components/qora/QoraActionCard';
import { MiniAppSheet } from '../components/qora/MiniAppSheet';
import { QoraOrb, type QoraOrbState } from '../components/qora/QoraOrb';
import { useWallet } from '../lib/wallet-context';
import { getQoraCopy, type AppLanguage } from '../lib/language';
import { getUiCopy } from '../lib/useAppLanguage';
import { defaultQoraContext } from '../qora/mockQoraService';
import type { QoraActionSchema, QoraMessage, QoraUserContext } from '../qora/types';
import { CenteredModal } from '../components/modals/CenteredModal';
import { IS_PREVIEW_MODE } from '../lib/contracts/contractConfig';
import { useJourney } from '../lib/journey/journey-context';
import { useEternityUserState } from '../lib/userState';
import { defaultMission } from '../lib/journey/missionRegistry';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { askGroundedQora } from '../special3/providers/qora';

const STORAGE_PREFIX = 'eternity:qora:v3';
const STORAGE_VERSION = 3;
const MAX_MESSAGES = 80;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const mission: QoraActionSchema = { id: 'continue-mission', kind: 'mission', moduleId: 'learning', title: 'Wallet safety', reason: 'Safety is the closest verified prerequisite for a new journey.', summary: 'Complete one short learning step before an economic action.', expectedOutcome: 'Improved readiness. Any EQ is resolved only from the verified Achievement source.', status: 'ready', primaryLabel: 'Continue', advancedRoute: '/readiness', requiresWallet: false };

type ConversationEnvelope = { version: number; updatedAt: number; messages: QoraMessage[] };

function anonymousSessionId() {
  const key = 'eternity-qora-anonymous-session';
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(key, created);
  return created;
}

function conversationKey(address: string | null, chainId: number | null, language: AppLanguage | null) {
  const environment = IS_PREVIEW_MODE ? 'preview' : 'production';
  const identity = address?.toLowerCase() ?? `anonymous:${anonymousSessionId()}`;
  return `${STORAGE_PREFIX}:${environment}:${chainId ?? 'no-chain'}:${identity}:${language ?? 'unselected'}`;
}

function loadMessages(key: string): QoraMessage[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '{}') as Partial<ConversationEnvelope>;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.messages)) return [];
    return parsed.messages.slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

function groundSpecialProgressionCopy(messages: QoraMessage[]) {
  if (!isSpecial3ShellEnabled()) return messages;
  return messages.map((message) => message.action ? { ...message, action:{ ...message.action, eqReward:undefined } } : message);
}

function cleanExpiredConversations() {
  const now = Date.now();
  Object.keys(window.localStorage).filter((key) => key.startsWith(`${STORAGE_PREFIX}:`)).forEach((key) => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? '{}') as Partial<ConversationEnvelope>;
      if (parsed.version !== STORAGE_VERSION || !parsed.updatedAt || now - parsed.updatedAt > MAX_AGE_MS) window.localStorage.removeItem(key);
    } catch {
      window.localStorage.removeItem(key);
    }
  });
}

export function QoraExperience({ initialPrompt: initialPromptOverride }: { initialPrompt?: string | null } = {}) {
  const [searchParams] = useSearchParams();
  const { isConnected, address, chainId } = useWallet();
  const user = useEternityUserState();
  const journey = useJourney();
  const activeMission = defaultMission(user);
  const referral = searchParams.get('ref');
  const language: AppLanguage = 'en';
  const [messages, setMessages] = useState<QoraMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QoraActionSchema | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const requestedView = searchParams.get('view');
  const [historyOpen, setHistoryOpen] = useState(requestedView === 'history');
  const [resumeTopic, setResumeTopic] = useState<string | null>(null);
  const [pendingGuestHistory, setPendingGuestHistory] = useState<QoraMessage[] | null>(null);
  const [newChatStarted, setNewChatStarted] = useState(false);
  const seededPrompt = useRef(false);
  const skipNextSave = useRef(true);
  const previousStorageKey = useRef<string | null>(null);
  const requestGeneration = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const copy = getQoraCopy(language ?? 'en');
  const ui = getUiCopy(language ?? 'en');
  const storageKey = useMemo(() => conversationKey(address, chainId, language), [address, chainId, language]);
  const topics = useMemo(() => buildSmartTopics(messages), [messages]);
  const context: QoraUserContext = useMemo(() => ({
    ...defaultQoraContext,
    userState:referral ? 'referred' : isConnected ? 'returning' : 'guest',
    referralCode:referral ?? undefined,
    walletConnected:isConnected,
    correctNetwork:user.correctNetwork,
    currentGoal:activeMission?.goal ?? 'Discover my next step',
    currentMissionId:journey.handoff?.missionId ?? activeMission?.id ?? 'onboarding',
    currentProductId:journey.handoff?.destinationProduct,
    currentOperation:journey.handoff?.expectedAction,
    formState:journey.handoff ? 'ready' : 'idle',
    journeyEntrySource:journey.handoff?.source ?? 'direct',
    recentImpact:journey.recentImpact?.impact.map((item) => item.label).join(' · '),
    level:user.level,
    eq:user.eq + journey.eqDelta,
    ...(!isConnected ? { currentGoal:'Discover my next step', currentMissionId:'onboarding', level:0, eq:0 } : {}),
  }), [activeMission?.goal, activeMission?.id, isConnected, journey.eqDelta, journey.handoff, journey.recentImpact, referral, user.correctNetwork, user.eq, user.level]);

  useEffect(() => {
    requestGeneration.current += 1;
    setThinking(false);
    cleanExpiredConversations();
    if (address && previousStorageKey.current?.includes(':anonymous:') && messages.length) {
      setPendingGuestHistory(messages);
    }
    skipNextSave.current = true;
    setMessages(groundSpecialProgressionCopy(loadMessages(storageKey)));
    setNewChatStarted(false);
    previousStorageKey.current = storageKey;
  // The scope change intentionally snapshots the previous session once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
    } else {
      const envelope: ConversationEnvelope = { version:STORAGE_VERSION, updatedAt:Date.now(), messages:messages.slice(-MAX_MESSAGES) };
      window.localStorage.setItem(storageKey, JSON.stringify(envelope));
    }
    endRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [messages, thinking, storageKey]);

  const send = useCallback(async (raw: string) => {
    const value = raw.trim(); if (!value || thinking) return;
    const generation = requestGeneration.current;
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'user', content: value, createdAt: new Date().toISOString() }]);
    setThinking(true);
    try {
      const response = await askGroundedQora(value, context);
      if (generation !== requestGeneration.current) return;
      const groundedAction = response.action && isSpecial3ShellEnabled() ? { ...response.action, eqReward:undefined } : response.action;
      setMessages((current) => [...current, { id: `q-${Date.now()}`, role: 'qora', content: response.text, createdAt: new Date().toISOString(), action:groundedAction }]);
      if (/\b(goal|want|learn|build|grow|start|protect|own|participate|improve)\b/i.test(value)) {
        const missionId = value.toLowerCase().includes('learn') ? 'mission-generator-foundation'
          : value.toLowerCase().includes('forecast') || value.toLowerCase().includes('participate') ? 'mission-forecast-participation'
          : value.toLowerCase().includes('own') ? 'mission-ownership-readiness'
          : 'mission-shield-foundation';
        journey.updateGoalFromQora(value, missionId);
      }
    } catch {
      if (generation !== requestGeneration.current) return;
      setMessages((current) => [...current, { id: `q-${Date.now()}`, role: 'qora', content: 'Connection paused. Nothing was submitted.', createdAt: new Date().toISOString(), action: { id: `recover-${Date.now()}`, kind: 'recovery', moduleId: 'wallet', title: 'Try again', reason: 'QORA is temporarily unavailable.', summary: 'Your wallet and conversation are safe.', expectedOutcome: 'Retry when the connection returns.', status: 'failure', primaryLabel: 'Retry' } }]);
    } finally {
      if (generation === requestGeneration.current) setThinking(false);
    }
  }, [context, journey, thinking]);

  const initialPrompt = initialPromptOverride ?? searchParams.get('prompt');
  useEffect(() => { if (initialPrompt && language && !seededPrompt.current) { seededPrompt.current = true; void send(initialPrompt); } }, [initialPrompt, language, send]);
  const reset = () => {
    requestGeneration.current += 1;
    window.localStorage.removeItem(storageKey);
    setMessages([]);
    setThinking(false);
    setResumeTopic(null);
    setNewChatStarted(true);
  };
  const feedback = (id: string, value: 'up' | 'down') => setMessages((current) => current.map((message) => message.id === id ? { ...message, feedback: message.feedback === value ? undefined : value } : message));
  const copyMessage = async (message: QoraMessage) => { await navigator.clipboard.writeText(message.content); setCopied(message.id); window.setTimeout(() => setCopied(null), 1200); };

  const suggestions = [
    { label: copy.start, prompt: 'I want to start' },
    { label: copy.learn, prompt: 'I want to learn' },
    { label: copy.guide, prompt: 'Guide me' },
  ];

  useEffect(() => {
    if (requestedView === 'history') setHistoryOpen(true);
    if (requestedView === 'actions') {
      setSelectedAction(mission);
      setNewChatStarted(true);
    }
  }, [requestedView]);

  const orbState: QoraOrbState = thinking ? 'thinking' : 'idle';

  return <div className="s3-qora-chat-app s3-qora-app" data-special3={isSpecial3ShellEnabled() || undefined} data-qora-provider={IS_PREVIEW_MODE ? 'preview-grounded' : 'live-unavailable'} dir="auto">
    <div className="s3-qora-main">
      {messages.length === 0 && !newChatStarted ? <section key="qora-start" className="s3-qora-start">
        <div className="s3-qora-identity"><QoraOrb size="standard" state={orbState}/></div>
        <h1>{isConnected ? copy.returning : 'Welcome to ETERNITY.'}</h1>
        {!isConnected && <p className="s3-qora-welcome-copy">A digital world where meaningful participation can build identity, value, ownership and influence. I’m QORA. You can explore safely and discover the right path without connecting a wallet.</p>}
        {referral && <div className="s3-qora-referral"><ShieldCheck size={16}/>Invite detected · you remain in control</div>}
        {isConnected && <button className="s3-qora-resume-mission" onClick={() => setSelectedAction(mission)}><span><small>Continue</small><strong>{mission.title}</strong></span><span className="s3-qora-mission-ring"><i>65%</i></span><ArrowRight size={18}/></button>}
        <div className="s3-qora-start-suggestions">{suggestions.map((item) => <button key={item.label} onClick={() => void send(item.prompt)}>{item.label}<ArrowRight size={15}/></button>)}</div>
        <div className="s3-qora-start-composer"><TextComposer language={language} onSend={(message) => void send(message)} disabled={thinking}/></div>
        <p className="s3-qora-safety-line"><ShieldCheck size={13}/>You approve every wallet action.</p>
      </section> : <section key="qora-conversation" className="s3-qora-conversation-view">
        <header><div><QoraOrb size="micro" state={orbState}/><span><h1 className="s3-qora-conversation-title">QORA</h1>{resumeTopic && <small>{resumeTopic}</small>}</span></div><div className="s3-qora-chat-tools"><button onClick={() => setHistoryOpen(true)} aria-label={ui.history}><History size={18}/><span>{ui.history}</span></button><button onClick={reset} aria-label={ui.newChat}><Plus size={20}/><span>{ui.newChat}</span></button></div></header>
        <div className="s3-qora-conversation-scroll" aria-live="polite" aria-busy={thinking}>
          {messages.length === 0 && <div className="s3-qora-new-chat-empty">
            <QoraOrb size="standard" state={orbState}/>
            <strong>Your new conversation is ready.</strong>
            <small>Write a message or choose one of the prompts below.</small>
          </div>}
          {messages.map((message) => <article key={message.id} className={`s3-qora-message is-${message.role}`}>
          <div className="s3-qora-message-content"><p dir="auto">{message.content}</p>{message.action && <QoraActionCard action={message.action} onOpen={() => setSelectedAction(message.action!)} onAsk={() => void send(`Explain ${message.action!.title} simply`)} onDismiss={() => setMessages((current) => current.map((item) => item.id === message.id ? { ...item, action: undefined } : item))}/>}<footer><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>{message.role === 'qora' && <div><button onClick={() => feedback(message.id, 'up')} aria-label="Helpful" className={message.feedback === 'up' ? 'active' : ''}><ThumbsUp size={14}/></button><button onClick={() => feedback(message.id, 'down')} aria-label="Not helpful" className={message.feedback === 'down' ? 'active' : ''}><ThumbsDown size={14}/></button><button onClick={() => void copyMessage(message)} aria-label="Copy response">{copied === message.id ? <Check size={14}/> : <Copy size={14}/>}</button></div>}</footer></div>
        </article>)}{thinking && <div className="s3-qora-thinking"><TextShimmer/></div>}<div ref={endRef}/></div>
        <footer className="s3-qora-conversation-composer">{!resumeTopic && <div className="s3-qora-conversation-funnels">{suggestions.map((item) => <button key={item.label} onClick={() => void send(item.prompt)}>{item.label}</button>)}</div>}{resumeTopic ? <div className="s3-qora-topic-choice"><span><Tag size={16}/><strong>{resumeTopic}</strong></span><div><button onClick={() => setResumeTopic(null)}>Continue conversation</button><button onClick={reset}>New conversation</button></div></div> : <TextComposer language={language} onSend={(message) => void send(message)} disabled={thinking}/>}</footer>
      </section>}
    </div>
    <MiniAppSheet action={selectedAction} onClose={() => setSelectedAction(null)}/>
    <ConversationHistory open={historyOpen} topics={topics} historyLabel={ui.history} onClose={() => setHistoryOpen(false)} onSelect={(topic) => { setResumeTopic(topic); setHistoryOpen(false); }}/>
    <CenteredModal open={Boolean(pendingGuestHistory)} onClose={() => setPendingGuestHistory(null)} title="Move guest history" maxWidth="max-w-md" closeLabel="Do not move guest history">
      <div className="qora-history-migration">
        <p>Guest history moves into this wallet scope only with your approval. Histories from different wallets are never combined.</p>
        <div>
          <button type="button" onClick={() => setPendingGuestHistory(null)}>Keep separate</button>
          <button type="button" onClick={() => { setMessages((current) => [...(pendingGuestHistory ?? []), ...current].slice(-MAX_MESSAGES)); setPendingGuestHistory(null); }}>Move history</button>
        </div>
      </div>
    </CenteredModal>
  </div>;
}

export function QoraPage() {
  const location = useLocation();
  const state = location.state as { initialPrompt?:string } | null;
  return <AppShell fillHeight wide noPadding><QoraExperience initialPrompt={state?.initialPrompt}/></AppShell>;
}

type SmartTopic = { label: string; count: number; preview: string };

function buildSmartTopics(messages: QoraMessage[]): SmartTopic[] {
  const rules = [
    { label: 'Learning', words: ['learn','course','edge','آموز'] },
    { label: 'Rewards', words: ['reward','earn','claim','پاداش','درآمد'] },
    { label: 'Identity', words: ['eid','identity','profile','هویت'] },
    { label: 'Community', words: ['fan','community','referral','کامیونیتی'] },
    { label: 'Ownership', words: ['shield','ownership','protect'] },
  ];
  const grouped = new Map<string, QoraMessage[]>();
  messages.forEach((message) => {
    const source = `${message.content} ${message.action?.moduleId ?? ''}`.toLowerCase();
    const label = rules.find((rule) => rule.words.some((word) => source.includes(word)))?.label ?? 'General';
    grouped.set(label, [...(grouped.get(label) ?? []), message]);
  });
  return [...grouped.entries()].map(([label, items]) => ({ label, count: items.length, preview: items[items.length - 1]?.content ?? '' })).slice(0, 8);
}

function ConversationHistory({ open, topics, historyLabel, onClose, onSelect }: { open: boolean; topics: SmartTopic[]; historyLabel: string; onClose: () => void; onSelect: (topic: string) => void }) {
  return <CenteredModal open={open} onClose={onClose} title={historyLabel} maxWidth="max-w-lg">
    <div className="s3-qora-history-sheet is-modal-content">
      <p>QORA groups conversations by topic.</p>
      <div>{topics.length ? topics.map((topic) => <button key={topic.label} onClick={() => onSelect(topic.label)}><span className="s3-qora-smart-tag"><Tag size={13}/>{topic.label}</span><strong>{topic.preview}</strong><small>{topic.count} messages</small><ArrowRight size={16}/></button>) : <div className="s3-qora-history-empty"><MessageSquareText size={28}/><strong>No conversations yet</strong><small>Your topics will appear here automatically.</small></div>}</div>
    </div>
  </CenteredModal>;
}
