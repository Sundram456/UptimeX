import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { monitorAPI } from '../services/api';
import { formatDate, formatPercentage, getStatusColor } from '../utils/format';
import './DashboardPage.css';
import MonitorForm from '../components/MonitorForm';
import MonitorCard from '../components/MonitorCard';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingMonitor, setEditingMonitor] = useState(null);

    useEffect(() => {
        loadMonitors();
    }, []);

    const loadMonitors = async () => {
        try {
            setLoading(true);
            const response = await monitorAPI.getAll();
            setMonitors(response.data.monitors);
            setError('');
        } catch (err) {
            setError('Failed to load monitors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMonitor = async (formData) => {
        try {
            if (editingMonitor) {
                await monitorAPI.update(editingMonitor.id, formData);
            } else {
                await monitorAPI.create(formData);
            }
            await loadMonitors();
            setShowForm(false);
            setEditingMonitor(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save monitor');
        }
    };

    const handleEditMonitor = (monitor) => {
        setEditingMonitor(monitor);
        setShowForm(true);
    };

    const handleDeleteMonitor = async (id) => {
        if (window.confirm('Are you sure you want to delete this monitor?')) {
            try {
                await monitorAPI.delete(id);
                await loadMonitors();
            } catch (err) {
                setError('Failed to delete monitor');
            }
        }
    };

    const handleMonitorClick = (id) => {
        navigate(`/monitor/${id}`);
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Monitors</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Monitor'}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {showForm && (
                <MonitorForm
                    monitor={editingMonitor}
                    onSubmit={handleAddMonitor}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingMonitor(null);
                    }}
                />
            )}

            {loading ? (
                <div className="loading">Loading monitors...</div>
            ) : monitors.length === 0 ? (
                <div className="empty-state">
                    <p>No monitors yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="monitors-grid">
                    {monitors.map((monitor) => (
                        <MonitorCard
                            key={monitor.id}
                            monitor={monitor}
                            onClick={() => handleMonitorClick(monitor.id)}
                            onEdit={() => handleEditMonitor(monitor)}
                            onDelete={() => handleDeleteMonitor(monitor.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
