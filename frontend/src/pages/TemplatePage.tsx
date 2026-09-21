import { Download, FileSpreadsheet, TimerReset, Weight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
import { useLogistics } from '../context/LogisticsContext';
import { formatDate, formatNumber, formatVolume } from '../data/logisticsMeta';

export function TemplatePage() {
    const { templateRows, templateSummary, exportTemplateCsv } = useLogistics();

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Plantilla estandarizada"
                title="Formato logístico listo para control diario y exportación"
                description="Vista tipo hoja de operación con jerarquía visual moderna, preparada para negociación, control interno y análisis de volumen movilizado."
                actions={
                    <button type="button" className="btn btn-primary rounded-2xl" onClick={exportTemplateCsv}>
                        <Download size={16} />
                        Exportar CSV
                    </button>
                }
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Registros" value={formatNumber(templateRows.length)} helper="Filas operativas consolidadas" icon={<FileSpreadsheet size={22} />} tone="primary" />
                <StatCard title="Unidades movilizadas" value={formatNumber(templateSummary.totalUnits)} helper="Cantidad total de producto" icon={<Weight size={22} />} tone="success" />
                <StatCard title="Volumen consolidado" value={formatVolume(templateSummary.totalVolume)} helper="Carga total considerada" icon={<FileSpreadsheet size={22} />} tone="default" />
                <StatCard title="Tiempo promedio" value={`${templateSummary.averageTravel.toFixed(1)} h`} helper="Promedio logístico estimado" icon={<TimerReset size={22} />} tone="warning" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_340px]">
                <SectionCard title="Plantilla logística" description="Tabla de captura con formato profesional tipo operación enterprise.">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Folio</th>
                                    <th>Proveedor / destino</th>
                                    <th>Cantidad</th>
                                    <th>Volumen</th>
                                    <th>Estado</th>
                                    <th>Traslado</th>
                                    <th>Responsable</th>
                                    <th>Tipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templateRows.map((row) => (
                                    <tr key={`${row.folio}-${row.movement_date}`}>
                                        <td>{formatDate(row.movement_date)}</td>
                                        <td className="font-bold">{row.folio}</td>
                                        <td>
                                            <div className="font-semibold">{row.provider_or_destination}</div>
                                            <div className="text-xs text-base-content/50">Lote {row.batch_code}</div>
                                        </td>
                                        <td>{formatNumber(row.quantity)}</td>
                                        <td>{formatVolume(row.volume_m3)}</td>
                                        <td><StatusBadge value={row.state} /></td>
                                        <td>{row.travel_time_hours} h</td>
                                        <td>{row.responsible}</td>
                                        <td className="capitalize">{row.movement_type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Indicadores de plantilla" description="Señales rápidas para negociación y supervisión operativa.">
                    <div className="space-y-4">
                        <div className="rounded-[24px] border border-base-200 bg-base-200/30 p-5">
                            <p className="text-sm font-semibold text-base-content/55">Promedio por registro</p>
                            <p className="mt-3 text-4xl font-black">
                                {templateRows.length ? formatNumber(Math.round(templateSummary.totalUnits / templateRows.length)) : '0'}
                            </p>
                            <p className="mt-2 text-sm text-base-content/60">Unidades movilizadas por folio promedio.</p>
                        </div>
                        <div className="rounded-[24px] border border-base-200 bg-base-200/30 p-5">
                            <p className="text-sm font-semibold text-base-content/55">Carga por volumen</p>
                            <p className="mt-3 text-4xl font-black">{templateSummary.totalVolume.toFixed(1)}</p>
                            <p className="mt-2 text-sm text-base-content/60">Metros cúbicos consolidados en el periodo cargado.</p>
                        </div>
                        <div className="rounded-[24px] border border-base-200 bg-base-200/30 p-5">
                            <p className="text-sm font-semibold text-base-content/55">Ritmo de traslado</p>
                            <p className="mt-3 text-4xl font-black">{templateSummary.averageTravel.toFixed(1)} h</p>
                            <p className="mt-2 text-sm text-base-content/60">Promedio actual para coordinación con clientes y rutas.</p>
                        </div>
                    </div>
                </SectionCard>
            </section>
        </div>
    );
}
