import { useEffect, useState } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { getTenantDashboardStats, getAlertsByTenant } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Alert } from '@/types/types';

export default function TenantDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.tenant_id) loadDashboard();
    else setLoading(false);
  }, [profile]);

  const loadDashboard = async () => {
    if (!profile?.tenant_id) return;
    try {
      const [s, a] = await Promise.all([getTenantDashboardStats(profile.tenant_id), getAlertsByTenant(profile.tenant_id, 'open')]);
      setStats(s); setRecentAlerts(a.slice(0, 5));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const getSeverityColor = (s: string) => {
    if (s === 'critical') return 'bg-destructive text-destructive-foreground';
    if (s === 'high') return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-muted-foreground">Overview of your endpoint compliance and security</p></div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24 bg-muted" /></CardHeader><CardContent><Skeleton className="h-8 w-16 bg-muted" /></CardContent></Card>)}</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Devices</CardTitle><Server className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalDevices || 0}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Compliant</CardTitle><CheckCircle className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.compliantDevices || 0}</div><p className="text-xs text-muted-foreground">{stats?.nonCompliantDevices || 0} non-compliant</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Open Alerts</CardTitle><AlertTriangle className="h-4 w-4 text-warning" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.openAlerts || 0}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Compliance Score</CardTitle><Shield className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.avgComplianceScore || 0}%</div></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Recent Alerts</CardTitle></CardHeader>
              <CardContent>
                {recentAlerts.length === 0 ? <p className="text-sm text-muted-foreground">No active alerts</p> : (
                  <div className="space-y-3">{recentAlerts.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-warning shrink-0" />
                      <div className="flex-1"><div className="flex items-center gap-2 mb-1"><Badge className={getSeverityColor(a.severity)}>{a.severity}</Badge></div><p className="text-sm font-medium">{a.title}</p></div>
                    </div>
                  ))}</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </TenantLayout>
  );
}
