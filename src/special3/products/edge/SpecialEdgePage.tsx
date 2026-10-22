import {
  AlertCircle, ArrowRight, Award, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCheck, GraduationCap, Layers3, ListTree, Lock, Medal, Play, RefreshCcw, Search, ShieldCheck,
  Target, Trophy, UserRoundCheck,
} from '@icons';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../../components/layout/AppShell';
import { IS_PREVIEW_MODE } from '../../../lib/contracts/contractConfig';
import { EDGE_API_CAPABILITIES, EDGE_EXTERNAL_SOURCE, edgeViewFromRoute, type EdgeView } from '../../../modules/edge/edgeFrontendContract';
import { edgePreviewFixture } from '../../../modules/edge/edgeSourcePreviewFixture';
import { Badge, Grid, Heading, Inline, Stack, Surface, Text } from '../../primitives';
import { FieldCarrier, FieldInput, LocalNav, PrimaryAction, SourceDisclosure } from '../../interaction';
import { SpecialMetricCard } from '../../ui/SpecialMetricCard';
import { ProductHeroActions } from '../ProductHeroActions';
import './edge.css';

type EdgeDataMode = 'preview' | 'live';
type NavigateView = (view: EdgeView, extra?: Record<string, string | null>) => void;
const fixture = edgePreviewFixture;
type PreviewRole = (typeof fixture.roles)[number];
const DEFAULT_PREVIEW_ROLE_SLUG = 'dao_member';

function resolvePreviewRole(value: string | null) {
  const fallback = fixture.roles.find((role) => role.slug === DEFAULT_PREVIEW_ROLE_SLUG) ?? fixture.roles[0];
  const normalizedValue = value === 'web3_developer' ? 'developer' : value;
  const role = fixture.roles.find((item) => item.slug === normalizedValue);
  return { role: role ?? fallback, valid: value === null || Boolean(role) };
}

function roleOrderedCategories(role: PreviewRole) {
  const focusOrder = new Map(role.focusAreas.map((title, index) => [title, index]));
  return [...fixture.categories].sort((left, right) => {
    const leftFocus = focusOrder.get(left.title);
    const rightFocus = focusOrder.get(right.title);
    if (leftFocus !== undefined || rightFocus !== undefined) return (leftFocus ?? 100 + left.order) - (rightFocus ?? 100 + right.order);
    return left.order - right.order;
  });
}

const previewDisclosure = { source:'mock' as const, freshness:'fresh' as const, label:'Preview · Source-derived EDGE fixture', detail:'Frontend QA data traces to edge.zip. It is not Live user progress.' };
const liveDisclosure = { source:'backend' as const, freshness:'unavailable' as const, label:'Live EDGE · session unavailable', detail:'The ETERNITY-to-EDGE authenticated session bridge is not configured.' };

type EdgeWorkspaceTemplateProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  status?: ReactNode;
  titleOwner?: string;
};

function EdgeWorkspaceTemplate({ children, className = '', eyebrow, title, intro, status }: EdgeWorkspaceTemplateProps) {
  return <section className={`s3-edge__view ${className}`.trim()} data-edge-workspace-title={title}>
    <header className="s3-edge__view-header">
      <Inline className="flex-wrap">{eyebrow && <Badge tone="primary">{eyebrow}</Badge>}{status}</Inline>
      <Heading level={2}>{title}</Heading>
      {intro && <Text tone="secondary">{intro}</Text>}
    </header>
    {children}
  </section>;
}

const OverviewTemplate = EdgeWorkspaceTemplate;
const BrowseTemplate = EdgeWorkspaceTemplate;
const DetailTemplate = EdgeWorkspaceTemplate;

function PreviewNotice({ role, roleQueryValid = true }: { role?: PreviewRole; roleQueryValid?: boolean } = {}) {
  return <Inline className="flex-wrap" data-edge-target-role={role?.slug} data-edge-role-query-valid={String(roleQueryValid)}><Badge tone="warning">Source-derived Preview</Badge>{role && <Badge tone="info">Target learning role · {role.label}</Badge>}{!roleQueryValid && <Badge tone="danger">Invalid role parameter · controlled default</Badge>}<Text variant="caption" tone="muted">Live EDGE session not connected · no Live progress</Text></Inline>;
}

