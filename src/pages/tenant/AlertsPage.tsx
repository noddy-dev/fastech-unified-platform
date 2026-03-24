import { useEffect, useState } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAlertsByTenant, updateAlert } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Alert } from '@/types/types';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertsPage() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile?.tenant_id) loadAlerts(); else setLoading(false); }, [profile]);

  const loadAlerts = async () => {
    try { setAlerts(await getAlertsByTenant(profile!.tenant_id!)); } catch { } finally { setLoading(false); }
  };

  const handleAcknowledge = async (id: string) => {
    try { await updateAlert(id, { status: 'acknowledged', acknowledged_by: profile?.id, acknowledged_at: new Date().toISOString() }); toast.success('Alert acknowledged'); loadAlerts(); } catch { toast.error('Failed'); }
  };

  const getSeverityColor = (s: string) => {
    if (s === 'critical') return 'bg-destructive text-destructive-foreground';
    if (s === 'high') return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Alerts</h1><p className="text-muted-foreground">Monitor and respond to security alerts</p></div>
        {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        : alerts.length === 0 ? <Card><CardContent className="py-12 text-center"><CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" /><p className="text-muted-foreground">No alerts</p></CardContent></Card>
        : <div className="space-y-3">{alerts.map(a => (
          <Card key={a.id}><CardContent className="py-4"><div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 mt-0.5 text-warning shrink-0" /><div><div className="flex items-center gap-2 mb-1"><Badge className={getSeverityColor(a.severity)}>{a.severity}</Badge><Badge variant="outline">{a.status}</Badge></div><p className="font-medium">{a.title}</p>{a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}</div></div>
            {a.status === 'open' && <Button size="sm" variant="outline" onClick={() => handleAcknowledge(a.id)}>Acknowledge</Button>}
          </div></CardContent></Card>
        ))}</div>}
      </div>
    </TenantLayout>
  );
}
