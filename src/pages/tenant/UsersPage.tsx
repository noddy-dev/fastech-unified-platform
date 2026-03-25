import { useEffect, useState } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTenantUsers } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/types';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile?.tenant_id) getTenantUsers(profile.tenant_id).then(setUsers).catch(console.error).finally(() => setLoading(false)); else setLoading(false); }, [profile]);

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Users</h1><p className="text-muted-foreground">Manage users in your organization</p></div>
        {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        : users.length === 0 ? <Card><CardContent className="py-12 text-center"><Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No users found</p></CardContent></Card>
        : <Card><CardHeader><CardTitle>{users.length} Users</CardTitle></CardHeader><CardContent><div className="space-y-3">{users.map(u => (
          <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg"><div><p className="font-medium">{u.email}</p><p className="text-xs text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</p></div><Badge variant="secondary">{(u.role || 'client').replace('_',' ')}</Badge></div>
        ))}</div></CardContent></Card>}
      </div>
    </TenantLayout>
  );
}
