import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-logo">
                    <h1>UptimeX</h1>
                </div>
                <nav className="header-nav">
                    <a href="/dashboard" className="nav-link">
                        Monitors
                    </a>
                    <a href="/alerts" className="nav-link">
                        Alerts
                    </a>
                </nav>
                <div className="header-user">
                    <span className="user-name">{user.username || user.email}</span>
                    <button onClick={handleLogout} className="btn btn-logout">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
