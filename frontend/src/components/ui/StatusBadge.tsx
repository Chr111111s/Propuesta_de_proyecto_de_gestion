import { getStatusTone } from '../../data/logisticsMeta';

const toneByStatus = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    neutral: 'badge-ghost',
} as const;

export function StatusBadge({ value }: { value: string }) {
    const tone = getStatusTone(value);

    return <span className={`badge badge-sm md:badge-md font-semibold ${toneByStatus[tone]}`}>{value}</span>;
}
