import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAccess } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DayOutInquiry {
  id: string;
  package_id: string;
  name: string;
  mobile_no: string;
  preferred_date: string;
  number_of_people: number;
  destination: string | null;
  special_comments: string | null;
  status: 'new' | 'contacted' | 'closed';
  submitted_at: string;
  tours?: { title: string };
}

export default function DayOutInquiries() {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<DayOutInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<DayOutInquiry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
    loadInquiries();
  }, []);

  const checkAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) navigate('/admin/login');
  };

  const loadInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('day_out_inquiry')
      .select('*, tours(title)')
      .order('submitted_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load day-out inquiries',
        variant: 'destructive',
      });
    } else {
      setInquiries((data || []) as DayOutInquiry[]);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'new' | 'contacted' | 'closed') => {
    const { error } = await supabase
      .from('day_out_inquiry')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'Status updated' });
      loadInquiries();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Day Out Inquiries</h1>
          <p className="text-muted-foreground">Manage day-out package inquiries</p>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No day-out inquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{inquiry.mobile_no}</TableCell>
                      <TableCell>{inquiry.tours?.title || 'N/A'}</TableCell>
                      <TableCell>{new Date(inquiry.preferred_date).toLocaleDateString()}</TableCell>
                      <TableCell>{inquiry.number_of_people}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(inquiry.status)}>
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Day Out Inquiry Details</DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                    <p className="text-sm">{selectedInquiry.mobile_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Package</label>
                    <p className="text-sm">{selectedInquiry.tours?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Date</label>
                    <p className="text-sm">{new Date(selectedInquiry.preferred_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Number of People</label>
                    <p className="text-sm">{selectedInquiry.number_of_people}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Destination</label>
                    <p className="text-sm">{selectedInquiry.destination || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Select
                      value={selectedInquiry.status}
                      onValueChange={(value) => updateStatus(selectedInquiry.id, value as any)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedInquiry.special_comments && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Special Comments</label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedInquiry.special_comments}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
