import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Bell, Search } from 'lucide-react';

const Topbar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-4 z-10 mx-4 mb-8 glass-panel flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 bg-[var(--surface-bg)] border border-[var(--surface-border)] rounded-xl px-4 py-2 w-64 md:w-96 shadow-sm">
                <Search size={18} className="text-[var(--text-muted)]" />
                <input
                    type="text"
                    placeholder="Search stocks, clusters..."
                    className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                />
            </div>

            <div className="flex items-center gap-4">
                <button
                    className="p-2 rounded-full hover:bg-[var(--surface-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                    <Bell size={20} />
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-[var(--surface-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="text-sm font-semibold text-primary">JD</span>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
