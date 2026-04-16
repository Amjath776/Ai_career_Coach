/**
 * Cover Letter Page
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

export default function CoverLetterPage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    jobTitle: '', companyName: '', jobDescription: '',
    tone: 'professional', highlights: '',
  });

  useEffect(() => {
    api.get('/cover-letter').then(({ data }) => setLetters(data.coverLetters)).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.jobTitle.trim()) { toast.error('Job title is required'); return; }
    setGenerating(true);
    try {
      const payload = { ...form, highlights: form.highlights ? form.highlights.split(',').map(h => h.trim()) : [] };
      const { data } = await api.post('/cover-letter/generate', payload);
      setLetters((prev) => [data.coverLetter, ...prev]);
      setSelected(data.coverLetter);
      setShowForm(false);
      toast.success('Cover letter generated! ');
    } catch { toast.error('Generation failed. Please try again.'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cover letter?')) return;
    try {
      await api.delete(`/cover-letter/${id}`);
      setLetters((prev) => prev.filter((l) => l._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Cover Letter Generator" />
        <div className="page-inner">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1> Cover Letter Generator</h1>
              <p>AI-generated cover letters tailored to each job application.</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelected(null); }}>+ New Cover Letter</button>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
              {/* List */}
              <div>
                {letters.length === 0 && !showForm ? (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}></div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No cover letters yet. Create your first one!</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setShowForm(true)}>Generate Now</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {letters.map((l) => (
                      <div key={l._id}
                        className="card"
                        style={{ cursor: 'pointer', border: selected?._id === l._id ? '2px solid var(--primary)' : undefined, padding: '1rem' }}
                        onClick={() => { setSelected(l); setShowForm(false); }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{l.jobTitle}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>{l.companyName || 'Company not specified'}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <span className="badge badge-muted">{l.tone}</span>
                          <span className="badge badge-muted">{new Date(l.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button className="btn btn-danger btn-sm" style={{ marginTop: '0.75rem', width: '100%' }} onClick={(e) => { e.stopPropagation(); handleDelete(l._id); }}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content area */}
              <div>
                {showForm && (
                  <div className="card fade-in">
                    <div className="card-header"><h3 className="card-title">Generate Cover Letter</h3></div>
                    <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="cl-jobTitle">Job Title <span>*</span></label>
                          <input id="cl-jobTitle" type="text" className="form-input" placeholder="e.g. Product Manager"
                            value={form.jobTitle} onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="cl-company">Company Name</label>
                          <input id="cl-company" type="text" className="form-input" placeholder="e.g. Google"
                            value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cl-tone">Tone</label>
                        <select id="cl-tone" className="form-select" value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}>
                          <option value="professional">Professional</option>
                          <option value="enthusiastic">Enthusiastic</option>
                          <option value="confident">Confident</option>
                          <option value="humble">Humble</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cl-highlights">Key Highlights (comma-separated)</label>
                        <input id="cl-highlights" type="text" className="form-input" placeholder="e.g. 5 years experience, led a team of 10, increased revenue by 30%"
                          value={form.highlights} onChange={e => setForm(p => ({ ...p, highlights: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cl-jd">Job Description (optional)</label>
                        <textarea id="cl-jd" className="form-textarea" placeholder="Paste the job description for more tailored results..."
                          value={form.jobDescription} onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))} style={{ minHeight: 100 }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={generating}>
                          {generating ? ' Generating…' : ' Generate with AI'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {selected && !showForm && (
                  <div className="card fade-in">
                    <div className="card-header">
                      <div>
                        <h3 className="card-title">{selected.jobTitle} — {selected.companyName || 'Company'}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
                          <span className="badge badge-primary">{selected.tone}</span>
                          <span className="badge badge-muted">{new Date(selected.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => {
                        navigator.clipboard.writeText(selected.content);
                        toast.success('Copied to clipboard!');
                      }}> Copy</button>
                    </div>
                    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1.5rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>
                      {selected.content}
                    </div>
                  </div>
                )}

                {!showForm && !selected && letters.length > 0 && (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>←</div>
                    <p style={{ color: 'var(--muted)' }}>Select a cover letter from the list to view it</p>
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
