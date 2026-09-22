import { Link, useParams } from 'react-router-dom';
import { Route as RouteIcon, Truck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useLogistics, findRelatedInventory, findRelatedRoute } from '../context/LogisticsContext';
import { buildTimelineSteps, formatDate, formatNumber, formatVolume } from '../data/logisticsMeta';

export function TrackingPage() {
    const { movementId } = useParams();
    const { movements, inventory, routes } = useLogistics();

    const selectedMovement = movements.find((movement) => movement.id === Number(movementId)) ?? movements[0];
    const relatedInventory = findRelatedInventory(selectedMovement, inventory);
    const relatedRoute = findRelatedRoute(selectedMovement, routes);
    const timeline = buildTimelineSteps({
        movement: selectedMovement,
        route: relatedRoute,
        inventoryItem: relatedInventory,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Tracking operativo"
                title="Seguimiento detallado de envío o pedido"
                description="Experiencia tipo tracking enterprise para revisar hitos, capacidad, trazabilidad del lote y estado actual del despacho."
            />

            <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <SectionCard title="Pedidos disponibles" description="Selecciona un folio para revisar su línea de tiempo y ficha logística.">
                    <div className="space-y-4">
                            {movements.slice(0, 10).map((movement) => {
                            const isActive = movement.id === selectedMovement?.id;
                            return (
                                <Link
                                    key={movement.id}
                                    to={`/tracking/${movement.id}`}
                                    className={[
                                        'block rounded-xl border p-4 transition-all',
                                        isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-base-200 bg-base-200/20 hover:bg-base-200/35',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold">{movement.folio}</p>
                                            <p className="text-sm text-base-content/55">{movement.partner}</p>
                                        </div>
                                        <StatusBadge value={movement.state} />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-base-content/55">
                                        <span>{formatDate(movement.movement_date)}</span>
                                        <span>{formatNumber(movement.quantity)} uds.</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard
                        title={selectedMovement ? `Folio ${selectedMovement.folio}` : 'Sin movimiento seleccionado'}
                        description="Estado actual y progreso de la operación desde registro hasta entrega."
                        actions={selectedMovement ? <StatusBadge value={selectedMovement.state} /> : undefined}
                    >
                        <ul className="timeline timeline-snap-icon timeline-vertical">
                            {timeline.map((step, index) => (
                                <li key={step.title}>
                                    {index > 0 ? <hr className={step.state === 'pending' ? 'bg-base-300' : 'bg-primary'} /> : null}
                                    <div className="timeline-middle">
                                        <div className={[
                                            'grid h-9 w-9 place-items-center rounded-full border',
                                            step.state === 'done'
                                                ? 'border-success bg-success text-success-content'
                                                : step.state === 'current'
                                                    ? 'border-warning bg-warning text-warning-content'
                                                    : 'border-base-300 bg-base-200 text-base-content/55',
                                        ].join(' ')}>
                                            <RouteIcon size={16} />
                                        </div>
                                    </div>
                                    <div className="timeline-end mb-8 rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm">
                                        <time className="text-xs font-semibold text-base-content/45">{step.time}</time>
                                        <div className="mt-2 text-lg font-bold">{step.title}</div>
                                        <p className="mt-2 text-sm text-base-content/60">{step.description}</p>
                                    </div>
                                    {index < timeline.length - 1 ? <hr className={step.state === 'pending' ? 'bg-base-300' : 'bg-primary'} /> : null}
                                </li>
                            ))}
                        </ul>
                    </SectionCard>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <SectionCard title="Ficha logística" description="Datos consolidados del envío actual.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-base-200 bg-base-200/25 p-4">
                                    <p className="text-sm text-base-content/55">Destino</p>
                                    <p className="mt-2 text-lg font-bold">{relatedRoute?.destination ?? selectedMovement?.partner ?? 'Pendiente'}</p>
                                </div>
                                <div className="rounded-xl border border-base-200 bg-base-200/25 p-4">
                                    <p className="text-sm text-base-content/55">Canal</p>
                                    <p className="mt-2 text-lg font-bold">{relatedRoute?.state_name ?? selectedMovement?.state ?? 'Sin canal'}</p>
                                </div>
                                <div className="rounded-xl border border-base-200 bg-base-200/25 p-4">
                                    <p className="text-sm text-base-content/55">Cantidad</p>
                                    <p className="display-num mt-2 text-lg font-bold">{selectedMovement ? `${formatNumber(selectedMovement.quantity)} uds.` : '0 uds.'}</p>
                                </div>
                                <div className="rounded-xl border border-base-200 bg-base-200/25 p-4">
                                    <p className="text-sm text-base-content/55">Volumen</p>
                                    <p className="display-num mt-2 text-lg font-bold">{selectedMovement ? formatVolume(selectedMovement.volume_m3) : '0 m³'}</p>
                                </div>
                                <div className="rounded-xl border border-base-200 bg-base-200/25 p-4">
                                    <p className="text-sm text-base-content/55">Bodega</p>
                                    <p className="mt-2 text-lg font-bold">{relatedInventory?.warehouse_location ?? 'Por asignar'}</p>
                                </div>
                                <div className="rounded-xl border border-base-200 bg-base-200/25 p-4">
                                    <p className="text-sm text-base-content/55">Responsable</p>
                                    <p className="mt-2 text-lg font-bold">{relatedRoute?.responsible ?? selectedMovement?.responsible ?? 'Sin responsable'}</p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Estado de traslado" description="Contexto operativo para el responsable y la mesa de control.">
                            <div className="scale-field rounded-xl bg-primary p-5 text-primary-content shadow-lg shadow-primary/25">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-primary-content/75">Pedido activo</p>
                                        <h3 className="display-num mt-3 text-2xl font-black">{selectedMovement?.folio ?? 'Sin folio'}</h3>
                                        <p className="mt-3 max-w-sm text-sm text-primary-content/80">
                                            Seguimiento estilo conductor/logística adaptado a transporte de producto fresco y control de tiempos.
                                        </p>
                                    </div>
                                    <Truck size={34} />
                                </div>
                                <progress className="progress progress-warning mt-5 h-2 w-full" value={selectedMovement ? 72 : 0} max={100} />
                            </div>
                        </SectionCard>
                    </section>
                </div>
            </section>
        </div>
    );
}
