/**
 * Controlled frontend-only EDGE fixture for SPECIAL UI/UX and interaction QA.
 * Every Product entity below is copied from the supplied edge.zip source and
 * remains preview-only. It is never a fallback for Live API/session data.
 */

export const EDGE_PREVIEW_RUNTIME_STATUS = 'preview-only-source-derived' as const;

type Trace = {
  sourceFile: string;
  sourceEntity: string;
  fixturePurpose: string;
  runtimeStatus: typeof EDGE_PREVIEW_RUNTIME_STATUS;
};

const trace = (sourceFile: string, sourceEntity: string, fixturePurpose: string): Trace => ({
  sourceFile,
  sourceEntity,
  fixturePurpose,
  runtimeStatus: EDGE_PREVIEW_RUNTIME_STATUS,
});

const placementSource = 'artifacts/edge-api/app/modules/assessment/placement_questions.py';
const web3Source = 'artifacts/edge-api/app/seeds/web3_fundamentals.py';
const quizSource = 'artifacts/edge-api/app/seeds/quiz_mcq_seed.py';
const scenarioSource = 'artifacts/edge-api/app/seeds/scenario_seed.py';
const roleSource = 'artifacts/edge-api/app/modules/path/role_maps.py';
const eligibilitySource = 'artifacts/edge-api/app/modules/eligibility/seeds.py';
const credentialSource = 'artifacts/edge-web/src/pages/learn.credential-modal.test.tsx';
const leaderboardSource = 'artifacts/edge-api/app/modules/content/router.py';

