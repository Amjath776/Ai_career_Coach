/**
 * Signup Page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async ({ name, email, password, currentTitle, industry }) => {
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password, { currentTitle, industry });
      toast.success('Account created! Welcome to AI Career Coach 🚀');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card fade-in-up" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🚀</div>
          AI Career <span>Coach</span>
        </div>

        <div className="auth-header">
          <h1>Create Your Account</h1>
          <p>Start your AI-powered career journey today</p>
        </div>

        <ErrorAlert message={error} onDismiss={() => setError('')} />

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name <span>*</span></label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="John Smith"
              autoComplete="name"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address <span>*</span></label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="currentTitle">Current Job Title</label>
              <input
                id="currentTitle"
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineer"
                {...register('currentTitle')}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="industry">Industry</label>
              <select id="industry" className="form-select" {...register('industry')}>
                <option value="">Select industry</option>
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Marketing</option>
                <option>Design</option>
                <option>Data Science</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password <span>*</span></label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password <span>*</span></label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repeat password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account…' : 'Create Free Account →'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.25rem' }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
