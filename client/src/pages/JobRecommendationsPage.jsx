/**
 * Job Recommendations Page
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';

export default function JobRecommendationsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({ keywords: '', location: '', jobType: '' });

  useEffect(() => {
    console.log('[Jobs] Fetching existing recommendations...');
    api.get('/jobs')
      .then(({ data }) => {
        console.log('[Jobs] Loaded:', data.recommendations ? `${data.recommendations.jobs?.length} jobs` : 'none');
        setRecommendations(data.recommendations);
      })
      .catch((err) => {
        console.error('[Jobs] Failed to load recommendations:', err.response?.data || err.message);
        toast.error('Failed to load saved recommendations');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    console.log('[Jobs] Generating recommendations with filters:', filters);
    setGenerating(true);
    try {
      const { data } = await api.post('/jobs/generate', filters);
      console.log('[Jobs] Generation succeeded:', data.recommendations?.jobs?.length, 'jobs');
      setRecommendations(data.recommendations);
      toast.success('Job recommendations updated! ');
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const isTimeout = err.code === 'ECONNABORTED';
      const displayMessage = isTimeout
        ? 'Request timed out — AI is still thinking. Try again.'
        : serverMessage || 'Failed to generate recommendations. Please try again.';

      console.error('[Jobs] Generation failed:');
      console.error('  Status :', err.response?.status);
      console.error('  Message:', serverMessage || err.message);
      console.error('  Full response:', err.response?.data);

      toast.error(displayMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSave = async (jobId, isSaved) => {
    try {
      await api.put(`/jobs/${jobId}/save`);
      setRecommendations((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) => j._id === jobId ? { ...j, isSaved: !j.isSaved } : j),
      }));
      toast.success(isSaved ? 'Removed from saved' : 'Job saved!');
    } catch (err) {
      console.error('[Jobs] Save toggle failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/apply`);
      setRecommendations((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) => j._id === jobId ? { ...j, isApplied: true } : j),
      }));
      toast.success('Marked as applied! ');
    } catch (err) {
      console.error('[Jobs] Mark applied failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const getMatchColor = (score) => score >= 80 ? 'badge-success' : score >= 60 ? 'badge-primary' : 'badge-muted';

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar />
        <div className="page-inner">
          <div className="page-header">
            <h1> Job Recommendations</h1>
            <p>AI-matched job opportunities based on your skills, experience, and preferences.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              {/* Filter form */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 className="card-title">Filter & Generate</h3></div>
                <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="keywords">Keywords</label>
                    <input id="keywords" type="text" className="form-input" placeholder="e.g. React, Python, PM"
                      value={filters.keywords} onChange={e => setFilters(p => ({ ...p, keywords: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Location</label>
                    <input id="location" type="text" className="form-input" placeholder="e.g. Remote, New York"
                      value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="jobType">Job Type</label>
                    <select id="jobType" className="form-select" value={filters.jobType} onChange={e => setFilters(p => ({ ...p, jobType: e.target.value }))}>
                      <option value="">Any type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={generating} style={{ height: '42px' }}>
                    {generating ? ' Generating…' : ' Find Jobs'}
                  </button>
                </form>
              </div>

              {/* Jobs grid */}
              {!recommendations ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                  
                  <h3>No Recommendations Yet</h3>
                  <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Click "Find Jobs" to generate AI-powered job matches for your profile.</p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                    Showing {recommendations.jobs?.length || 0} job matches · Generated {new Date(recommendations.generatedAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {recommendations.jobs?.map((job) => (
                      <div key={job._id} className="job-card">
                        <div className="job-card-header">
                          <div>
                            <div className="job-card-title">{job.title}</div>
                            <div className="job-card-company">{job.company} · {job.location}</div>
                          </div>
                          <span className={`badge ${getMatchColor(job.matchScore)}`}>{job.matchScore}% match</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{job.description}</p>
                        <div className="job-card-meta">
                          <span className="badge badge-muted">{job.type}</span>
                          {job.salary?.min && (
                            <span className="badge badge-success">
                              ₹{Number(job.salary.min).toLocaleString('en-IN')}–₹{Number(job.salary.max).toLocaleString('en-IN')}
                            </span>
                          )}
                          {job.source && <span className="badge badge-muted">{job.source}</span>}
                          {job.isApplied && <span className="badge badge-primary"> Applied</span>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                          {job.requiredSkills?.slice(0, 4).map((s) => <span key={s} className="skill-tag">{s}</span>)}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
