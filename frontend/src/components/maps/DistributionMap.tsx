import { Fragment } from 'react';
import { divIcon, type LatLngTuple } from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import type { DistributionStateSummary, Route } from '../../types/logistics';
import { formatNumber, getStatusTone } from '../../data/logisticsMeta';

const logisticsHub: LatLngTuple = [19.1738, -96.1342];

const coordinateCatalog: Record<string, LatLngTuple> = {
    veracruz: [19.1738, -96.1342],
    puebla: [19.0414, -98.2063],
    oaxaca: [17.0732, -96.7266],
    tabasco: [17.9895, -92.9475],
    chiapas: [16.7516, -93.1029],
    yucatan: [20.9674, -89.5926],
    merida: [20.9674, -89.5926],
    campeche: [19.8301, -90.5349],
    'quintana roo': [21.1619, -86.8515],
    cancun: [21.1619, -86.8515],
    mexico: [19.4326, -99.1332],
    cdmx: [19.4326, -99.1332],
    monterrey: [25.6866, -100.3161],
    'nuevo leon': [25.5922, -99.9962],
    guadalajara: [20.6597, -103.3496],
    jalisco: [20.6767, -103.3475],
    queretaro: [20.5888, -100.3899],
    hidalgo: [20.0911, -98.7624],
    tamaulipas: [23.7369, -99.1411],
    'san luis potosi': [22.1565, -100.9855],
};

function normalizeKey(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function resolveCoordinate(route: Route) {
    const keys = [route.destination, route.state_name].map(normalizeKey);

    for (const key of keys) {
        const exact = coordinateCatalog[key];
        if (exact) {
            return exact;
        }

        const partial = Object.entries(coordinateCatalog).find(([catalogKey]) => key.includes(catalogKey));
        if (partial) {
            return partial[1];
        }
    }

    return [19.4326, -99.1332] as LatLngTuple;
}

function toneColor(status: string) {
    const tone = getStatusTone(status);

    if (tone === 'success') {
        return 'var(--color-success)';
    }

    if (tone === 'warning') {
        return 'var(--color-warning)';
    }

    if (tone === 'error') {
        return 'var(--color-error)';
    }

    return 'var(--color-secondary)';
}

function buildIcon(kind: 'hub' | 'route', color: string) {
    const size = kind === 'hub' ? 18 : 14;

    return divIcon({
        className: 'custom-map-pin',
        html: `<span style="display:block;width:${size}px;height:${size}px;border:3px solid white;border-radius:999px;background:${color};"></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

export function DistributionMap({ routes, stateSummary }: { routes: Route[]; stateSummary: DistributionStateSummary[] }) {
    const visibleRoutes = routes.slice(0, 8);

    const legendItems = [
        { label: 'Operativa', color: 'var(--color-success)' },
        { label: 'En tránsito', color: 'var(--color-warning)' },
        { label: 'Requiere atención', color: 'var(--color-error)' },
        { label: 'Hub central', color: 'var(--color-neutral)' },
    ];

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_340px]">
            <div className="map-frame isolate overflow-hidden rounded-xl border border-base-200 bg-base-100 shadow-sm">
                <MapContainer
                    center={[22.2, -100.0]}
                    zoom={5}
                    minZoom={4}
                    maxZoom={19}
                    scrollWheelZoom={false}
                    className="distribution-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                        referrerPolicy="strict-origin-when-cross-origin"
                        updateWhenIdle
                    />
                    <Marker position={logisticsHub} icon={buildIcon('hub', 'var(--color-neutral)')}>
                        <Popup>
                            <strong>Hub logístico PiñaLog 360</strong>
                            <br />
                            Centro de despacho primario.
                        </Popup>
                    </Marker>
                    {visibleRoutes.map((route) => {
                        const destination = resolveCoordinate(route);
                        const color = toneColor(route.status);

                        return (
                            <Fragment key={route.id}>
                                <Polyline positions={[logisticsHub, destination]} pathOptions={{ color, weight: 3, opacity: 0.85, dashArray: '6 6' }} />
                                <Marker position={destination} icon={buildIcon('route', color)}>
                                    <Popup>
                                        <strong>{route.destination}</strong>
                                        <br />
                                        {route.state_name} · {route.status}
                                        <br />
                                        Capacidad: {formatNumber(route.capacity_units)} unidades
                                    </Popup>
                                </Marker>
                            </Fragment>
                        );
                    })}
                </MapContainer>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-base-200 bg-base-100/95 px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-base-content/50">Estado de ruta</span>
                    {legendItems.map((item) => (
                        <span key={item.label} className="flex items-center gap-1.5 text-xs text-base-content/70">
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                            />
                            {item.label}
                        </span>
                    ))}
                </div>
                <p className="border-t border-base-200 px-4 py-2 text-xs text-base-content/65">
                    Ubicaciones de referencia. Las líneas conectan origen y destino, no representan el recorrido por carretera.
                </p>
            </div>

            <div className="space-y-3 rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm xl:max-h-[540px] xl:overflow-y-auto app-scrollbar">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-base-content/45">Cobertura territorial</p>
                    <h3 className="mt-2 text-lg font-bold">Estados con operación activa</h3>
                </div>
                <div className="space-y-3">
                    {stateSummary.slice(0, 6).map((state) => (
                        <div key={state.state_name} className="rounded-xl border border-base-200 bg-base-200/30 p-3">
                            <div className="flex items-center justify-between gap-3">
                                <strong className="text-sm">{state.state_name}</strong>
                                <span className="badge badge-outline">{state.route_count} rutas</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-base-content/60">
                                <span>{state.active_routes} activas</span>
                                <span>{formatNumber(state.total_capacity_units)} uds.</span>
                            </div>
                            <progress
                                className="progress progress-success mt-3 h-2 w-full"
                                value={state.active_routes}
                                max={Math.max(state.route_count, 1)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
