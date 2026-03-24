import { useEffect, useState } from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Server, AlertTriangle, TrendingUp, Users, Globe } from 'lucide-react';
import { getAllTenants, getAllDevices, getAllAlerts, getAllUsers, getAllMSPs } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState({ tenants: 0, msps: 0, devices: 0, alerts: 0, users: 0, avgCompliance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [tenants, devices, alerts, users, msps] = await Promise.all([
        getAllTenants(), getAllDevices(), getAllAlerts(), getAllUsers(), getAllMSPs(),
      ]);
      const avgComp = devices.length > 0
        ? Math.round(devices.reduce((s, d) => s + (d.compliance_score || 0), 0) / devices.length)
        : 0;
      setStats({
        tenants: tenants.length, msps: msps.length, devices: devices.length,
        alerts: alerts.filter((a: any) => a.status === 'open').length,
        users: users.length, avgCompliance: avgComp,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Total Tenants', value: stats.tenants, icon: Building2, href: '/superadmin/tenants' },
    { label: 'Total MSPs', value: stats.msps, icon: Globe, href: '/superadmin/msps' },
    { label: 'Total Devices', value: stats.devices, icon: Server, href: '#' },
    { label: 'Active Alerts', value: stats.alerts, icon: AlertTriangle, href: '#' },
    { label: 'Total Users', value: stats.users, icon: Users, href: '/superadmin/users' },
    { label: 'Avg Compliance', value: `${stats.avgCompliance}%`, icon: TrendingUp, href: '#' },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Full platform overview — all tenants, MSPs, and devices</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} to={card.href}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-16 bg-muted" />
                    ) : (
                      <div className="text-2xl font-bold">{card.value}</div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
