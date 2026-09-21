import { useMemo, useState } from 'react';
import { Boxes, Building2, Filter, Package } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
import { useLogistics } from '../context/LogisticsContext';
import { formatDate, formatNumber, formatVolume, getStockTone } from '../data/logisticsMeta';

export function InventoryPage() {
    const { inventory } = useLogistics();
    const [warehouseFilter, setWarehouseFilter] = useState('all');

    const warehouses = Array.from(new Set(inventory.map((item) => item.warehouse_location)));

    const filteredInventory = useMemo(
        () => inventory.filter((item) => warehouseFilter === 'all' || item.warehouse_location === warehouseFilter),
        [inventory, warehouseFilter],
    );

    const summary = useMemo(() => {
        const totalUnits = filteredInventory.reduce((accumulator, item) => accumulator + item.quantity, 0);
        const totalVolume = filteredInventory.reduce((accumulator, item) => accumulator + item.volume_m3, 0);
        const lowStock = filteredInventory.filter((item) => item.quantity <= 320).length;

        return { totalUnits, totalVolume, lowStock };
    }, [filteredInventory]);

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Inventario central"
                title="Existencias por bodega y región"
                description="Panel de control visual para revisar disponibilidad, estado de frescura y focos de redistribución por lote."
                actions={
                    <label className="select select-bordered flex items-center gap-2 rounded-2xl">
                        <Filter size={16} />
                        <select value={warehouseFilter} onChange={(event) => setWarehouseFilter(event.target.value)}>
                            <option value="all">Todas las bodegas</option>
                            {warehouses.map((warehouse) => (
                                <option key={warehouse} value={warehouse}>{warehouse}</option>
                            ))}
                        </select>
                    </label>
                }
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Unidades disponibles" value={formatNumber(summary.totalUnits)} helper="Stock consolidado filtrado" icon={<Boxes size={22} />} tone="primary" />
                <StatCard title="Volumen almacenado" value={formatVolume(summary.totalVolume)} helper="Capacidad ocupada" icon={<Package size={22} />} tone="success" />
                <StatCard title="Bodegas visibles" value={formatNumber(warehouseFilter === 'all' ? warehouses.length : 1)} helper="Nodos logísticos en pantalla" icon={<Building2 size={22} />} tone="default" />
                <StatCard title="Alertas de reabasto" value={formatNumber(summary.lowStock)} helper="Lotes con semáforo amarillo o rojo" icon={<Filter size={22} />} tone="warning" />
            </section>

            <SectionCard title="Resumen por bodega" description="Comparativo de ocupación y stock crítico por ubicación física.">
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {warehouses
                        .filter((warehouse) => warehouseFilter === 'all' || warehouse === warehouseFilter)
                        .map((warehouse) => {
                            const items = inventory.filter((item) => item.warehouse_location === warehouse);
                            const units = items.reduce((accumulator, item) => accumulator + item.quantity, 0);
                            const volume = items.reduce((accumulator, item) => accumulator + item.volume_m3, 0);
                            const riskCount = items.filter((item) => item.quantity <= 320).length;
                            const progressValue = Math.min(100, Math.round((units / 1800) * 100));

                            return (
                                <div key={warehouse} className="rounded-[24px] border border-base-200 bg-base-200/25 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-bold">{warehouse}</p>
                                            <p className="text-sm text-base-content/60">{items.length} lotes activos</p>
                                        </div>
                                        <span className="badge badge-outline">{riskCount} alertas</span>
                                    </div>
                                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-base-content/55">Unidades</p>
                                            <p className="mt-1 text-2xl font-black">{formatNumber(units)}</p>
                                        </div>
                                        <div>
                                            <p className="text-base-content/55">Volumen</p>
                                            <p className="mt-1 text-2xl font-black">{formatVolume(volume)}</p>
                                        </div>
                                    </div>
                                    <progress className="progress progress-success mt-5 h-2 w-full" value={progressValue} max={100} />
                                </div>
                            );
                        })}
                </div>
            </SectionCard>

            <SectionCard title="Existencias detalladas" description="Lotes, procedencia, estado y capacidad visual por producto almacenado.">
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Lote</th>
                                <th>Producto</th>
                                <th>Origen</th>
                                <th>Bodega</th>
                                <th>Ingreso</th>
                                <th>Stock</th>
                                <th>Volumen</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item) => {
                                const tone = getStockTone(item.quantity);
                                const progressClass = tone === 'success' ? 'progress-success' : tone === 'warning' ? 'progress-warning' : 'progress-error';

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="font-bold">{item.batch_code}</div>
                                            <div className="text-xs text-base-content/50">{item.state}</div>
                                        </td>
                                        <td>{item.product_name}</td>
                                        <td>{item.origin}</td>
                                        <td>{item.warehouse_location}</td>
                                        <td>{formatDate(item.entry_date)}</td>
                                        <td className="min-w-44">
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <span>{formatNumber(item.quantity)} uds.</span>
                                                <span className="text-base-content/50">{Math.min(100, Math.round((item.quantity / 600) * 100))}%</span>
                                            </div>
                                            <progress className={`progress mt-2 h-2 w-full ${progressClass}`} value={item.quantity} max={600} />
                                        </td>
                                        <td>{formatVolume(item.volume_m3)}</td>
                                        <td><StatusBadge value={item.status} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
}
