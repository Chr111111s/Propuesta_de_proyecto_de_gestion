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
        default: '',
        primary: 'stat-panel-primary',
        success: 'stat-panel-success',
        warning: 'stat-panel-warning',
    }[tone];

    return (
        <div className={`stat stat-panel rounded-2xl border transition-shadow ${toneClass}`}>
            <div className="stat-figure">{icon}</div>
            <div className="stat-title text-xs font-semibold uppercase tracking-[0.08em] text-base-content/55">{title}</div>
            <div className="display-num stat-value text-3xl lg:text-4xl">{value}</div>
            <div className="stat-desc text-base-content/55">{helper}</div>
        </div>
    );
}
