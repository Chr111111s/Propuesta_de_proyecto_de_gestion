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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error en la API');
  }

  return response.json() as Promise<T>;
}

export const api = {
  getMetrics: () => request<DashboardMetrics>('/dashboard/metrics'),
  getInventory: () => request<InventoryItem[]>('/inventory'),
  getMovements: () => request<Movement[]>('/movements'),
  getLogisticsTemplate: () => request<LogisticsTemplateRow[]>('/movements/template'),
  getRoutes: () => request<Route[]>('/distribution/routes'),
  getStateSummary: () => request<DistributionStateSummary[]>('/distribution/summary/states'),
  createMovement: (payload: MovementPayload) =>
    request<Movement>('/movements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createRoute: (payload: RoutePayload) =>
    request<Route>('/distribution/routes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
