import React, { useState, useEffect } from 'react';
import { validateUrl, validateInterval, getValidationError } from '../utils/validation';
import './MonitorForm.css';

export default function MonitorForm({ monitor, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        method: 'GET',
        interval_seconds: 300,
        description: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (monitor) {
            setFormData({
                name: monitor.name,
                url: monitor.url,
                method: monitor.method,
                interval_seconds: monitor.interval_seconds,
                description: monitor.description || '',
            });
        }
    }, [monitor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.url.trim()) {
            newErrors.url = 'URL is required';
        } else if (!validateUrl(formData.url)) {
            newErrors.url = 'Invalid URL format';
        }

        if (!validateInterval(parseInt(formData.interval_seconds))) {
            newErrors.interval_seconds = 'Interval must be at least 30 seconds';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                name: formData.name,
                url: formData.url,
                method: formData.method,
                interval_seconds: parseInt(formData.interval_seconds),
                description: formData.description,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="monitor-form-container">
            <div className="monitor-form-box">
                <h2>{monitor ? 'Edit Monitor' : 'Create New Monitor'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Monitor Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., My API"
                            required
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>URL *</label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            required
                        />
                        {errors.url && <span className="error">{errors.url}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>HTTP Method</label>
                            <select name="method" value={formData.method} onChange={handleChange}>
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Check Interval (seconds) *</label>
                            <input
                                type="number"
                                name="interval_seconds"
                                value={formData.interval_seconds}
                                onChange={handleChange}
                                min="30"
                                step="30"
                                required
                            />
                            {errors.interval_seconds && (
                                <span className="error">{errors.interval_seconds}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Optional description"
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Saving...' : monitor ? 'Update Monitor' : 'Create Monitor'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
