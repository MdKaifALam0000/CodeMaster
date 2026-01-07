import { useMemo } from 'react';
import { NavLink } from 'react-router';
import {
    Code2,
    CheckCircle,
    Target,
    Flame,
    TrendingUp,
    Clock,
    XCircle
} from 'lucide-react';

const DashboardOverview = ({ stats, progress, recentSubmissions }) => {
    // Generate heatmap data for last 365 days
    const heatmapData = useMemo(() => {
        const data = [];
        const today = new Date();

        // Create activity map from progress data
        const activityMap = {};
        if (progress?.activityData) {
            Object.entries(progress.activityData).forEach(([date, info]) => {
                activityMap[date] = info.submissions || 0;
            });
        }

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = activityMap[dateStr] || 0;

            let level = 0;
            if (count > 0) level = 1;
            if (count >= 2) level = 2;
            if (count >= 4) level = 3;
            if (count >= 6) level = 4;

            data.push({ date: dateStr, count, level });
        }
        return data;
    }, [progress]);

    // Calculate difficulty stats
    const difficultyStats = useMemo(() => {
        if (!progress?.difficultyStats) {
            return {
                easy: { solved: 0, total: 0, percentage: 0 },
                medium: { solved: 0, total: 0, percentage: 0 },
                hard: { solved: 0, total: 0, percentage: 0 }
            };
        }

        return {
            easy: {
                ...progress.difficultyStats.easy,
                percentage: progress.difficultyStats.easy.total > 0
                    ? Math.round((progress.difficultyStats.easy.solved / progress.difficultyStats.easy.total) * 100)
                    : 0
            },
            medium: {
                ...progress.difficultyStats.medium,
                percentage: progress.difficultyStats.medium.total > 0
                    ? Math.round((progress.difficultyStats.medium.solved / progress.difficultyStats.medium.total) * 100)
                    : 0
            },
            hard: {
                ...progress.difficultyStats.hard,
                percentage: progress.difficultyStats.hard.total > 0
                    ? Math.round((progress.difficultyStats.hard.solved / progress.difficultyStats.hard.total) * 100)
                    : 0
            }
        };
    }, [progress]);

    const circumference = 2 * Math.PI * 32; // radius = 32

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return <CheckCircle className="w-3 h-3" />;
            case 'wrong': return <XCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div>
            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon blue">
                            <Code2 />
                        </div>
                        <span className="stat-card-label">Problems Solved</span>
                    </div>
                    <div className="stat-card-value">{stats?.problemsSolved || 0}</div>
                    <div className="stat-card-change">
                        of {progress?.totalProblems || 0} total
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon green">
                            <CheckCircle />
                        </div>
                        <span className="stat-card-label">Acceptance Rate</span>
                    </div>
                    <div className="stat-card-value">{stats?.successRate || 0}%</div>
                    <div className="stat-card-change positive">
                        {stats?.acceptedSubmissions || 0} accepted
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon yellow">
                            <Flame />
                        </div>
                        <span className="stat-card-label">Current Streak</span>
                    </div>
                    <div className="stat-card-value">{progress?.streak || 0}</div>
                    <div className="stat-card-change">days</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon purple">
                            <TrendingUp />
                        </div>
                        <span className="stat-card-label">Total Submissions</span>
                    </div>
                    <div className="stat-card-value">{stats?.totalSubmissions || 0}</div>
                    <div className="stat-card-change">all time</div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--dash-space-xl)' }}>
                {/* Activity Heatmap */}
                <div className="content-section">
                    <div className="section-header">
                        <h2 className="section-title">Activity</h2>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted)' }}>
                            {stats?.problemsSolved || 0} submissions in the last year
                        </span>
                    </div>
                    <div className="section-content">
                        <div className="heatmap-container">
                            <div className="heatmap-grid">
                                {heatmapData.map((cell, index) => (
                                    <div
                                        key={index}
                                        className={`heatmap-cell level-${cell.level}`}
                                        title={`${cell.date}: ${cell.count} submissions`}
                                    />
                                ))}
                            </div>
                            <div className="heatmap-legend">
                                <span>Less</span>
                                <div className="heatmap-legend-cells">
                                    <div className="heatmap-cell" />
                                    <div className="heatmap-cell level-1" />
                                    <div className="heatmap-cell level-2" />
                                    <div className="heatmap-cell level-3" />
                                    <div className="heatmap-cell level-4" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="content-section">
                    <div className="section-header">
                        <h2 className="section-title">Difficulty</h2>
                    </div>
                    <div className="section-content">
                        <div className="difficulty-grid">
                            {/* Easy */}
                            <div className="difficulty-item">
                                <div className="difficulty-ring">
                                    <svg viewBox="0 0 80 80">
                                        <circle
                                            className="difficulty-ring-bg"
                                            cx="40"
                                            cy="40"
                                            r="32"
                                        />
                                        <circle
                                            className="difficulty-ring-progress easy"
                                            cx="40"
                                            cy="40"
                                            r="32"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference - (circumference * difficultyStats.easy.percentage) / 100}
                                        />
                                    </svg>
                                    <div className="difficulty-ring-value">{difficultyStats.easy.solved}</div>
                                </div>
                                <div className="difficulty-label easy">Easy</div>
                                <div className="difficulty-count">{difficultyStats.easy.solved}/{difficultyStats.easy.total}</div>
                            </div>

                            {/* Medium */}
                            <div className="difficulty-item">
                                <div className="difficulty-ring">
                                    <svg viewBox="0 0 80 80">
                                        <circle
                                            className="difficulty-ring-bg"
                                            cx="40"
                                            cy="40"
                                            r="32"
                                        />
                                        <circle
                                            className="difficulty-ring-progress medium"
                                            cx="40"
                                            cy="40"
                                            r="32"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference - (circumference * difficultyStats.medium.percentage) / 100}
                                        />
                                    </svg>
                                    <div className="difficulty-ring-value">{difficultyStats.medium.solved}</div>
                                </div>
                                <div className="difficulty-label medium">Medium</div>
                                <div className="difficulty-count">{difficultyStats.medium.solved}/{difficultyStats.medium.total}</div>
                            </div>

                            {/* Hard */}
                            <div className="difficulty-item">
                                <div className="difficulty-ring">
                                    <svg viewBox="0 0 80 80">
                                        <circle
                                            className="difficulty-ring-bg"
                                            cx="40"
                                            cy="40"
                                            r="32"
                                        />
                                        <circle
                                            className="difficulty-ring-progress hard"
                                            cx="40"
                                            cy="40"
                                            r="32"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference - (circumference * difficultyStats.hard.percentage) / 100}
                                        />
                                    </svg>
                                    <div className="difficulty-ring-value">{difficultyStats.hard.solved}</div>
                                </div>
                                <div className="difficulty-label hard">Hard</div>
                                <div className="difficulty-count">{difficultyStats.hard.solved}/{difficultyStats.hard.total}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Submissions */}
            <div className="content-section" style={{ marginTop: 'var(--dash-space-xl)' }}>
                <div className="section-header">
                    <h2 className="section-title">Recent Submissions</h2>
                </div>
                <div className="section-content" style={{ padding: 0 }}>
                    {recentSubmissions && recentSubmissions.length > 0 ? (
                        <table className="submissions-table">
                            <thead>
                                <tr>
                                    <th>Problem</th>
                                    <th>Status</th>
                                    <th>Language</th>
                                    <th>Runtime</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSubmissions.slice(0, 5).map((submission) => (
                                    <tr key={submission._id}>
                                        <td>
                                            <NavLink
                                                to={`/problem/${submission.problemId}`}
                                                className="problem-link"
                                            >
                                                {submission.problemTitle}
                                            </NavLink>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${submission.status}`}>
                                                {getStatusIcon(submission.status)}
                                                {submission.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="language-badge">{submission.language}</span>
                                        </td>
                                        <td>{submission.runtime}ms</td>
                                        <td style={{ color: 'var(--dash-text-muted)' }}>
                                            {new Date(submission.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <Code2 className="empty-state-icon" />
                            <div className="empty-state-title">No submissions yet</div>
                            <div className="empty-state-text">Start solving problems to see your submissions here</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