export const edgePreviewFixture = Object.freeze({
  status: EDGE_PREVIEW_RUNTIME_STATUS,
  sourcePackage: 'edge.zip',
  placement: {
    totalSourceQuestions: 18,
    previewQuestions: [
      {
        id:'w3f-01', categorySlug:'web3_fundamentals', categoryTitle:'Web3 Fundamentals', difficultyWeight:1,
        question:'What is a blockchain?',
        options:['A centralized database managed by a single company','A distributed ledger that records transactions across many computers','A type of cryptocurrency exchange','A programming language for smart contracts'],
        correctIndex:1,
        explanation:'A blockchain is a distributed ledger shared across many computers, making it resistant to tampering.',
        trace:trace(placementSource, 'QUESTIONS[w3f-01]', 'Placement question interaction'),
      },
      {
        id:'eco-01', categorySlug:'ecosystem_foundations', categoryTitle:'Ecosystem Foundations', difficultyWeight:1,
        question:'What is a Layer 2 (L2) solution?',
        options:['A second blockchain that replaces Ethereum entirely','A protocol built on top of a base chain to improve scalability and reduce fees','A hardware device for cold storage','A type of centralized exchange'],
        correctIndex:1,
        explanation:'L2s sit on top of a base chain (L1), batching transactions to increase throughput and cut costs.',
        trace:trace(placementSource, 'QUESTIONS[eco-01]', 'Placement question interaction'),
      },
      {
        id:'prl-01', categorySlug:'product_literacy', categoryTitle:'Product Literacy', difficultyWeight:1,
        question:'What is an Automated Market Maker (AMM)?',
        options:['A human trader who executes orders on behalf of the protocol','A smart contract that uses liquidity pools to price and swap tokens algorithmically','A centralized order book managed by an exchange','A hardware device that automates token staking'],
        correctIndex:1,
        explanation:'AMMs replace traditional order books with liquidity pools and a pricing formula (e.g. x*y=k).',
        trace:trace(placementSource, 'QUESTIONS[prl-01]', 'Placement question interaction'),
      },
      {
        id:'gov-01', categorySlug:'governance_dao', categoryTitle:'Governance & DAO', difficultyWeight:1,
        question:'What is a DAO?',
        options:['A Decentralized Application Operator run by a single entity','A Decentralized Autonomous Organization governed by smart contracts and token holders','A government agency overseeing blockchain regulation','A type of hardware wallet'],
        correctIndex:1,
        explanation:'A DAO is an organization whose rules are encoded in smart contracts, with token holders voting on decisions.',
        trace:trace(placementSource, 'QUESTIONS[gov-01]', 'Placement question interaction'),
      },
      {
        id:'ngl-01', categorySlug:'network_growth_leadership', categoryTitle:'Network Growth & Leadership', difficultyWeight:1,
        question:'What is a token incentive program primarily designed to achieve?',
        options:['Reduce the circulating supply of a token permanently','Bootstrap user adoption and liquidity by rewarding early participants','Replace venture capital funding entirely','Increase transaction fees for the network'],
        correctIndex:1,
        explanation:'Token incentive programs use rewards to attract early users and liquidity, kick-starting network effects.',
        trace:trace(placementSource, 'QUESTIONS[ngl-01]', 'Placement question interaction'),
      },
      {
        id:'src-01', categorySlug:'security_risk_control', categoryTitle:'Security & Risk Control', difficultyWeight:1,
        question:'What is a reentrancy attack in smart contracts?',
        options:['An attack where an attacker floods a network with spam transactions','An attack where a malicious contract repeatedly calls back into the victim contract before its state is updated','A phishing attack targeting hardware wallet users','A front-running attack on a DEX liquidity pool'],
        correctIndex:1,
        explanation:'Reentrancy exploits a contract that sends ETH before updating state — the classic example is The DAO hack.',
        trace:trace(placementSource, 'QUESTIONS[src-01]', 'Placement question interaction'),
      },
    ],
    trace:trace(placementSource, 'QUESTIONS (18 total)', 'Placement Intro, Question, Result and Retake UI'),
  },
  categories: [
    { slug:'web3-fundamentals', title:'Web3 Fundamentals', description:'The foundational layer of Web3 knowledge — blockchains, wallets, transactions, and the decentralised internet. Required before any other track.', order:1, trace:trace(web3Source, 'CATEGORIES[web3-fundamentals]', 'Catalogue/path category') },
    { slug:'ecosystem-foundations', title:'Ecosystem Foundations', description:'Deep-dive into the major L1/L2 ecosystems, token standards, and DeFi primitives.', order:2, trace:trace(web3Source, 'CATEGORIES[ecosystem-foundations]', 'Catalogue/path category') },
    { slug:'product-literacy', title:'Product Literacy', description:'How to read whitepapers, evaluate tokenomics, and think like a Web3 product builder.', order:3, trace:trace(web3Source, 'CATEGORIES[product-literacy]', 'Catalogue/path category') },
    { slug:'governance-dao', title:'Governance & DAO', description:'On-chain governance mechanics, DAO tooling, voting frameworks, and contributor incentives.', order:4, trace:trace(web3Source, 'CATEGORIES[governance-dao]', 'Catalogue/path category') },
    { slug:'network-growth-leadership', title:'Network Growth & Leadership', description:'Community building, ambassador programmes, growth loops, and protocol leadership.', order:5, trace:trace(web3Source, 'CATEGORIES[network-growth-leadership]', 'Catalogue/path category') },
    { slug:'security-risk-control', title:'Security & Risk Control', description:'Smart contract security, wallet hygiene, phishing defence, and on-chain risk assessment.', order:6, trace:trace(web3Source, 'CATEGORIES[security-risk-control]', 'Catalogue/path category') },
  ],
  modules: [
    { slug:'blockchain-fundamentals', categorySlug:'web3-fundamentals', title:'Blockchain Fundamentals', description:'How blockchains work under the hood — distributed ledgers, consensus mechanisms, blocks, and transactions.', order:1, trace:trace(web3Source, 'MODULES[blockchain-fundamentals]', 'Category/module hierarchy') },
    { slug:'wallets-and-identity', categorySlug:'web3-fundamentals', title:'Wallets & Identity', description:'Private keys, seed phrases, wallet types, and how on-chain identity flows from cryptographic ownership.', order:2, trace:trace(web3Source, 'MODULES[wallets-and-identity]', 'Category/module hierarchy') },
  ],
  lessons: [
    {
      id:'30000000-0000-0000-0000-000000000101', moduleSlug:'blockchain-fundamentals', order:1,
      title:'What Is a Blockchain?', learningLevel:'beginner', estimatedDuration:4,
      objective:'Explain what a blockchain is, why it is described as a distributed ledger, and how immutability is enforced.',
      explanation:'A blockchain is a list of records (blocks) chained together with cryptography and replicated across thousands of computers worldwide. Once a block is confirmed, changing it would require rewriting every subsequent block on every machine simultaneously — making tampering economically unfeasible.',
      practicalExample:"When you send ETH to a friend, that transaction is bundled into a block. Validators across the network agree it is valid, seal the block with a cryptographic hash, and append it to the chain. Every node updates its copy. Your friend's balance increases the moment consensus is reached.",
      relevance:'Every Web3 application — DeFi, NFTs, DAOs — ultimately writes its state to a blockchain. Understanding the ledger layer is required before making sense of gas fees, finality, or cross-chain bridges.',
      warning:'Blockchains are append-only. A transaction sent to the wrong address cannot be reversed. Always verify addresses before confirming.',
      trace:trace(web3Source, 'MICROLESSONS[30000000-0000-0000-0000-000000000101]', 'Lesson reading view'),
    },
    {
      id:'30000000-0000-0000-0000-000000000102', moduleSlug:'blockchain-fundamentals', order:2,
      title:'Consensus Mechanisms: PoW vs PoS', learningLevel:'beginner', estimatedDuration:5,
      objective:'Compare Proof-of-Work and Proof-of-Stake, and explain the trade-offs between security, energy use, and decentralisation.',
      trace:trace(web3Source, 'MICROLESSONS[30000000-0000-0000-0000-000000000102]', 'Learning path continuation'),
    },
  ],
  quiz: {
    lessonId:'30000000-0000-0000-0000-000000000101',
    question:"What happens to a block's hash if even one character of its data is changed?",
    options:['It stays the same — hashes are fixed-length regardless of input','It becomes completely different — even one character change produces a new hash','Only the last digit changes to reflect the modification','The hash is deleted and must be recalculated by miners'],
    correctIndex:1,
    explanation:'Cryptographic hash functions are extremely sensitive — even a single character change produces a completely different hash. This avalanche effect makes tampering immediately detectable, which is the foundation of blockchain immutability.',
    trace:trace(quizSource, 'MCQ_DATA[30000000-0000-0000-0000-000000000101]', 'Lesson quiz interaction'),
  },
  scenario: {
    ref:'scenario-w3f-m1-l1', title:'The Irreversible Transfer',
    situation:"A colleague accidentally sends 2 ETH to your wallet address instead of the intended recipient. They ask you to forward it, but you're unsure whether the original recipient even exists on-chain. You need to decide how to handle this.",
    steps:[{
      order:1,
      prompt:"Your colleague asks you to simply 'send it back' to the original recipient. What is your first action?",
      context:'The address your colleague provides is 42 characters, starting with 0x.',
      choices:[
        { label:'Verify the recipient address exists on-chain via Etherscan before sending anything.', outcome:"You confirm the address has prior transactions, confirming it's a live wallet.", feedback:'Correct first step. Any address can receive ETH — but verifying it is an active wallet reduces the chance of a second error. Blockchain transfers are irreversible, so verify before every send.', scoreImpact:10, optimal:true },
        { label:'Ask your colleague to send you the transaction hash of the original mistaken transfer.', outcome:"You now have the transaction hash but still don't know if the target address is active.", feedback:'The transaction hash confirms the original mistake but does not help you verify the target. Verification of the destination address is still required before forwarding.', scoreImpact:0, optimal:false },
        { label:'Immediately send the 2 ETH to the address your colleague provided.', outcome:'You send 2 ETH instantly. Whether the address is correct only becomes clear later.', feedback:'This is the highest-risk action. Without address verification, you risk a second irreversible mistake. Blockchain finality means there is no undo — always verify first.', scoreImpact:-5, optimal:false },
      ],
    }],
    trace:trace(scenarioSource, 'SCENARIOS[scenario-w3f-m1-l1]', 'Scenario decision simulation'),
  },
  roles: [
    { slug:'dao_member', label:'DAO Member', description:'Participate in decentralized governance — vote on proposals, manage treasuries, and shape protocol direction.', focusAreas:['Governance & DAO','Web3 Fundamentals','Ecosystem Foundations','Security & Risk Control'], trace:trace(roleSource, 'ROLE_CONFIG[dao_member]', 'Target-role selection') },
    { slug:'defi_investor', label:'DeFi Investor', description:'Navigate yield protocols, liquidity provision, and on-chain risk to grow and protect your assets.', focusAreas:['Product Literacy','Security & Risk Control','Web3 Fundamentals','Ecosystem Foundations'], trace:trace(roleSource, 'ROLE_CONFIG[defi_investor]', 'Target-role selection') },
    { slug:'developer', label:'Web3 Developer', description:'Build audited smart contracts, DApps, and protocol integrations — from EVM basics to security patterns.', focusAreas:['Security & Risk Control','Ecosystem Foundations','Web3 Fundamentals','Product Literacy'], trace:trace(roleSource, 'ROLE_CONFIG[developer]', 'Target-role selection') },
    { slug:'general', label:'General Learner', description:'Build a complete, well-rounded understanding of the Web3 ecosystem from the ground up.', focusAreas:['Web3 Fundamentals','Ecosystem Foundations','Product Literacy','Governance & DAO'], trace:trace(roleSource, 'ROLE_CONFIG[general]', 'Target-role selection') },
  ],
  prerequisites: {
    'ecosystem-foundations':{ requires:['web3-fundamentals'], trace:trace(roleSource, 'ROLE_CONFIG category ordering / ecosystem-foundations', 'Learning-path prerequisite lock') },
    'product-literacy':{ requires:['web3-fundamentals'], trace:trace(roleSource, 'ROLE_CONFIG category ordering / product-literacy', 'Learning-path prerequisite lock') },
    'governance-dao':{ requires:['web3-fundamentals'], trace:trace(roleSource, 'ROLE_CONFIG category ordering / governance-dao', 'Learning-path prerequisite lock') },
    'network-growth-leadership':{ requires:['web3-fundamentals'], trace:trace(roleSource, 'ROLE_CONFIG category ordering / network-growth-leadership', 'Learning-path prerequisite lock') },
    'security-risk-control':{ requires:['web3-fundamentals','ecosystem-foundations'], trace:trace(roleSource, 'ROLE_CONFIG category ordering / security-risk-control', 'Learning-path prerequisite lock') },
  },
  credentialExample: {
    id:'cred-test-001', title:'Web3 Fundamentals', category:'web3_fundamentals', learningLevel:'beginner', verifiableId:null,
    issuedAt:null, expiresAt:null, attestationState:'Unavailable in source fixture', status:'Preview awarded example',
    trace:trace(credentialSource, 'MOCK_CREDENTIAL', 'Credential card; dates/verification remain unavailable'),
  },
  eligibility: [
    { slug:'voter', label:'Voter', description:'Can participate in DAO governance votes. Requires basic Web3 knowledge.', requirements:['web3-fundamentals · beginner','ecosystem-foundations · beginner','governance-dao · beginner'] },
    { slug:'mentor', label:'Mentor', description:'Guides new learners through content. Requires community literacy.', requirements:['product-literacy · beginner','governance-dao · intermediate'] },
    { slug:'ambassador', label:'Ambassador', description:'Represents the DAO externally. Requires security and growth credentials.', requirements:['security-risk-control · beginner','network-growth-leadership · beginner'] },
    { slug:'leader', label:'Leader', description:'Leads DAO working groups. Requires network growth + security credentials.', requirements:['network-growth-leadership · beginner','security-risk-control · beginner'] },
    { slug:'analyst', label:'Analyst', description:'Reviews protocol risks and audits. Requires security credential.', requirements:['security-risk-control · beginner'] },
    { slug:'dao_member', label:'DAO Member', description:'Full DAO membership. Requires foundational + governance credentials.', requirements:['web3-fundamentals · beginner','governance-dao · beginner'] },
  ].map((item) => ({ ...item, trace:trace(eligibilitySource, `_DAO_ROLES/_RULES[${item.slug}]`, 'Role eligibility requirements') })),
  leaderboard: {
    entries:[],
    formula:'lessons × 1.0 + scenario score × 0.5',
    emptyReason:'No authoritative learner entry exists in supplied seed/test fixtures.',
    trace:trace(leaderboardSource, 'get_leaderboard / LEADERBOARD_*_WEIGHT', 'Leaderboard information architecture and grounded empty state'),
  },
});

export type EdgePreviewFixture = typeof edgePreviewFixture;
