import { ReactNode } from 'react';

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-2">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                    <span className="inline-block h-1.5 w-1.5 rotate-45 bg-secondary/80" aria-hidden="true" />
                    {eyebrow}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-base-content lg:text-4xl">{title}</h1>
                <p className="text-sm leading-6 text-base-content/65 lg:text-base">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
    );
}
