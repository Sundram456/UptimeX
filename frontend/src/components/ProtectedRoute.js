import React, { useState, useEffect } from 'react';
import './ProtectedRoute.css';

export default function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="protected-loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="protected-error">
                <h2>Access Denied</h2>
                <p>Please log in to continue.</p>
                <a href="/login" className="btn btn-primary">
                    Go to Login
                </a>
            </div>
        );
    }

    return children;
}
