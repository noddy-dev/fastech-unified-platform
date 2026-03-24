import { useEffect, useState } from 'react';
import { MSPLayout } from '@/components/layouts/MSPLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Server, AlertTriangle, TrendingUp } from 'lucide-react';
import { getMSPDashboardStats } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function MSPDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getMSPDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <MSPLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">MSP Dashboard</h1><p className="text-muted-foreground">Cross-tenant overview</p></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? [...Array(4)].map((_, i) => <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24 bg-muted" /></CardHeader><CardContent><Skeleton className="h-8 w-16 bg-muted" /></CardContent></Card>) : (
            <>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Tenants</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalTenants || 0}</div><p className="text-xs text-muted-foreground">{stats?.activeTenants || 0} active</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Devices</CardTitle><Server className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalDevices || 0}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Alerts</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalAlerts || 0}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Avg Compliance</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.avgCompliance || 0}%</div></CardContent></Card>
            </>
          )}
        </div>
      </div>
    </MSPLayout>
  );
}
