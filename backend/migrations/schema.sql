-- UptimeX Database Schema
-- Production-grade PostgreSQL schema with proper indexing and constraints

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Monitors Table (URL to monitor)
CREATE TABLE IF NOT EXISTS monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    interval_seconds INT NOT NULL DEFAULT 300,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_monitors_user_id ON monitors(user_id);
CREATE INDEX idx_monitors_is_active ON monitors(is_active);
CREATE INDEX idx_monitors_user_active ON monitors(user_id, is_active);

-- Monitor Logs (Health check results)
CREATE TABLE IF NOT EXISTS monitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL,
    status_code INT,
    response_time_ms INT NOT NULL,
    is_up BOOLEAN NOT NULL,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
);

CREATE INDEX idx_monitor_logs_monitor_id ON monitor_logs(monitor_id);
CREATE INDEX idx_monitor_logs_checked_at ON monitor_logs(checked_at);
CREATE INDEX idx_monitor_logs_monitor_checked ON monitor_logs(monitor_id, checked_at DESC);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL,
    user_id UUID NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'DOWN', 'SLOW', 'RECOVERED'
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_sent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_alerts_monitor_id ON alerts(monitor_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_sent_at ON alerts(sent_at DESC);
CREATE INDEX idx_alerts_monitor_user ON alerts(monitor_id, user_id);

-- Alert History (for throttling and audit)
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    last_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consecutive_count INT DEFAULT 0,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
    UNIQUE(monitor_id, alert_type)
);

CREATE INDEX idx_alert_history_monitor_type ON alert_history(monitor_id, alert_type);

-- Status Summary (materialized for analytics - updated periodically)
CREATE TABLE IF NOT EXISTS monitor_status_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL,
    total_checks INT DEFAULT 0,
    successful_checks INT DEFAULT 0,
    uptime_percentage DECIMAL(5, 2) DEFAULT 100,
    average_response_time_ms DECIMAL(10, 2),
    last_status_code INT,
    last_checked_at TIMESTAMP,
    last_up_at TIMESTAMP,
    last_down_at TIMESTAMP,
    current_status VARCHAR(20) DEFAULT 'UNKNOWN', -- UP, DOWN, UNKNOWN
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
);

CREATE INDEX idx_monitor_status_summary_monitor_id ON monitor_status_summary(monitor_id);
