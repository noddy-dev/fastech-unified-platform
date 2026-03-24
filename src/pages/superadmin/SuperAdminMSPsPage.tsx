import { useEffect, useState } from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAllMSPs, createMSP, deleteMSP } from '@/db/api';
import type { MSP } from '@/types/types';
import { Plus, Globe, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminMSPsPage() {
  const [msps, setMsps] = useState<MSP[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMSP, setNewMSP] = useState({ name: '', contact_email: '', phone: '' });

  useEffect(() => { loadMSPs(); }, []);

  const loadMSPs = async () => {
    try { setMsps(await getAllMSPs()); } catch { toast.error('Failed to load MSPs'); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newMSP.name || !newMSP.contact_email) { toast.error('Name and email required'); return; }
    try {
      await createMSP(newMSP);
      toast.success('MSP created'); setDialogOpen(false); setNewMSP({ name: '', contact_email: '', phone: '' }); loadMSPs();
    } catch { toast.error('Failed to create MSP'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this MSP?')) return;
    try { await deleteMSP(id); toast.success('MSP deleted'); loadMSPs(); } catch { toast.error('Failed to delete'); }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">MSP Management</h1><p className="text-muted-foreground">Create, edit, and delete MSP organizations</p></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add MSP</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New MSP</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>MSP Name</Label><Input placeholder="TechServ MSP" value={newMSP.name} onChange={(e) => setNewMSP({ ...newMSP, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Contact Email</Label><Input type="email" placeholder="contact@msp.com" value={newMSP.contact_email} onChange={(e) => setNewMSP({ ...newMSP, contact_email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input placeholder="+1 555 000 0000" value={newMSP.phone} onChange={(e) => setNewMSP({ ...newMSP, phone: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={handleCreate}>Create MSP</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        ) : msps.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No MSPs registered</p></CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {msps.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /><CardTitle className="text-lg">{m.name}</CardTitle></div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="text-muted-foreground">{m.contact_email}</p>
                  {m.phone && <p className="text-muted-foreground">{m.phone}</p>}
                  <p className="text-xs text-muted-foreground">Created: {new Date(m.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
