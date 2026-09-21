import { FormEvent, useState } from 'react';
import { CalendarDays, Map, Plus, Timer, Truck } from 'lucide-react';
import { DistributionMap } from '../components/maps/DistributionMap';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
import { useLogistics } from '../context/LogisticsContext';
import { formatDate, formatNumber, routeInitialState } from '../data/logisticsMeta';
import type { RoutePayload } from '../types/logistics';

export function DistributionPage() {
    const { routes, stateSummary, routeSummary, createRoute } = useLogistics();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<RoutePayload>(routeInitialState);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);

        try {
            await createRoute(form);
            setForm(routeInitialState);
            setOpen(false);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Planeación territorial"
                title="Distribución estatal con mapa de seguimiento"
                description="Vista tipo control tower con rutas activas, capacidad, responsables y desempeño de traslado sobre un mapa profesional."
                actions={
                    <button type="button" className="btn btn-primary rounded-2xl" onClick={() => setOpen(true)}>
                        <Plus size={16} />
                        Programar ruta
                    </button>
                }
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Rutas activas" value={formatNumber(routes.length)} helper="Despachos visibles en el periodo" icon={<Truck size={22} />} tone="primary" />
                <StatCard title="Estados cubiertos" value={formatNumber(stateSummary.length)} helper="Nodos estatales con actividad" icon={<Map size={22} />} tone="default" />
                <StatCard title="Tiempo promedio" value={`${routeSummary.averageTravelTime.toFixed(1)} h`} helper="Duración media estimada de traslado" icon={<Timer size={22} />} tone="warning" />
                <StatCard title="Capacidad total" value={formatNumber(routeSummary.totalCapacity)} helper="Unidades disponibles para distribución" icon={<CalendarDays size={22} />} tone="success" />
            </section>

            <SectionCard title="Mapa de distribución" description="Hub principal, destinos activos y señales de estado por ruta.">
                <DistributionMap routes={routes} stateSummary={stateSummary} />
            </SectionCard>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_420px]">
                <SectionCard title="Rutas operativas" description="Prioriza seguimiento de capacidad, responsables y mantenimiento.">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Destino</th>
                                    <th>Estado</th>
                                    <th>Tiempo</th>
                                    <th>Capacidad</th>
                                    <th>Responsable</th>
                                    <th>Estatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map((route) => (
                                    <tr key={route.id}>
                                        <td className="font-semibold">{route.destination}</td>
                                        <td>{route.state_name}</td>
                                        <td>{route.travel_time_hours} h</td>
                                        <td>{formatNumber(route.capacity_units)}</td>
                                        <td>{route.responsible}</td>
                                        <td><StatusBadge value={route.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Desempeño estatal" description="Concentrado de utilización por plaza o estado.">
                    <div className="space-y-4">
                        {stateSummary.map((state) => (
                            <div key={state.state_name} className="rounded-2xl border border-base-200 bg-base-200/30 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold">{state.state_name}</p>
                                        <p className="text-sm text-base-content/60">{state.active_routes} activas · {state.maintenance_routes} en mantenimiento</p>
                                    </div>
                                    <span className="badge badge-outline">{formatNumber(state.total_capacity_units)} uds.</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm text-base-content/55">
                                    <span>Tiempo medio: {state.average_travel_time_hours.toFixed(1)} h</span>
                                    <span>{state.route_count} rutas totales</span>
                                </div>
                                <progress className="progress progress-success mt-3 h-2 w-full" value={state.active_routes} max={Math.max(state.route_count, 1)} />
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </section>

            <dialog className={`modal ${open ? 'modal-open' : ''}`}>
                <div className="modal-box max-w-2xl rounded-[28px] p-0">
                    <form onSubmit={handleSubmit} className="space-y-5 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black">Programar ruta estatal</h3>
                                <p className="mt-2 text-sm text-base-content/60">Captura destino, capacidad y responsable para actualizar el mapa logístico.</p>
                            </div>
                            <button type="button" className="btn btn-ghost btn-circle" onClick={() => setOpen(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Estado</span>
                                <input className="input input-bordered rounded-2xl" value={form.state_name} onChange={(event) => setForm((current) => ({ ...current, state_name: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Destino</span>
                                <input className="input input-bordered rounded-2xl" value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Tiempo estimado (h)</span>
                                <input type="number" step="0.1" className="input input-bordered rounded-2xl" value={form.travel_time_hours} onChange={(event) => setForm((current) => ({ ...current, travel_time_hours: Number(event.target.value) }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Capacidad</span>
                                <input type="number" className="input input-bordered rounded-2xl" value={form.capacity_units} onChange={(event) => setForm((current) => ({ ...current, capacity_units: Number(event.target.value) }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Responsable</span>
                                <input className="input input-bordered rounded-2xl" value={form.responsible} onChange={(event) => setForm((current) => ({ ...current, responsible: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Estado de ruta</span>
                                <input className="input input-bordered rounded-2xl" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2 md:col-span-2">
                                <span className="label-text font-semibold">Último mantenimiento</span>
                                <input type="date" className="input input-bordered rounded-2xl" value={form.last_maintenance} onChange={(event) => setForm((current) => ({ ...current, last_maintenance: event.target.value }))} required />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" className="btn btn-ghost rounded-2xl" onClick={() => setOpen(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className={`btn btn-primary rounded-2xl ${submitting ? 'btn-disabled' : ''}`}>
                                {submitting ? 'Guardando...' : 'Guardar ruta'}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="button" onClick={() => setOpen(false)}>close</button>
                </form>
            </dialog>
        </div>
    );
}
