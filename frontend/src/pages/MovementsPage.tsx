import { FormEvent, useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { SectionCard } from '../components/ui/SectionCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useLogistics } from '../context/LogisticsContext';
import { formatDate, formatNumber, formatVolume, movementInitialState } from '../data/logisticsMeta';
import type { MovementPayload } from '../types/logistics';

export function MovementsPage() {
    const { movements, createMovement } = useLogistics();
    const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' });
    const [form, setForm] = useState<MovementPayload>(movementInitialState);
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const filteredMovements = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        return movements.filter((movement) => {
            const matchesType = filters.type === 'all' || movement.movement_type === filters.type;
            const matchesStatus = filters.status === 'all' || movement.state === filters.status;
            const matchesSearch =
                !search ||
                movement.folio.toLowerCase().includes(search) ||
                movement.partner.toLowerCase().includes(search) ||
                movement.batch_code.toLowerCase().includes(search);

            return matchesType && matchesStatus && matchesSearch;
        });
    }, [movements, filters]);

    const statusOptions = Array.from(new Set(movements.map((movement) => movement.state)));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);

        try {
            await createMovement(form);
            setForm({ ...movementInitialState, movement_type: form.movement_type });
            setOpen(false);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Módulo operacional"
                title="Entradas y salidas con foco transaccional"
                description="Una vista separada para control de folios, origen/destino, volúmenes y responsables operativos sin perder claridad visual."
                actions={
                    <button type="button" className="btn btn-primary rounded-xl" onClick={() => setOpen(true)}>
                        <Plus size={16} />
                        Registrar movimiento
                    </button>
                }
            />

            <SectionCard title="Filtros y métricas rápidas" description="Localiza movimientos por folio, lote, tipo o estado operativo.">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_200px_220px]">
                    <label className="input input-bordered flex items-center gap-2 rounded-xl">
                        <Search size={16} className="text-base-content/45" />
                        <input
                            value={filters.search}
                            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                            placeholder="Buscar folio, socio o lote"
                            className="grow"
                        />
                    </label>
                    <select
                        className="select select-bordered rounded-xl"
                        value={filters.type}
                        onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="entrada">Entradas</option>
                        <option value="salida">Salidas</option>
                    </select>
                    <select
                        className="select select-bordered rounded-xl"
                        value={filters.status}
                        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                    >
                        <option value="all">Todos los estados</option>
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <span className="badge badge-lg badge-outline">{filteredMovements.length} registros visibles</span>
                    <span className="badge badge-lg badge-outline">
                        {filteredMovements.filter((movement) => movement.movement_type === 'entrada').length} entradas
                    </span>
                    <span className="badge badge-lg badge-outline">
                        {filteredMovements.filter((movement) => movement.movement_type === 'salida').length} salidas
                    </span>
                </div>
            </SectionCard>

            <SectionCard title="Tabla de movimientos" description="Información operativa lista para seguimiento, revisión y trazabilidad.">
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Proveedor / destino</th>
                                <th>Cantidad</th>
                                <th>Volumen</th>
                                <th>Responsable</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovements.map((movement) => (
                                <tr key={movement.id}>
                                    <td>
                                        <div className="folio-mono font-bold">{movement.folio}</div>
                                        <div className="text-xs text-base-content/50">{movement.batch_code}</div>
                                    </td>
                                    <td>{formatDate(movement.movement_date)}</td>
                                    <td className="capitalize">{movement.movement_type}</td>
                                    <td>{movement.partner}</td>
                                    <td>{formatNumber(movement.quantity)}</td>
                                    <td>{formatVolume(movement.volume_m3)}</td>
                                    <td>{movement.responsible}</td>
                                    <td><StatusBadge value={movement.state} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            <dialog className={`modal ${open ? 'modal-open' : ''}`}>
                <div className="modal-box max-w-3xl rounded-2xl p-0">
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black">Registrar movimiento</h3>
                                <p className="mt-2 text-sm text-base-content/60">Captura el movimiento con datos de socio, lote, volumen y trazabilidad de bodega.</p>
                            </div>
                            <button type="button" className="btn btn-ghost btn-circle" onClick={() => setOpen(false)} aria-label="Cerrar">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Folio</span>
                                <input className="input input-bordered rounded-xl" value={form.folio} onChange={(event) => setForm((current) => ({ ...current, folio: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Tipo</span>
                                <select className="select select-bordered rounded-xl" value={form.movement_type} onChange={(event) => setForm((current) => ({ ...current, movement_type: event.target.value as MovementPayload['movement_type'] }))}>
                                    <option value="entrada">Entrada</option>
                                    <option value="salida">Salida</option>
                                </select>
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Proveedor / destino</span>
                                <input className="input input-bordered rounded-xl" value={form.partner} onChange={(event) => setForm((current) => ({ ...current, partner: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Fecha</span>
                                <input type="date" className="input input-bordered rounded-xl" value={form.movement_date} onChange={(event) => setForm((current) => ({ ...current, movement_date: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Cantidad</span>
                                <input type="number" className="input input-bordered rounded-xl" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Volumen m³</span>
                                <input type="number" step="0.1" className="input input-bordered rounded-xl" value={form.volume_m3} onChange={(event) => setForm((current) => ({ ...current, volume_m3: Number(event.target.value) }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Estado operativo</span>
                                <input className="input input-bordered rounded-xl" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Responsable</span>
                                <input className="input input-bordered rounded-xl" value={form.responsible} onChange={(event) => setForm((current) => ({ ...current, responsible: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Origen</span>
                                <input className="input input-bordered rounded-xl" value={form.origin} onChange={(event) => setForm((current) => ({ ...current, origin: event.target.value }))} />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Bodega</span>
                                <input className="input input-bordered rounded-xl" value={form.warehouse_location} onChange={(event) => setForm((current) => ({ ...current, warehouse_location: event.target.value }))} />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Lote</span>
                                <input className="input input-bordered rounded-xl" value={form.batch_code} onChange={(event) => setForm((current) => ({ ...current, batch_code: event.target.value }))} required />
                            </label>
                            <label className="form-control gap-2">
                                <span className="label-text font-semibold">Tiempo traslado (h)</span>
                                <input type="number" step="0.1" className="input input-bordered rounded-xl" value={form.travel_time_hours} onChange={(event) => setForm((current) => ({ ...current, travel_time_hours: Number(event.target.value) }))} />
                            </label>
                        </div>

                        <label className="form-control gap-2">
                            <span className="label-text font-semibold">Notas</span>
                            <textarea className="textarea textarea-bordered min-h-28 rounded-xl" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
                        </label>

                        <div className="flex justify-end gap-3">
                            <button type="button" className="btn btn-ghost rounded-xl" onClick={() => setOpen(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className={`btn btn-primary rounded-xl ${submitting ? 'btn-disabled' : ''}`}>
                                {submitting ? 'Guardando...' : 'Guardar movimiento'}
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
