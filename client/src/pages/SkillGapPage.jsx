/**
 * Skill Gap Analysis Page
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const PRIORITY_COLORS = { critical: 'badge-danger', high: 'badge-accent', medium: 'badge-primary', low: 'badge-muted' };

export default function SkillGapPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ targetRole: '', targetIndustry: '' });

  useEffect(() => {
    console.log('[SkillGap] Fetching existing analyses...');
    api.get('/skill-gap')
      .then(({ data }) => {
        console.log('[SkillGap] Loaded analyses:', data.skillGaps?.length);
        setAnalyses(data.skillGaps);
        if (data.skillGaps.length > 0) setSelected(data.skillGaps[0]);
      })
      .catch((err) => {
        console.error('[SkillGap] Failed to load analyses:', err.response?.data || err.message);
        toast.error('Failed to load previous analyses');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!form.targetRole) { toast.error('Target role is required'); return; }

    console.log('[SkillGap] Submitting analysis request:', form);
    setAnalyzing(true);
    try {
      const { data } = await api.post('/skill-gap/analyze', form);
      console.log('[SkillGap] Analysis succeeded:', data.skillGap);
      setAnalyses((prev) => [data.skillGap, ...prev]);
      setSelected(data.skillGap);
      toast.success('Skill gap analysis complete! ');
    } catch (err) {
      // Extract the most meaningful error message available
      const serverMessage = err.response?.data?.message;
      const networkError = err.code === 'ECONNABORTED' ? 'Request timed out — the AI is taking too long. Try again.' : null;
      const displayMessage = serverMessage || networkError || 'Analysis failed. Please try again.';

      console.error('[SkillGap] Analysis failed:');
      console.error('  Status :', err.response?.status);
      console.error('  Message:', serverMessage || err.message);
      console.error('  Full error:', err.response?.data);

      toast.error(displayMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const radarData = selected ? {
    labels: selected.missingSkills?.slice(0, 6).map((s) => s.skill) || [],
    datasets: [{
      label: 'Skill Gap',
      data: selected.missingSkills?.slice(0, 6).map((_, i) => Math.max(10, 100 - i * 15)) || [],
      borderColor: '#dc2626',
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      pointBackgroundColor: '#dc2626',
      borderWidth: 2,
    }, {
      label: 'Current Skills',
      data: selected.missingSkills?.slice(0, 6).map(() => 0) || [],
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      pointBackgroundColor: '#059669',
      borderWidth: 2,
    }],
  } : null;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar />
        <div className="page-inner">
          <div className="page-header">
            <h1> Skill Gap Analysis</h1>
            <p>Discover what skills you're missing for your target role and get a prioritized learning plan.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              {/* Form */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 className="card-title">Analyze Your Skill Gap</h3></div>
                <form onSubmit={handleAnalyze} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sg-role">Target Role <span>*</span></label>
                    <input id="sg-role" type="text" className="form-input" placeholder="e.g. Data Scientist"
                      value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sg-industry">Target Industry</label>
                    <input id="sg-industry" type="text" className="form-input" placeholder="e.g. FinTech"
                      value={form.targetIndustry} onChange={e => setForm(p => ({ ...p, targetIndustry: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={analyzing} style={{ height: '42px' }}>
                    {analyzing ? ' Analyzing…' : ' Analyze Gap'}
                  </button>
                </form>
              </div>

              {selected ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Readiness */}
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">Overall Readiness for "{selected.targetRole}"</h3></div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <span>Readiness Score</span>
                        <strong>{selected.overallReadiness}%</strong>
                      </div>
                      <div className="progress-bar-track" style={{ height: 12 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${selected.overallReadiness}%`,
                          background: selected.overallReadiness >= 70 ? 'var(--success)' : selected.overallReadiness >= 40 ? 'var(--accent)' : 'var(--danger)',
                        }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Your Strengths</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selected.strengthAreas?.map((s) => <span key={s} className="badge badge-success">{s}</span>)}
                      </div>
                    </div>
                    {radarData && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <Radar data={radarData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } } }} />
                      </div>
                    )}
                  </div>

                  {/* Missing skills */}
                  <div className="card">
                    <div className="card-header"><h3 className="card-title">Missing Skills (Prioritized)</h3></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: 520 }}>
                      {selected.missingSkills?.map((skill, i) => (
                        <div key={i} style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9375rem' }}>{skill.skill}</strong>
                            <span className={`badge ${PRIORITY_COLORS[skill.priority] || 'badge-muted'}`}>{skill.priority}</span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                             Est. time: {skill.estimatedLearningTime}
                          </div>
                          {skill.resources?.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Resources:</div>
                              {skill.resources.slice(0, 2).map((r, ri) => (
                                <div key={ri} style={{ fontSize: '0.8125rem', color: 'var(--info)', marginBottom: '0.2rem' }}>
                                   {r.url ? <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--info)' }}>{r.title}</a> : r.title}
                                  {r.cost && <span style={{ color: 'var(--muted)' }}> ({r.cost})</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority order */}
                  <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header"><h3 className="card-title"> Recommended Learning Order</h3></div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selected.prioritizedLearningOrder?.map((skill, i) => (
                        <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                          <span style={{ width: 24, height: 24, background: 'var(--primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                  
                  <h3>No Analysis Yet</h3>
                  <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Enter a target role above to discover your skill gaps.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
