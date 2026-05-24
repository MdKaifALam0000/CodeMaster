import { NavLink, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../authSlice';
import {
    LayoutDashboard,
    Code2,
    History,
    Settings,
    LogOut,
    Home,
    Trophy,
    Flame,
    X
} from 'lucide-react';

const DashboardSidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'problems', label: 'Problems', icon: Code2 },
        { id: 'submissions', label: 'Submissions', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
            {/* Close button on mobile */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 lg:hidden p-2 text-gray-500 hover:text-white transition-colors"
                aria-label="Close menu"
            >
                <X className="w-5 h-5" />
            </button>
            {/* Brand */}
            <div className="sidebar-header">
                <NavLink to="/home" className="sidebar-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Turing Forge</span>
                </NavLink>
            </div>

            {/* User Info */}
            <div className="sidebar-user">
                <div className="sidebar-avatar">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">
                        {user?.firstName} {user?.lastName}
                    </div>
                    <div className="sidebar-user-email">
                        {user?.emailId}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section-title">Menu</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                if (onClose) onClose();
                            }}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <Icon />
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                <div className="nav-section-title">Quick Links</div>
                <NavLink to="/home" className="nav-item">
                    <Home />
                    <span>Practice Problems</span>
                </NavLink>
                <NavLink to="/team-coding" className="nav-item">
                    <Trophy />
                    <span>Team Coding</span>
                </NavLink>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-item">
                    <LogOut />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
