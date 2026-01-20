import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, SignupPage } from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MonitorDetailPage from './pages/MonitorDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { isAuthenticated } from './utils/auth';
import './App.css';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />}
                />
                <Route
                    path="/signup"
                    element={isAuthenticated() ? <Navigate to="/dashboard" /> : <SignupPage />}
                />

                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <DashboardPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/monitor/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <MonitorDetailPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Default redirect */}
                <Route
                    path="/"
                    element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />}
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
