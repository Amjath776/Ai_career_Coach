/**
 * Interview Preparation Page
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

export default function InterviewPrepPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState({});
  const [form, setForm] = useState({ targetRole: '', targetCompany: '', interviewType: 'mixed', numQuestions: 10 });

  useEffect(() => {
    api.get('/interview').then(({ data }) => {
      setSessions(data.sessions);
      if (data.sessions.length > 0) setSelected(data.sessions[0]);
    }).finally(() => setLoading(false));
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!form.targetRole) { toast.error('Target role is required'); return; }
    setStarting(true);
    try {
      const { data } = await api.post('/interview/start', form);
      setSessions((prev) => [data.session, ...prev]);
      setSelected(data.session);
      setCurrentQ(0);
      setAnswer('');
      setShowFeedback({});
      toast.success('Interview session started! 🎤');
    } catch { toast.error('Failed to start session'); }
    finally { setStarting(false); }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) { toast.error('Please type your answer'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.put(`/interview/${selected._id}/answer`, { questionIndex: currentQ, answer });
      setSelected(data.session);
      setShowFeedback((prev) => ({ ...prev, [currentQ]: true }));
      toast.success('Answer submitted — AI feedback ready!');
      setAnswer('');
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  };

  const handleComplete = async () => {
    try {
      const { data } = await api.put(`/interview/${selected._id}/complete`);
      setSelected(data.session);
      setSessions((prev) => prev.map((s) => s._id === data.session._id ? data.session : s));
      toast.success('Session completed! Great work 🎉');
    } catch { toast.error('Failed to complete session'); }
  };

  const q = selected?.questions?.[currentQ];
  const answeredCount = selected?.questions?.filter((q) => q.userAnswer).length || 0;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Interview Preparation" />
        <div className="page-inner">
          <div className="page-header">
            <h1>🎤 Interview Preparation</h1>
            <p>Practice with AI-generated role-specific questions and get instant feedback on your answers.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              {/* Start form */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 className="card-title">Start New Interview Session</h3></div>
                <form onSubmit={handleStart} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 120px auto', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label">Target Role <span>*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Product Manager"
                      value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Company</label>
                    <input type="text" className="form-input" placeholder="e.g. Google (optional)"
                      value={form.targetCompany} onChange={e => setForm(p => ({ ...p, targetCompany: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Interview Type</label>
                    <select className="form-select" value={form.interviewType} onChange={e => setForm(p => ({ ...p, interviewType: e.target.value }))}>
                      <option value="mixed">Mixed</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="case-study">Case Study</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Questions</label>
                    <select className="form-select" value={form.numQuestions} onChange={e => setForm(p => ({ ...p, numQuestions: parseInt(e.target.value) }))}>
                      {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={starting} style={{ height: '42px' }}>
                    {starting ? '⏳ Starting…' : '🎤 Start'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
                {/* Session list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sessions.map((s) => (
                    <div key={s._id}
                      className="card"
                      style={{ cursor: 'pointer', padding: '0.875rem', border: selected?._id === s._id ? '2px solid var(--primary)' : undefined }}
                      onClick={() => { setSelected(s); setCurrentQ(0); setAnswer(''); setShowFeedback({}); }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.targetRole}</div>
                      {s.targetCompany && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.targetCompany}</div>}
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-muted">{s.interviewType}</span>
                        <span className="badge badge-muted">{s.questions?.length}Q</span>
                        {s.overallScore > 0 && <span className="badge badge-success">Score: {s.overallScore}/10</span>}
                        {s.completedAt && <span className="badge badge-primary">Done</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active session */}
                {selected ? (
                  <div>
                    {/* Progress bar */}
                    <div className="card" style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{selected.targetRole} {selected.targetCompany && `@ ${selected.targetCompany}`}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{answeredCount}/{selected.questions?.length} answered</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill success" style={{ width: `${(answeredCount / (selected.questions?.length || 1)) * 100}%` }} />
                      </div>

                      {/* Question nav */}
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {selected.questions?.map((q, i) => (
                          <button key={i} onClick={() => { setCurrentQ(i); setAnswer(''); }}
                            style={{
                              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                              background: i === currentQ ? 'var(--primary)' : q.userAnswer ? 'var(--success)' : 'var(--surface)',
                              color: (i === currentQ || q.userAnswer) ? '#fff' : 'var(--text)',
                            }}
                          >{i + 1}</button>
                        ))}
                      </div>
                    </div>

                    {/* Current question */}
                    {q && (
                      <div className="question-card">
                        <div className="question-number">Question {currentQ + 1} of {selected.questions.length} · {q.category} · {q.difficulty}</div>
                        <div className="question-text">{q.question}</div>

                        {/* Tips */}
                        {q.tips?.length > 0 && (
                          <div style={{ background: '#fef3c7', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            💡 <strong>Tips:</strong> {q.tips.join(' · ')}
                          </div>
                        )}

                        {/* Answer box */}
                        <div className="form-group">
                          <label className="form-label">Your Answer</label>
                          <textarea
                            className="form-textarea"
                            placeholder="Type your answer here. Be specific, use examples, follow the STAR method for behavioral questions..."
                            value={answer || q.userAnswer || ''}
                            onChange={e => setAnswer(e.target.value)}
                            disabled={!!q.userAnswer}
                            style={{ minHeight: 150 }}
                          />
                        </div>

                        <div className="answer-actions">
                          {!q.userAnswer ? (
                            <button className="btn btn-primary" onClick={handleSubmitAnswer} disabled={submitting}>
                              {submitting ? '🤖 Evaluating…' : '🤖 Submit & Get AI Feedback'}
                            </button>
                          ) : (
                            <div className="ai-feedback-box">
                              <h4>🤖 AI Feedback</h4>
                              <div className="score-display">
                                Score: <span style={{ color: q.aiScore >= 7 ? 'var(--success)' : q.aiScore >= 5 ? 'var(--accent)' : 'var(--danger)', fontSize: '1.125rem' }}>{q.aiScore}/10</span>
                              </div>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{q.aiFeedback}</p>
                              {q.modelAnswer && (
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--success-bg)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                                  <strong>Model Answer:</strong> {q.modelAnswer}
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                            {currentQ > 0 && <button className="btn btn-ghost btn-sm" onClick={() => { setCurrentQ(currentQ - 1); setAnswer(''); }}>← Prev</button>}
                            {currentQ < selected.questions.length - 1 && (
                              <button className="btn btn-outline btn-sm" onClick={() => { setCurrentQ(currentQ + 1); setAnswer(''); }}>Next →</button>
                            )}
                            {answeredCount === selected.questions.length && !selected.completedAt && (
                              <button className="btn btn-accent btn-sm" onClick={handleComplete}>Complete Session ✓</button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Completed session summary */}
                    {selected.completedAt && (
                      <div className="card" style={{ marginTop: '1.25rem' }}>
                        <div className="card-header"><h3 className="card-title">📋 Session Summary</h3></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                          <div style={{ padding: '1.25rem', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{selected.overallScore}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Overall Score (out of 10)</div>
                          </div>
                          <div style={{ padding: '1.25rem', background: 'var(--success-bg)', borderRadius: 'var(--radius)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{answeredCount}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Questions Answered</div>
                          </div>
                          <div style={{ padding: '1.25rem', background: '#fef3c7', borderRadius: 'var(--radius)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{selected.interviewType}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Interview Type</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎤</div>
                    <h3>Start an Interview Session</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Fill in the form above to generate interview questions for your target role.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
