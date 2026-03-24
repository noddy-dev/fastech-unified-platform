import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/common/RouteGuard';

// Auth
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';

// Super Admin
import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage';
import SuperAdminTenantsPage from './pages/superadmin/SuperAdminTenantsPage';
import SuperAdminMSPsPage from './pages/superadmin/SuperAdminMSPsPage';
import SuperAdminUsersPage from './pages/superadmin/SuperAdminUsersPage';
import SuperAdminPatchPage from './pages/superadmin/SuperAdminPatchPage';
import SuperAdminAuditPage from './pages/superadmin/SuperAdminAuditPage';

// MSP
import MSPDashboardPage from './pages/msp/MSPDashboardPage';
import TenantsPage from './pages/msp/TenantsPage';
import MSPSupportPage from './pages/msp/MSPSupportPage';
import MSPPatchManagementPage from './pages/msp/MSPPatchManagementPage';

// Tenant
import TenantDashboardPage from './pages/tenant/TenantDashboardPage';
import DevicesPage from './pages/tenant/DevicesPage';
import DeviceDetailPage from './pages/tenant/DeviceDetailPage';
import CompliancePage from './pages/tenant/CompliancePage';
import AlertsPage from './pages/tenant/AlertsPage';
import AIInsightsPage from './pages/tenant/AIInsightsPage';
import RemoteManagementPage from './pages/tenant/RemoteManagementPage';
import NetworkPage from './pages/tenant/NetworkPage';
import ReportsPage from './pages/tenant/ReportsPage';
import UsersPage from './pages/tenant/UsersPage';
import TenantPatchManagementPage from './pages/tenant/PatchManagementPage';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <RouteGuard>
          <Routes>
            {/* Root redirects based on role in RouteGuard */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Super Admin Routes */}
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/superadmin/tenants" element={<SuperAdminTenantsPage />} />
            <Route path="/superadmin/msps" element={<SuperAdminMSPsPage />} />
            <Route path="/superadmin/users" element={<SuperAdminUsersPage />} />
            <Route path="/superadmin/patches" element={<SuperAdminPatchPage />} />
            <Route path="/superadmin/audit" element={<SuperAdminAuditPage />} />

            {/* MSP Routes */}
            <Route path="/msp/dashboard" element={<MSPDashboardPage />} />
            <Route path="/msp/tenants" element={<TenantsPage />} />
            <Route path="/msp/patches" element={<MSPPatchManagementPage />} />
            <Route path="/msp/support" element={<MSPSupportPage />} />

            {/* Tenant Routes */}
            <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
            <Route path="/tenant/devices" element={<DevicesPage />} />
            <Route path="/tenant/devices/:deviceId" element={<DeviceDetailPage />} />
            <Route path="/tenant/patches" element={<TenantPatchManagementPage />} />
            <Route path="/tenant/compliance" element={<CompliancePage />} />
            <Route path="/tenant/alerts" element={<AlertsPage />} />
            <Route path="/tenant/ai-insights" element={<AIInsightsPage />} />
            <Route path="/tenant/remote" element={<RemoteManagementPage />} />
            <Route path="/tenant/network" element={<NetworkPage />} />
            <Route path="/tenant/reports" element={<ReportsPage />} />
            <Route path="/tenant/users" element={<UsersPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteGuard>
        <Sonner />
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
