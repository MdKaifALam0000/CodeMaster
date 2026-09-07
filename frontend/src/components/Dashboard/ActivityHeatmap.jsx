import { useState, useMemo } from 'react';
import { 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    Flame, 
    CheckCircle2, 
    Clock, 
    Sparkles 
} from 'lucide-react';
import './ActivityHeatmap.css';

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format a Date to local YYYY-MM-DD
 */
const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * ActivityHeatmap Component - LeetCode Style Heatmap with Month-Wise Activity & Dynamic Opacity
 */
const ActivityHeatmap = ({ progress, stats }) => {
    const today = useMemo(() => new Date(), []);
    const [viewMode, setViewMode] = useState('year'); // 'year' or 'month'
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [hoveredCell, setHoveredCell] = useState(null);

    // 1. Build unified activity map from both progress.activityData and progress.solvedProblems
    const activityMap = useMemo(() => {
        const map = {};

        // Merge backend activityData
        if (progress?.activityData) {
            Object.entries(progress.activityData).forEach(([dateStr, info]) => {
                map[dateStr] = {
                    submissions: info.submissions || 0,
                    accepted: info.accepted || 0,
                    problems: info.problems || []
                };
            });
        }

        // Merge solvedProblems list (guarantees solved problems are never omitted)
        if (progress?.solvedProblems && Array.isArray(progress.solvedProblems)) {
            progress.solvedProblems.forEach((p) => {
                if (p.solvedAt) {
                    const d = new Date(p.solvedAt);
                    const localKey = formatLocalDate(d);
                    const isoKey = d.toISOString().split('T')[0];

                    [localKey, isoKey].forEach(k => {
                        if (!map[k]) {
                            map[k] = { submissions: 1, accepted: 1, problems: [p._id || p.title] };
                        } else {
                            if (map[k].accepted === 0) map[k].accepted = 1;
                            if (map[k].submissions === 0) map[k].submissions = 1;
                            const pId = p._id || p.title;
                            if (!map[k].problems.includes(pId)) {
                                map[k].problems.push(pId);
                            }
                        }
                    });
                }
            });
        }

        return map;
    }, [progress]);

    // 2. Generate 53 weeks (columns) × 7 days (rows) for the Full Year Heatmap
    const { columns, monthHeaders, yearStats } = useMemo(() => {
        const cols = [];
        const monthPositions = {};
        let totalYearSubmissions = 0;
        let totalYearSolved = 0;
        let activeDaysCount = 0;

        const endDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (52 * 7 + endDayOfWeek));
        startDate.setHours(0, 0, 0, 0);

        for (let c = 0; c < 53; c++) {
            const weekDays = [];
            for (let r = 0; r < 7; r++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + (c * 7 + r));
                const dateKey = formatLocalDate(cellDate);
                const isoKey = cellDate.toISOString().split('T')[0];

                const isFuture = cellDate > today;
                const info = activityMap[dateKey] || activityMap[isoKey] || { submissions: 0, accepted: 0, problems: [] };

                const solvedCount = info.accepted || (info.problems ? info.problems.length : 0);
                const submissionsCount = info.submissions || (solvedCount > 0 ? solvedCount : 0);

                if (!isFuture) {
                    totalYearSubmissions += submissionsCount;
                    totalYearSolved += solvedCount;
                    if (submissionsCount > 0 || solvedCount > 0) activeDaysCount++;
                }

                // Opacity & Level according to questions solved
                let level = 0;
                let opacity = 0;
                if (!isFuture && solvedCount > 0) {
                    if (solvedCount === 1) {
                        level = 1;
                        opacity = 0.38;
                    } else if (solvedCount === 2) {
                        level = 2;
                        opacity = 0.60;
                    } else if (solvedCount >= 3 && solvedCount <= 4) {
                        level = 3;
                        opacity = 0.82;
                    } else {
                        level = 4;
                        opacity = 1.0;
                    }
                } else if (!isFuture && submissionsCount > 0) {
                    level = 1;
                    opacity = 0.25;
                }

                // Track month headers on the 1st day of each month
                if (cellDate.getDate() === 1 && !monthPositions[cellDate.getMonth()]) {
                    monthPositions[cellDate.getMonth()] = {
                        name: MONTH_NAMES[cellDate.getMonth()],
                        colIndex: c,
                        year: cellDate.getFullYear()
                    };
                }

                weekDays.push({
                    date: cellDate,
                    dateStr: dateKey,
                    isFuture,
                    solvedCount,
                    submissionsCount,
                    level,
                    opacity
                });
            }
            cols.push(weekDays);
        }

        return {
            columns: cols,
            monthHeaders: Object.values(monthPositions).sort((a, b) => a.colIndex - b.colIndex),
            yearStats: {
                totalSubmissions: totalYearSubmissions,
                totalSolved: totalYearSolved,
                activeDays: activeDaysCount
            }
        };
    }, [today, activityMap]);

    // 3. Generate Month-Wise Data for the Selected Month View
    const monthCalendarData = useMemo(() => {
        const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
        const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
        const totalDays = lastDayOfMonth.getDate();

        const cells = [];

        // Leading padding days from previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            cells.push({ isPadding: true, day: '' });
        }

        let monthSolved = 0;
        let monthSubmissions = 0;
        let monthActiveDays = 0;

        for (let day = 1; day <= totalDays; day++) {
            const cellDate = new Date(selectedYear, selectedMonth, day);
            const dateKey = formatLocalDate(cellDate);
            const isoKey = cellDate.toISOString().split('T')[0];

            const isFuture = cellDate > today;
            const info = activityMap[dateKey] || activityMap[isoKey] || { submissions: 0, accepted: 0, problems: [] };

            const solvedCount = info.accepted || (info.problems ? info.problems.length : 0);
            const submissionsCount = info.submissions || (solvedCount > 0 ? solvedCount : 0);

            if (!isFuture) {
                monthSubmissions += submissionsCount;
                monthSolved += solvedCount;
                if (submissionsCount > 0 || solvedCount > 0) monthActiveDays++;
            }

            let level = 0;
            let opacity = 0;
            if (!isFuture && solvedCount > 0) {
                if (solvedCount === 1) {
                    level = 1;
                    opacity = 0.38;
                } else if (solvedCount === 2) {
                    level = 2;
                    opacity = 0.60;
                } else if (solvedCount >= 3 && solvedCount <= 4) {
                    level = 3;
                    opacity = 0.82;
                } else {
                    level = 4;
                    opacity = 1.0;
                }
            } else if (!isFuture && submissionsCount > 0) {
                level = 1;
                opacity = 0.25;
            }

            cells.push({
                isPadding: false,
                day,
                date: cellDate,
                dateStr: dateKey,
                isFuture,
                solvedCount,
                submissionsCount,
                level,
                opacity
            });
        }

        return {
            cells,
            stats: {
                solved: monthSolved,
                submissions: monthSubmissions,
                activeDays: monthActiveDays,
                totalDays
            }
        };
    }, [selectedYear, selectedMonth, today, activityMap]);

    // Handle Month Navigation
    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(prev => prev - 1);
        } else {
            setSelectedMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(prev => prev + 1);
        } else {
            setSelectedMonth(prev => prev + 1);
        }
    };

    return (
        <div className="activity-heatmap-card">
            {/* Header: Title & View Selector */}
            <div className="heatmap-header">
                <div className="header-left-info">
                    <div className="title-row">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <h2 className="activity-title">Activity</h2>
                        <div className="streak-badge">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            <span>{progress?.streak || 0} Day Streak</span>
                        </div>
                    </div>
                    <div className="subtitle-metrics">
                        <span>
                            <strong>{yearStats.totalSolved || stats?.problemsSolved || 0}</strong> problems solved
                        </span>
                        <span className="bullet-sep">•</span>
                        <span>
                            <strong>{yearStats.totalSubmissions || stats?.totalSubmissions || 0}</strong> submissions in past year
                        </span>
                        <span className="bullet-sep">•</span>
                        <span>
                            <strong>{yearStats.activeDays}</strong> active days
                        </span>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'year' ? 'active' : ''}`}
                        onClick={() => setViewMode('year')}
                    >
                        Year View
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
                        onClick={() => setViewMode('month')}
                    >
                        Month View
                    </button>
                </div>
            </div>

            {/* Month-Wise Selector Bar (Like LeetCode) */}
            <div className="month-quick-bar">
                <button
                    className={`month-pill ${viewMode === 'year' ? 'active' : ''}`}
                    onClick={() => setViewMode('year')}
                >
                    All Year
                </button>
                {MONTH_NAMES.map((name, idx) => {
                    const isSelected = viewMode === 'month' && selectedMonth === idx;
                    const isCurrentMonth = today.getMonth() === idx && today.getFullYear() === selectedYear;

                    return (
                        <button
                            key={name}
                            className={`month-pill ${isSelected ? 'active' : ''} ${isCurrentMonth ? 'current-month-indicator' : ''}`}
                            onClick={() => {
                                setSelectedMonth(idx);
                                setViewMode('month');
                            }}
                        >
                            {name}
                            {isCurrentMonth && <span className="now-dot" />}
                        </button>
                    );
                })}
            </div>

            {/* View Mode 1: Full Year 53-Week Heatmap */}
            {viewMode === 'year' && (
                <div className="heatmap-viewport">
                    <div className="heatmap-wrapper">
                        {/* Month Labels Row */}
                        <div className="month-labels-track">
                            <div className="day-label-placeholder" />
                            <div className="months-grid">
                                {monthHeaders.map((m, idx) => (
                                    <span
                                        key={idx}
                                        className="month-header-label"
                                        style={{ gridColumnStart: m.colIndex + 1 }}
                                        onClick={() => {
                                            setSelectedMonth(MONTH_NAMES.indexOf(m.name));
                                            setSelectedYear(m.year);
                                            setViewMode('month');
                                        }}
                                        title={`Click to view ${m.name} ${m.year}`}
                                    >
                                        {m.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Days of Week (Left) + 53 Columns (Right) */}
                        <div className="heatmap-body">
                            {/* Day labels */}
                            <div className="day-labels-col">
                                <span>Mon</span>
                                <span>Wed</span>
                                <span>Fri</span>
                            </div>

                            {/* 53 Columns × 7 Rows */}
                            <div className="heatmap-columns-grid">
                                {columns.map((week, colIdx) => (
                                    <div key={colIdx} className="heatmap-column">
                                        {week.map((cell, rowIdx) => {
                                            if (cell.isFuture) {
                                                return (
                                                    <div
                                                        key={rowIdx}
                                                        className="heatmap-cell cell-future"
                                                    />
                                                );
                                            }

                                            return (
                                                <div
                                                    key={rowIdx}
                                                    className={`heatmap-cell level-${cell.level}`}
                                                    style={
                                                        cell.level > 0
                                                            ? { backgroundColor: `rgba(34, 197, 94, ${cell.opacity})` }
                                                            : {}
                                                    }
                                                    onMouseEnter={() => setHoveredCell(cell)}
                                                    onMouseLeave={() => setHoveredCell(null)}
                                                    onClick={() => {
                                                        setSelectedMonth(cell.date.getMonth());
                                                        setSelectedYear(cell.date.getFullYear());
                                                        setViewMode('month');
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Mode 2: Month-Wise Detailed Calendar (Like LeetCode) */}
            {viewMode === 'month' && (
                <div className="month-detail-view">
                    {/* Month Navigator Header */}
                    <div className="month-nav-bar">
                        <div className="month-nav-left">
                            <button className="month-arrow-btn" onClick={handlePrevMonth} title="Previous Month">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <h3 className="month-name-heading">
                                {FULL_MONTH_NAMES[selectedMonth]} {selectedYear}
                            </h3>
                            <button className="month-arrow-btn" onClick={handleNextMonth} title="Next Month">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="month-quick-stats">
                            <div className="quick-stat-badge">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span><strong>{monthCalendarData.stats.solved}</strong> Solved</span>
                            </div>
                            <div className="quick-stat-badge">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span><strong>{monthCalendarData.stats.submissions}</strong> Submissions</span>
                            </div>
                            <div className="quick-stat-badge">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span><strong>{monthCalendarData.stats.activeDays}</strong> Active Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Month Calendar Grid */}
                    <div className="month-calendar-grid">
                        {/* Day of Week Headers */}
                        {DAYS_OF_WEEK.map((d) => (
                            <div key={d} className="month-weekday-header">
                                {d}
                            </div>
                        ))}

                        {/* Days */}
                        {monthCalendarData.cells.map((cell, idx) => {
                            if (cell.isPadding) {
                                return <div key={idx} className="month-day-cell padding" />;
                            }

                            const isToday =
                                cell.date.getDate() === today.getDate() &&
                                cell.date.getMonth() === today.getMonth() &&
                                cell.date.getFullYear() === today.getFullYear();

                            return (
                                <div
                                    key={idx}
                                    className={`month-day-cell ${cell.isFuture ? 'future' : ''} ${isToday ? 'today' : ''} ${cell.level > 0 ? `active-level-${cell.level}` : ''}`}
                                    style={
                                        cell.level > 0
                                            ? { backgroundColor: `rgba(34, 197, 94, ${cell.opacity})` }
                                            : {}
                                    }
                                    onMouseEnter={() => setHoveredCell(cell)}
                                    onMouseLeave={() => setHoveredCell(null)}
                                >
                                    <span className="day-number">{cell.day}</span>
                                    {cell.solvedCount > 0 && (
                                        <div className="day-solved-pill">
                                            ✓ {cell.solvedCount}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Hover Tooltip Readout */}
            <div className="tooltip-readout-bar">
                {hoveredCell ? (
                    <div className="tooltip-content-active">
                        <span className="tooltip-date">
                            {hoveredCell.date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}:
                        </span>
                        <span className="tooltip-metric solved">
                            <strong>{hoveredCell.solvedCount}</strong> problems solved
                        </span>
                        <span className="bullet-sep">•</span>
                        <span className="tooltip-metric submissions">
                            <strong>{hoveredCell.submissionsCount}</strong> submissions
                        </span>
                    </div>
                ) : (
                    <div className="tooltip-placeholder">
                        Hover over any square or day to view exact questions solved
                    </div>
                )}
            </div>

            {/* Bottom Legend */}
            <div className="heatmap-footer">
                <span className="legend-caption">
                    Opacity scales with number of problems solved
                </span>

                <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="heatmap-legend-cells">
                        <div className="heatmap-cell level-0" title="0 problems solved" />
                        <div className="heatmap-cell level-1" style={{ backgroundColor: 'rgba(34, 197, 94, 0.38)' }} title="1 problem solved (38% opacity)" />
                        <div className="heatmap-cell level-2" style={{ backgroundColor: 'rgba(34, 197, 94, 0.60)' }} title="2 problems solved (60% opacity)" />
                        <div className="heatmap-cell level-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.82)' }} title="3-4 problems solved (82% opacity)" />
                        <div className="heatmap-cell level-4" style={{ backgroundColor: 'rgba(34, 197, 94, 1.0)' }} title="5+ problems solved (100% neon green)" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
