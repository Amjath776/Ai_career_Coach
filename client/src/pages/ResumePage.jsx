/**
 * Resume Page — Upload/Edit resume and get AI feedback
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

const ScoreRing = ({ score, label, color = '#1a2e4a' }) => {
  const r = 38, c = 2 * Math.PI * r;
  const dash = ((score / 100) * c).toFixed(1);
  return (
    <div className="score-ring" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="score-ring-text">
        <div className="score-ring-value">{score}</div>
        <div className="score-ring-label">{label}</div>
      </div>
    </div>
  );
};

export default function ResumePage() {
  const [resume, setResume] = useState(null);
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    api.get('/resume').then(({ data }) => {
      setResume(data.resume);
      setContent(data.resume.content || '');
      if (data.resume.aiFeedback?.overallScore) setFeedback(data.resume.aiFeedback);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/resume', { content });
      setResume(data.resume);
      toast.success('Resume saved!');
    } catch { toast.error('Failed to save resume'); }
    finally { setSaving(false); }
  };

  const handleAnalyze = async () => {
    if (!content || content.trim().length < 50) {
      toast.error('Please enter at least 50 characters of resume content');
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await api.post('/resume/analyze', { content, targetRole });
      setFeedback(data.feedback);
      setActiveTab('feedback');
      toast.success('AI analysis complete! ');
    } catch { toast.error('Analysis failed. Please try again.'); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar />
        <div className="page-inner">
          <div className="page-header">
            <h1> AI Resume Builder</h1>
            <p>Paste or type your resume content, then get AI-powered feedback and optimization suggestions.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                {['editor', 'feedback'].map((tab) => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'editor' ? ' Resume Editor' : ` AI Feedback ${feedback ? `(Score: ${feedback.overallScore})` : ''}`}
                  </button>
                ))}
              </div>

              {activeTab === 'editor' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Resume Content</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving…' : ' Save'}
                        </button>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" htmlFor="targetRole">Target Job Role (optional)</label>
                      <input
                        id="targetRole"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Senior Software Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="resumeContent">Resume Text <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <textarea
                        id="resumeContent"
                        className="form-textarea"
                        placeholder="Paste your full resume here, or type it manually. Include your work experience, education, skills, and achievements..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ minHeight: 400, fontFamily: 'monospace', fontSize: '0.875rem' }}
                      />
                      <span className="form-error" style={{ color: 'var(--muted)' }}>{content.length} characters</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={analyzing}>
                        {analyzing ? ' Analyzing with AI…' : ' Analyze with AI'}
                      </button>
                      <button className="btn btn-outline" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : ' Save Draft'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'feedback' && (
                <div>
                  {!feedback ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                      
                      <h3>No Analysis Yet</h3>
                      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Go to the Resume Editor tab and click "Analyze with AI" to get feedback.</p>
                      <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('editor')}>Go to Editor →</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {/* Score cards */}
                      <div className="card">
                        <div className="card-header"><h3 className="card-title">Resume Scores</h3></div>
                        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <ScoreRing score={feedback.overallScore} label="Overall" color="#1a2e4a" />
                          <ScoreRing score={feedback.atsScore} label="ATS Score" color="#f59e0b" />
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                <span>Overall Quality</span><span>{feedback.overallScore}%</span>
                              </div>
                              <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${feedback.overallScore}%` }} /></div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                <span>ATS Compatibility</span><span>{feedback.atsScore}%</span>
                              </div>
                              <div className="progress-bar-track"><div className="progress-bar-fill accent" style={{ width: `${feedback.atsScore}%` }} /></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Strengths */}
                        <div className="card">
                          <div className="card-header"><h3 className="card-title"> Strengths</h3></div>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {feedback.strengths?.map((s, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--success)', marginTop: '0.1rem' }}></span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Improvements */}
                        <div className="card">
                          <div className="card-header"><h3 className="card-title"> Improvements</h3></div>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {feedback.improvements?.map((s, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--accent)', marginTop: '0.1rem' }}>→</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action verbs + keywords */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="card">
                          <div className="card-header"><h3 className="card-title"> Recommended Action Verbs</h3></div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {feedback.actionVerbs?.map((v) => <span key={v} className="badge badge-primary">{v}</span>)}
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-header"><h3 className="card-title"> Keyword Suggestions</h3></div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {feedback.keywordSuggestions?.map((k) => <span key={k} className="badge badge-accent">{k}</span>)}
                          </div>
                        </div>
                      </div>

                      {/* Suggested summary */}
                      {feedback.suggestedSummary && (
                        <div className="card">
                          <div className="card-header"><h3 className="card-title"> AI-Suggested Professional Summary</h3></div>
                          <p style={{ color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                            "{feedback.suggestedSummary}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
