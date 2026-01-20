import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { monitorAPI } from '../services/api';
import { formatDate, getStatusColor, getStatusBgColor } from '../utils/format';
import './MonitorDetailPage.css';
import MonitorChart from '../components/MonitorChart';

export default function MonitorDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [monitor, setMonitor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('analytics');

    useEffect(() => {
        loadMonitorDetails();
        const interval = setInterval(loadMonitorDetails, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [id]);

    const loadMonitorDetails = async () => {
        try {
            const response = await monitorAPI.getById(id);
            setMonitor(response.data.monitor);
            setError('');
        } catch (err) {
            setError('Failed to load monitor details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            await monitorAPI.update(id, { is_active: !monitor.is_active });
            setMonitor({ ...monitor, is_active: !monitor.is_active });
        } catch (err) {
            setError('Failed to update monitor');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this monitor?')) {
            try {
                await monitorAPI.delete(id);
                navigate('/dashboard');
            } catch (err) {
                setError('Failed to delete monitor');
            }
        }
    };

    if (loading) {
        return <div className="detail-loading">Loading monitor details...</div>;
    }

    if (!monitor) {
        return <div className="detail-error">Monitor not found</div>;
    }

    const stats = monitor.stats || {};
    const statusColor = getStatusColor(monitor.current_status);
    const statusBgColor = getStatusBgColor(monitor.current_status);

    return (
        <div className="monitor-detail-page">
            <div className="detail-header">
                <div className="detail-title-section">
                    <h1>{monitor.name}</h1>
                    <p className="monitor-url">{monitor.url}</p>
                </div>
                <div className="detail-actions">
                    <button
                        className={`btn btn-toggle ${monitor.is_active ? 'active' : 'inactive'}`}
                        onClick={handleToggleActive}
                    >
                        {monitor.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="detail-stats">
                <div className="stat-card">
                    <div className="stat-label">Status</div>
                    <div
                        className="stat-value status-badge"
                        style={{ backgroundColor: statusBgColor, color: statusColor }}
                    >
                        {monitor.current_status || 'UNKNOWN'}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Uptime</div>
                    <div className="stat-value">{(parseFloat(monitor.uptime_percentage) || 0).toFixed(2)}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Response</div>
                    <div className="stat-value">{(parseFloat(stats.avg_response_time_ms) || 0).toFixed(0)}ms</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Checks</div>
                    <div className="stat-value">{stats.total_checks || 0}</div>
                </div>
            </div>

            <div className="detail-tabs">
                <button
                    className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
                <button
                    className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Recent Logs
                </button>
                <button
                    className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    Info
                </button>
            </div>

            <div className="detail-content">
                {activeTab === 'analytics' && (
                    <div className="analytics-section">
                        <MonitorChart monitorId={id} />
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="logs-section">
                        <h3>Recent Logs</h3>
                        {monitor.recent_logs && monitor.recent_logs.length > 0 ? (
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Status Code</th>
                                        <th>Response Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monitor.recent_logs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{formatDate(log.checked_at)}</td>
                                            <td>{log.status_code || '-'}</td>
                                            <td>{log.response_time_ms}ms</td>
                                            <td>
                                                <span
                                                    className={`status-badge ${log.is_up ? 'up' : 'down'}`}
                                                >
                                                    {log.is_up ? 'UP' : 'DOWN'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No logs available yet</p>
                        )}
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="info-section">
                        <div className="info-item">
                            <label>Monitor ID</label>
                            <p>{monitor.id}</p>
                        </div>
                        <div className="info-item">
                            <label>URL</label>
                            <p>{monitor.url}</p>
                        </div>
                        <div className="info-item">
                            <label>Method</label>
                            <p>{monitor.method}</p>
                        </div>
                        <div className="info-item">
                            <label>Check Interval</label>
                            <p>{monitor.interval_seconds}s</p>
                        </div>
                        <div className="info-item">
                            <label>Created</label>
                            <p>{formatDate(monitor.created_at)}</p>
                        </div>
                        {monitor.description && (
                            <div className="info-item">
                                <label>Description</label>
                                <p>{monitor.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
