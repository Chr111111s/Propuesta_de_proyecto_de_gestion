import { ReactNode } from 'react';

export function StatCard({
    title,
    value,
    helper,
    icon,
    tone = 'default',
}: {
    title: string;
    value: string;
    helper: string;
    icon: ReactNode;
    tone?: 'default' | 'primary' | 'success' | 'warning';
}) {
    const toneClass = {
        default: 'bg-base-100 border-base-200',
        primary: 'bg-primary/5 border-primary/15',
        success: 'bg-success/10 border-success/20',
        warning: 'bg-warning/10 border-warning/20',
    }[tone];

    return (
        <div className={`stat rounded-3xl border shadow-sm ${toneClass}`}>
            <div className="stat-figure text-primary">{icon}</div>
            <div className="stat-title text-base-content/60">{title}</div>
            <div className="stat-value text-3xl lg:text-4xl">{value}</div>
            <div className="stat-desc text-base-content/55">{helper}</div>
        </div>
    );
}
