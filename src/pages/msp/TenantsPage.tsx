import { useEffect, useState } from 'react';
import { MSPLayout } from '@/components/layouts/MSPLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTenantsWithStats, createTenant, updateTenant } from '@/db/api';
import type { TenantWithStats, TenantStatus } from '@/types/types';
import { Plus, Server, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', subscription_tier: 'standard' });

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => { try { setTenants(await getTenantsWithStats()); } catch { toast.error('Failed'); } finally { setLoading(false); } };

  const handleCreate = async () => {
    if (!newTenant.name) { toast.error('Enter name'); return; }
    try { await createTenant({ name: newTenant.name, subscription_tier: newTenant.subscription_tier, status: 'active' }); toast.success('Created'); setDialogOpen(false); setNewTenant({ name: '', subscription_tier: 'standard' }); loadTenants(); } catch { toast.error('Failed'); }
  };

  const handleStatus = async (id: string, s: TenantStatus) => { try { await updateTenant(id, { status: s }); toast.success('Updated'); loadTenants(); } catch { toast.error('Failed'); } };

  const getStatusColor = (s: string) => s === 'active' ? 'bg-success text-success-foreground' : s === 'suspended' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground';

  return (
    <MSPLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">Tenants</h1><p className="text-muted-foreground">View and manage your tenants</p></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Tenant</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Create Tenant</DialogTitle><DialogDescription>Add a new tenant</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4"><div className="space-y-2"><Label>Name</Label><Input value={newTenant.name} onChange={(e) => setNewTenant({...newTenant, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Tier</Label><Select value={newTenant.subscription_tier} onValueChange={(v) => setNewTenant({...newTenant, subscription_tier: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="basic">Basic</SelectItem><SelectItem value="standard">Standard</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent></Select></div></div>
              <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{tenants.map(t => (
          <Card key={t.id}><CardHeader><div className="flex items-start justify-between"><CardTitle className="text-lg">{t.name}</CardTitle><Badge className={getStatusColor(t.status)}>{t.status}</Badge></div></CardHeader>
          <CardContent className="space-y-3"><div className="grid grid-cols-2 gap-2 text-sm"><div className="flex items-center gap-2"><Server className="w-4 h-4 text-muted-foreground" />{t.device_count || 0} devices</div><div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-muted-foreground" />{t.active_alerts || 0} alerts</div><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" />{t.avg_compliance_score || 0}%</div></div>
          <Select value={t.status} onValueChange={(v) => handleStatus(t.id, v as TenantStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
          </CardContent></Card>
        ))}</div>}
      </div>
    </MSPLayout>
  );
}
