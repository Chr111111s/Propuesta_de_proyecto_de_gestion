import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { api } from '../services/api';
import type {
    DistributionStateSummary,
    DashboardMetrics,
    InventoryItem,
    LogisticsTemplateRow,
    Movement,
    MovementPayload,
    Route,
    RoutePayload,
} from '../types/logistics';
import {
    buildTimelineSteps,
    calculateWeeklyMovements,
    findRelatedInventory,
    findRelatedRoute,
    summarizeRoutes,
    summarizeTemplate,
    today,
} from '../data/logisticsMeta';

type LogisticsContextValue = {
    metrics: DashboardMetrics | null;
    inventory: InventoryItem[];
    movements: Movement[];
    routes: Route[];
    templateRows: LogisticsTemplateRow[];
    stateSummary: DistributionStateSummary[];
    loading: boolean;
    error: string;
    refreshData: () => Promise<void>;
    createMovement: (payload: MovementPayload) => Promise<void>;
    createRoute: (payload: RoutePayload) => Promise<void>;
    exportTemplateCsv: () => void;
    totalBatches: number;
    coveredStates: number;
    totalCapacity: number;
    criticalInventory: InventoryItem[];
    activeRoutes: Route[];
    weeklyMovements: Array<{ date: string; entradas: number; salidas: number }>;
    latestMovement?: Movement;
    latestRoute?: Route;
    latestMovementInventory?: InventoryItem;
    timelineSteps: ReadonlyArray<{
        title: string;
        description: string;
        time: string;
        state: 'done' | 'current' | 'pending';
    }>;
    templateSummary: {
        totalVolume: number;
        totalUnits: number;
        averageTravel: number;
    };
    routeSummary: {
        maintenanceRoutes: number;
        totalCapacity: number;
        averageTravelTime: number;
    };
};

const LogisticsContext = createContext<LogisticsContextValue | undefined>(undefined);

export function LogisticsProvider({ children }: { children: ReactNode }) {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [templateRows, setTemplateRows] = useState<LogisticsTemplateRow[]>([]);
    const [stateSummary, setStateSummary] = useState<DistributionStateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [metricsData, inventoryData, movementsData, routesData, templateData, stateSummaryData] = await Promise.all([
                api.getMetrics(),
                api.getInventory(),
                api.getMovements(),
                api.getRoutes(),
                api.getLogisticsTemplate(),
                api.getStateSummary(),
            ]);

            setMetrics(metricsData);
            setInventory(inventoryData);
            setMovements(movementsData);
            setRoutes(routesData);
            setTemplateRows(templateData);
            setStateSummary(stateSummaryData);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const createMovement = useCallback(
        async (payload: MovementPayload) => {
            setError('');
            try {
                await api.createMovement(payload);
                await loadData();
            } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : 'No se pudo registrar el movimiento');
                throw submitError;
            }
        },
        [loadData],
    );

    const createRoute = useCallback(
        async (payload: RoutePayload) => {
            setError('');
            try {
                await api.createRoute(payload);
                await loadData();
            } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : 'No se pudo registrar la ruta');
                throw submitError;
            }
        },
        [loadData],
    );

    const exportTemplateCsv = useCallback(() => {
        const header = [
            'fecha',
            'folio',
            'proveedor_destino',
            'cantidad',
            'volumen_m3',
            'estado',
            'tiempo_traslado_horas',
            'responsable',
            'tipo',
            'lote',
        ];

        const rows = templateRows.map((row) => [
            row.movement_date,
            row.folio,
            row.provider_or_destination,
            String(row.quantity),
            String(row.volume_m3),
            row.state,
            String(row.travel_time_hours),
            row.responsible,
            row.movement_type,
            row.batch_code,
        ]);

        const csv = [header, ...rows]
            .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `plantilla-logistica-pinalog-${today}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [templateRows]);

    const totalBatches = useMemo(() => inventory.length, [inventory]);
    const coveredStates = useMemo(() => stateSummary.length, [stateSummary]);
    const totalCapacity = useMemo(
        () => stateSummary.reduce((accumulator, item) => accumulator + item.total_capacity_units, 0),
        [stateSummary],
    );

    const criticalInventory = useMemo(
        () => [...inventory].sort((left, right) => left.quantity - right.quantity).slice(0, 5),
        [inventory],
    );

    const activeRoutes = useMemo(
        () => routes.filter((route) => !route.status.toLowerCase().includes('mantenimiento')).slice(0, 6),
        [routes],
    );

    const weeklyMovements = useMemo(() => calculateWeeklyMovements(movements), [movements]);
    const latestMovement = movements[0];
    const latestRoute = routes[0];
    const latestMovementInventory = useMemo(
        () => findRelatedInventory(latestMovement, inventory),
        [latestMovement, inventory],
    );
    const timelineSteps = useMemo(
        () => buildTimelineSteps({ movement: latestMovement, route: latestRoute, inventoryItem: latestMovementInventory }),
        [latestMovement, latestRoute, latestMovementInventory],
    );
    const templateSummary = useMemo(() => summarizeTemplate(templateRows), [templateRows]);
    const routeSummary = useMemo(() => summarizeRoutes(routes, stateSummary), [routes, stateSummary]);

    const value = useMemo<LogisticsContextValue>(
        () => ({
            metrics,
            inventory,
            movements,
            routes,
            templateRows,
            stateSummary,
            loading,
            error,
            refreshData: loadData,
            createMovement,
            createRoute,
            exportTemplateCsv,
            totalBatches,
            coveredStates,
            totalCapacity,
            criticalInventory,
            activeRoutes,
            weeklyMovements,
            latestMovement,
            latestRoute,
            latestMovementInventory,
            timelineSteps,
            templateSummary,
            routeSummary,
        }),
        [
            metrics,
            inventory,
            movements,
            routes,
            templateRows,
            stateSummary,
            loading,
            error,
            loadData,
            createMovement,
            createRoute,
            exportTemplateCsv,
            totalBatches,
            coveredStates,
            totalCapacity,
            criticalInventory,
            activeRoutes,
            weeklyMovements,
            latestMovement,
            latestRoute,
            latestMovementInventory,
            timelineSteps,
            templateSummary,
            routeSummary,
        ],
    );

    return <LogisticsContext.Provider value={value}>{children}</LogisticsContext.Provider>;
}

export function useLogistics() {
    const context = useContext(LogisticsContext);

    if (!context) {
        throw new Error('useLogistics debe usarse dentro de LogisticsProvider');
    }

    return context;
}

export { findRelatedInventory, findRelatedRoute };
