import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface UserRoleRow {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export default function Roles() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRoleRow[]>([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('admin');
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: 'Failed to load roles', variant: 'destructive' });
    } else {
      setRoles(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!userId) {
      toast({ title: 'Validation', description: 'User ID is required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('user_roles').insert([{ user_id: userId, role }]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: 'Role assigned' });
    setUserId('');
    loadRoles();
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this role?')) return;
    const { error } = await supabase.from('user_roles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to remove role', variant: 'destructive' });
      return;
    }
    toast({ title: 'Removed', description: 'Role removed' });
    loadRoles();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Roles</h1>
          <p className="text-muted-foreground">Assign or remove admin/moderator roles by Supabase `user_id`.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="auth.users.id" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>

        <div>
          <Button onClick={handleAdd}>Assign Role</Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user_id}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(r.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}




