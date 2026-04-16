/**
 * Dashboard Page
 * Shows stats, charts, recent activity, and quick access to all tools.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, RadialLinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const QUICK_TOOLS = [
  { icon: '📄', label: 'Analyze Resume', path: '/resume', color: '#dbeafe' },
  { icon: '✉️', label: 'Write Cover Letter', path: '/cover-letter', color: '#fef3c7' },
  { icon: '🎤', label: 'Interview Prep', path: '/interview', color: '#d1fae5' },
  { icon: '🎯', label: 'Skill Gap Check', path: '/skill-gap', color: '#ede9fe' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setDashData(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const skillsChartData = {
    labels: dashData?.skillsData?.map((s) => s.skill) || [],
    datasets: [{
      label: 'Proficiency',
      data: dashData?.skillsData?.map((s) => s.proficiency) || [],
      backgroundColor: '#1a2e4a',
      borderRadius: 6,
    }],
  };

  const radarData = {
    labels: ['Resume', 'Interview', 'Skills', 'Jobs', 'Roadmap', 'Insights'],
    datasets: [{
      label: 'Progress',
      data: [
        dashData?.stats?.resumeScore || 0,
        dashData?.stats?.avgInterviewScore * 10 || 0,
        dashData?.stats?.skillReadiness || 0,
        Math.min((dashData?.stats?.appliedJobs || 0) * 20, 100),
        dashData?.stats?.roadmapProgress || 0,
        50,
      ],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      pointBackgroundColor: '#f59e0b',
      borderWidth: 2,
    }],
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Dashboard" />
        <div className="page-inner">
          {/* Welcome */}
          <div className="page-header">
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Here's your career progress overview. Keep pushing forward.</p>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="fade-in-up">
              {/* Stats */}
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon navy">📄</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashData?.stats?.resumeScore || 0}</div>
                    <div className="stat-label">Resume Score</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon amber">🎯</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashData?.stats?.skillReadiness || 0}%</div>
                    <div className="stat-label">Skill Readiness</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">📚</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashData?.stats?.roadmapProgress || 0}%</div>
                    <div className="stat-label">Roadmap Progress</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon blue">🎤</div>
                  <div className="stat-content">
                    <div className="stat-value">{dashData?.stats?.interviewSessions || 0}</div>
                    <div className="stat-label">Interview Sessions</div>
                  </div>
                </div>
              </div>

              {/* Main charts */}
              <div className="dashboard-main">
                {/* Skills chart */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Skills Overview</h3>
                    <Link to="/skill-gap" className="btn btn-ghost btn-sm">Analyze →</Link>
                  </div>
                  {dashData?.skillsData?.length > 0 ? (
                    <Bar
                      data={skillsChartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { min: 0, max: 100, grid: { color: '#f1f5f9' } },
                          x: { grid: { display: false } },
                        },
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
                      <p>Add skills to your profile to see the chart</p>
                      <Link to="/resume" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Update Profile</Link>
                    </div>
                  )}
                </div>

                {/* Career radar */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Career Radar</h3>
                  </div>
                  <Radar
                    data={radarData}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        r: {
                          min: 0, max: 100,
                          ticks: { stepSize: 20, font: { size: 10 } },
                          grid: { color: '#e2e8f0' },
                          pointLabels: { font: { size: 11 } },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Quick tools */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {QUICK_TOOLS.map((tool) => (
                    <Link key={tool.path} to={tool.path} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '0.75rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)',
                      background: tool.color, textAlign: 'center',
                      transition: 'transform var(--transition)', textDecoration: 'none',
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ fontSize: '2rem' }}>{tool.icon}</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{tool.label}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent activity + recommended jobs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Recent activity */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Recent Activity</h3>
                  </div>
                  {dashData?.recentActivity?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {dashData.recentActivity.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
                          <span style={{ fontSize: '1.25rem' }}>
                            {a.type === 'cover-letter' ? '✉️' : a.type === 'interview' ? '🎤' : '📄'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(a.date).toLocaleDateString()}</div>
                          </div>
                          {a.score !== undefined && <span className="badge badge-primary">{a.score}/10</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      <p>No recent activity yet.</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Start by analyzing your resume!</p>
                    </div>
                  )}
                </div>

                {/* Recommended jobs */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Top Job Matches</h3>
                    <Link to="/jobs" className="btn btn-ghost btn-sm">View All →</Link>
                  </div>
                  {dashData?.recommendedJobs?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {dashData.recommendedJobs.map((job, i) => (
                        <div key={i} style={{ padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{job.title}</div>
                              <div style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>{job.company} · {job.location}</div>
                            </div>
                            <span className="badge badge-success">{job.matchScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      <p>No job recommendations yet.</p>
                      <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Generate Jobs →</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
