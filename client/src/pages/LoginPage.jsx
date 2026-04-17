/**
 * Login Page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! ');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card fade-in-up">
        {/* Logo */}
        <div className="auth-logo">
          AI Career <span>Coach</span>
        </div>

        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your career journey</p>
        </div>

        <ErrorAlert message={error} onDismiss={() => setError('')} />

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password <span>*</span></label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Your password"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create one free</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.25rem' }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
