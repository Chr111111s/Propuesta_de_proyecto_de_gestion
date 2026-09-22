import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, ExternalLink, Maximize2, Minimize2, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    calculateBenefit, contingencyAmount, currency, developmentCosts, developmentSubtotal,
    developmentTotal, firstYearTotal, monthlyOperation, operatingCosts, proposalSources,
} from '../data/projectProposal';

const chapters = ['Propuesta', 'Problema', 'Solución', 'Beneficios', 'Alcance', 'Equipo y plan', 'Inversión', 'Operación', 'Retorno', 'Validación', 'Decisión', 'Fuentes'];

function Note({ children }: { children: ReactNode }) {
    return <p className="proposal-note">{children}</p>;
}

function Point({ title, children }: { title: string; children: ReactNode }) {
    return <div className="proposal-point"><h3>{title}</h3><p>{children}</p></div>;
}

function CostTable({ rows, label }: { rows: typeof developmentCosts; label: string }) {
    return (
        <div className="proposal-table-wrap">
            <table className="proposal-table">
                <caption className="sr-only">{label}. Importes en pesos mexicanos.</caption>
                <thead><tr><th scope="col">Concepto</th><th scope="col">Base de cálculo</th><th scope="col">MXN</th></tr></thead>
                <tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.calculation}</td><td>{currency(row.amount)}</td></tr>)}</tbody>
            </table>
        </div>
    );
}

function BenefitScenario() {
    const [productValue, setProductValue] = useState(400_000);
    const [reduction, setReduction] = useState(2);
    const [hours, setHours] = useState(30);
    const result = calculateBenefit(productValue, reduction, hours, 100);
    const inputs = [
        { id: 'product-value', label: 'Producto manejado al mes, a costo', value: productValue, min: 0, max: 2_000_000, step: 10_000, display: currency(productValue), set: setProductValue },
        { id: 'waste-reduction', label: 'Reducción de merma en puntos porcentuales', value: reduction, min: 0, max: 5, step: 0.5, display: `${reduction.toLocaleString('es-MX')} pp`, set: setReduction },
        { id: 'hours-saved', label: 'Horas administrativas liberadas al mes', value: hours, min: 0, max: 100, step: 5, display: `${hours} h`, set: setHours },
    ];

    return (
        <>
            <div className="proposal-columns">
                <div className="proposal-controls">
                    {inputs.map((input) => <div key={input.id}>
                        <label htmlFor={input.id}>{input.label}<strong>{input.display}</strong></label>
                        <input id={input.id} type="range" min={input.min} max={input.max} step={input.step} value={input.value}
                            aria-valuetext={input.display} onChange={(event) => input.set(Number(event.target.value))} />
                    </div>)}
                    <p className="proposal-small">Costo supuesto de la hora administrativa: $100. Ejemplo: pasar de 8% a 6% de merma equivale a 2 puntos porcentuales.</p>
                </div>
                <div className="proposal-result" aria-live="polite" aria-atomic="true">
                    <p>Beneficio neto mensual estimado</p>
                    <strong className="proposal-amount">{currency(result.netMonthly)}</strong>
                    <dl>
                        <div><dt>Producto recuperado a costo</dt><dd>{currency(result.recoveredProduct)}</dd></div>
                        <div><dt>Valor del tiempo liberado</dt><dd>{currency(result.releasedCapacity)}</dd></div>
                        <div><dt>Operación mensual</dt><dd>−{currency(monthlyOperation)}</dd></div>
                    </dl>
                    <p className="proposal-payback">{result.paybackMonths === null ? 'Sin recuperación con estos supuestos' : `Recuperación simple: ${result.paybackMonths.toLocaleString('es-MX', { maximumFractionDigits: 1 })} meses de operación`}</p>
                </div>
            </div>
            <Note>Escenario ilustrativo, no ahorro demostrado. Fórmula: valor mensual a costo × reducción de merma / 100 + horas × $100 − operación. El tiempo liberado representa capacidad, no efectivo automático. Sin valorar ese tiempo, el caso inicial recupera la inversión en 29.4 meses de operación. El cálculo omite impuestos, financiamiento y curva de adopción. El plazo comienza después de los tres meses de implementación.</Note>
        </>
    );
}

