import React from 'react';

const MetricCard = ({ title, value, change, changeType, icon: Icon }) => {
    return (
        <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-muted)]">{title}</h3>
                {Icon && (
                    <div className="p-2 rounded-lg bg-[var(--surface-border)]">
                        <Icon size={18} className="text-[var(--text-main)]" />
                    </div>
                )}
            </div>
            <div>
                <div className="text-3xl font-bold text-[var(--text-main)]">{value}</div>
                {change && (
                    <div className={`text-sm mt-2 flex items-center font-medium ${changeType === 'positive' ? 'text-success'
                            : changeType === 'negative' ? 'text-danger'
                                : 'text-[var(--text-muted)]'
                        }`}>
                        {changeType === 'positive' ? '+' : ''}{change}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
