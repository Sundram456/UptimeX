import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { monitorAPI } from '../services/api';
import './MonitorChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function MonitorChart({ monitorId }) {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChartData();
    }, [monitorId]);

    const loadChartData = async () => {
        try {
            const response = await monitorAPI.getLogs(monitorId, { limit: 50, hoursBack: 24 });
            const logs = response.data.logs || [];

            // Group logs by hour and calculate average response time
            const groupedData = {};
            logs.forEach((log) => {
                const date = new Date(log.checked_at);
                const hour = date.getHours();
                const key = `${date.getDate()}/${date.getMonth() + 1} ${hour}:00`;

                if (!groupedData[key]) {
                    groupedData[key] = {
                        responseTimes: [],
                        statuses: [],
                    };
                }

                groupedData[key].responseTimes.push(log.response_time_ms);
                groupedData[key].statuses.push(log.is_up ? 1 : 0);
            });

            const labels = Object.keys(groupedData).reverse();
            const avgResponseTimes = labels.map(
                (label) =>
                    groupedData[label].responseTimes.reduce((a, b) => a + b, 0) /
                    groupedData[label].responseTimes.length
            );
            const uptimePercentages = labels.map(
                (label) =>
                    (groupedData[label].statuses.reduce((a, b) => a + b, 0) /
                        groupedData[label].statuses.length) *
                    100
            );

            setChartData({
                responseTimeChart: {
                    labels,
                    datasets: [
                        {
                            label: 'Avg Response Time (ms)',
                            data: avgResponseTimes,
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                        },
                    ],
                },
                uptimeChart: {
                    labels,
                    datasets: [
                        {
                            label: 'Uptime (%)',
                            data: uptimePercentages,
                            backgroundColor: uptimePercentages.map((val) =>
                                val >= 95 ? '#28a745' : val >= 90 ? '#ffc107' : '#dc3545'
                            ),
                            borderWidth: 0,
                        },
                    ],
                },
            });
        } catch (error) {
            console.error('Failed to load chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="chart-loading">Loading chart data...</div>;
    }

    if (!chartData) {
        return <div className="chart-error">No data available for chart</div>;
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="chart-container">
            <div className="chart-section">
                <h3>Response Time (Last 24 Hours)</h3>
                <div className="chart-wrapper">
                    <Line data={chartData.responseTimeChart} options={chartOptions} />
                </div>
            </div>

            <div className="chart-section">
                <h3>Uptime Percentage (Last 24 Hours)</h3>
                <div className="chart-wrapper">
                    <Bar data={chartData.uptimeChart} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
