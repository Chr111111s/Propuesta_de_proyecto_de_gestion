import {
    ArrowRightLeft,
    ClipboardList,
    LayoutDashboard,
    Map,
    RefreshCcw,
    Route,
    Search,
    UserCircle2,
    Warehouse,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLogistics } from '../../context/LogisticsContext';
import { formatNumber } from '../../data/logisticsMeta';

const navigationItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/movements', label: 'Entradas / salidas', icon: ArrowRightLeft },
    { to: '/inventory', label: 'Inventario', icon: Warehouse },
    { to: '/distribution', label: 'Distribución', icon: Map },
    { to: '/template', label: 'Plantilla logística', icon: ClipboardList },
    { to: '/tracking', label: 'Seguimiento', icon: Route },
];

const pageMeta = {
    '/dashboard': {
        title: 'Centro de control PiñaLog 360',
        subtitle: 'Visión ejecutiva de inventario, distribución y trazabilidad en tiempo real.',
    },
    '/movements': {
        title: 'Operación de movimientos',
        subtitle: 'Registra y monitorea entradas y salidas con foco en folios, tiempos y responsables.',
    },
    '/inventory': {
        title: 'Gestión de inventario',
        subtitle: 'Controla existencias por bodega, origen y frescura con indicadores visuales claros.',
    },
    '/distribution': {
        title: 'Distribución territorial',
        subtitle: 'Mapea rutas activas, capacidad estatal y desempeño logístico desde un mismo panel.',
    },
    '/template': {
        title: 'Plantilla logística operativa',
        subtitle: 'Consolida movimientos en una vista estructurada lista para control diario y exportación.',
    },
    '/tracking': {
        title: 'Seguimiento de envío',
        subtitle: 'Consulta la línea de tiempo de cada pedido como un trayecto logístico de punta a punta.',
    },
} as const;

function resolvePageMeta(pathname: string) {
    const match = Object.entries(pageMeta).find(([path]) => pathname.startsWith(path));
    return match?.[1] ?? pageMeta['/dashboard'];
}

export default function AppShell() {
    const location = useLocation();
    const { coveredStates, totalCapacity, refreshData, loading, error } = useLogistics();
    const meta = resolvePageMeta(location.pathname);

    return (
        <div className="min-h-screen bg-base-200/50 text-base-content lg:h-screen lg:overflow-hidden">
            <div className="mx-auto grid min-h-screen max-w-[1720px] lg:h-screen lg:grid-cols-[292px_minmax(0,1fr)] lg:overflow-hidden">
                <aside className="border-b border-base-200 bg-base-100/95 px-5 py-6 backdrop-blur lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r xl:px-6 app-scrollbar">
                    <div className="flex h-full min-h-0 flex-col gap-6">
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-content shadow-sm">
                                    PL
                                </div>
                                <div>
                                    <h1 className="text-lg font-extrabold tracking-tight">PiñaLog 360</h1>
                                    <p className="text-sm text-base-content/55">Logística agroindustrial enterprise</p>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-base-200 bg-base-200/35 p-4 shadow-sm">
                                <p className="text-xs font-semibold text-base-content/45">Cobertura activa</p>
                                <div className="mt-3 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-3xl font-black">{coveredStates}</p>
                                        <p className="text-sm text-base-content/60">estados atendidos</p>
                                    </div>
                                    <span className="badge badge-success badge-outline">{formatNumber(totalCapacity)} uds.</span>
                                </div>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 space-y-4 overflow-hidden">
                            <div className="px-1">
                                <p className="text-xs font-semibold text-base-content/40">Navegación</p>
                            </div>
                            <ul className="menu app-scrollbar max-h-full gap-2 overflow-y-auto rounded-[28px] bg-base-100 p-2">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.to}>
                                            <NavLink
                                                to={item.to}
                                                className={({ isActive }) =>
                                                    [
                                                        'rounded-2xl px-4 py-3 font-semibold transition-all duration-200',
                                                        isActive
                                                            ? 'bg-primary text-primary-content shadow-sm'
                                                            : 'border border-transparent hover:border-base-200 hover:bg-base-200/70',
                                                    ].join(' ')
                                                }
                                            >
                                                <Icon size={18} />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="mt-auto rounded-[24px] border border-base-200 bg-base-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                    <div className="w-12 rounded-full bg-primary/10 text-primary">
                                        <UserCircle2 size={24} />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold">Josle</p>
                                    <p className="text-sm text-base-content/55">Control de operaciones</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="min-w-0 px-4 py-5 sm:px-6 lg:flex lg:h-screen lg:min-h-0 lg:flex-col lg:overflow-hidden xl:px-8">
                    <header className="z-[90] mb-6 shrink-0 rounded-[28px] border border-base-200 bg-base-100/92 p-4 shadow-sm backdrop-blur-xl lg:p-5">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.75fr)] xl:items-center">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-base-content/45">Panel operativo</p>
                                <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{meta.title}</h2>
                                <p className="text-sm text-base-content/60 lg:text-base">{meta.subtitle}</p>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:justify-self-stretch">
                                <label className="input input-bordered flex w-full flex-1 items-center gap-2 rounded-2xl">
                                    <Search size={16} className="text-base-content/45" />
                                    <input type="text" className="grow" placeholder="Buscar folio, lote o destino" />
                                </label>
                                <button type="button" className="btn btn-primary rounded-2xl sm:min-w-44" onClick={() => void refreshData()}>
                                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                                    Actualizar
                                </button>
                            </div>
                        </div>
                        {error ? <div className="alert alert-error mt-4 rounded-2xl text-sm">{error}</div> : null}
                    </header>

                    <main className="min-h-0 space-y-6 pb-8 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden app-scrollbar">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