function LiveUnavailable() {
  return <OverviewTemplate className="s3-edge" eyebrow="Live / authenticated mode" title="EDGE" titleOwner="shell" intro="Live EDGE data requires the authenticated ETERNITY-to-EDGE session bridge." status={<SourceDisclosure compact value={liveDisclosure}/>}>
    <Surface className="p-6" data-edge-session="integration-required"><Inline><AlertCircle/><div><Heading level={2}>{EDGE_EXTERNAL_SOURCE.sessionBridge}</Heading><Text tone="secondary">No source-derived Preview fixture is allowed to become Live data. API-backed progress and actions stay blocked until identity and authorization are configured.</Text><Text variant="caption" tone="muted">Required session capability: {EDGE_API_CAPABILITIES.session[0]}</Text></div></Inline></Surface>
  </OverviewTemplate>;
}

function Dashboard({ go, role }: { go: NavigateView; role: PreviewRole }) {
  const current = fixture.lessons[0];
  return <OverviewTemplate className="s3-edge" eyebrow="Learning and qualification layer" title="EDGE" titleOwner="shell" intro="Build Web3 capability through placement, role-aware learning, decisions and verifiable credentials." status={<SourceDisclosure compact value={previewDisclosure}/>}>
    <Stack gap={4}><PreviewNotice/>
      <Surface className="p-5"><Grid columns={2} gap={4}><div><Text variant="caption" tone="muted">Continue learning · 4 min</Text><Heading level={2}>{current.title}</Heading><Text tone="secondary">{current.objective}</Text><PrimaryAction className="mt-4 min-h-11 px-4" onClick={() => go('lesson')}>Continue Lesson <ArrowRight/></PrimaryAction></div><div className="grid grid-cols-2 gap-2"><Surface className="p-3"><Text variant="caption" tone="muted">Placement</Text><Text variant="label">Preview sample ready</Text></Surface><Surface className="p-3"><Text variant="caption" tone="muted">Target role</Text><Text variant="label">{role.label}</Text></Surface><Surface className="p-3"><Text variant="caption" tone="muted">Learning path</Text><Text variant="label">6 categories</Text></Surface><Surface className="p-3"><Text variant="caption" tone="muted">Credentials</Text><Text variant="label">1 source example</Text></Surface></div></Grid></Surface>
      <Grid columns={3} gap={3}>
        <Surface as="button" variant="interactive" className="min-h-36 p-4 text-left" onClick={() => go('placement')}><ClipboardCheck/><Heading level={3}>Placement</Heading><Text tone="secondary">18 questions · 6 domains in the authoritative bank.</Text><span className="mt-3 inline-flex items-center gap-1 text-primary-500">Start workflow <ArrowRight/></span></Surface>
        <Surface as="button" variant="interactive" className="min-h-36 p-4 text-left" onClick={() => go('scenario')}><Target/><Heading level={3}>Scenario decisions</Heading><Text tone="secondary">Practice consequences using the seeded branching model.</Text><span className="mt-3 inline-flex items-center gap-1 text-primary-500">Open Scenario <ArrowRight/></span></Surface>
        <Surface as="button" variant="interactive" className="min-h-36 p-4 text-left" onClick={() => go('eligibility')}><UserRoundCheck/><Heading level={3}>Role eligibility</Heading><Text tone="secondary">Locked, eligible and granted remain different states.</Text><span className="mt-3 inline-flex items-center gap-1 text-primary-500">Review roles <ArrowRight/></span></Surface>
      </Grid>
      <Surface className="p-4"><Inline><ShieldCheck/><div><Heading level={3}>Progression boundary</Heading><Text tone="secondary">Learning level, EDGE learning rank and Credential are EDGE records—not ETERNITY Level, Rank, Achievement or EQ.</Text></div></Inline></Surface>
    </Stack>
  </OverviewTemplate>;
}

