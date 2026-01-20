import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setToken, setUser } from '../utils/auth';
import { validateEmail, validatePassword } from '../utils/validation';
import './AuthPage.css';

const AuthLayout = ({ children, title, subtitle }) => (
    <div className="auth-page">
        <div className="auth-visual">
            <div className="visual-content">
                <h1>UptimeX</h1>
                <p>Enterprise-grade URL monitoring and status alerts for your mission-critical applications.</p>
            </div>
        </div>
        <div className="auth-form-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    </div>
);

export function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(formData.email)) {
            setError('Invalid email format');
            return;
        }

        if (!validatePassword(formData.password)) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.login(formData.email, formData.password);
            const { token, user } = response.data;

            setToken(token);
            setUser(user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Log in to your account">
            {error && <div className="message error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@company.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                    {loading ? 'Logging in...' : 'Sign In'}
                </button>
            </form>

            <div className="auth-footer">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
        </AuthLayout>
    );
}

export function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(formData.email)) {
            setError('Invalid email format');
            return;
        }

        if (!formData.username || formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (!validatePassword(formData.password)) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.signup(formData);
            const { token, user } = response.data;

            setToken(token);
            setUser(user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Get Started" subtitle="Create your free account">
            {error && <div className="message error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@company.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="username"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="John"
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <div className="auth-footer">
                Already have an account? <Link to="/login">Log in</Link>
            </div>
        </AuthLayout>
    );
}
