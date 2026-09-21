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
        return '#1F7A4F';
    }

    if (tone === 'warning') {
        return '#D18B13';
    }

    if (tone === 'error') {
        return '#D64545';
    }

    return '#5B6472';
}

function buildIcon(kind: 'hub' | 'route', color: string) {
    const size = kind === 'hub' ? 18 : 14;

    return divIcon({
        className: 'custom-map-pin',
        html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:999px;background:${color};box-shadow:0 0 0 6px rgba(255,255,255,.92),0 14px 28px rgba(15,23,42,.22);"></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

export function DistributionMap({ routes, stateSummary }: { routes: Route[]; stateSummary: DistributionStateSummary[] }) {
    const visibleRoutes = routes.slice(0, 8);

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_340px]">
            <div className="map-frame isolate overflow-hidden rounded-[24px] border border-base-200 bg-base-100 shadow-sm">
                <MapContainer
                    center={[22.2, -100.0]}
                    zoom={5}
                    minZoom={4}
                    scrollWheelZoom={false}
                    className="distribution-map"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={logisticsHub} icon={buildIcon('hub', '#111827')}>
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
                                <Polyline positions={[logisticsHub, destination]} pathOptions={{ color, weight: 4, opacity: 0.78 }} />
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
            </div>

            <div className="space-y-3 rounded-[24px] border border-base-200 bg-base-100 p-4 shadow-sm xl:max-h-[540px] xl:overflow-y-auto app-scrollbar">
                <div>
                    <p className="text-xs font-semibold text-base-content/45">Cobertura territorial</p>
                    <h3 className="mt-2 text-lg font-bold">Estados con operación activa</h3>
                </div>
                <div className="space-y-3">
                    {stateSummary.slice(0, 6).map((state) => (
                        <div key={state.state_name} className="rounded-2xl border border-base-200 bg-base-200/30 p-3">
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
