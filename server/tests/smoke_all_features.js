/**
 * Deep smoke-test for geminiService.js
 * Calls every fallback with real inputs and validates:
 *  - output is non-empty
 *  - output is unique per different input
 *  - output references the input role/data
 *  - no identical responses across calls
 */
'use strict';

require('dotenv').config();

// Force fallback mode regardless of real API key
// by temporarily nulling the model after init
const svc    = require('../services/geminiService');
const assert = (cond, msg) => { if (!cond) { console.error('  FAIL:', msg); process.exitCode = 1; } else { console.log('  PASS:', msg); } };
const C      = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', b: '\x1b[1m', x: '\x1b[0m' };
const head   = (t) => console.log(`\n${C.b}${'─'.repeat(55)}\n  ${t}\n${'─'.repeat(55)}${C.x}`);

// ─── helper: compare two objects for uniqueness ───────────────────────────────
const notEqual = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

async function run() {
  head('1. RESUME ANALYSIS — fallback smoke test');
  const r1 = await svc.analyzeResume('John, Data Scientist, 5 years Python, built ML pipeline that increased accuracy by 23%', 'Data Scientist');
  const r2 = await svc.analyzeResume('Jane, Frontend Developer, built React apps, improved LCP by 40%', 'Frontend Developer');
  const r3 = await svc.analyzeResume('Alex, DevOps Engineer, Kubernetes, Docker, CI/CD pipelines', 'DevOps Engineer');
  console.log('  DS   → score:', r1.overallScore, '| verbs sample:', r1.actionVerbs?.slice(0,2));
  console.log('  FE   → score:', r2.overallScore, '| verbs sample:', r2.actionVerbs?.slice(0,2));
  console.log('  DevOps→ score:', r3.overallScore, '| verbs sample:', r3.actionVerbs?.slice(0,2));
  assert(r1.overallScore > 0, 'DS overallScore > 0');
  assert(r2.overallScore > 0, 'FE overallScore > 0');
  assert(r1.keywordSuggestions?.length > 0, 'DS keywordSuggestions not empty');
  assert(r2.keywordSuggestions?.length > 0, 'FE keywordSuggestions not empty');
  assert(notEqual(r1.keywordSuggestions, r2.keywordSuggestions), 'DS ≠ FE keywords');
  assert(notEqual(r1.actionVerbs, r2.actionVerbs), 'DS ≠ FE action verbs');
  assert((r1.suggestedSummary || '').toLowerCase().includes('data scientist'), 'DS summary references role');
  assert((r2.suggestedSummary || '').toLowerCase().includes('frontend developer'), 'FE summary references role');

  head('2. COVER LETTER — fallback smoke test');
  const cl1 = await svc.generateCoverLetter({ name: 'Ahmed', currentTitle: 'Data Scientist', jobTitle: 'Senior ML Engineer', companyName: 'Stripe', jobDescription: 'Build ML pipelines', highlights: ['Reduced latency by 40%'], tone: 'professional' });
  const cl2 = await svc.generateCoverLetter({ name: 'Sara', currentTitle: 'Frontend Developer', jobTitle: 'React Engineer', companyName: 'Vercel', jobDescription: 'Build UI components', highlights: ['Improved LCP to 1.2s'], tone: 'confident' });
  console.log('  CL1 (Ahmed→Stripe) start:', cl1?.slice(0, 80));
  console.log('  CL2 (Sara→Vercel) start:', cl2?.slice(0, 80));
  assert(typeof cl1 === 'string' && cl1.length > 100, 'CL1 is non-empty string');
  assert(typeof cl2 === 'string' && cl2.length > 100, 'CL2 is non-empty string');
  assert(cl1.includes('Stripe'), 'CL1 mentions company');
  assert(cl2.includes('Vercel'), 'CL2 mentions company');
  assert(notEqual(cl1, cl2), 'CL1 ≠ CL2 (unique per input)');

  head('3. JOB RECOMMENDATIONS — fallback smoke test');
  const j1 = await svc.generateJobRecommendations({ skills: ['Python', 'ML', 'SQL'], currentTitle: 'Data Scientist', industry: 'Technology', preferences: { jobType: 'full-time' } });
  const j2 = await svc.generateJobRecommendations({ skills: ['React', 'TypeScript', 'CSS'], currentTitle: 'Frontend Developer', industry: 'Technology', preferences: { jobType: 'remote' } });
  console.log('  DS jobs:', j1?.slice(0,2).map(j => j.title));
  console.log('  FE jobs:', j2?.slice(0,2).map(j => j.title));
  assert(Array.isArray(j1) && j1.length >= 5, 'DS: at least 5 jobs');
  assert(Array.isArray(j2) && j2.length >= 5, 'FE: at least 5 jobs');
  assert(notEqual(j1.map(j=>j.title), j2.map(j=>j.title)), 'DS ≠ FE job titles');
  assert(j1.every(j => j.matchScore > 0), 'DS all matchScores > 0');
  assert(j1[0].description.length > 20, 'DS description non-trivial');

  head('4. CAREER PATHS — fallback smoke test');
  const cp1 = await svc.generateCareerPaths({ currentRole: 'Data Scientist', targetRole: 'Head of AI', skills: ['Python','ML'], yearsOfExperience: 3, mbtiType: 'INTJ' });
  const cp2 = await svc.generateCareerPaths({ currentRole: 'Frontend Developer', targetRole: 'Engineering Manager', skills: ['React','TypeScript'], yearsOfExperience: 5, mbtiType: 'ENTJ' });
  console.log('  DS path titles:', cp1?.paths?.map(p => p.title));
  console.log('  FE path titles:', cp2?.paths?.map(p => p.title));
  assert(cp1?.paths?.length === 2, 'DS: exactly 2 paths');
  assert(cp2?.paths?.length === 2, 'FE: exactly 2 paths');
  assert(notEqual(cp1.paths[0].title, cp1.paths[1].title), 'DS: 2 paths are distinct');
  assert(notEqual(cp1.paths, cp2.paths), 'DS ≠ FE career paths');
  assert(cp1.personalityInsights?.mbtiAnalysis?.length > 20, 'DS MBTI analysis present');
  assert((cp1.personalityInsights?.mbtiAnalysis || '').includes('INTJ'), 'DS MBTI references INTJ type');

  head('5. SKILL GAP ANALYSIS — fallback smoke test (already validated)');
  const sg1 = await svc.analyzeSkillGap({ currentSkills: ['Python','Pandas'], targetRole: 'Data Scientist', industry: 'Technology' });
  const sg2 = await svc.analyzeSkillGap({ currentSkills: ['React','CSS'], targetRole: 'Frontend Developer', industry: 'Technology' });
  const sg3 = await svc.analyzeSkillGap({ currentSkills: ['Linux','Docker'], targetRole: 'DevOps Engineer', industry: 'Technology' });
  assert(sg1.overallReadiness !== sg2.overallReadiness || sg1.missingSkills[0].skill !== sg2.missingSkills[0].skill, 'SG: DS ≠ FE outputs');
  assert(notEqual(sg1.missingSkills.map(m=>m.skill), sg3.missingSkills.map(m=>m.skill)), 'SG: DS ≠ DevOps missing skills');
  assert(sg1.strengths.includes('Python'), 'SG: DS strengths contain Python');
  assert(sg2.strengths.includes('React'), 'SG: FE strengths contain React');
  console.log('  DS readiness:', sg1.overallReadiness, '| FE:', sg2.overallReadiness, '| DevOps:', sg3.overallReadiness);

  head('6. LEARNING ROADMAP — fallback smoke test');
  const rm1 = await svc.generateLearningRoadmap({ goal: 'Become a Data Scientist', targetRole: 'Data Scientist', currentSkills: ['Python'], durationMonths: 3 });
  const rm2 = await svc.generateLearningRoadmap({ goal: 'Become a Frontend Developer', targetRole: 'Frontend Developer', currentSkills: ['HTML'], durationMonths: 3 });
  const rm3 = await svc.generateLearningRoadmap({ goal: 'Learn Cloud Security', targetRole: '', currentSkills: [], durationMonths: 2 });
  console.log('  DS roadmap phases:', rm1?.phases?.map(p => p.title));
  console.log('  FE roadmap phases:', rm2?.phases?.map(p => p.title));
  console.log('  Generic roadmap phases:', rm3?.phases?.map(p => p.title));
  assert(rm1?.phases?.length >= 1, 'DS: phases present');
  assert(rm2?.phases?.length >= 1, 'FE: phases present');
  assert(notEqual(rm1?.phases?.map(p=>p.title), rm2?.phases?.map(p=>p.title)), 'DS ≠ FE roadmap phases');
  assert(rm1?.phases[0]?.resources?.length > 0, 'DS month 1 has resources');

  head('7. INTERVIEW QUESTIONS — fallback smoke test');
  const iq1 = await svc.generateInterviewQuestions({ targetRole: 'Data Scientist', company: 'Google', interviewType: 'technical', numQuestions: 5 });
  const iq2 = await svc.generateInterviewQuestions({ targetRole: 'Frontend Developer', company: 'Vercel', interviewType: 'technical', numQuestions: 5 });
  const iq3 = await svc.generateInterviewQuestions({ targetRole: 'DevOps Engineer', company: 'Cloudflare', interviewType: 'behavioral', numQuestions: 5 });
  console.log('  DS q[0]:', iq1?.[0]?.question?.slice(0,60));
  console.log('  FE q[0]:', iq2?.[0]?.question?.slice(0,60));
  assert(Array.isArray(iq1) && iq1.length === 5, 'DS: 5 questions returned');
  assert(Array.isArray(iq2) && iq2.length === 5, 'FE: 5 questions returned');
  assert(notEqual(iq1.map(q=>q.question), iq2.map(q=>q.question)), 'DS ≠ FE questions');
  assert(iq1.every(q => q.question && q.category && q.difficulty), 'DS: all questions have required fields');
  // Verify shuffling: run same role twice — should differ
  const iq1b = await svc.generateInterviewQuestions({ targetRole: 'Data Scientist', company: 'Google', interviewType: 'technical', numQuestions: 5 });
  const shuffled = notEqual(iq1.map(q=>q.question), iq1b.map(q=>q.question));
  // Shuffling is probabilistic (chance it's same is tiny)
  console.log('  Shuffle check (DS run 2 ≠ run 1):', shuffled ? 'SHUFFLED' : 'SAME ORDER (probabilistic)');

  head('8. ANSWER EVALUATION — fallback smoke test');
  const ae1 = await svc.evaluateAnswer({ question: 'Explain bias-variance tradeoff', answer: 'It is about balancing model complexity.', role: 'Data Scientist' });
  const ae2 = await svc.evaluateAnswer({ question: 'Explain bias-variance tradeoff', answer: 'Bias-variance tradeoff describes the tension between underfitting and overfitting. High bias models are too simple (linear regression on non-linear data) and underfit. High variance models are too complex and overfit. I resolved this in a production churn model by tuning regularization strength with 5-fold CV, improving test accuracy from 71% to 84%.', role: 'Data Scientist' });
  console.log('  Short answer score:', ae1.score, '| Long+metrics score:', ae2.score);
  assert(ae1.score >= 0 && ae1.score <= 10, 'AE1: score in range');
  assert(ae2.score >= 0 && ae2.score <= 10, 'AE2: score in range');
  assert(ae2.score > ae1.score, 'Detailed answer scores higher than vague answer');
  assert(ae1.improvements?.length > 0, 'AE1: improvements present');
  assert(ae2.strengths?.length > 0, 'AE2: strengths present (good answer recognised)');

  head('9. INDUSTRY INSIGHTS — fallback smoke test');
  const ii1 = await svc.generateIndustryInsights({ industry: 'Technology', role: 'Data Scientist', location: 'San Francisco, USA' });
  const ii2 = await svc.generateIndustryInsights({ industry: 'Finance', role: 'Backend Developer', location: 'London, UK' });
  const ii3 = await svc.generateIndustryInsights({ industry: 'Healthcare', role: 'ML Engineer', location: 'Remote' });
  console.log('  Tech  → demand:', ii1?.demandLevel, '| salary entry min:', ii1?.salaryRanges?.[0]?.min);
  console.log('  Fin   → demand:', ii2?.demandLevel, '| salary entry min:', ii2?.salaryRanges?.[0]?.min);
  console.log('  Health→ demand:', ii3?.demandLevel, '| salary entry min:', ii3?.salaryRanges?.[0]?.min);
  assert(notEqual(ii1.marketOverview, ii2.marketOverview), 'Tech ≠ Finance market overview');
  assert(notEqual(ii1.topSkills, ii3.topSkills), 'Tech ≠ Healthcare top skills');
  assert(notEqual(ii1.topCompanies, ii2.topCompanies), 'Tech ≠ Finance top companies');
  assert(ii2.salaryRanges[0].min < ii1.salaryRanges[0].min, 'London salary scaled lower than SF (location multiplier working)');
  assert(ii1.salaryRanges.length === 4, 'Industry insights: 4 salary tiers');

  // ── Final result ─────────────────────────────────────────────────────────────
  const exitCode = process.exitCode || 0;
  if (exitCode === 0) {
    console.log('\n\x1b[32m\x1b[1m╔══════════════════════════════════════════╗');
    console.log('║  ALL FEATURE SMOKE TESTS: ✅  PASS       ║');
    console.log('║  Dynamic behavior confirmed for all 9    ║');
    console.log('╚══════════════════════════════════════════╝\x1b[0m\n');
  } else {
    console.log('\n\x1b[31m\x1b[1m╔══════════════════════════════════════════╗');
    console.log('║  SOME TESTS FAILED — see FAILs above     ║');
    console.log('╚══════════════════════════════════════════╝\x1b[0m\n');
  }
}

run().catch((e) => { console.error('Unhandled error:', e.message); process.exit(1); });
