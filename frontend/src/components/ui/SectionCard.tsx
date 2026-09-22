import { ReactNode } from 'react';

export function SectionCard({
    title,
    description,
    actions,
    children,
    className = '',
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={`card border border-base-200 bg-base-100 shadow-sm rounded-2xl ${className}`.trim()}>
            <div className="card-body gap-5 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-base-content">{title}</h2>
                        {description ? <p className="text-sm text-base-content/60">{description}</p> : null}
                    </div>
                    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
                </div>
                {children}
            </div>
        </section>
    );
}
