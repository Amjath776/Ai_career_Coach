/**
 * Landing Page
 * Professional hero section, feature showcase, and CTAs.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '', title: 'AI Resume Analysis', desc: 'Get detailed feedback on your resume with ATS optimization, action verb suggestions, and a professional score.' },
  { icon: '', title: 'Cover Letter Generator', desc: 'Generate tailored, role-specific cover letters in seconds with customizable tone and highlights.' },
  { icon: '', title: 'Smart Job Matching', desc: 'Discover jobs that match your skills and preferences with AI-powered match scoring.' },
  { icon: '', title: 'Career Path Planning', desc: 'Visualize your journey from current role to dream job with step-by-step roadmaps.' },
  { icon: '', title: 'Skill Gap Analysis', desc: 'Identify missing skills for your target role with prioritized learning resources and timelines.' },
  { icon: '', title: 'Learning Roadmaps', desc: 'Follow structured monthly plans with curated resources, projects, and milestone tracking.' },
  { icon: '', title: 'Interview Preparation', desc: 'Practice with role-specific questions and get instant AI feedback on your answers.' },
  { icon: '', title: 'Industry Insights', desc: 'Access real-time salary data, top skills, market trends, and growth forecasts by industry.' },
  { icon: '', title: 'Personality Analysis', desc: 'Discover career paths aligned with your Myers-Briggs personality type and work preferences.' },
];

const STATS = [
  { value: '10,000+', label: 'Career Plans Generated' },
  { value: '95%', label: 'User Satisfaction' },
  { value: '8', label: 'AI-Powered Tools' },
  { value: '500+', label: 'Job Roles Covered' },
];

export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-logo">
            AI Career <span>Coach</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <h1>Accelerate Your Career with <span>AI-Powered</span> Coaching</h1>
        <p>
          From resume optimization to interview prep — AI Career Coach gives you every tool you need to land your dream job and grow your career.
        </p>
        <div className="landing-hero-cta">
          <Link to="/signup" className="btn btn-accent btn-lg">Start for Free →</Link>
          <Link to="/login" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Sign In
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-features-inner">
          <h2>Everything You Need to Succeed</h2>
          <p className="landing-features-subtitle">
            Nine AI-powered tools, one platform. Built to take you from job seeker to career champion.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                {f.icon && <div className="feature-icon">{f.icon}</div>}
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 2rem', background: 'var(--card)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Get Started in Three Steps</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '3rem' }}>Simple, fast, and completely AI-powered.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up and tell us about your experience, skills, and career goals.' },
              { step: '02', title: 'Explore AI Tools', desc: 'Use our suite of AI tools to analyze, plan, and prepare for your next career move.' },
              { step: '03', title: 'Land Your Dream Job', desc: 'Apply with confidence using AI-optimized resumes, cover letters, and interview skills.' },
            ].map((s) => (
              <div key={s.step} style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '1rem' }}>{s.step}</div>
                <h3 style={{ marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-section">
        <h2>Ready to Take Control of Your Career?</h2>
        <p>Join thousands of professionals using AI Career Coach to land better jobs faster.</p>
        <Link to="/signup" className="btn btn-accent btn-lg">Create Free Account →</Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} AI Career Coach. Built with React, Node.js &amp; Google Gemini AI.</p>
      </footer>
    </div>
  );
}
