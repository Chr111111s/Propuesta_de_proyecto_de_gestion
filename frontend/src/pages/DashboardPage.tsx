import {
    Activity,
    AlertTriangle,
    Boxes,
    MapPinned,
    PackageCheck,
    TrendingUp,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { SectionCard } from '../components/ui/SectionCard';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useLogistics } from '../context/LogisticsContext';
import { formatDate, formatNumber, formatPercent, formatVolume } from '../data/logisticsMeta';

export function DashboardPage() {
    const {
        metrics,
        totalBatches,
        coveredStates,
        criticalInventory,
        weeklyMovements,
        activeRoutes,
        movements,
        routeSummary,
    } = useLogistics();

    return (
        <div className="space-y-6">
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_380px]">
                <div className="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm lg:p-7">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-secondary/80" aria-hidden="true" />
                        Dashboard principal
                    </p>
                    <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight lg:text-5xl">
                        Operación integral de inventario y distribución de piñas
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-base-content/60 lg:text-base">
                        Un centro de control diseñado para seguimiento diario, decisiones de reabasto y coordinación logística
                        multiestado con claridad ejecutiva.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <span className="badge badge-lg badge-outline">{formatNumber(movements.length)} movimientos monitoreados</span>
                        <span className="badge badge-lg badge-outline">{coveredStates} estados con cobertura</span>
                        <span className="badge badge-lg badge-outline">{formatNumber(routeSummary.totalCapacity)} uds. de capacidad</span>
                    </div>
                </div>

                <div className="scale-field rounded-2xl bg-neutral p-6 text-primary-content shadow-lg shadow-neutral/15 lg:p-7">
                    <p className="text-xs font-semibold text-primary-content/75">Eficiencia operativa</p>
                    <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                            <p className="display-num text-5xl font-black">{metrics?.estimated_waste_reduction_pct ?? 0}%</p>
                            <p className="mt-2 max-w-xs text-sm text-primary-content/80">
                                Reducción estimada de merma frente a retrasos y sobreinventario del periodo.
                            </p>
                        </div>
                        <TrendingUp size={44} className="text-primary-content/60" />
                    </div>
                    <progress className="progress progress-accent mt-6 h-3 w-full" value={metrics?.estimated_waste_reduction_pct ?? 0} max={100} />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                <StatCard
                    title="Inventario total"
                    value={formatNumber(metrics?.total_units ?? 0)}
                    helper="Unidades disponibles en red logística"
                    icon={<Boxes size={22} />}
                    tone="primary"
                />
                <StatCard
                    title="Volumen actual"
                    value={formatVolume(metrics?.total_volume_m3 ?? 0)}
                    helper="Ocupación consolidada de bodegas"
                    icon={<PackageCheck size={22} />}
                    tone="success"
                />
                <StatCard
                    title="Rutas activas"
                    value={formatNumber(metrics?.active_routes ?? 0)}
                    helper="Despachos en curso y cobertura estatal"
                    icon={<MapPinned size={22} />}
                    tone="default"
                />
                <StatCard
                    title="Movimientos del periodo"
                    value={formatNumber(metrics?.monthly_movements ?? 0)}
                    helper="Entradas y salidas registradas"
                    icon={<Activity size={22} />}
                    tone="default"
                />
                <StatCard
                    title="Lotes activos"
                    value={formatNumber(totalBatches)}
                    helper="Trazabilidad vigente por lote y bodega"
                    icon={<TrendingUp size={22} />}
                    tone="default"
                />
                <StatCard
                    title="Alertas de stock"
                    value={formatNumber(criticalInventory.length)}
                    helper="Bodegas con nivel por debajo del umbral"
                    icon={<AlertTriangle size={22} />}
                    tone="warning"
                />
            </section>

            <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.6fr)_420px]">
                <SectionCard title="Movimiento semanal" description="Comparativo de entradas y salidas en los últimos siete registros de operación.">
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer>
                            <AreaChart data={weeklyMovements} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="entradasFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.32} />
                                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.03} />
                                    </linearGradient>
                                    <linearGradient id="salidasFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.26} />
                                        <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0.03} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="var(--color-base-300)" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: 'var(--color-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--color-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(value, name) => [formatNumber(Number(value ?? 0)), name === 'entradas' ? 'Entradas' : 'Salidas']}
                                    labelFormatter={(label) => formatDate(String(label))}
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid var(--color-base-300)',
                                        background: 'var(--color-base-100)',
                                        boxShadow: '0 12px 28px rgba(30,48,72,0.12)',
                                        fontSize: 13,
                                        fontFamily: 'var(--font-sans)',
                                    }}
                                    cursor={{ stroke: 'var(--color-secondary)', strokeDasharray: '3 3' }}
                                />
                                <Area type="monotone" dataKey="entradas" stroke="var(--color-primary)" strokeWidth={3} fill="url(#entradasFill)" />
                                <Area type="monotone" dataKey="salidas" stroke="var(--color-secondary)" strokeWidth={3} fill="url(#salidasFill)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Bajo stock" description="Productos que requieren revisión de reabasto o redistribución interna.">
                    <div className="space-y-3">
                        {criticalInventory.map((item) => (
<div key={item.id} className="rounded-xl border border-base-200 bg-base-200/30 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="folio-mono font-bold">{item.batch_code}</p>
                                                <p className="text-sm text-base-content/60">{item.warehouse_location} · {item.origin}</p>
                                            </div>
                                            <StatusBadge value={item.status} />
                                        </div>
                                <div className="mt-3 flex items-center justify-between text-sm text-base-content/60">
                                    <span>{formatNumber(item.quantity)} unidades</span>
                                    <span>{formatVolume(item.volume_m3)}</span>
                                </div>
                                <progress className="progress progress-warning mt-3 h-2 w-full" value={item.quantity} max={600} />
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <SectionCard title="Rutas destacadas" description="Despachos y canales con actividad prioritaria.">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Destino</th>
                                    <th>Estado</th>
                                    <th>Capacidad</th>
                                    <th>Estatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeRoutes.map((route) => (
                                    <tr key={route.id}>
                                        <td>
                                            <div className="font-semibold">{route.destination}</div>
                                            <div className="text-xs text-base-content/50">{route.responsible}</div>
                                        </td>
                                        <td>{route.state_name}</td>
                                        <td>{formatNumber(route.capacity_units)}</td>
                                        <td><StatusBadge value={route.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Movimientos recientes" description="Últimos folios registrados para control diario.">
                    <div className="overflow-x-auto">
                        <table className="table table-pin-rows">
                            <thead>
                                <tr>
                                    <th>Folio</th>
                                    <th>Fecha</th>
                                    <th>Socio</th>
                                    <th>Cantidad</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.slice(0, 6).map((movement) => (
                                    <tr key={movement.id}>
                                        <td className="folio-mono font-semibold">{movement.folio}</td>
                                        <td>{formatDate(movement.movement_date)}</td>
                                        <td>{movement.partner}</td>
                                        <td>{formatNumber(movement.quantity)}</td>
                                        <td><StatusBadge value={movement.state} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/55">Cobertura estatal</p>
                    <p className="display-num mt-3 text-4xl font-black">{coveredStates}</p>
                    <p className="mt-2 text-sm text-base-content/60">Regiones con entregas, recolección o tránsito actualmente controlado.</p>
                </div>
                <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/55">Capacidad total</p>
                    <p className="display-num mt-3 text-4xl font-black">{formatNumber(routeSummary.totalCapacity)}</p>
                    <p className="mt-2 text-sm text-base-content/60">Unidades disponibles para redistribución estatal.</p>
                </div>
                <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/55">Merma evitada</p>
                    <p className="display-num mt-3 text-4xl font-black">{formatPercent(metrics?.estimated_waste_reduction_pct ?? 0)}</p>
                    <p className="mt-2 text-sm text-base-content/60">Indicador de eficiencia frente a sobreinventario y demoras.</p>
                </div>
            </section>
        </div>
    );
}
