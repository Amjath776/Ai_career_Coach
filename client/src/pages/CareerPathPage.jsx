/**
 * Career Path Page
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

const MBTI_TYPES = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

export default function CareerPathPage() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ currentRole: '', targetRole: '', industry: '', mbtiType: '' });

  useEffect(() => {
    api.get('/career-path').then(({ data }) => {
      setPaths(data.careerPaths);
      if (data.careerPaths.length > 0) setSelected(data.careerPaths[0]);
    }).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.currentRole || !form.targetRole) { toast.error('Current and target roles are required'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/career-path/generate', form);
      setPaths((prev) => [data.careerPath, ...prev]);
      setSelected(data.careerPath);
      toast.success('Career paths generated! 🗺️');
    } catch { toast.error('Generation failed'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this career path?')) return;
    await api.delete(`/career-path/${id}`);
    setPaths((prev) => prev.filter((p) => p._id !== id));
    if (selected?._id === id) setSelected(null);
    toast.success('Deleted');
  };

  const difficultyBadge = { easy: 'badge-success', moderate: 'badge-primary', challenging: 'badge-danger' };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Career Path Recommendations" />
        <div className="page-inner">
          <div className="page-header">
            <h1>🗺️ Career Path Recommendations</h1>
            <p>Visualize your journey to your target role with personalized, AI-generated step-by-step paths.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              {/* Form */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 className="card-title">Generate Career Path</h3></div>
                <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label">Current Role <span>*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Junior Developer"
                      value={form.currentRole} onChange={e => setForm(p => ({ ...p, currentRole: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Role <span>*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. CTO"
                      value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input type="text" className="form-input" placeholder="e.g. Technology"
                      value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MBTI Type</label>
                    <select className="form-select" value={form.mbtiType} onChange={e => setForm(p => ({ ...p, mbtiType: e.target.value }))}>
                      <option value="">Unknown</option>
                      {MBTI_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={generating} style={{ height: '42px' }}>
                    {generating ? '🤖 Generating…' : '🗺️ Generate'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
                {/* Previous analyses */}
                <div>
                  {paths.map((p) => (
                    <div key={p._id}
                      className="card"
                      style={{ cursor: 'pointer', marginBottom: '0.75rem', padding: '1rem', border: selected?._id === p._id ? '2px solid var(--primary)' : undefined }}
                      onClick={() => setSelected(p)}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.currentRole} → {p.targetRole}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                      <button className="btn btn-danger btn-sm" style={{ marginTop: '0.5rem', width: '100%' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}>Delete</button>
                    </div>
                  ))}
                </div>

                {/* Path detail */}
                {selected ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Personality insights */}
                    {selected.personalityInsights?.mbtiAnalysis && (
                      <div className="card">
                        <div className="card-header"><h3 className="card-title">🧠 Personality Insights {selected.mbtiType && `(${selected.mbtiType})`}</h3></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                          <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{selected.personalityInsights.mbtiAnalysis}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selected.personalityInsights.careerAlignment}</p>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--success)' }}>✓ Strengths</div>
                            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                              {selected.personalityInsights.strengths?.map((s) => <li key={s} className="badge badge-success">{s}</li>)}
                            </ul>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--danger)' }}>⚡ Challenges</div>
                            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                              {selected.personalityInsights.challenges?.map((c) => <li key={c} className="badge badge-danger">{c}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Paths */}
                    {selected.paths?.map((path, pi) => (
                      <div key={pi} className="card">
                        <div className="card-header">
                          <div>
                            <h3 className="card-title">{path.title}</h3>
                            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{path.description}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className={`badge ${difficultyBadge[path.difficulty] || 'badge-muted'}`}>{path.difficulty}</span>
                            <span className="badge badge-muted">⏱️ {path.timelineYears}y</span>
                            <span className="badge badge-success">📈 {path.estimatedSalaryGrowth}</span>
                          </div>
                        </div>

                        {/* Steps timeline */}
                        <div style={{ position: 'relative' }}>
                          {path.steps?.map((step, si) => (
                            <div key={si} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
                              {/* Connector line */}
                              {si < path.steps.length - 1 && (
                                <div style={{ position: 'absolute', left: 15, top: 32, bottom: -24, width: 2, background: 'var(--card-border)' }} />
                              )}
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                {step.step}
                              </div>
                              <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{step.role}</div>
                                <div style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                  ⏱️ {step.duration} · 💰 ${step.avgSalary?.toLocaleString() || 'N/A'}/yr
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                                  {step.skills?.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                                </div>
                                {step.tips && (
                                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    💡 {step.tips}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Required Skills</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {path.requiredSkills?.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                    <h3>Generate Your Career Path</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Fill in your current and target roles to get personalized career paths.</p>
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
