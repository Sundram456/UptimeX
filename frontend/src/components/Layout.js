import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';
import './Layout.css';

export default function Layout({ children }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/alerts', label: 'Alerts', icon: '🔔' }, // Future feature placeholder
        { path: '/settings', label: 'Settings', icon: '⚙️' }, // Future feature placeholder
    ];

    return (
        <div className="app-layout">
            <button
                className="mobile-toggle btn"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                ☰
            </button>

            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-logo">UptimeX</div>
                </div>

                <nav className="nav-links">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="user-profile">
                    <div className="avatar">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.username || 'User'}</span>
                        <span className="user-role">Free Plan</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        ⏻
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