type PlacementState = 'intro'|'question'|'result';
function Placement({ go, initial }: { go: NavigateView; initial: PlacementState }) {
  const questions = fixture.placement.previewQuestions;
  const [state, setState] = useState<PlacementState>(initial);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const question = questions[index];
  const score = questions.reduce((sum, item) => sum + (answers[item.id] === item.correctIndex ? 1 : 0), 0);
  return <DetailTemplate className="s3-edge" eyebrow="Source bank · 18 questions / 6 domains" title="Placement assessment" titleOwner="shell" intro="Preview demonstrates the actual assessment interaction using a traceable six-question cross-domain subset." status={<SourceDisclosure compact value={previewDisclosure}/>}>
    <Stack gap={4}><PreviewNotice/>
      {state === 'intro' && <Surface className="p-6 text-center" data-placement-state="intro"><ClipboardCheck className="mx-auto" size={40}/><Heading level={2}>Find the right learning start</Heading><Text tone="secondary">The Live Product uses 18 questions. This controlled Preview presents one source question from each of the six domains.</Text><Grid columns={3} gap={2} className="my-5"><Surface className="p-3"><Text variant="numeric">18</Text><Text variant="caption">Source questions</Text></Surface><Surface className="p-3"><Text variant="numeric">6</Text><Text variant="caption">Domains</Text></Surface><Surface className="p-3"><Text variant="numeric">~5</Text><Text variant="caption">Minutes</Text></Surface></Grid><PrimaryAction className="min-h-11 px-5" onClick={() => setState('question')}>Start Preview assessment <ArrowRight/></PrimaryAction></Surface>}
      {state === 'question' && <div data-placement-state="question"><Inline className="justify-between"><Text variant="caption">Question {index + 1} of {questions.length}</Text><Text variant="caption" tone="muted">{Object.keys(answers).length} answered</Text></Inline><div className="my-3 h-1.5 overflow-hidden rounded-full bg-[var(--s3-surface-raised)]"><div className="h-full bg-primary-500" style={{ width:`${((index + 1) / questions.length) * 100}%` }}/></div>
        <Surface className="p-5"><Badge tone="info">{question.categoryTitle}</Badge><Heading level={2} className="mt-3">{question.question}</Heading><div className="mt-4 grid gap-3">{question.options.map((option, optionIndex) => <button type="button" key={option} aria-pressed={answers[question.id] === optionIndex} className={`min-h-12 rounded-xl border p-3 text-left ${answers[question.id] === optionIndex ? 'border-primary-500 bg-primary-500/10' : 'border-[var(--s3-border)] bg-[var(--s3-surface)]'}`} onClick={() => setAnswers((current) => ({ ...current, [question.id]:optionIndex }))}><span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-current">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div></Surface>
        <Inline className="mt-4 justify-between"><button type="button" className="min-h-11 px-3" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}><ChevronLeft/> Previous</button>{index < questions.length - 1 ? <PrimaryAction className="min-h-11 px-4" onClick={() => setIndex((value) => value + 1)}>Next <ChevronRight/></PrimaryAction> : <PrimaryAction className="min-h-11 px-4" onClick={() => setState('result')}>Submit Preview <CheckCircle2/></PrimaryAction>}</Inline>
      </div>}
      {state === 'result' && <Surface className="p-6" data-placement-state="result"><Inline><CheckCircle2/><div><Text variant="caption" tone="muted">Deterministic Preview result · {score}/{questions.length} correct</Text><Heading level={2}>Learning level: {score >= 5 ? 'Intermediate' : 'Beginner'}</Heading></div></Inline><Text tone="secondary" className="mt-3">This result is calculated only from the displayed source-derived Preview subset and does not replace a Live placement record.</Text><Grid columns={2} gap={3} className="my-4">{questions.map((item) => <Surface key={item.id} className="p-3"><Text variant="label">{item.categoryTitle}</Text><Badge tone={answers[item.id] === item.correctIndex ? 'success' : 'neutral'}>{answers[item.id] === item.correctIndex ? 'Correct' : 'Review recommended'}</Badge></Surface>)}</Grid><Inline><button type="button" className="min-h-11 px-3" onClick={() => { setAnswers({}); setIndex(0); setState('question'); }}><RefreshCcw/> Retake Preview</button><PrimaryAction className="min-h-11 px-4" onClick={() => go('role')}>Choose target role <ArrowRight/></PrimaryAction></Inline></Surface>}
      <Surface className="p-4"><Text variant="label">QORA boundary</Text><Text tone="secondary">QORA may explain terminology and prepare you. It cannot select an answer or submit the assessment.</Text></Surface>
    </Stack>
  </DetailTemplate>;
}

function RoleSelection({ go, role, roleQueryValid }: { go: NavigateView; role: PreviewRole; roleQueryValid: boolean }) {
  return <BrowseTemplate className="s3-edge" eyebrow="Placement → target role → path" title="Role selection" titleOwner="shell" intro="Choose a source-defined role to organize the learning path. It never changes Profile Rank." status={<SourceDisclosure compact value={previewDisclosure}/>}> 
    <Stack gap={4}><PreviewNotice role={role} roleQueryValid={roleQueryValid}/><Grid columns={2} gap={3}>{fixture.roles.map((item) => <Surface as="button" variant="interactive" key={item.slug} className={`min-h-40 p-4 text-left ${role.slug === item.slug ? 'ring-2 ring-primary-500' : ''}`} onClick={() => go('role', { edgeRole:item.slug })} aria-pressed={role.slug === item.slug}><Inline className="justify-between"><Target/><Badge tone={role.slug === item.slug ? 'info' : 'neutral'}>{role.slug === item.slug ? 'Selected' : 'Available'}</Badge></Inline><Heading level={3}>{item.label}</Heading><Text tone="secondary">{item.description}</Text><div className="mt-3 flex flex-wrap gap-1">{item.focusAreas.map((focus) => <Badge key={focus} tone="neutral">{focus}</Badge>)}</div></Surface>)}</Grid><Surface className="p-4"><Inline className="justify-between"><div><Text variant="caption" tone="muted">Preview target learning role</Text><Heading level={3}>{role.label}</Heading><Text variant="caption" tone="muted">EDGE learning context only · no Profile Rank, DAO grant or ETERNITY Level change</Text></div><PrimaryAction className="min-h-11 px-4" onClick={() => go('learn', { edgeRole:role.slug })}>Confirm & view path <ArrowRight/></PrimaryAction></Inline></Surface></Stack>
  </BrowseTemplate>;
}

function LearningPath({ go, context, role, roleQueryValid }: { go: NavigateView; context: 'path'|'catalogue'|'category'|'module'; role: PreviewRole; roleQueryValid: boolean }) {
  const title = context === 'path' ? 'My learning path' : context === 'catalogue' ? 'Browse catalogue' : context === 'category' ? 'Web3 Fundamentals' : 'Blockchain Fundamentals';
  const categories = context === 'path' ? roleOrderedCategories(role) : fixture.categories;
  return <BrowseTemplate className="s3-edge" eyebrow="Category → Module → Lesson" title={title} titleOwner="shell" intro="The hierarchy and prerequisites come from the supplied EDGE content and role maps." status={<SourceDisclosure compact value={previewDisclosure}/>}> 
    <Stack gap={4}><PreviewNotice role={context === 'catalogue' ? undefined : role} roleQueryValid={roleQueryValid}/>
      {context === 'path' && <><Surface className="p-5" data-edge-learning-path-role={role.slug}><Inline className="justify-between"><div><Text variant="caption" tone="muted">Target learning role · Preview</Text><Heading level={2}>{role.label}</Heading><Text tone="secondary">Source focus areas are ordered first; all catalogue categories remain available.</Text><div className="mt-3 flex flex-wrap gap-1">{role.focusAreas.map((focus) => <Badge key={focus} tone="info">{focus}</Badge>)}</div></div><button type="button" className="min-h-11 px-3 text-primary-500" onClick={() => go('role')}>Change role</button></Inline></Surface><div className="grid gap-3">{categories.map((category, index) => { const prereqs = fixture.prerequisites[category.slug as keyof typeof fixture.prerequisites]?.requires ?? []; const locked = prereqs.length > 0; const focused = role.focusAreas.includes(category.title); return <Surface key={category.slug} className="p-4"><Inline className="justify-between"><Inline><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--s3-border)]">{locked ? <Lock/> : <Check/>}</span><div><Text variant="caption" tone="muted">{index + 1}. Category {locked ? `· prerequisite: ${prereqs.join(', ')}` : '· current'}</Text><Inline><Heading level={3}>{category.title}</Heading>{focused && <Badge tone="info">Role focus</Badge>}</Inline></div></Inline><button type="button" className="min-h-11 px-3 text-primary-500" onClick={() => go('category')}>Explore <ChevronRight/></button></Inline></Surface>; })}</div></>}
      {context === 'catalogue' && <Grid columns={3} gap={3}>{fixture.categories.map((category) => <Surface as="button" variant="interactive" key={category.slug} className="min-h-44 p-4 text-left" onClick={() => go('category')}><Layers3/><Heading level={3}>{category.title}</Heading><Text tone="secondary">{category.description}</Text></Surface>)}</Grid>}
      {context === 'category' && <><button type="button" className="min-h-11 self-start px-2" onClick={() => go('catalogue')}><ChevronLeft/> Catalogue</button><Grid columns={2} gap={3}>{fixture.modules.map((module) => <Surface as="button" variant="interactive" key={module.slug} className="min-h-40 p-4 text-left" onClick={() => go('module')}><ListTree/><Text variant="caption" tone="muted">Module {module.order}</Text><Heading level={3}>{module.title}</Heading><Text tone="secondary">{module.description}</Text></Surface>)}</Grid></>}
      {context === 'module' && <><button type="button" className="min-h-11 self-start px-2" onClick={() => go('category')}><ChevronLeft/> Web3 Fundamentals</button><div className="grid gap-3">{fixture.lessons.map((lesson, index) => <Surface key={lesson.id} className="p-4"><Inline className="justify-between"><Inline><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--s3-border)]">{index === 0 ? <Play/> : <Lock/>}</span><div><Text variant="caption" tone="muted">Lesson {lesson.order} · {lesson.estimatedDuration} min · Learning level: {lesson.learningLevel}</Text><Heading level={3}>{lesson.title}</Heading></div></Inline><button type="button" className="min-h-11 px-3 text-primary-500" onClick={() => go('lesson')}>{index === 0 ? 'Continue' : 'Preview'} <ChevronRight/></button></Inline></Surface>)}</div></>}
      <Inline className="flex-wrap"><button type="button" className="min-h-11 px-3" onClick={() => go('learn')}>My Path</button><button type="button" className="min-h-11 px-3" onClick={() => go('catalogue')}>Browse All</button></Inline>
    </Stack>
  </BrowseTemplate>;
}

function Lesson({ go, role, roleQueryValid }: { go: NavigateView; role: PreviewRole; roleQueryValid: boolean }) {
  const lesson = fixture.lessons[0];
  return <DetailTemplate className="s3-edge" eyebrow="Web3 Fundamentals / Blockchain Fundamentals" title={lesson.title} titleOwner="shell" intro={`${lesson.estimatedDuration} min · Learning level: ${lesson.learningLevel}`} status={<SourceDisclosure compact value={previewDisclosure}/>}>
    <Stack gap={4}><PreviewNotice role={role} roleQueryValid={roleQueryValid}/><Surface className="p-5"><Text variant="caption" tone="muted">Learning objective</Text><Heading level={2}>{lesson.objective}</Heading></Surface><Surface className="p-5"><Heading level={2}>Simple explanation</Heading><Text tone="secondary">{lesson.explanation}</Text><Heading level={3} className="mt-5">Practical example</Heading><Text tone="secondary">{lesson.practicalExample}</Text><Heading level={3} className="mt-5">Why it matters</Heading><Text tone="secondary">{lesson.relevance}</Text></Surface><Surface className="p-4"><Inline><AlertCircle/><div><Heading level={3}>Key warning</Heading><Text tone="secondary">{lesson.warning}</Text></div></Inline></Surface><Inline className="flex-wrap"><PrimaryAction className="min-h-11 px-4" onClick={() => go('quiz')}>Open Quiz <GraduationCap/></PrimaryAction><button type="button" className="min-h-11 px-4" onClick={() => go('scenario')}>Practice Scenario <Target/></button><button type="button" className="min-h-11 px-4" onClick={() => go('module')}>Back to Module</button></Inline><Text variant="caption" tone="muted">Preview cannot mark this Lesson complete. Live completion remains an authenticated Product action.</Text></Stack>
  </DetailTemplate>;
}

function Quiz({ role, roleQueryValid }: { role: PreviewRole; roleQueryValid: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const quiz = fixture.quiz;
  return <DetailTemplate className="s3-edge" eyebrow="Lesson assessment · source-derived Preview" title="Quick Quiz" titleOwner="shell" intro={quiz.question} status={<SourceDisclosure compact value={previewDisclosure}/>}>
    <Stack gap={4}><PreviewNotice role={role} roleQueryValid={roleQueryValid}/><Surface className="p-5" data-edge-quiz="source-derived"><div className="grid gap-3">{quiz.options.map((option, index) => <button key={option} type="button" aria-pressed={selected === index} disabled={submitted} className={`min-h-12 rounded-xl border p-3 text-left ${selected === index ? 'border-primary-500 bg-primary-500/10' : 'border-[var(--s3-border)]'}`} onClick={() => setSelected(index)}><span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-current">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{!submitted ? <PrimaryAction disabled={selected === null} className="mt-4 min-h-11 px-4" onClick={() => setSubmitted(true)}>Submit Preview answer</PrimaryAction> : <Surface className="mt-4 p-4"><Badge tone={selected === quiz.correctIndex ? 'success' : 'warning'}>{selected === quiz.correctIndex ? 'Correct' : 'Incorrect'}</Badge><Text tone="secondary" className="mt-2">{quiz.explanation}</Text></Surface>}</Surface><Surface className="p-4"><Text variant="label">QORA boundary</Text><Text tone="secondary">QORA may explain the concept after you decide. It cannot select or submit an answer.</Text></Surface></Stack>
  </DetailTemplate>;
}

function Scenario() {
  const scenario = fixture.scenario;
  const step = scenario.steps[0];
  const [choice, setChoice] = useState<number | null>(null);
  return <DetailTemplate className="s3-edge" eyebrow="Decision practice · source-derived Preview" title={scenario.title} titleOwner="shell" intro={scenario.situation} status={<SourceDisclosure compact value={previewDisclosure}/>}>
    <Stack gap={4}><PreviewNotice/><Surface className="p-5" data-edge-scenario={scenario.ref}><Text variant="caption" tone="muted">Situation / Step {step.order}</Text><Heading level={2}>{step.prompt}</Heading><Text tone="secondary">{step.context}</Text><div className="mt-4 grid gap-3">{step.choices.map((item, index) => <button type="button" key={item.label} disabled={choice !== null} className={`min-h-12 rounded-xl border p-3 text-left ${choice === index ? 'border-primary-500 bg-primary-500/10' : 'border-[var(--s3-border)]'}`} onClick={() => setChoice(index)}>{item.label}</button>)}</div></Surface>{choice !== null && <Surface className="p-5"><Inline className="justify-between"><Heading level={2}>Consequence</Heading><Badge tone={step.choices[choice].optimal ? 'success' : 'warning'}>{step.choices[choice].scoreImpact > 0 ? '+' : ''}{step.choices[choice].scoreImpact} Preview points</Badge></Inline><Text>{step.choices[choice].outcome}</Text><Text tone="secondary" className="mt-2">{step.choices[choice].feedback}</Text><button type="button" className="mt-4 min-h-11 px-3" onClick={() => setChoice(null)}><RefreshCcw/> Restart Preview step</button></Surface>}<Text variant="caption" tone="muted">Scenario points are EDGE Preview session results, not ETERNITY EQ.</Text></Stack>
  </DetailTemplate>;
}

function Credentials({ verify = false }: { verify?: boolean }) {
  const credential = fixture.credentialExample;
  const [value, setValue] = useState(verify ? credential.id : '');
  const [checked, setChecked] = useState(false);
  const found = checked && value === credential.id;
  return <DetailTemplate className="s3-edge" eyebrow={verify ? 'Public verification utility' : 'Read-only credential wallet'} title={verify ? 'Verify Credential' : 'Credentials'} titleOwner="shell" intro="Credential and verification fields are rendered only where the supplied source provides an example." status={<SourceDisclosure compact value={previewDisclosure}/>}>
    <Stack gap={4} className={verify ? 's3-edge__credential-workspace' : undefined}><PreviewNotice/>{verify && <Surface className="p-5"><Inline className="items-end"><FieldCarrier id="edge-credential-id" className="flex-1" label="Verifiable or fixture identifier" description="Preview verification uses only the controlled source fixture." error={checked && !found ? 'Credential not found in the controlled source fixture.' : undefined}><FieldInput className="field-control min-h-12 flex-1 px-3" value={value} onChange={(event) => { setValue(event.target.value); setChecked(false); }}/></FieldCarrier><PrimaryAction className="min-h-11 px-4" onClick={() => setChecked(true)}><Search/> Verify Preview</PrimaryAction></Inline></Surface>}
      {(!verify || found) && <Surface className="p-5" data-edge-credential={credential.id}><Inline className="justify-between"><Inline><Award/><div><Text variant="caption" tone="muted">Source test fixture</Text><Heading level={2}>{credential.title}</Heading></div></Inline><Badge tone="warning">{credential.status}</Badge></Inline><Grid columns={3} gap={3} className="my-4"><Surface className="p-3"><Text variant="caption" tone="muted">Category</Text><Text variant="label">{credential.category}</Text></Surface><Surface className="p-3"><Text variant="caption" tone="muted">Learning level</Text><Text variant="label">{credential.learningLevel}</Text></Surface><Surface className="p-3"><Text variant="caption" tone="muted">Attestation</Text><Text variant="label">{credential.attestationState}</Text></Surface></Grid><Text variant="caption" tone="muted">Issued / expiry / verifiable identifier: unavailable in the authoritative fixture. No values are invented.</Text></Surface>}
    </Stack>
  </DetailTemplate>;
}

function Progress({ go, eligibility = false }: { go: NavigateView; eligibility?: boolean }) {
  if (eligibility) return <BrowseTemplate className="s3-edge" eyebrow="Credential-to-role rules" title="Role eligibility" titleOwner="shell" intro="Locked, eligible and granted are evaluated independently. This Preview has no granted role." status={<SourceDisclosure compact value={previewDisclosure}/>}><Stack gap={4}><PreviewNotice/><Grid columns={2} gap={3} className="s3-edge__eligibility-grid">{fixture.eligibility.map((role) => <Surface key={role.slug} className="p-4"><Inline className="justify-between"><UserRoundCheck/><Badge tone="neutral">Locked · missing</Badge></Inline><Heading level={3}>{role.label}</Heading><Text tone="secondary">{role.description}</Text><Text variant="caption" tone="muted" className="mt-3">Requires: {role.requirements.join(' + ')}</Text></Surface>)}</Grid><Text variant="caption" tone="muted">Preview qualification is not a granted DAO role and does not change Profile Rank.</Text></Stack></BrowseTemplate>;
  return <BrowseTemplate className="s3-edge" eyebrow="EDGE learning rank only" title="Learning progress" titleOwner="shell" intro="The source defines ranking by completed lessons and Scenario score; it supplies no authoritative learner rows." status={<SourceDisclosure compact value={previewDisclosure}/>}><Stack gap={4}><PreviewNotice/><Grid columns={2} gap={3}><Surface className="p-5"><Medal/><Heading level={2}>EDGE leaderboard</Heading><Text tone="secondary">{fixture.leaderboard.emptyReason}</Text><Text variant="caption" tone="muted">Formula: {fixture.leaderboard.formula}</Text><Badge tone="neutral">No source-derived learner entries</Badge></Surface><Surface className="p-5"><Trophy/><Heading level={2}>Role eligibility</Heading><Text tone="secondary">Six source-defined DAO roles and their credential requirements are available for inspection.</Text><button type="button" className="mt-4 min-h-11 px-3 text-primary-500" onClick={() => go('eligibility')}>Review eligibility <ArrowRight/></button></Surface></Grid></Stack></BrowseTemplate>;
}

const primaryNav: Array<{ id:'overview'|'learn'|'credentials'|'progress'; label:string; view:EdgeView }> = [
  { id:'overview', label:'Overview', view:'dashboard' }, { id:'learn', label:'Learn', view:'learn' },
  { id:'credentials', label:'Credentials', view:'credentials' }, { id:'progress', label:'Progress', view:'leaderboard' },
];
function primaryFor(view: EdgeView) {
  if (['credentials','verify'].includes(view)) return 'credentials';
  if (['leaderboard','eligibility','progress'].includes(view)) return 'progress';
  if (['placement','role','learn','catalogue','category','module','lesson','quiz','scenario'].includes(view)) return 'learn';
  return 'overview';
}

export function SpecialEdgePage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const view = edgeViewFromRoute(pathname, params.get('view'));
  const mode: EdgeDataMode = IS_PREVIEW_MODE && params.get('edgeData') !== 'live' ? 'preview' : 'live';
  const roleState = resolvePreviewRole(params.get('edgeRole'));
  const go: NavigateView = (next, extra = {}) => { const copy = new URLSearchParams(params); if (next === 'dashboard') copy.delete('view'); else copy.set('view', next); Object.entries(extra).forEach(([key, value]) => value === null ? copy.delete(key) : copy.set(key, value)); if (pathname !== '/readiness') { navigate(`/readiness?${copy.toString()}`); return; } setParams(copy); };
  let content;
  if (mode === 'live') content = <LiveUnavailable/>;
  else if (view === 'placement') content = <Placement go={go} initial={params.get('step') === 'question' ? 'question' : params.get('step') === 'result' ? 'result' : 'intro'}/>;
  else if (view === 'role') content = <RoleSelection go={go} role={roleState.role} roleQueryValid={roleState.valid}/>;
  else if (view === 'learn') content = <LearningPath go={go} context="path" role={roleState.role} roleQueryValid={roleState.valid}/>;
  else if (view === 'catalogue') content = <LearningPath go={go} context="catalogue" role={roleState.role} roleQueryValid={roleState.valid}/>;
  else if (view === 'category') content = <LearningPath go={go} context="category" role={roleState.role} roleQueryValid={roleState.valid}/>;
  else if (view === 'module') content = <LearningPath go={go} context="module" role={roleState.role} roleQueryValid={roleState.valid}/>;
  else if (view === 'lesson') content = <Lesson go={go} role={roleState.role} roleQueryValid={roleState.valid}/>;
  else if (view === 'quiz') content = <Quiz role={roleState.role} roleQueryValid={roleState.valid}/>;
  else if (view === 'scenario') content = <Scenario/>;
  else if (view === 'credentials') content = <Credentials/>;
  else if (view === 'verify') content = <Credentials verify/>;
  else if (view === 'eligibility') content = <Progress go={go} eligibility/>;
  else if (view === 'leaderboard' || view === 'progress') content = <Progress go={go}/>;
  else content = <Dashboard go={go} role={roleState.role}/>;

  const activePrimary = primaryFor(view);
  const metrics = mode === 'preview' ? [
    { label:'Mode', value:'Source Preview', detail:'No Live progress', icon:<BookOpen/> },
    { label:'Target role', value:roleState.role.label, detail:roleState.valid ? 'Validated learning context' : 'Controlled default', icon:<Target/> },
    { label:'Placement bank', value:'18 questions', detail:'6 source domains', icon:<ClipboardCheck/> },
    { label:'Learning map', value:'6 categories', detail:'Role-aware paths', icon:<Layers3/> },
  ] : [
    { label:'Mode', value:'Live unavailable', detail:'Session bridge required', icon:<AlertCircle/> },
    { label:'Session', value:'Not connected', detail:'No Preview fallback', icon:<ShieldCheck/> },
    { label:'Progress', value:'Unavailable', detail:'No learner state inferred', icon:<Medal/> },
    { label:'Credentials', value:'Not evaluated', detail:'No ownership inferred', icon:<Award/> },
  ];

  return <AppShell title="EDGE" showBack wide>
    <section className="s3-product s3-product--edge s3-edge-product" data-edge-view={view} data-edge-data-mode={mode}>
      <header className="s3-product__hero s3-edge-product__hero">
        <div className="s3-product__hero-row">
          <div>
            <p className="s3-product__eyebrow">EDGE · Learning & qualification</p>
            <h1>Learn clearly. Qualify honestly.</h1>
            <p>Role-aware Web3 learning, decisions and verifiable credentials.</p>
          </div>
          <ProductHeroActions product="EDGE" />
        </div>
      </header>
      <section className="s3-product__metrics s3-edge-product__metrics" aria-label="EDGE summary">
        {metrics.map((metric) => <SpecialMetricCard key={metric.label} {...metric}/>) }
      </section>
      <LocalNav label="EDGE" activeId={activePrimary} items={primaryNav} onChange={(id) => go(primaryNav.find((item) => item.id === id)?.view ?? 'dashboard')} />
      <main className="s3-edge-product__workspace">{content}</main>
      {mode === 'preview' && <Surface className="s3-edge-product__live-check p-4"><Inline className="justify-between"><Text variant="caption" tone="muted">Live API mode remains available for honest session-blocked QA.</Text><button type="button" className="min-h-11 px-3 text-primary-500" onClick={() => { const copy = new URLSearchParams(params); copy.set('edgeData','live'); setParams(copy, { replace:true }); }}>Inspect Live state</button></Inline></Surface>}
      <footer className="s3-edge-product__source"><SourceDisclosure value={mode === 'preview' ? previewDisclosure : liveDisclosure}/></footer>
    </section>
  </AppShell>;
}