export function PresentationPage() {
    const [active, setActive] = useState(0);
    const [presenting, setPresenting] = useState(false);
    const deckRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const interacted = useRef(false);

    useEffect(() => {
        if (interacted.current) headingRef.current?.focus({ preventScroll: true });
        deckRef.current?.querySelector('.proposal-slides')?.scrollTo({ top: 0 });
    }, [active]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setPresenting(false); return; }
            const target = event.target;
            if (target instanceof HTMLElement && (target.matches('input, select, textarea, button, a') || target.isContentEditable)) return;
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            interacted.current = true;
            if (event.key === 'ArrowRight') setActive((value) => Math.min(chapters.length - 1, value + 1));
            if (event.key === 'ArrowLeft') setActive((value) => Math.max(0, value - 1));
            if (event.key === 'Home') setActive(0);
            if (event.key === 'End') setActive(chapters.length - 1);
        };
        const onFullscreenChange = () => { if (!document.fullscreenElement) setPresenting(false); };
        window.addEventListener('keydown', onKeyDown);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, []);

    function goTo(index: number) {
        interacted.current = true;
        setActive(index);
        deckRef.current?.querySelector('.proposal-slides')?.scrollTo({ top: 0 });
    }

    async function togglePresentation() {
        if (presenting) {
            if (document.fullscreenElement) await document.exitFullscreen();
            setPresenting(false);
        } else {
            setPresenting(true);
            try { await deckRef.current?.requestFullscreen?.(); } catch { /* El modo de exposición también funciona sin pantalla completa. */ }
        }
    }

    const slides: Array<{ title: string; content: ReactNode }> = [
        {
            title: 'Control logístico para cada lote de piña',
            content: <>
                <p className="proposal-lead">PiñaLog 360 reúne inventario, movimientos y distribución para que una comercializadora sepa qué tiene, dónde está y quién lo mueve.</p>
                <div className="proposal-cover-band">
                    <div><span>Inversión estimada</span><strong>{currency(developmentTotal)}</strong><small>MXN · piloto sobre el MVP actual</small></div>
                    <div><span>Equipo de desarrollo</span><strong>2 juniors</strong><small>México · dedicación completa</small></div>
                    <div><span>Implementación</span><strong>3 meses</strong><small>12 semanas efectivas previstas</small></div>
                </div>
                <p className="proposal-cover-end">Propuesta para dirección y responsables de bodega. Septiembre de 2026.</p>
            </>,
        },
        {
            title: 'El costo de una operación dispersa',
            content: <>
                <p className="proposal-lead">Cuando cada movimiento vive en una hoja o un mensaje distinto, conciliar existencias consume tiempo y retrasa decisiones.</p>
                <div className="proposal-grid">
                    <Point title="Existencias poco confiables">Una salida sin registrar puede provocar que se prometa producto que ya no está en bodega.</Point>
                    <Point title="Lotes con poca visibilidad">Sin revisar fecha de entrada y ubicación, el equipo puede dejar producto antiguo sin atender.</Point>
                    <Point title="Seguimiento fragmentado">Buscar folios, destinos y responsables obliga a consultar varias fuentes.</Point>
                    <Point title="Reportes manuales">Volver a capturar información aumenta el trabajo y dificulta explicar diferencias.</Point>
                </div>
                <Note>Problemas que la propuesta busca atender. El piloto debe confirmar su frecuencia y costo en la operación del cliente.</Note>
            </>,
        },
        {
            title: 'Una base funcional para ordenar la operación',
            content: <>
                <div className="proposal-grid">
                    <Point title="Movimientos e inventario">Registro de entradas y salidas que actualiza existencias. Consulta por lote, origen y bodega.</Point>
                    <Point title="Distribución estatal">Registro de destinos, capacidad y responsables. Mapa con ubicaciones de referencia.</Point>
                    <Point title="Consulta y reporte">Dashboard, filtros y plantilla logística exportable a CSV para conciliación.</Point>
                    <Point title="Seguimiento por folio">Vista de movimientos y una línea de tiempo construida con la información registrada.</Point>
                </div>
                <div className="proposal-callout"><strong>Estado actual: MVP local.</strong> Ya permite demostrar el flujo principal. El piloto presupuestado agrega controles de acceso, pruebas, respaldos y puesta en marcha.</div>
                <Note>El mapa no recibe GPS en vivo. Los hitos de seguimiento son derivados, no evidencia de eventos capturados en campo. El 3.5% de merma de la demo es un valor fijo ilustrativo, no un resultado medido.</Note>
            </>,
        },
        {
            title: 'Beneficios que pueden medirse',
            content: <>
                <div className="proposal-table-wrap"><table className="proposal-table proposal-benefits">
                    <caption className="sr-only">Beneficio esperado, mecanismo y medición durante el piloto</caption>
                    <thead><tr><th>Beneficio esperado</th><th>Cómo ayuda el proyecto</th><th>Indicador del piloto</th></tr></thead>
                    <tbody>
                        <tr><th scope="row">Menos diferencias de stock</th><td>Cada entrada o salida actualiza el lote.</td><td>Exactitud frente al conteo físico.</td></tr>
                        <tr><th scope="row">Menos tiempo de conciliación</th><td>Folios y exportación reúnen los registros.</td><td>Minutos de cierre por jornada.</td></tr>
                        <tr><th scope="row">Mejor rotación</th><td>Fechas y ubicación ayudan a priorizar lotes.</td><td>Merma a costo por volumen recibido.</td></tr>
                        <tr><th scope="row">Mayor trazabilidad</th><td>Lote, destino y responsable acompañan el movimiento.</td><td>Porcentaje de registros completos.</td></tr>
                    </tbody>
                </table></div>
                <Note>Medir una línea base y comparar cuatro semanas de piloto con volúmenes y condiciones similares. El software aporta información, pero la captura y la rotación física siguen dependiendo del equipo operativo.</Note>
            </>,
        },
        {
            title: 'Un alcance acotado para empezar',
            content: <>
                <p className="proposal-lead">Piloto propuesto para una empresa, una bodega y hasta cinco usuarios. Objetivo de prueba: 100 movimientos al día, sin garantía de capacidad hasta validarlo.</p>
                <div className="proposal-columns">
                    <div><h3 className="proposal-subtitle">Incluido en la inversión</h3><ul className="proposal-list">
                        <li>Adaptación de los módulos actuales al flujo acordado.</li><li>Acceso individual y dos roles básicos: administración y operación.</li>
                        <li>Validaciones de inventario y registro básico de autor y fecha.</li><li>Despliegue, respaldo diario y prueba de restauración.</li>
                        <li>Carga inicial de un CSV limpio de hasta 500 lotes.</li><li>Pruebas, manual y dos sesiones remotas de capacitación.</li>
                    </ul></div>
                    <div><h3 className="proposal-subtitle">Fases posteriores, fuera del presupuesto</h3><ul className="proposal-list proposal-list-muted">
                        <li>GPS en vivo, sensores y optimización automática de rutas.</li><li>Facturación fiscal e integración con ERP o contabilidad.</li>
                        <li>Aplicación móvil nativa y trabajo sin conexión.</li><li>Multiempresa, limpieza masiva de históricos y operación 24/7.</li>
                        <li>Compra de equipos, viáticos y migración a gran escala.</li>
                    </ul></div>
                </div>
            </>,
        },
        {
            title: 'Dos juniors, con entregas semanales',
            content: <>
                <div className="proposal-roles"><p><strong>Junior 1</strong> Interfaz, formularios, reportes y documentación.</p><p><strong>Junior 2</strong> API, datos, permisos, respaldos y despliegue.</p></div>
                <ol className="proposal-timeline">
                    <li><span>Sem. 1–2</span><div><h3>Diagnóstico y alcance</h3><p>Validar el flujo, preparar datos y acordar criterios de aceptación.</p></div></li>
                    <li><span>Sem. 3–6</span><div><h3>Adaptación del MVP</h3><p>Completar acceso, validaciones y cambios de operación priorizados.</p></div></li>
                    <li><span>Sem. 7–8</span><div><h3>Pruebas y preparación</h3><p>Revisar permisos, concurrencia, restauración y carga inicial.</p></div></li>
                    <li><span>Sem. 9–12</span><div><h3>Piloto acompañado</h3><p>Capacitar, medir cuatro semanas, corregir y entregar documentación.</p></div></li>
                </ol>
                <Note>Capacidad planeada: 2 × 40 h × 12 semanas = 960 h. Reservar 240 h para coordinación, aprendizaje y retrabajo deja unas 720 h de ejecución. Ambos prueban y revisan cambios. Un especialista externo aporta 12 h de revisión puntual, ya presupuestadas. El cliente asigna un responsable disponible 2 h por semana.</Note>
            </>,
        },
        {
            title: 'Presupuesto de desarrollo en México',
            content: <>
                <CostTable rows={developmentCosts} label="Presupuesto de implementación" />
                <div className="proposal-budget-summary"><p>Subtotal <strong>{currency(developmentSubtotal)}</strong></p><p>Contingencia del 15% <strong>{currency(contingencyAmount)}</strong></p><p className="proposal-total">Inversión prevista <strong>{currency(developmentTotal)} MXN</strong></p></div>
                <Note>Modelo de contratación interna: $18,000 brutos/mes por junior. La provisión laboral del 30% es una reserva estimada, no un cálculo de nómina. Reutiliza el MVP y equipos existentes. No es una cotización de agencia: no incluye margen comercial ni impuestos aplicables a servicios. Si se contrata por honorarios, debe recalcularse el esquema, sin confundir sueldo con tarifa.</Note>
                <p className="proposal-source">Referencia salarial: <a href={proposalSources[0].url} target="_blank" rel="noreferrer">Indeed México: $15,345/mes, actualización del 9 de septiembre de 2026 <ExternalLink size={12} /></a>. El importe de $18,000 es un supuesto del proyecto.</p>
            </>,
        },
        {
            title: 'Operación después del lanzamiento',
            content: <>
                <CostTable rows={operatingCosts} label="Gasto mensual después de implementar" />
                <div className="proposal-cover-band proposal-band-light"><div><span>Operación mensual</span><strong>{currency(monthlyOperation)}</strong><small>MXN · estimación para el piloto</small></div><div><span>Inversión + 12 meses de operación</span><strong>{currency(firstYearTotal)}</strong><small>MXN · horizonte total aproximado de 15 meses</small></div></div>
                <Note>Las 8 h mensuales cubren mantenimiento y correcciones menores, sin nuevas funciones ni atención 24/7. El dominio inicial está incluido en desarrollo. El total de {currency(firstYearTotal)} incluye toda la contingencia y $600 para renovar el dominio al vencer. Excluye impuestos, equipos y tiempo del personal del cliente. Los sueldos de desarrollo terminan al cerrar el proyecto. Si el equipo permanece contratado, el gasto mensual aumenta.</Note>
                <p className="proposal-source">Precios de referencia: <a href={proposalSources[1].url} target="_blank" rel="noreferrer">servidor DigitalOcean</a> y <a href={proposalSources[2].url} target="_blank" rel="noreferrer">respaldo diario</a>. Tipo de cambio de planeación: $20 MXN/USD. Bolsas y mantenimiento son estimaciones propias.</p>
            </>,
        },
        { title: 'El retorno depende de la operación real', content: <BenefitScenario /> },
        {
            title: 'Criterios para continuar después del piloto',
            content: <>
                <div className="proposal-columns">
                    <div><h3 className="proposal-subtitle">Metas propuestas, por acordar</h3><ul className="proposal-checks">
                        <li><Check size={18} /> Exactitud de inventario de al menos 98% frente al conteo.</li>
                        <li><Check size={18} /> Al menos 95% de movimientos con folio, lote y responsable.</li>
                        <li><Check size={18} /> Reducción del 20% del tiempo de conciliación frente a la línea base.</li>
                        <li><Check size={18} /> Permisos validados, restauración exitosa y cero fallos críticos abiertos.</li>
                    </ul></div>
                    <div><h3 className="proposal-subtitle">Riesgos y respuesta</h3>
                        <Point title="Captura tardía o incompleta">Un responsable por turno y conciliación diaria durante el piloto.</Point>
                        <Point title="Curva de aprendizaje del equipo">Entregas pequeñas, revisión externa y reserva de contingencia.</Point>
                        <Point title="Carga o acceso insuficientes">Pruebas con cinco usuarios y 100 movimientos/día antes de operar. Ajustar alcance si falla.</Point>
                    </div>
                </div>
                <Note>Medir exactitud como 100 × (1 − Σ|unidades en sistema − unidades físicas| / Σunidades físicas), con inventario físico mayor que cero y el mismo corte. Medir integridad sobre todos los movimientos del periodo. La mejora de merma requiere registrar bajas y comparar producto equivalente.</Note>
            </>,
        },
        {
            title: 'Una inversión por etapas y con evidencia',
            content: <>
                <p className="proposal-lead">El proyecto conviene cuando el costo de los errores y del trabajo manual justifica centralizar la operación. El MVP permite revisar esa hipótesis antes de ampliar la inversión.</p>
                <div className="proposal-decision"><span>Propuesta de autorización</span><strong>{currency(developmentTotal)} MXN</strong><p>Tres meses, dos juniors y un piloto delimitado. La reserva se utiliza solamente ante necesidades documentadas.</p></div>
                <div className="proposal-grid"><Point title="Primera decisión">Acordar bodega, responsable, alcance y línea base durante las primeras dos semanas.</Point><Point title="Decisión de continuidad">Al cierre, contrastar métricas, incidencias y ahorro observado. Escalar sólo si el piloto demuestra valor.</Point></div>
                <Link to="/dashboard" className="btn btn-primary mt-5 proposal-demo-link">Ver el proyecto funcionando <ChevronRight size={17} /></Link>
            </>,
        },
        {
            title: 'Fuentes y bases de la propuesta',
            content: <>
                <div className="proposal-references">{proposalSources.map((source) => <div key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={16} /></a><p>{source.detail}</p></div>)}</div>
                <div className="proposal-callout"><strong>Revisión del proyecto.</strong> Alcance contrastado con los módulos de inventario, movimientos, distribución, plantilla y seguimiento, y con la API del repositorio. La documentación ejecutiva previa aporta el contexto del negocio. Sus ahorros ilustrativos no se presentan como resultados reales.</div>
                <Note>Consulta: 22 de septiembre de 2026. Sueldos elegidos, provisión laboral, honorarios de revisión, mantenimiento, dominio, plazo y escenarios de beneficio son supuestos de planeación. Validarlos con cotizaciones, datos del cliente y su esquema de contratación antes de comprometer gasto.</Note>
            </>,
        },
    ];

    return (
        <div ref={deckRef} className={`proposal-deck ${presenting ? 'proposal-presenting' : ''}`}>
            <div className="proposal-toolbar">
                <div><span className="proposal-toolbar-label">Propuesta de proyecto</span><p>PiñaLog 360 <span> / {String(active + 1).padStart(2, '0')} de {slides.length}</span></p></div>
                <div className="flex flex-wrap gap-2"><button className="btn btn-sm btn-ghost" type="button" onClick={() => window.print()}><Printer size={16} /> Imprimir / PDF</button><button className="btn btn-sm btn-primary" type="button" onClick={() => void togglePresentation()}>{presenting ? <Minimize2 size={16} /> : <Maximize2 size={16} />}{presenting ? 'Salir' : 'Presentar'}</button></div>
            </div>
            <nav className="proposal-chapters" aria-label="Secciones de la presentación">{chapters.map((chapter, index) => <button type="button" key={chapter} aria-current={active === index ? 'step' : undefined} onClick={() => goTo(index)}>{chapter}</button>)}</nav>
            <div className="proposal-slides">
                {slides.map((slide, index) => <article key={chapters[index]} className={`proposal-slide ${index === 0 ? 'proposal-cover' : ''} ${active === index ? 'is-active' : ''}`} aria-labelledby={`proposal-title-${index}`} hidden={active !== index}>
                    <div className="proposal-slide-heading"><span className="proposal-kicker">{chapters[index]}</span><span className="proposal-slide-number">{String(index + 1).padStart(2, '0')} / {slides.length}</span></div>
                    <h1 id={`proposal-title-${index}`} ref={active === index ? headingRef : undefined} tabIndex={-1}>{slide.title}</h1>
                    {slide.content}
                    <footer className="proposal-print-footer">PiñaLog 360 · Propuesta de piloto · Septiembre 2026 · {index + 1}/{slides.length}</footer>
                </article>)}
            </div>
            <div className="proposal-pagination"><button type="button" className="btn btn-outline btn-sm" disabled={active === 0} onClick={() => goTo(active - 1)}><ArrowLeft size={16} /> Anterior</button><p aria-live="polite">{chapters[active]} <span>· Usa ← → para avanzar</span></p><button type="button" className="btn btn-primary btn-sm" disabled={active === slides.length - 1} onClick={() => goTo(active + 1)}>Siguiente <ArrowRight size={16} /></button></div>
        </div>
    );
}
