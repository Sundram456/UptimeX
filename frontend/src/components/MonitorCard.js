import React from 'react';
import { formatPercentage, getStatusColor, getStatusBgColor, formatDate } from '../utils/format';
import './MonitorCard.css';

export default function MonitorCard({ monitor, onClick, onEdit, onDelete }) {
    const statusColor = getStatusColor(monitor.current_status);
    const statusBgColor = getStatusBgColor(monitor.current_status);

    return (
        <div className="monitor-card" onClick={onClick}>
            <div className="card-header">
                <div>
                    <h3 className="card-title">{monitor.name}</h3>
                    <p className="card-url">{monitor.url}</p>
                </div>
                <div
                    className="status-indicator"
                    style={{
                        backgroundColor: statusBgColor,
                        color: statusColor,
                    }}
                >
                    {monitor.current_status || 'UNKNOWN'}
                </div>
            </div>

            <div className="card-stats">
                <div className="stat">
                    <div className="stat-label">Uptime</div>
                    <div className="stat-value">{formatPercentage(monitor.uptime_percentage)}</div>
                </div>
                <div className="stat">
                    <div className="stat-label">Last Check</div>
                    <div className="stat-value">
                        {monitor.last_checked_at ? (
                            <span title={formatDate(monitor.last_checked_at)}>
                                {formatRelativeTime(monitor.last_checked_at)}
                            </span>
                        ) : (
                            'Never'
                        )}
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button
                    className="action-btn edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    Edit
                </button>
                <button
                    className="action-btn delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
