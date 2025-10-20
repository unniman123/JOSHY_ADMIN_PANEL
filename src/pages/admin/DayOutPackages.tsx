import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAccess } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DayOutPackage {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  price: number | null;
  duration_days: number | null;
  is_published: boolean;
  display_order: number;
  categories?: { name: string };
}

export default function DayOutPackages() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<DayOutPackage[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
    loadPackages();
  }, []);

  const checkAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) navigate('/admin/login');
  };

  const loadPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tours')
      .select('id, title, slug, short_description, price, duration_days, is_published, display_order, categories(name)')
      .eq('is_day_out_package', true)
      .order('display_order', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load day-out packages',
        variant: 'destructive',
      });
    } else {
      setPackages((data || []) as DayOutPackage[]);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete package',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'Package deleted successfully' });
      loadPackages();
    }
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Day Out Packages</h1>
            <p className="text-muted-foreground">Manage single-day tour packages</p>
          </div>
          <Button onClick={() => navigate('/admin/tours/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No day-out packages found. Create one from the Tours page and mark it as "Day Out Package".
                    </TableCell>
                  </TableRow>
                ) : (
                  packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.display_order}</TableCell>
                      <TableCell className="font-medium">{pkg.title}</TableCell>
                      <TableCell>{pkg.categories?.name || 'Uncategorized'}</TableCell>
                      <TableCell>{pkg.duration_days ? `${pkg.duration_days} day${pkg.duration_days > 1 ? 's' : ''}` : 'N/A'}</TableCell>
                      <TableCell>{pkg.price ? `₹${pkg.price.toLocaleString()}` : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={pkg.is_published ? 'default' : 'secondary'}>
                          {pkg.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/tours/edit/${pkg.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the day-out package.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
