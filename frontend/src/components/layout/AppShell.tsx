import {
    ArrowRightLeft,
    ClipboardList,
    LayoutDashboard,
    Map,
    Presentation,
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
    { to: '/presentation', label: 'Presentación', icon: Presentation },
];

const pageMeta = {
    '/presentation': {
        title: 'Propuesta del proyecto',
        subtitle: 'Valor, alcance e inversión para llevar PiñaLog 360 a un piloto operativo.',
    },
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
    const isPresentation = location.pathname.startsWith('/presentation');

    return (
        <div className="app-shell min-h-screen bg-base-200/50 text-base-content lg:h-screen lg:overflow-hidden">
            <div className="mx-auto grid min-h-screen max-w-[1720px] lg:h-screen lg:grid-cols-[292px_minmax(0,1fr)] lg:overflow-hidden">
                <aside className="app-sidebar border-b border-base-200 bg-base-100/95 px-5 py-6 backdrop-blur lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r xl:px-6 app-scrollbar">
                    <div className="flex h-full min-h-0 flex-col gap-6">
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="grid h-14 w-14 shrink-0 place-items-center">
                                    <div className="flex h-10 w-10 rotate-45 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/25 ring-1 ring-primary-content/20">
                                        <span className="-rotate-45 font-display text-base font-extrabold tracking-tight text-primary-content">
                                            PL
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="font-display text-lg font-extrabold tracking-tight">PiñaLog 360</h1>
                                    <p className="text-sm text-base-content/55">Logística agroindustrial</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-base-content/45">
                                    Cobertura activa
                                </p>
                                <div className="mt-3 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="display-num text-3xl font-black">{coveredStates}</p>
                                        <p className="text-sm text-base-content/60">estados atendidos</p>
                                    </div>
                                    <span className="badge badge-success badge-outline">{formatNumber(totalCapacity)} uds.</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                            <div className="shrink-0 px-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-base-content/40">
                                    Navegación
                                </p>
                            </div>
                            <ul className="menu app-navigation app-scrollbar min-h-0 flex-1 flex-nowrap gap-2 overflow-y-auto rounded-2xl bg-base-100 p-2">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.to}>
                                            <NavLink
                                                to={item.to}
                                                className={({ isActive }) =>
                                                    [
                                                        'rounded-xl border px-4 py-3 font-semibold transition-colors duration-150',
                                                        isActive
                                                            ? 'border-primary/20 bg-primary/10 text-primary'
                                                            : 'border-transparent hover:border-base-200 hover:bg-base-200/70',
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

                        <div className="mt-auto shrink-0 rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                                    <UserCircle2 size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold leading-5">Josle</p>
                                    <p className="mt-1 text-sm leading-5 text-base-content/55">Control de operaciones</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="app-workspace min-w-0 px-4 py-5 sm:px-6 lg:flex lg:h-screen lg:min-h-0 lg:flex-col lg:overflow-hidden xl:px-8">
                    <header className="app-header z-[90] mb-6 shrink-0 rounded-2xl border border-base-200 bg-base-100/92 p-4 shadow-sm backdrop-blur-xl lg:p-5">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.75fr)] xl:items-center">
                            <div className="space-y-1">
                                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                                    <span className="inline-block h-1.5 w-1.5 rotate-45 bg-secondary/80" aria-hidden="true" />
                                    {isPresentation ? 'Presentación ejecutiva' : 'Panel operativo'}
                                </p>
                                <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{meta.title}</h2>
                                <p className="text-sm text-base-content/60 lg:text-base">{meta.subtitle}</p>
                            </div>

                            {isPresentation ? <div className="flex flex-wrap gap-2 xl:justify-end"><span className="badge badge-outline">México · MXN</span><span className="badge badge-primary badge-outline">2 desarrolladores junior</span></div> : <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:justify-self-stretch">
                                <label className="input input-bordered flex w-full flex-1 items-center gap-2 rounded-xl">
                                    <Search size={16} className="text-base-content/45" />
                                    <input type="text" className="grow" placeholder="Buscar folio, lote o destino" />
                                </label>
                                <button type="button" className="btn btn-primary rounded-xl sm:min-w-44" onClick={() => void refreshData()}>
                                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                                    Actualizar
                                </button>
                            </div>}
                        </div>
                        {error && !isPresentation ? <div className="alert alert-error mt-4 rounded-xl text-sm">{error}</div> : null}
                    </header>

                    <main className="min-h-0 space-y-6 pb-8 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden app-scrollbar">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
