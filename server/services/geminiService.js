/**
 * Gemini AI Service
 * Central wrapper around @google/generative-ai.
 * All AI-powered features call this service.
 * Includes graceful fallback responses when API is unavailable.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

// ── Initialize Gemini ─────────────────────────────────────────────────────────
const initGemini = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️  Gemini API key not configured — AI features will use fallback responses');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized successfully');
    return true;
  } catch (err) {
    console.error('❌ Failed to initialize Gemini Connection:', err.message);
    return false;
  }
};

initGemini();

// ── Core generation function ──────────────────────────────────────────────────
const generateContent = async (prompt) => {
  if (!model) throw new Error('Gemini AI not initialized. Check your API key in .env');
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error(`[Gemini ERROR] Generation failed: ${err.message}`);
    throw err;
  }
};

// ── Parse JSON from AI response ───────────────────────────────────────────────
const parseJSON = (text) => {
  // Step 1: try to find a markdown code block
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let rawJSON = jsonMatch ? jsonMatch[1] : text;

  // Step 2: if no code block, extract substring from first { or [ to last } or ]
  if (!jsonMatch) {
    const firstCurly  = rawJSON.indexOf('{');
    const firstSquare = rawJSON.indexOf('[');
    const firstBracket = Math.min(
      firstCurly  > -1 ? firstCurly  : Infinity,
      firstSquare > -1 ? firstSquare : Infinity
    );
    const lastBracket = Math.max(rawJSON.lastIndexOf('}'), rawJSON.lastIndexOf(']'));
    if (firstBracket !== Infinity && lastBracket > firstBracket) {
      rawJSON = rawJSON.substring(firstBracket, lastBracket + 1);
    }
  }

  try {
    return JSON.parse(rawJSON.trim());
  } catch (e) {
    console.error('[Gemini] parseJSON failed. Raw text was:', text.slice(0, 500));
    throw new Error(`Gemini returned unparseable JSON: ${e.message}`);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// RESUME ANALYSIS
// ──────────────────────────────────────────────────────────────────────────────
const analyzeResume = async (resumeContent, targetRole = '') => {
  if (!model) return getFallbackResumeAnalysis();
  try {
    const prompt = `
You are an expert resume coach and career advisor. Analyze the following resume and provide detailed feedback.
${targetRole ? `Target role: ${targetRole}` : ''}

Resume Content:
${resumeContent}

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "actionVerbs": ["verb1", "verb2", ...],
  "keywordSuggestions": ["keyword1", "keyword2", ...],
  "suggestedSummary": "A compelling professional summary..."
}`;
    const text = await generateContent(prompt);
    return parseJSON(text);
  } catch (err) {
    console.error('Gemini resume analysis error:', err.message);
    return getFallbackResumeAnalysis();
  }
};

const getFallbackResumeAnalysis = () => ({
  overallScore: 72,
  atsScore: 68,
  strengths: ['Clear work history', 'Relevant skills listed', 'Good educational background'],
  improvements: [
    'Add quantifiable achievements (e.g., "increased sales by 30%")',
    'Use stronger action verbs',
    'Tailor keywords to target job description',
    'Add a compelling professional summary',
  ],
  actionVerbs: ['Achieved', 'Delivered', 'Led', 'Optimized', 'Implemented', 'Spearheaded'],
  keywordSuggestions: ['project management', 'cross-functional', 'stakeholder', 'KPIs'],
  suggestedSummary: 'Results-driven professional with proven expertise in delivering impactful solutions. Committed to driving growth and operational excellence.',
});

// ──────────────────────────────────────────────────────────────────────────────
// COVER LETTER GENERATION
// ──────────────────────────────────────────────────────────────────────────────
const generateCoverLetter = async ({ name, currentTitle, jobTitle, companyName, jobDescription, highlights, tone }) => {
  if (!model) return getFallbackCoverLetter(name, jobTitle, companyName);
  try {
    const prompt = `
Write a compelling ${tone} cover letter for:
Applicant: ${name}, currently a ${currentTitle}
Applying for: ${jobTitle} at ${companyName}
Job Description: ${jobDescription}
Key highlights to emphasize: ${highlights.join(', ')}

The cover letter should be professional, 3–4 paragraphs, and not use generic phrases.
Return only the cover letter text, no JSON.`;
    return await generateContent(prompt);
  } catch (err) {
    console.error('Gemini cover letter error:', err.message);
    return getFallbackCoverLetter(name, jobTitle, companyName);
  }
};

const getFallbackCoverLetter = (name, jobTitle, companyName) =>
  `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background and proven track record, I am confident in my ability to contribute meaningfully to your team.\n\nThroughout my career, I have consistently delivered results by combining technical expertise with strategic thinking. My experience aligns well with the requirements of this role, and I am excited about the opportunity to bring my skills to ${companyName}.\n\nI would welcome the opportunity to discuss how my background, skills, and accomplishments can contribute to your team's success. Thank you for considering my application.\n\nSincerely,\n${name}`;

// ──────────────────────────────────────────────────────────────────────────────
// JOB RECOMMENDATIONS
// ──────────────────────────────────────────────────────────────────────────────
const generateJobRecommendations = async ({ skills, currentTitle, industry, preferences }) => {
  if (!model) {
    console.warn('[Gemini] No model — returning fallback jobs');
    return getFallbackJobs(currentTitle);
  }
  try {
    console.log(`[Gemini] generateJobRecommendations called for role="${currentTitle}" industry="${industry}"`);
    const prompt = `
Generate 8 realistic job recommendations for a professional with:
Current Role: ${currentTitle}
Industry: ${industry}
Skills: ${skills.join(', ')}
Preferences: ${JSON.stringify(preferences)}

Return a JSON array of jobs with this structure:
[{
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, Country",
  "type": "full-time",
  "salary": { "min": 70000, "max": 100000, "currency": "USD" },
  "description": "Brief job description",
  "requiredSkills": ["skill1", "skill2"],
  "matchScore": 85,
  "source": "AI Generated"
}]`;
    const text = await generateContent(prompt);
    console.log('[Gemini] generateJobRecommendations raw response length:', text.length);
    const result = parseJSON(text);
    console.log(`[Gemini] generateJobRecommendations parsed OK, jobs=${result?.length}`);
    return result;
  } catch (err) {
    console.error('[Gemini] generateJobRecommendations error:', err.message);
    return getFallbackJobs(currentTitle);
  }
};

const getFallbackJobs = (currentTitle) => [
  { title: `Senior ${currentTitle}`, company: 'TechCorp Inc', location: 'Remote', type: 'full-time', salary: { min: 90000, max: 130000, currency: 'USD' }, description: 'Lead engineering efforts for scalable products.', requiredSkills: ['Leadership', 'Communication', 'Strategy'], matchScore: 90, source: 'AI Generated' },
  { title: `${currentTitle} Manager`, company: 'InnovateCo', location: 'New York, USA', type: 'full-time', salary: { min: 100000, max: 150000, currency: 'USD' }, description: 'Manage cross-functional teams and drive results.', requiredSkills: ['Management', 'Agile', 'Roadmapping'], matchScore: 82, source: 'AI Generated' },
  { title: `Lead ${currentTitle}`, company: 'StartupXYZ', location: 'San Francisco, USA', type: 'full-time', salary: { min: 120000, max: 160000, currency: 'USD' }, description: 'Shape technical direction and mentor junior team members.', requiredSkills: ['Mentoring', 'Architecture', 'Problem Solving'], matchScore: 78, source: 'AI Generated' },
];

// ──────────────────────────────────────────────────────────────────────────────
// CAREER PATH RECOMMENDATIONS
// ──────────────────────────────────────────────────────────────────────────────
const generateCareerPaths = async ({ currentRole, targetRole, skills, yearsOfExperience, workPreferences, mbtiType }) => {
  if (!model) return getFallbackCareerPaths(currentRole, targetRole);
  try {
    const prompt = `
Generate 2 detailed career path options from "${currentRole}" to "${targetRole}".
Years of Experience: ${yearsOfExperience}
Current Skills: ${skills.join(', ')}
MBTI Type: ${mbtiType || 'Unknown'}
Work Preferences: ${JSON.stringify(workPreferences)}

Return a JSON object:
{
  "paths": [{
    "title": "Path title",
    "description": "Overview",
    "timelineYears": 3,
    "steps": [{ "step": 1, "role": "Role Name", "duration": "12 months", "skills": [], "responsibilities": [], "avgSalary": 80000, "tips": "Key tip" }],
    "requiredSkills": [],
    "estimatedSalaryGrowth": "40% over 3 years",
    "difficulty": "moderate"
  }],
  "personalityInsights": {
    "mbtiAnalysis": "Analysis based on MBTI type",
    "careerAlignment": "How this path aligns with personality",
    "strengths": [],
    "challenges": []
  }
}`;
    const text = await generateContent(prompt);
    return parseJSON(text);
  } catch (err) {
    console.error('Gemini career path error:', err.message);
    return getFallbackCareerPaths(currentRole, targetRole);
  }
};

const getFallbackCareerPaths = (currentRole, targetRole) => ({
  paths: [
    {
      title: 'Standard Progression Path',
      description: `A structured journey from ${currentRole} to ${targetRole} through consistent skill development.`,
      timelineYears: 3,
      steps: [
        { step: 1, role: `Mid-level ${currentRole}`, duration: '12 months', skills: ['Leadership', 'Communication'], responsibilities: ['Lead small projects', 'Mentor juniors'], avgSalary: 75000, tips: 'Focus on impact metrics' },
        { step: 2, role: `Senior ${currentRole}`, duration: '12 months', skills: ['Strategy', 'Team Management'], responsibilities: ['Own major deliverables', 'Cross-team collaboration'], avgSalary: 95000, tips: 'Build your executive presence' },
        { step: 3, role: targetRole, duration: 'Ongoing', skills: ['Vision', 'P&L Management'], responsibilities: ['Set direction', 'Drive organisational growth'], avgSalary: 130000, tips: 'Develop a personal board of advisors' },
      ],
      requiredSkills: ['Leadership', 'Strategy', 'Communication', 'Data Analysis'],
      estimatedSalaryGrowth: '50% over 3 years',
      difficulty: 'moderate',
    },
  ],
  personalityInsights: {
    mbtiAnalysis: 'Your personality type shows strong analytical and leadership traits.',
    careerAlignment: 'This career path aligns well with your work preferences and long-term goals.',
    strengths: ['Strategic thinking', 'Problem solving', 'Communication'],
    challenges: ['Delegation', 'Managing ambiguity'],
  },
});

// ──────────────────────────────────────────────────────────────────────────────
// SKILL GAP ANALYSIS
// ──────────────────────────────────────────────────────────────────────────────
const analyzeSkillGap = async ({ currentSkills, targetRole, industry }) => {
  if (!model) {
    console.warn('[Gemini] No model — returning fallback skill gap');
    return getFallbackSkillGap(currentSkills, targetRole);
  }
  try {
    console.log(`[Gemini] analyzeSkillGap called for role="${targetRole}" industry="${industry}"`);
    const prompt = `
Perform a skill gap analysis for someone targeting: "${targetRole}" in "${industry}"
Current Skills: ${currentSkills.join(', ')}

Return JSON:
{
  "requiredSkills": [],
  "missingSkills": [{
    "skill": "Skill Name",
    "priority": "critical|high|medium|low",
    "estimatedLearningTime": "2-4 weeks",
    "resources": [{ "title": "Resource Name", "type": "course", "url": "https://...", "cost": "free" }]
  }],
  "strengthAreas": [],
  "overallReadiness": <0-100>,
  "prioritizedLearningOrder": []
}`;
    const text = await generateContent(prompt);
    console.log('[Gemini] analyzeSkillGap raw response length:', text.length);
    const result = parseJSON(text);
    console.log('[Gemini] analyzeSkillGap parsed OK, overallReadiness:', result.overallReadiness);
    return result;
  } catch (err) {
    console.error('[Gemini] analyzeSkillGap error:', err.message);
    return getFallbackSkillGap(currentSkills, targetRole);
  }
};

const getFallbackSkillGap = (currentSkills, targetRole) => ({
  requiredSkills: ['Python', 'SQL', 'Data Visualization', 'Machine Learning', 'Statistics', 'Communication'],
  missingSkills: [
    { skill: 'Machine Learning', priority: 'critical', estimatedLearningTime: '3-6 months', resources: [{ title: 'Machine Learning by Andrew Ng', type: 'course', url: 'https://coursera.org/learn/machine-learning', cost: 'free with audit' }] },
    { skill: 'Data Visualization', priority: 'high', estimatedLearningTime: '4-6 weeks', resources: [{ title: 'Tableau for Beginners', type: 'course', url: 'https://www.tableau.com/learn', cost: 'free' }] },
    { skill: 'Statistics', priority: 'high', estimatedLearningTime: '6-8 weeks', resources: [{ title: 'Khan Academy Statistics', type: 'tutorial', url: 'https://khanacademy.org/math/statistics-probability', cost: 'free' }] },
  ],
  strengthAreas: currentSkills.slice(0, 3),
  overallReadiness: 45,
  prioritizedLearningOrder: ['Machine Learning', 'Statistics', 'Data Visualization'],
});

// ──────────────────────────────────────────────────────────────────────────────
// LEARNING ROADMAP
// ──────────────────────────────────────────────────────────────────────────────
const generateLearningRoadmap = async ({ goal, targetRole, currentSkills, durationMonths }) => {
  if (!model) {
    console.warn('[Gemini] No model — returning fallback roadmap');
    return getFallbackRoadmap(goal, durationMonths);
  }
  try {
    console.log(`[Gemini] generateLearningRoadmap called: goal="${goal}", months=${durationMonths}`);
    const prompt = `
Create a highly detailed ${durationMonths}-month learning roadmap for a student aiming for this goal: "${goal}"
Target Role: ${targetRole || 'Professional'}
Current Skills: ${currentSkills.join(', ') || 'Beginner'}

Provide a structured learning path with specific, real-world topics, credible online course names (as examples), and concrete portfolio project ideas.

Return a JSON object with this exact structure:
{
  "phases": [{
    "month": 1,
    "title": "Phase Title (e.g., Foundations of JavaScript)",
    "focus": "Practical overview of the month's objective",
    "topics": ["Specific Topic (e.g., Asynchronous JS)", "Specific Topic (e.g., DOM Manipulation)"],
    "resources": [
      { "title": "Specific Course Name (e.g., The Complete JavaScript Course 2024)", "type": "course", "url": "https://...", "estimatedHours": 20 }
    ],
    "projects": [
      { "title": "Practical Project (e.g., Weather Dashboard)", "description": "Specific project details...", "skills": ["Skill 1", "Skill 2"] }
    ],
    "milestones": ["Clear milestone (e.g., Build and deploy a weather app)"]
  }]
}`;
    const text = await generateContent(prompt);
    console.log('[Gemini] generateLearningRoadmap raw response length:', text.length);
    const result = parseJSON(text);
    console.log(`[Gemini] generateLearningRoadmap parsed OK, phases=${result?.phases?.length}`);
    return result;
  } catch (err) {
    console.error('[Gemini] generateLearningRoadmap error:', err.message);
    return getFallbackRoadmap(goal, durationMonths);
  }
};

const getFallbackRoadmap = (goal, durationMonths) => {
  const g = (goal || '').toLowerCase();
  let phases = [];
  
  if (g.includes('entrepreneur') || g.includes('business') || g.includes('startup')) {
    phases = [
      { 
        month: 1, 
        title: 'Month 1: Market Research', 
        focus: 'Validate your idea and identify competitors', 
        topics: ['Customer Interviews', 'Lean Canvas', 'Competitive Analysis'], 
        resources: [{ title: 'The Lean Startup', type: 'book/course', url: 'https://steveblank.com', estimatedHours: 20 }], 
        projects: [{ title: 'Value Proposition Canvas', description: 'Define the core value of your product.', skills: ['Research', 'Strategy'] }], 
        milestones: ['Validated Problem Statement'] 
      },
      { 
        month: 2, 
        title: 'Month 2: MVP Design', 
        focus: 'Build a minimum viable product', 
        topics: ['No-code Tools', 'Prototyping', 'User Flows'], 
        resources: [{ title: 'Build and Launch with Webflow', type: 'course', url: 'https://webflow.com/university', estimatedHours: 30 }], 
        projects: [{ title: 'Landing Page Prototype', description: 'Build a high-fidelity prototype of your key feature.', skills: ['Design', 'UX'] }], 
        milestones: ['Completed Static Prototype'] 
      },
      { 
        month: 3, 
        title: 'Month 3: Sales & Growth', 
        focus: 'Acquire your first customers', 
        topics: ['B2B Sales', 'Content Marketing', 'Analytics'], 
        resources: [{ title: 'Growth Marketing 101', type: 'course', url: 'https://hubspot.com', estimatedHours: 40 }], 
        projects: [{ title: 'Cold Outreach Campaign', description: 'Reach out to 50 potential customers.', skills: ['Sales', 'Communication'] }], 
        milestones: ['First 10 Waitlist Signups'] 
      }
    ];
  } else if (g.includes('data') || g.includes('python') || g.includes('analy')) {
    phases = [
      { 
        month: 1, 
        title: 'Month 1: Python for Data', 
        focus: 'Master Python fundamentals', 
        topics: ['NumPy', 'Pandas', 'Jupyter Notebooks'], 
        resources: [{ title: 'Python for Data Science', type: 'course', url: 'https://coursera.org', estimatedHours: 40 }], 
        projects: [{ title: 'Exploratory Data Analysis', description: 'Analyze a dataset from Kaggle.', skills: ['Python', 'Pandas'] }], 
        milestones: ['Complete 5 EDA notebooks'] 
      }
    ];
  } else {
    phases = [
      {
        month: 1,
        title: `Month 1: ${goal} Foundations`,
        focus: `Master the fundamental concepts of ${goal}`,
        topics: ['Introduction & Core Principles', 'Industry Overview', 'Basic Tools & Frameworks'],
        resources: [{ title: 'Introductory Course', type: 'online course', url: 'https://learning.com', estimatedHours: 20 }],
        projects: [{ title: 'Beginner Project', description: `A small project to practice ${goal} basics.`, skills: ['Foundations'] }],
        milestones: ['Understand core terminology'],
      },
      {
        month: 2,
        title: `Month 2: Core ${goal} Skills`,
        focus: 'Develop technical competencies and practical knowledge',
        topics: ['Advanced Techniques', 'Standard Procedures', 'Technical Workflows'],
        resources: [{ title: 'Technical Mastery', type: 'course', url: 'https://learning.com', estimatedHours: 35 }],
        projects: [{ title: 'Technical Project', description: `Apply core ${goal} techniques in a real scenario.`, skills: ['Technical'] }],
        milestones: ['Complete technical assessment'],
      },
      {
        month: 3,
        title: `Month 3: Advanced ${goal} Practice`,
        focus: 'Deep dive into complex topics and real-world application',
        topics: ['Complex Problem Solving', 'Case Studies', 'Advanced Applications'],
        resources: [{ title: 'Advanced Workshop', type: 'workshop', url: 'https://learning.com', estimatedHours: 40 }],
        projects: [{ title: 'Capstone Project', description: `A comprehensive final project demonstrating ${goal} expertise.`, skills: ['Expertise', 'Problem Solving'] }],
        milestones: ['Complete complex case study'],
      }
    ];
  }

  return {
    phases: phases.slice(0, Math.min(durationMonths, 6))
  };
};

// ──────────────────────────────────────────────────────────────────────────────
// INTERVIEW QUESTIONS & FEEDBACK
// ──────────────────────────────────────────────────────────────────────────────
const generateInterviewQuestions = async ({ targetRole, company, interviewType, numQuestions = 10 }) => {
  if (!model) return getFallbackInterviewQuestions(targetRole, numQuestions);
  try {
    const prompt = `
Generate ${numQuestions} ${interviewType} interview questions for: "${targetRole}" at "${company || 'a tech company'}"

Return JSON array:
[{
  "question": "Question text",
  "category": "behavioral|technical|situational",
  "difficulty": "easy|medium|hard",
  "tips": ["Tip 1", "Tip 2"],
  "modelAnswer": "Example strong answer outline"
}]`;
    const text = await generateContent(prompt);
    return parseJSON(text);
  } catch (err) {
    console.error('Gemini interview questions error:', err.message);
    return getFallbackInterviewQuestions(targetRole, numQuestions);
  }
};

const evaluateAnswer = async ({ question, answer, role }) => {
  if (!model) return getFallbackEvaluation();
  try {
    const prompt = `
Evaluate this interview answer for a ${role} position:
Question: ${question}
Answer: ${answer}

Return JSON:
{
  "score": <0-10>,
  "feedback": "Detailed feedback",
  "strengths": [],
  "improvements": [],
  "modelAnswer": "A stronger version of the answer"
}`;
    const text = await generateContent(prompt);
    return parseJSON(text);
  } catch (err) {
    console.error('Gemini evaluation error:', err.message);
    return getFallbackEvaluation();
  }
};

const getFallbackInterviewQuestions = (role, n) =>
  Array.from({ length: n }, (_, i) => ({
    question: ['Tell me about yourself and your relevant experience.', `Why are you interested in this ${role} position?`, 'Describe a challenging project and how you overcame obstacles.', 'How do you handle competing priorities and deadlines?', 'What is your greatest professional achievement?', 'Describe a time when you had a conflict with a teammate.', 'How do you stay current with industry trends?', 'Where do you see yourself in 5 years?', 'What is your leadership style?', 'Do you have any questions for us?'][i % 10],
    category: ['behavioral', 'situational', 'behavioral', 'situational', 'behavioral', 'behavioral', 'technical', 'behavioral', 'behavioral', 'general'][i % 10],
    difficulty: ['easy', 'medium', 'medium', 'medium', 'medium', 'hard', 'medium', 'easy', 'medium', 'easy'][i % 10],
    tips: ['Use the STAR method', 'Be specific and concise'],
    modelAnswer: 'Focus on specific examples with measurable outcomes.',
  }));

const getFallbackEvaluation = () => ({
  score: 7,
  feedback: 'Good answer with relevant points. Consider adding specific measurable outcomes.',
  strengths: ['Clear structure', 'Relevant experience mentioned'],
  improvements: ['Add quantifiable results', 'Use STAR format more explicitly'],
  modelAnswer: 'Stronger answer would include: Situation → Task → Action → Result with metrics.',
});

// ──────────────────────────────────────────────────────────────────────────────
// INDUSTRY INSIGHTS
// ──────────────────────────────────────────────────────────────────────────────
const generateIndustryInsights = async ({ industry, role, location }) => {
  if (!model) return getFallbackIndustryInsights(industry, role);
  try {
    const prompt = `
Generate comprehensive industry insights for "${industry}" targeting "${role}" in "${location}".

Return JSON:
{
  "marketOverview": "Overview paragraph",
  "growthOutlook": "Positive|Neutral|Declining with explanation",
  "demandLevel": "very-high|high|medium|low",
  "salaryRanges": [{ "level": "Entry", "min": 50000, "max": 75000, "median": 62000, "currency": "USD" }],
  "topSkills": [{ "skill": "Skill Name", "demandScore": 90, "trend": "rising|stable|declining" }],
  "topCertifications": [],
  "topCompanies": [],
  "recommendedTraining": [{ "title": "Training Name", "provider": "Provider", "url": "https://...", "cost": "free|paid" }],
  "workTrends": []
}`;
    const text = await generateContent(prompt);
    return parseJSON(text);
  } catch (err) {
    console.error('Gemini industry insights error:', err.message);
    return getFallbackIndustryInsights(industry, role);
  }
};

const getFallbackIndustryInsights = (industry, role) => ({
  marketOverview: `The ${industry} industry is experiencing significant growth driven by digital transformation and AI adoption. Demand for skilled ${role}s continues to outpace supply.`,
  growthOutlook: 'Positive — projected 15% growth over the next 5 years',
  demandLevel: 'high',
  salaryRanges: [
    { level: 'Entry', min: 55000, max: 80000, median: 67000, currency: 'USD' },
    { level: 'Mid', min: 80000, max: 120000, median: 98000, currency: 'USD' },
    { level: 'Senior', min: 120000, max: 180000, median: 148000, currency: 'USD' },
    { level: 'Lead/Principal', min: 160000, max: 220000, median: 190000, currency: 'USD' },
  ],
  topSkills: [
    { skill: 'Python', demandScore: 92, trend: 'rising' },
    { skill: 'Cloud Platforms (AWS/GCP/Azure)', demandScore: 88, trend: 'rising' },
    { skill: 'Machine Learning', demandScore: 85, trend: 'rising' },
    { skill: 'SQL', demandScore: 80, trend: 'stable' },
    { skill: 'Data Visualization', demandScore: 76, trend: 'stable' },
  ],
  topCertifications: ['AWS Certified Solutions Architect', 'Google Professional Data Engineer', 'PMP'],
  topCompanies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix'],
  recommendedTraining: [
    { title: 'Google Data Analytics Certificate', provider: 'Coursera', url: 'https://coursera.org', cost: 'paid' },
    { title: 'AWS Free Tier Training', provider: 'AWS', url: 'https://aws.amazon.com/training', cost: 'free' },
  ],
  workTrends: ['Remote-first opportunities increasing', 'AI augmentation of workflows', 'Focus on cloud-native architecture', 'Cross-functional collaboration'],
});

module.exports = {
  analyzeResume,
  generateCoverLetter,
  generateJobRecommendations,
  generateCareerPaths,
  analyzeSkillGap,
  generateLearningRoadmap,
  generateInterviewQuestions,
  evaluateAnswer,
  generateIndustryInsights,
};
