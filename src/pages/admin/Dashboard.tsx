import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAccess } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Map,
  FolderTree,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTours: 0,
    categories: 0,
    newInquiries: 0,
    publishedTours: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
    loadStats();
  }, []);

  const checkAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      navigate('/admin/login');
    }
  };

  const loadStats = async () => {
    try {
      const [toursRes, catsRes, inquiriesRes, publishedRes] = await Promise.all([
        supabase.from('tours').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('tours').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      ]);

      setStats({
        totalTours: toursRes.count || 0,
        categories: catsRes.count || 0,
        newInquiries: inquiriesRes.count || 0,
        publishedTours: publishedRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">Welcome back! Here's what's happening with your travel business.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="card-dashboard group cursor-pointer"
            onClick={() => navigate('/admin/tours/new')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Add New Tour</CardTitle>
                    <CardDescription>Create a new travel experience</CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
          </Card>

          <Card
            className="card-dashboard group cursor-pointer"
            onClick={() => navigate('/admin/inquiries/tours')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">View Inquiries</CardTitle>
                    <CardDescription>Check customer messages</CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-dashboard relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-bl-full"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Map className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalTours}</div>
              <p className="text-xs text-muted-foreground mt-1">Active tour listings</p>
            </CardContent>
          </Card>

          <Card className="card-dashboard relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-accent opacity-10 rounded-bl-full"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <FolderTree className="h-5 w-5 text-accent" />
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.categories}</div>
              <p className="text-xs text-muted-foreground mt-1">Tour categories</p>
            </CardContent>
          </Card>

          <Card className="card-dashboard relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 opacity-10 rounded-bl-full"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.newInquiries}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending customer messages</p>
            </CardContent>
          </Card>

          <Card className="card-dashboard relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 opacity-10 rounded-bl-full"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.publishedTours}</div>
              <p className="text-xs text-muted-foreground mt-1">Live on website</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Placeholder */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates and changes in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Welcome to your enhanced admin panel</p>
                  <p className="text-xs text-muted-foreground">Dashboard updated with modern design</p>
                </div>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
