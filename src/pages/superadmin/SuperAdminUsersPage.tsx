import { useEffect, useState } from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/db/api';
import type { Profile } from '@/types/types';
import { Users } from 'lucide-react';

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-destructive text-destructive-foreground',
      msp_admin: 'bg-primary text-primary-foreground',
      tenant_admin: 'bg-secondary text-secondary-foreground',
      tenant_user: 'bg-muted text-muted-foreground',
    };
    return colors[role] || 'bg-muted text-muted-foreground';
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">User Management</h1><p className="text-muted-foreground">View and manage all platform users</p></div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        ) : (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />{users.length} Users</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{u.email || u.username || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{u.organization_name || 'No org'}</p>
                    </div>
                    <Badge className={getRoleBadge(u.role)}>{u.role.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
}
