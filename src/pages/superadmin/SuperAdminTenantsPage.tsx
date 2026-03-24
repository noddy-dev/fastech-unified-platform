import { useEffect, useState } from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTenantsWithStats, createTenant, updateTenant, deleteTenant } from '@/db/api';
import type { TenantWithStats, TenantStatus } from '@/types/types';
import { Plus, Server, AlertCircle, TrendingUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', subscription_tier: 'standard' });

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    try { setTenants(await getTenantsWithStats()); }
    catch { toast.error('Failed to load tenants'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newTenant.name) { toast.error('Enter tenant name'); return; }
    try {
      await createTenant({ name: newTenant.name, subscription_tier: newTenant.subscription_tier, status: 'active' });
      toast.success('Tenant created');
      setDialogOpen(false);
      setNewTenant({ name: '', subscription_tier: 'standard' });
      loadTenants();
    } catch { toast.error('Failed to create tenant'); }
  };

  const handleStatusChange = async (id: string, status: TenantStatus) => {
    try { await updateTenant(id, { status }); toast.success('Status updated'); loadTenants(); }
    catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tenant?')) return;
    try { await deleteTenant(id); toast.success('Tenant deleted'); loadTenants(); }
    catch { toast.error('Failed to delete'); }
  };

  const getStatusColor = (s: string) => {
    if (s === 'active') return 'bg-success text-success-foreground';
    if (s === 'suspended') return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tenant Management</h1>
            <p className="text-muted-foreground">Create, edit, and delete all tenants</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Tenant</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
                <DialogDescription>Add a new tenant organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tenant Name</Label>
                  <Input placeholder="Acme Corp" value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Subscription Tier</Label>
                  <Select value={newTenant.subscription_tier} onValueChange={(v) => setNewTenant({ ...newTenant, subscription_tier: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={handleCreate}>Create Tenant</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        ) : tenants.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No tenants yet</p></CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((t) => (
              <Card key={t.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2"><Server className="w-4 h-4 text-muted-foreground" /><span>{t.device_count || 0} devices</span></div>
                    <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-muted-foreground" /><span>{t.active_alerts || 0} alerts</span></div>
                    <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><span>{t.avg_compliance_score || 0}%</span></div>
                    <div className="text-muted-foreground">{t.subscription_tier}</div>
                  </div>
                  <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v as TenantStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
