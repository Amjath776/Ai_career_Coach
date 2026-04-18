/**
 * ============================================================
 * QA DYNAMIC AUDIT — AI Career Coach
 * ============================================================
 * Senior Backend QA Engineer / AI System Auditor Script
 *
 * Tests whether the Skill Gap Analysis endpoint produces
 * DYNAMIC, input-specific responses or STATIC / CACHED ones.
 *
 * Test Cases:
 *   Case 1: Data Scientist       | Python, Pandas
 *   Case 2: Frontend Developer   | HTML, CSS, React
 *   Case 3: DevOps Engineer      | Linux, Docker
 *
 * Run:  node tests/qa_dynamic_audit.js
 * ============================================================
 */

require('dotenv').config();
const http = require('http');

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL  = 'http://localhost:5000';
const TEST_USER = {
  name:    'QA Auditor Bot',
  email:   `qa.audit.${Date.now()}@testbot.com`,
  password:'QaAudit#2026!',
};

// ── Colour helpers (no dependencies) ─────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
};
const pass  = (s) => `${C.green}${C.bold}✅ PASS${C.reset} ${s}`;
const fail  = (s) => `${C.red}${C.bold}❌ FAIL${C.reset} ${s}`;
const info  = (s) => `${C.cyan}ℹ️  ${s}${C.reset}`;
const warn  = (s) => `${C.yellow}⚠️  ${s}${C.reset}`;
const head  = (s) => `\n${C.bold}${C.white}${'═'.repeat(60)}\n  ${s}\n${'═'.repeat(60)}${C.reset}`;

// ── HTTP helper ───────────────────────────────────────────────────────────────
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Test cases ────────────────────────────────────────────────────────────────
const TEST_CASES = [
  {
    id:             'Case-1',
    label:          'Data Scientist',
    skills:         ['Python', 'Pandas'],
    targetRole:     'Data Scientist',
    targetIndustry: 'Technology',
  },
  {
    id:             'Case-2',
    label:          'Frontend Developer',
    skills:         ['HTML', 'CSS', 'React'],
    targetRole:     'Frontend Developer',
    targetIndustry: 'Technology',
  },
  {
    id:             'Case-3',
    label:          'DevOps Engineer',
    skills:         ['Linux', 'Docker'],
    targetRole:     'DevOps Engineer',
    targetIndustry: 'Technology',
  },
];

// ── Audit helpers ─────────────────────────────────────────────────────────────

/** Returns true if two string arrays share ANY element (case-insensitive) */
function arraysOverlap(a, b) {
  const bLower = b.map((x) => x.toLowerCase());
  return a.some((x) => bLower.includes(x.toLowerCase()));
}

/** Compute Jaccard similarity between two string arrays (0 = no overlap, 1 = identical) */
function jaccardSimilarity(a, b) {
  const setA = new Set(a.map((x) => x.toLowerCase()));
  const setB = new Set(b.map((x) => x.toLowerCase()));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1 : intersection / union;
}

/** Return missing-skill names from an analysis object */
function missingSkillNames(analysis) {
  return (analysis.missingSkills || []).map((ms) => ms.skill || '');
}

/** Return strength names from an analysis object */
function strengthNames(analysis) {
  return (analysis.strengths || []);
}

