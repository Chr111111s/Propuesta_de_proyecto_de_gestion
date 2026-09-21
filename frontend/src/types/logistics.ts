export type DashboardMetrics = {
  total_units: number;
  total_volume_m3: number;
  active_routes: number;
  monthly_movements: number;
  estimated_waste_reduction_pct: number;
};

export type InventoryItem = {
  id: number;
  product_name: string;
  batch_code: string;
  origin: string;
  state: string;
  quantity: number;
  volume_m3: number;
  warehouse_location: string;
  entry_date: string;
  status: string;
};

export type Movement = {
  id: number;
  folio: string;
  movement_type: 'entrada' | 'salida';
  partner: string;
  quantity: number;
  volume_m3: number;
  state: string;
  travel_time_hours: number;
  responsible: string;
  movement_date: string;
  batch_code: string;
  notes: string;
};

export type MovementPayload = Omit<Movement, 'id'> & {
  product_name: string;
  origin: string;
  warehouse_location: string;
  status: string;
};

export type LogisticsTemplateRow = {
  movement_date: string;
  folio: string;
  provider_or_destination: string;
  quantity: number;
  volume_m3: number;
  state: string;
  travel_time_hours: number;
  responsible: string;
  movement_type: 'entrada' | 'salida';
  batch_code: string;
};

export type Route = {
  id: number;
  state_name: string;
  destination: string;
  travel_time_hours: number;
  status: string;
  responsible: string;
  capacity_units: number;
  last_maintenance: string;
};

export type RoutePayload = Omit<Route, 'id'>;

export type DistributionStateSummary = {
  state_name: string;
  route_count: number;
  active_routes: number;
  maintenance_routes: number;
  total_capacity_units: number;
  average_travel_time_hours: number;
};
