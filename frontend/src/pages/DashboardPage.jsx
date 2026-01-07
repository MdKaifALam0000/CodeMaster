import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import { getUserProfile, getUserProgress } from '../dashboardSlice';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar';
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import ProfileSettings from '../components/Dashboard/ProfileSettings';
import '../components/Dashboard/Dashboard.css';
import { NavLink } from 'react-router';
import {
    CheckCircle,
    XCircle,
    Clock,
    Code2,
    ExternalLink
} from 'lucide-react';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { profile, stats, progress, loading } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(getUserProfile());
        dispatch(getUserProgress());
    }, [dispatch]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return <CheckCircle className="w-3 h-3" />;
            case 'wrong': return <XCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh'
                }}>
                    <div className="loading loading-spinner loading-lg" style={{ color: 'var(--dash-accent)' }}></div>
                </div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <DashboardOverview
                        stats={stats}
                        progress={progress}
                        recentSubmissions={progress?.recentSubmissions}
                    />
                );

            case 'problems':
                return (
                    <div>
                        <div className="content-section">
                            <div className="section-header">
                                <h2 className="section-title">Solved Problems</h2>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted)' }}>
                                    {progress?.solvedProblems?.length || 0} problems solved
                                </span>
                            </div>
                            <div className="section-content" style={{ padding: 0 }}>
                                {progress?.solvedProblems && progress.solvedProblems.length > 0 ? (
                                    <table className="submissions-table">
                                        <thead>
                                            <tr>
                                                <th>Problem</th>
                                                <th>Difficulty</th>
                                                <th>Tags</th>
                                                <th>Solved On</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {progress.solvedProblems.map((problem) => (
                                                <tr key={problem._id}>
                                                    <td>
                                                        <NavLink
                                                            to={`/problem/${problem._id}`}
                                                            className="problem-link"
                                                        >
                                                            {problem.title}
                                                        </NavLink>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${problem.difficulty?.toLowerCase()}`}>
                                                            {problem.difficulty}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="language-badge">{problem.tags}</span>
                                                    </td>
                                                    <td style={{ color: 'var(--dash-text-muted)' }}>
                                                        {problem.solvedAt ? new Date(problem.solvedAt).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td>
                                                        <NavLink
                                                            to={`/problem/${problem._id}`}
                                                            style={{
                                                                color: 'var(--dash-text-muted)',
                                                                transition: 'color 0.15s'
                                                            }}
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </NavLink>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="empty-state">
                                        <Code2 className="empty-state-icon" />
                                        <div className="empty-state-title">No problems solved yet</div>
                                        <div className="empty-state-text">
                                            <NavLink to="/home" style={{ color: 'var(--dash-accent)' }}>
                                                Start practicing
                                            </NavLink>
                                            {' '}to see your solved problems here
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'submissions':
                return (
                    <div>
                        <div className="content-section">
                            <div className="section-header">
                                <h2 className="section-title">All Submissions</h2>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--dash-text-muted)' }}>
                                    {stats?.totalSubmissions || 0} total submissions
                                </span>
                            </div>
                            <div className="section-content" style={{ padding: 0 }}>
                                {progress?.recentSubmissions && progress.recentSubmissions.length > 0 ? (
                                    <table className="submissions-table">
                                        <thead>
                                            <tr>
                                                <th>Problem</th>
                                                <th>Status</th>
                                                <th>Language</th>
                                                <th>Runtime</th>
                                                <th>Memory</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {progress.recentSubmissions.map((submission) => (
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
                                                    <td>{(submission.memory / 1024).toFixed(2)}MB</td>
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
                                        <div className="empty-state-text">
                                            <NavLink to="/home" style={{ color: 'var(--dash-accent)' }}>
                                                Start solving problems
                                            </NavLink>
                                            {' '}to see your submissions here
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                return <ProfileSettings profile={profile} />;

            default:
                return null;
        }
    };

    const getPageTitle = () => {
        switch (activeTab) {
            case 'overview': return { title: 'Dashboard', subtitle: 'Track your coding progress and achievements' };
            case 'problems': return { title: 'Solved Problems', subtitle: 'View all the problems you have conquered' };
            case 'submissions': return { title: 'Submissions', subtitle: 'Your complete submission history' };
            case 'settings': return { title: 'Settings', subtitle: 'Manage your account and preferences' };
            default: return { title: 'Dashboard', subtitle: '' };
        }
    };

    const { title, subtitle } = getPageTitle();

    return (
        <div className="dashboard-container">
            <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </header>

                <div className="dashboard-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
