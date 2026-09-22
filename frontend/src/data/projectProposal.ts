export const proposalSources = [
    {
        title: 'Indeed México · sueldo de desarrollador junior',
        url: 'https://mx.indeed.com/career/desarrollador-junior/salaries',
        detail: 'Promedio base de $15,345 MXN/mes, 98 registros. Actualización: 9 de septiembre de 2026. Referencia de mercado, no tarifa de un proyecto.',
    },
    {
        title: 'DigitalOcean · servidor básico',
        url: 'https://www.digitalocean.com/pricing/droplets',
        detail: 'Referencia: servidor de 2 GiB y 1 vCPU por USD 12/mes. El tamaño definitivo depende de las pruebas del piloto.',
    },
    {
        title: 'DigitalOcean · respaldos',
        url: 'https://www.digitalocean.com/pricing/backups',
        detail: 'Respaldo diario: 30% del precio del servidor. La propuesta usa un tipo de cambio presupuestal de $20 MXN/USD, no una cotización cambiaria.',
    },
];

export const proposalAssumptions = {
    developers: 2,
    monthlySalary: 18_000,
    months: 3,
    employmentProvision: 0.3,
    contingency: 0.15,
    reviewHours: 12,
    reviewHourlyRate: 700,
};

const salaries = proposalAssumptions.developers * proposalAssumptions.monthlySalary * proposalAssumptions.months;

export const developmentCosts = [
    { label: 'Dos desarrolladores junior', calculation: '2 × $18,000 brutos × 3 meses', amount: salaries },
    { label: 'Provisión de costos laborales', calculation: '30% de sueldos · supuesto de planeación', amount: salaries * proposalAssumptions.employmentProvision },
    { label: 'Revisión técnica externa puntual', calculation: '12 horas × $700 · seguridad y despliegue', amount: proposalAssumptions.reviewHours * proposalAssumptions.reviewHourlyRate },
    { label: 'Entorno de pruebas', calculation: '3 meses × $400 · bolsa estimada', amount: 1_200 },
    { label: 'Dominio del primer año', calculation: 'Bolsa estimada · cotizar al contratar', amount: 600 },
];

export const developmentSubtotal = developmentCosts.reduce((total, item) => total + item.amount, 0);
export const contingencyAmount = developmentSubtotal * proposalAssumptions.contingency;
export const developmentTotal = developmentSubtotal + contingencyAmount;

export const operatingCosts = [
    { label: 'Servidor', calculation: 'USD 12 × $20 MXN/USD', amount: 240 },
    { label: 'Respaldo diario del servidor', calculation: '30% del servidor', amount: 72 },
    { label: 'Reserva de infraestructura', calculation: 'Almacenamiento y variación de consumo', amount: 188 },
    { label: 'Mantenimiento limitado', calculation: '8 horas/mes × $200 · tarifa supuesta', amount: 1_600 },
];

export const monthlyOperation = operatingCosts.reduce((total, item) => total + item.amount, 0);
// El horizonte incluye tres meses de implementación y doce de operación,
// por lo que contempla la primera renovación del dominio.
export const domainRenewal = 600;
export const firstYearTotal = developmentTotal + monthlyOperation * 12 + domainRenewal;

export function calculateBenefit(monthlyProductValue: number, reductionPoints: number, hoursSaved: number, hourlyCost: number) {
    const recoveredProduct = monthlyProductValue * reductionPoints / 100;
    const releasedCapacity = hoursSaved * hourlyCost;
    const netMonthly = recoveredProduct + releasedCapacity - monthlyOperation;
    return {
        recoveredProduct,
        releasedCapacity,
        netMonthly,
        paybackMonths: netMonthly > 0 ? developmentTotal / netMonthly : null,
    };
}

export const currency = (value: number) => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(value);
