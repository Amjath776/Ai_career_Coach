/**
 * Learning Roadmap Page
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

export default function LearningRoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [form, setForm] = useState({ goal: '', targetRole: '', durationMonths: 6 });

  useEffect(() => {
    console.log('[Roadmap] Fetching roadmaps...');
    api.get('/roadmap')
      .then(({ data }) => {
        console.log('[Roadmap] Loaded:', data.roadmaps?.length, 'roadmaps');
        setRoadmaps(data.roadmaps);
        if (data.roadmaps.length > 0) setSelected(data.roadmaps[0]);
      })
      .catch((err) => {
        console.error('[Roadmap] Failed to load:', err.response?.data || err.message);
        toast.error('Failed to load roadmaps');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.goal) { toast.error('Learning goal is required'); return; }

    console.log('[Roadmap] Creating roadmap with:', form);
    setGenerating(true);
    try {
      const { data } = await api.post('/roadmap/generate', form);
      console.log('[Roadmap] Created:', data.roadmap?._id, `(${data.roadmap?.phases?.length} phases)`);
      setRoadmaps((prev) => [data.roadmap, ...prev]);
      setSelected(data.roadmap);
      toast.success('Learning roadmap created! ');
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const isTimeout = err.code === 'ECONNABORTED';
      const displayMessage = isTimeout
        ? 'Request timed out — AI is thinking. Please try again.'
        : serverMessage || 'Generation failed. Please try again.';

      console.error('[Roadmap] Generation failed:');
      console.error('  Status :', err.response?.status);
      console.error('  Message:', serverMessage || err.message);
      console.error('  Full response:', err.response?.data);

      toast.error(displayMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handlePhaseUpdate = async (month, completed) => {
    try {
      const { data } = await api.put(`/roadmap/${selected._id}/phase/${month}`, {
        completed,
        progressPercent: completed ? 100 : 0,
      });
      setSelected(data.roadmap);
      setRoadmaps((prev) => prev.map((r) => r._id === data.roadmap._id ? data.roadmap : r));
      toast.success(completed ? 'Phase completed! ' : 'Phase marked incomplete');
    } catch (err) {
      console.error('[Roadmap] Phase update failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this roadmap?')) return;
    try {
      await api.delete(`/roadmap/${id}`);
      setRoadmaps((prev) => prev.filter((r) => r._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Deleted');
    } catch (err) {
      console.error('[Roadmap] Delete failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Learning Roadmap" />
        <div className="page-inner">
          <div className="page-header">
            <h1> Learning Roadmap</h1>
            <p>AI-generated structured learning plans with monthly milestones and project suggestions.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              {/* Form */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 className="card-title">Create New Roadmap</h3></div>
                <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 120px auto', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label">Learning Goal <span>*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Become a Full-Stack Developer"
                      value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Role</label>
                    <input type="text" className="form-input" placeholder="e.g. React Developer"
                      value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <select className="form-select" value={form.durationMonths} onChange={e => setForm(p => ({ ...p, durationMonths: parseInt(e.target.value) }))}>
                      {[3, 6, 9, 12].map((m) => <option key={m} value={m}>{m} months</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={generating} style={{ height: '42px' }}>
                    {generating ? ' Generating…' : ' Create'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {roadmaps.map((r) => (
                    <div key={r._id}
                      className="card"
                      style={{ cursor: 'pointer', padding: '0.875rem', border: selected?._id === r._id ? '2px solid var(--primary)' : undefined }}
                      onClick={() => setSelected(r)}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{r.goal}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{r.durationMonths} months · {r.phases?.length} phases</div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span>Progress</span><span>{r.overallProgress}%</span>
                        </div>
                        <div className="progress-bar-track" style={{ height: 6 }}>
                          <div className="progress-bar-fill success" style={{ width: `${r.overallProgress}%` }} />
                        </div>
                      </div>
                      <button className="btn btn-danger btn-sm" style={{ width: '100%' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}>Delete</button>
                    </div>
                  ))}
                </div>

                {/* Detail */}
                {selected ? (
                  <div>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                      <div className="card-header">
                        <div>
                          <h3 className="card-title">{selected.goal}</h3>
                          {selected.targetRole && <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Target: {selected.targetRole}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{selected.overallProgress}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Complete</div>
                        </div>
                      </div>
                      <div className="progress-bar-track" style={{ height: 10 }}>
                        <div className="progress-bar-fill success" style={{ width: `${selected.overallProgress}%` }} />
                      </div>
                    </div>

                    {/* Phases */}
                    {selected.phases?.map((phase) => (
                      <div key={phase.month} className="roadmap-phase">
                        <div className="roadmap-phase-header"
                          onClick={() => setExpandedPhase(expandedPhase === phase.month ? null : phase.month)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            <div className={`phase-number ${phase.completed ? 'done' : ''}`}>{phase.completed ? '' : phase.month}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{phase.title}</div>
                              <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{phase.focus}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                              type="checkbox"
                              checked={phase.completed}
                              onChange={(e) => { e.stopPropagation(); handlePhaseUpdate(phase.month, e.target.checked); }}
                              style={{ width: 18, height: 18, accentColor: 'var(--success)', cursor: 'pointer' }}
                              onClick={e => e.stopPropagation()}
                            />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{expandedPhase === phase.month ? '' : ''}</span>
                          </div>
                        </div>

                        {expandedPhase === phase.month && (
                          <div className="roadmap-phase-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}> Topics</div>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {phase.topics?.map((t, i) => <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>• {t}</li>)}
                                </ul>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '1rem', marginBottom: '0.5rem' }}> Milestones</div>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {phase.milestones?.map((m, i) => <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}> {m}</li>)}
                                </ul>
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}> Resources</div>
                                {phase.resources?.map((r, i) => (
                                  <div key={i} style={{ fontSize: '0.8125rem', marginBottom: '0.375rem', padding: '0.5rem', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ fontWeight: 500 }}>{r.title}</div>
                                    <div style={{ color: 'var(--muted)' }}>{r.type} · {r.estimatedHours}h</div>
                                  </div>
                                ))}
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '1rem', marginBottom: '0.5rem' }}> Projects</div>
                                {phase.projects?.map((p, i) => (
                                  <div key={i} style={{ fontSize: '0.8125rem', padding: '0.5rem', background: '#fef3c7', borderRadius: 'var(--radius)', marginBottom: '0.375rem' }}>
                                    <div style={{ fontWeight: 500 }}>{p.title}</div>
                                    <div style={{ color: 'var(--muted)' }}>{p.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    
                    <h3>Create Your First Roadmap</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Enter a learning goal above to generate a structured monthly plan.</p>
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
