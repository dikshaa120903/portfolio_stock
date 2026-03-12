import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, Activity, TrendingUp, BarChart2 } from 'lucide-react';

const navItems = [
    { path: '/portfolio', label: 'Portfolio', icon: PieChart },
    { path: '/clustering', label: 'Clustering', icon: Activity },
    { path: '/forecasting', label: 'Forecasting', icon: TrendingUp },
    { path: '/prediction', label: 'Prediction', icon: TrendingUp },
    { path: '/gold-silver', label: 'Gold & Silver Correlation', icon: TrendingUp },
];

const Sidebar = () => {
    return (
        <aside className="fixed inset-y-0 left-0 w-64 glass-panel border-r border-[var(--surface-border)] overflow-y-auto hidden md:block z-20 m-4">
            <div className="flex items-center justify-center py-6 border-b border-[var(--surface-border)]">
                <div className="flex items-center gap-2">
                    <div className="bg-primary text-white p-2 rounded-lg">
                        <BarChart2 size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">FinApp</h1>
                </div>
            </div>

            <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-purple-500/20'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-bg)] hover:text-[var(--text-main)]'
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
