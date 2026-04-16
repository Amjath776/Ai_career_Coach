/**
 * Industry Insights Page
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TREND_COLORS = { rising: 'badge-success', stable: 'badge-primary', declining: 'badge-danger' };

export default function IndustryInsightsPage() {
  const [insights, setInsights] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ industry: '', role: '', location: 'Global' });

  useEffect(() => {
    api.get('/industry').then(({ data }) => {
      setInsights(data.insights);
      if (data.insights.length > 0) setSelected(data.insights[0]);
    }).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.industry) { toast.error('Industry is required'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/industry/generate', form);
      setInsights((prev) => [data.insight, ...prev]);
      setSelected(data.insight);
      toast.success('Industry insights generated! 📊');
    } catch { toast.error('Generation failed'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this insight?')) return;
    await api.delete(`/industry/${id}`);
    setInsights((prev) => prev.filter((i) => i._id !== id));
    if (selected?._id === id) setSelected(insights.find(i => i._id !== id) || null);
    toast.success('Deleted');
  };

  const salaryChartData = selected?.salaryRanges ? {
    labels: selected.salaryRanges.map((s) => s.level),
    datasets: [
      { label: 'Min Salary', data: selected.salaryRanges.map((s) => s.min), backgroundColor: '#dbeafe', borderRadius: 4 },
      { label: 'Median', data: selected.salaryRanges.map((s) => s.median), backgroundColor: '#1a2e4a', borderRadius: 4 },
      { label: 'Max Salary', data: selected.salaryRanges.map((s) => s.max), backgroundColor: '#f59e0b', borderRadius: 4 },
    ],
  } : null;

  const demandBadge = { 'very-high': 'badge-success', high: 'badge-primary', medium: 'badge-accent', low: 'badge-danger' };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Industry Insights" />
        <div className="page-inner">
          <div className="page-header">
            <h1>📊 Industry Insights</h1>
            <p>Real-time market data, salary benchmarks, top skills, and growth forecasts by industry.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              {/* Form */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 className="card-title">Generate Industry Report</h3></div>
                <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label">Industry <span>*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Technology, Healthcare"
                      value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input type="text" className="form-input" placeholder="e.g. Software Engineer"
                      value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-input" placeholder="e.g. USA, Global"
                      value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={generating} style={{ height: '42px' }}>
                    {generating ? '🤖 Generating…' : '📊 Generate'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {insights.map((ins) => (
                    <div key={ins._id}
                      className="card"
                      style={{ cursor: 'pointer', padding: '0.875rem', border: selected?._id === ins._id ? '2px solid var(--primary)' : undefined }}
                      onClick={() => setSelected(ins)}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ins.industry}</div>
                      {ins.role && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{ins.role}</div>}
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
                        <span className="badge badge-muted">{ins.location}</span>
                        <span className={`badge ${demandBadge[ins.demandLevel] || 'badge-muted'}`}>{ins.demandLevel}</span>
                      </div>
                      <button className="btn btn-danger btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(ins._id); }}>Delete</button>
                    </div>
                  ))}
                </div>

                {/* Detail */}
                {selected ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Header card */}
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selected.industry}</h2>
                          {selected.role && <div style={{ color: 'var(--muted)' }}>Role: {selected.role} · {selected.location}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${demandBadge[selected.demandLevel] || 'badge-muted'}`} style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
                            Demand: {selected.demandLevel?.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selected.marketOverview}</p>
                      {selected.growthOutlook && (
                        <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--success-bg)', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: '#065f46' }}>
                          📈 <strong>Growth Outlook:</strong> {selected.growthOutlook}
                        </div>
                      )}
                    </div>

                    {/* Salary chart */}
                    {salaryChartData && (
                      <div className="card">
                        <div className="card-header"><h3 className="card-title">💰 Salary Ranges by Level (USD)</h3></div>
                        <Bar data={salaryChartData} options={{
                          responsive: true,
                          plugins: { legend: { position: 'bottom' } },
                          scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
                        }} />
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      {/* Top skills */}
                      <div className="card">
                        <div className="card-header"><h3 className="card-title">🔥 Top In-Demand Skills</h3></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {selected.topSkills?.map((s, i) => (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.skill}</span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <span className={`badge ${TREND_COLORS[s.trend] || 'badge-muted'}`} style={{ fontSize: '0.7rem' }}>{s.trend}</span>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{s.demandScore}%</span>
                                </div>
                              </div>
                              <div className="progress-bar-track" style={{ height: 6 }}>
                                <div className="progress-bar-fill" style={{ width: `${s.demandScore}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications + companies */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card">
                          <div className="card-header"><h3 className="card-title">🏆 Top Certifications</h3></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selected.topCertifications?.map((c, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>#{i + 1}</span> {c}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-header"><h3 className="card-title">🏢 Top Companies</h3></div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {selected.topCompanies?.map((c) => <span key={c} className="badge badge-muted">{c}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Work trends */}
                    {selected.workTrends?.length > 0 && (
                      <div className="card">
                        <div className="card-header"><h3 className="card-title">🌐 Work Trends</h3></div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                          {selected.workTrends.map((t, i) => (
                            <div key={i} style={{ padding: '0.625rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', fontSize: '0.875rem', border: '1px solid var(--card-border)' }}>
                              ✦ {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended training */}
                    {selected.recommendedTraining?.length > 0 && (
                      <div className="card">
                        <div className="card-header"><h3 className="card-title">📚 Recommended Training</h3></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          {selected.recommendedTraining.map((t, i) => (
                            <div key={i} style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t.title}</div>
                              <div style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>{t.provider} · {t.cost}</div>
                              {t.url && (
                                <a href={t.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>View →</a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                    <h3>Generate Industry Insights</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Enter an industry name above to get market data, salary benchmarks, and trend analysis.</p>
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
