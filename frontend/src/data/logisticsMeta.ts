import type {
    DistributionStateSummary,
    InventoryItem,
    LogisticsTemplateRow,
    Movement,
    MovementPayload,
    Route,
    RoutePayload,
} from '../types/logistics';

export const today = new Date().toISOString().slice(0, 10);

export const movementInitialState: MovementPayload = {
    folio: '',
    movement_type: 'entrada',
    partner: '',
    quantity: 0,
    volume_m3: 0,
    state: 'Recibido',
    travel_time_hours: 0,
    responsible: '',
    movement_date: today,
    batch_code: '',
    notes: '',
    product_name: 'Piña Miel',
    origin: '',
    warehouse_location: 'Bodega A1',
    status: 'Fresco',
};

export const routeInitialState: RoutePayload = {
    state_name: '',
    destination: '',
    travel_time_hours: 0,
    status: 'Programada',
    responsible: '',
    capacity_units: 0,
    last_maintenance: today,
};

export function formatNumber(value: number) {
    return new Intl.NumberFormat('es-MX').format(value);
}

export function formatPercent(value: number) {
    return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatVolume(value: number) {
    return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(value)} m³`;
}

export function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function getStatusTone(value: string) {
    const normalized = value.toLowerCase();

    if (
        normalized.includes('retras') ||
        normalized.includes('manten') ||
        normalized.includes('crit') ||
        normalized.includes('cancel')
    ) {
        return 'error';
    }

    if (
        normalized.includes('trán') ||
        normalized.includes('trans') ||
        normalized.includes('progra') ||
        normalized.includes('pend') ||
        normalized.includes('alert')
    ) {
        return 'warning';
    }

    if (
        normalized.includes('entreg') ||
        normalized.includes('recib') ||
        normalized.includes('activ') ||
        normalized.includes('fresc') ||
        normalized.includes('disp') ||
        normalized.includes('ok')
    ) {
        return 'success';
    }

    return 'neutral';
}

export function getStockTone(quantity: number) {
    if (quantity <= 180) {
        return 'error';
    }

    if (quantity <= 320) {
        return 'warning';
    }

    return 'success';
}

export function calculateWeeklyMovements(movements: Movement[]) {
    const grouped = movements.reduce<Record<string, { entradas: number; salidas: number }>>((accumulator, movement) => {
        if (!accumulator[movement.movement_date]) {
            accumulator[movement.movement_date] = { entradas: 0, salidas: 0 };
        }

        if (movement.movement_type === 'entrada') {
            accumulator[movement.movement_date].entradas += movement.quantity;
        } else {
            accumulator[movement.movement_date].salidas += movement.quantity;
        }

        return accumulator;
    }, {});

    return Object.entries(grouped)
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(-7)
        .map(([date, totals]) => ({ date, ...totals }));
}

export function buildTimelineSteps(params: {
    movement?: Movement;
    route?: Route;
    inventoryItem?: InventoryItem;
}) {
    const { movement, route, inventoryItem } = params;

    return [
        {
            title: 'Movimiento registrado',
            description: movement ? `${movement.folio} · ${movement.partner}` : 'Esperando registro operativo',
            time: movement ? formatDate(movement.movement_date) : '--',
            state: movement ? 'done' : 'pending',
        },
        {
            title: 'Preparación en bodega',
            description: movement
                ? `${movement.batch_code} · ${inventoryItem?.warehouse_location ?? 'Bodega por asignar'}`
                : 'Sin lote asignado',
            time: movement ? `${movement.travel_time_hours} h estimadas` : '--',
            state: movement ? 'done' : 'pending',
        },
        {
            title: 'Ruta asignada',
            description: route ? `${route.destination} · ${route.responsible}` : 'Sin ruta programada',
            time: route ? formatDate(route.last_maintenance) : '--',
            state: route ? 'current' : 'pending',
        },
        {
            title: 'Seguimiento en tránsito',
            description: route ? route.status : 'Pendiente de despacho',
            time: route ? `${route.travel_time_hours} h de trayecto` : '--',
            state: route && getStatusTone(route.status) === 'warning' ? 'current' : route ? 'done' : 'pending',
        },
        {
            title: 'Entrega confirmada',
            description: 'Validación final de recepción y cierre operativo',
            time: 'ETA final',
            state: route && getStatusTone(route.status) === 'success' ? 'done' : 'pending',
        },
    ] as const;
}

export function findRelatedInventory(movement: Movement | undefined, inventory: InventoryItem[]) {
    if (!movement) {
        return undefined;
    }

    return inventory.find((item) => item.batch_code === movement.batch_code);
}

export function findRelatedRoute(movement: Movement | undefined, routes: Route[]) {
    if (!movement) {
        return routes[0];
    }

    const normalizedPartner = movement.partner.toLowerCase();
    const normalizedState = movement.state.toLowerCase();

    return (
        routes.find((route) => {
            const destination = route.destination.toLowerCase();
            const stateName = route.state_name.toLowerCase();

            return (
                destination.includes(normalizedPartner) ||
                destination.includes(normalizedState) ||
                stateName.includes(normalizedPartner) ||
                stateName.includes(normalizedState)
            );
        }) ?? routes[0]
    );
}

export function summarizeTemplate(templateRows: LogisticsTemplateRow[]) {
    const totalVolume = templateRows.reduce((accumulator, row) => accumulator + row.volume_m3, 0);
    const totalUnits = templateRows.reduce((accumulator, row) => accumulator + row.quantity, 0);
    const averageTravel = templateRows.length
        ? templateRows.reduce((accumulator, row) => accumulator + row.travel_time_hours, 0) / templateRows.length
        : 0;

    return { totalVolume, totalUnits, averageTravel };
}

export function summarizeRoutes(routes: Route[], stateSummary: DistributionStateSummary[]) {
    const maintenanceRoutes = stateSummary.reduce((accumulator, item) => accumulator + item.maintenance_routes, 0);
    const totalCapacity = stateSummary.reduce((accumulator, item) => accumulator + item.total_capacity_units, 0);
    const averageTravelTime = routes.length
        ? routes.reduce((accumulator, route) => accumulator + route.travel_time_hours, 0) / routes.length
        : 0;

    return { maintenanceRoutes, totalCapacity, averageTravelTime };
}
