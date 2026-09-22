import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { LogisticsProvider } from './context/LogisticsContext';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const MovementsPage = lazy(() => import('./pages/MovementsPage').then((module) => ({ default: module.MovementsPage })));
const InventoryPage = lazy(() => import('./pages/InventoryPage').then((module) => ({ default: module.InventoryPage })));
const DistributionPage = lazy(() => import('./pages/DistributionPage').then((module) => ({ default: module.DistributionPage })));
const TemplatePage = lazy(() => import('./pages/TemplatePage').then((module) => ({ default: module.TemplatePage })));
const TrackingPage = lazy(() => import('./pages/TrackingPage').then((module) => ({ default: module.TrackingPage })));
const PresentationPage = lazy(() => import('./pages/PresentationPage').then((module) => ({ default: module.PresentationPage })));

export default function App() {
  return (
    <HashRouter>
      <LogisticsProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/presentation" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><PresentationPage /></Suspense>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><DashboardPage /></Suspense>} />
            <Route path="/movements" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><MovementsPage /></Suspense>} />
            <Route path="/inventory" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><InventoryPage /></Suspense>} />
            <Route path="/distribution" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><DistributionPage /></Suspense>} />
            <Route path="/template" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><TemplatePage /></Suspense>} />
            <Route path="/tracking" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><TrackingPage /></Suspense>} />
            <Route path="/tracking/:movementId" element={<Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}><TrackingPage /></Suspense>} />
          </Route>
        </Routes>
      </LogisticsProvider>
    </HashRouter>
  );
}
