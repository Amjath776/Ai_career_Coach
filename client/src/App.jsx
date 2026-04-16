/**
 * App Router
 * Sets up all routes with protected route wrapping.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const CoverLetterPage = lazy(() => import('./pages/CoverLetterPage'));
const JobRecommendationsPage = lazy(() => import('./pages/JobRecommendationsPage'));
const CareerPathPage = lazy(() => import('./pages/CareerPathPage'));
const SkillGapPage = lazy(() => import('./pages/SkillGapPage'));
const LearningRoadmapPage = lazy(() => import('./pages/LearningRoadmapPage'));
const InterviewPrepPage = lazy(() => import('./pages/InterviewPrepPage'));
const IndustryInsightsPage = lazy(() => import('./pages/IndustryInsightsPage'));

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route — redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
            <Route path="/cover-letter" element={<ProtectedRoute><CoverLetterPage /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><JobRecommendationsPage /></ProtectedRoute>} />
            <Route path="/career-path" element={<ProtectedRoute><CareerPathPage /></ProtectedRoute>} />
            <Route path="/skill-gap" element={<ProtectedRoute><SkillGapPage /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><LearningRoadmapPage /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewPrepPage /></ProtectedRoute>} />
            <Route path="/industry" element={<ProtectedRoute><IndustryInsightsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
