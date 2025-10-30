import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderTree, 
  Map, 
  MessageSquare, 
  Settings, 
  LogOut,
  Palmtree,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const isInquiriesOpen = location.pathname.includes('/admin/inquiries');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
      toast({
        title: 'Logged out',
        description: 'Successfully logged out',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Map, label: 'Tours', path: '/admin/tours' },
    { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
    { icon: Palmtree, label: 'Day Out Packages', path: '/admin/day-out-packages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];
  
  const inquiryItems = [
    { icon: FileText, label: 'Tour Inquiries', path: '/admin/inquiries/tours' },
    { icon: Palmtree, label: 'Day Out Inquiries', path: '/admin/inquiries/day-out' },
    { icon: Mail, label: 'Contact Inquiries', path: '/admin/inquiries/contact' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-1 p-4">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          
          <Collapsible defaultOpen={isInquiriesOpen} className="space-y-1">
            <CollapsibleTrigger asChild>
              <Button
                variant={isInquiriesOpen ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Inquiries
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-6">
              {inquiryItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                  >
                    <item.icon className="mr-2 h-3 w-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
