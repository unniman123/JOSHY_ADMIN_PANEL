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

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'archived';
  submitted_at: string;
}

export default function ContactInquiries() {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
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
      .from('contact_inquiry')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contact inquiries',
        variant: 'destructive',
      });
    } else {
      setInquiries((data || []) as ContactInquiry[]);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'new' | 'responded' | 'archived') => {
    const { error } = await supabase
      .from('contact_inquiry')
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
      case 'responded':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Inquiries</h1>
          <p className="text-muted-foreground">Manage contact form submissions</p>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No contact inquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell className="max-w-xs truncate">{inquiry.subject}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(inquiry.status)}>
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inquiry.submitted_at).toLocaleDateString()}
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
              <DialogTitle>Contact Inquiry Details</DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{selectedInquiry.email}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                    <p className="text-sm">{selectedInquiry.subject}</p>
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
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