// ── Main audit ─────────────────────────────────────────────────────────────────
async function runAudit() {
  console.log(head('AI CAREER COACH — DYNAMIC RESPONSE QA AUDIT'));

  // ── Step 1: Register test user ──────────────────────────────────────────────
  console.log(info('Step 1: Registering temporary QA test user...'));
  const signupRes = await request('POST', '/api/auth/signup', TEST_USER);
  if (signupRes.status !== 201) {
    console.error(fail(`Signup failed (${signupRes.status}): ${JSON.stringify(signupRes.body)}`));
    process.exit(1);
  }
  const token = signupRes.body.token;
  console.log(info(`Registered & token acquired. User: ${TEST_USER.email}`));

  // ── Step 2: Run all test cases ──────────────────────────────────────────────
  const results = [];

  for (const tc of TEST_CASES) {
    console.log(head(`Running ${tc.id}: ${tc.label}`));
    console.log(info(`Skills sent: [${tc.skills.join(', ')}]`));
    console.log(info(`Target Role: ${tc.targetRole}`));

    // 2a. Update user profile skills (the controller reads from req.user.skills)
    const profileRes = await request(
      'PUT',
      '/api/auth/profile',
      { skills: tc.skills, currentTitle: tc.label, industry: tc.targetIndustry },
      token,
    );
    if (profileRes.status !== 200) {
      console.warn(warn(`Profile update returned ${profileRes.status}`));
    }

    // 2b. Call skill-gap analyze
    const startTime = Date.now();
    const apiRes = await request(
      'POST',
      '/api/skill-gap/analyze',
      { targetRole: tc.targetRole, targetIndustry: tc.targetIndustry },
      token,
    );
    const elapsed = Date.now() - startTime;

    if (apiRes.status !== 201) {
      console.error(fail(`API call failed (${apiRes.status}): ${JSON.stringify(apiRes.body)}`));
      results.push({ ...tc, error: apiRes.body, analysis: null, elapsed });
      continue;
    }

    const analysis = apiRes.body.skillGap;
    results.push({ ...tc, analysis, elapsed });

    // Print raw snapshot
    console.log(info(`Response time  : ${elapsed}ms`));
    console.log(info(`Readiness score: ${analysis.overallReadiness}`));
    console.log(info(`Strengths      : ${(analysis.strengths || []).join(', ')}`));
    console.log(info(`Missing skills : ${missingSkillNames(analysis).join(', ')}`));
    console.log(info(`Summary        : "${analysis.summary}"`));
  }

  // ── Step 3: Cross-case comparison ──────────────────────────────────────────
  console.log(head('CROSS-CASE COMPARISON & VALIDATION'));

  const issues   = [];
  const evidence = [];
  let dynamic    = true;

  const validResults = results.filter((r) => r.analysis);

  // --- TEST A: Readiness scores must differ ---
  const scores = validResults.map((r) => r.analysis.overallReadiness);
  const uniqueScores = new Set(scores);
  if (uniqueScores.size < Math.max(2, validResults.length - 1)) {
    dynamic = false;
    issues.push('Readiness scores are identical or nearly identical across different roles');
    evidence.push(`Scores: ${scores.join(', ')} — expected variety`);
    console.log(fail(`Readiness scores: ${scores.join(', ')} — NOT sufficiently varied`));
  } else {
    console.log(pass(`Readiness scores differ per case: ${scores.join(', ')}`));
  }

  // --- TEST B: Strengths must reflect user-provided skills ---
  for (const r of validResults) {
    if (!r.analysis) continue;
    const userSkillsLower = r.skills.map((s) => s.toLowerCase());
    const strengths = r.analysis.strengths || [];
    if (strengths.length === 0) {
      dynamic = false;
      issues.push(`${r.id}: Strengths array is EMPTY — user skills should appear as strengths`);
      evidence.push(`${r.id} user skills [${r.skills.join(', ')}] — strengths: []`);
      console.log(fail(`${r.id}: strengths array is empty — user skills not reflected`));
      continue;
    }
    const strengthsLower  = strengths.map((s) => s.toLowerCase());
    const hasMatch = r.skills.some((sk) =>
      strengthsLower.some((st) => st.includes(sk.toLowerCase()) || sk.toLowerCase().includes(st))
    );
    if (!hasMatch) {
      dynamic = false;
      issues.push(`${r.id}: Strengths do not reflect user-provided skills`);
      evidence.push(`${r.id} user skills [${r.skills.join(', ')}] not found in strengths [${strengths.join(', ')}]`);
      console.log(fail(`${r.id}: strengths don't reflect input skills`));
    } else {
      console.log(pass(`${r.id}: strengths contain user-provided skills`));
    }
  }

  // --- TEST C: Missing skills must NOT include user-provided skills ---
  for (const r of validResults) {
    if (!r.analysis) continue;
    const missingNames = missingSkillNames(r.analysis);
    const conflict = r.skills.filter((sk) =>
      missingNames.some(
        (ms) => ms.toLowerCase().includes(sk.toLowerCase()) ||
                sk.toLowerCase().includes(ms.toLowerCase())
      )
    );
    if (conflict.length > 0) {
      dynamic = false;
      issues.push(`${r.id}: Missing skills include skills the user already has`);
      evidence.push(`${r.id}: "${conflict.join(', ')}" appeared in both user skills AND missing skills`);
      console.log(fail(`${r.id}: user skills [${conflict.join(', ')}] appear in missingSkills!`));
    } else {
      console.log(pass(`${r.id}: missingSkills correctly excludes user-provided skills`));
    }
  }

  // --- TEST D: Missing skills should be very different across roles ---
  if (validResults.length >= 2) {
    for (let i = 0; i < validResults.length; i++) {
      for (let j = i + 1; j < validResults.length; j++) {
        const rA = validResults[i];
        const rB = validResults[j];
        if (!rA.analysis || !rB.analysis) continue;
        const mA = missingSkillNames(rA.analysis);
        const mB = missingSkillNames(rB.analysis);
        const sim = jaccardSimilarity(mA, mB);

        if (sim > 0.60) {
          dynamic = false;
          issues.push(`Missing skills for ${rA.id} and ${rB.id} are too similar (Jaccard=${(sim * 100).toFixed(0)}%)`);
          evidence.push(
            `${rA.id} missing: [${mA.join(', ')}]\n` +
            `  ${rB.id} missing: [${mB.join(', ')}]`
          );
          console.log(fail(`${rA.label} vs ${rB.label}: missing skills overlap too much (similarity=${(sim * 100).toFixed(0)}%)`));
        } else {
          console.log(pass(`${rA.label} vs ${rB.label}: missing skills are role-specific (similarity=${(sim * 100).toFixed(0)}%)`));
        }
      }
    }
  }

  // --- TEST E: Summaries must reference the target role ---
  for (const r of validResults) {
    if (!r.analysis) continue;
    const summary = (r.analysis.summary || '').toLowerCase();
    const roleWords = r.targetRole.toLowerCase().split(' ');
    const mentioned = roleWords.some((w) => summary.includes(w));
    if (!mentioned) {
      // soft warning — not necessarily static but suspicious
      issues.push(`${r.id}: Summary doesn't mention the target role`);
      evidence.push(`${r.id} summary: "${r.analysis.summary}"`);
      dynamic = false;
      console.log(fail(`${r.id}: summary does not mention the target role ("${r.targetRole}")`));
    } else {
      console.log(pass(`${r.id}: summary references the target role`));
    }
  }

  // --- TEST F: Detect if any two full responses are identical (JSON stringify) ---
  if (validResults.length >= 2) {
    for (let i = 0; i < validResults.length; i++) {
      for (let j = i + 1; j < validResults.length; j++) {
        const rA = validResults[i];
        const rB = validResults[j];
        if (!rA.analysis || !rB.analysis) continue;
        // Compare without DB-generated fields (_id, createdAt)
        const normalize = (a) => ({
          overallReadiness: a.overallReadiness,
          summary: a.summary,
          strengths: [...(a.strengths || [])].sort(),
          missingSkills: [...(a.missingSkills || [])].map((m) => m.skill).sort(),
        });
        if (JSON.stringify(normalize(rA.analysis)) === JSON.stringify(normalize(rB.analysis))) {
          dynamic = false;
          issues.push(`Identical full response detected between ${rA.id} and ${rB.id}`);
          evidence.push(`${rA.id} and ${rB.id} returned byte-for-byte identical normalized responses`);
          console.log(fail(`${rA.id} and ${rB.id} responses are IDENTICAL — clear static/cache issue`));
        } else {
          console.log(pass(`${rA.id} vs ${rB.id}: full responses are unique`));
        }
      }
    }
  }

  // --- TEST G: Generic suggestion detection ---
  const GENERIC_PHRASES = [
    'improve communication',
    'communication skills',
    'work harder',
    'be professional',
    'always learning',
  ];
  for (const r of validResults) {
    if (!r.analysis) continue;
    const allText = JSON.stringify(r.analysis).toLowerCase();
    const found = GENERIC_PHRASES.filter((p) => allText.includes(p));
    if (found.length > 0) {
      issues.push(`${r.id}: Generic/filler suggestions detected`);
      evidence.push(`${r.id}: found phrases: [${found.join(', ')}]`);
      console.log(warn(`${r.id}: generic phrases detected: ${found.join(', ')}`));
    } else {
      console.log(pass(`${r.id}: no generic filler phrases detected`));
    }
  }

  // ── Step 4: Build final verdict ─────────────────────────────────────────────
  console.log(head('FINAL AUDIT REPORT'));

  const report = {
    status:         dynamic ? 'PASS' : 'FAIL',
    dynamic_output: dynamic,
    issues_detected: issues.length > 0 ? issues : ['None — all checks passed'],
    evidence:        evidence.length > 0 ? evidence : ['No anomalies found'],
    final_verdict:   dynamic
      ? 'System is DYNAMIC — responses change meaningfully with different inputs'
      : 'System is STATIC or PARTIALLY STATIC — one or more inputs produced identical or non-personalized responses',
    test_cases: results.map((r) => ({
      id:              r.id,
      role:            r.targetRole,
      skills_sent:     r.skills,
      readiness_score: r.analysis?.overallReadiness ?? 'ERROR',
      missing_count:   r.analysis?.missingSkills?.length ?? 'ERROR',
      strengths_count: r.analysis?.strengths?.length ?? 'ERROR',
      response_time_ms: r.elapsed,
    })),
  };

  console.log('\n' + JSON.stringify(report, null, 2));

  // Print summary banner
  console.log('\n');
  if (dynamic) {
    console.log(`${C.green}${C.bold}╔══════════════════════════════════════════╗`);
    console.log(`║        AUDIT RESULT: ✅  PASS             ║`);
    console.log(`║  API IS GENERATING DYNAMIC RESPONSES     ║`);
    console.log(`╚══════════════════════════════════════════╝${C.reset}`);
  } else {
    console.log(`${C.red}${C.bold}╔══════════════════════════════════════════╗`);
    console.log(`║        AUDIT RESULT: ❌  FAIL             ║`);
    console.log(`║  STATIC / CACHED RESPONSES DETECTED      ║`);
    console.log(`╚══════════════════════════════════════════╝${C.reset}`);
    console.log(`\n${C.yellow}Issues detected:${C.reset}`);
    issues.forEach((issue, idx) => console.log(`  ${idx + 1}. ${issue}`));
  }

  process.exit(dynamic ? 0 : 1);
}

runAudit().catch((err) => {
  console.error(fail(`Unhandled error: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
});
