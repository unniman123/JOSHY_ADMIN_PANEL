import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Tours from "./pages/admin/Tours";
import TourForm from "./pages/admin/TourForm";
import TourInquiries from "./pages/admin/TourInquiries";
import DayOutInquiries from "./pages/admin/DayOutInquiries";
import ContactInquiries from "./pages/admin/ContactInquiries";
import DayOutPackages from "./pages/admin/DayOutPackages";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/tours" element={<Tours />} />
          <Route path="/admin/tours/new" element={<TourForm />} />
          <Route path="/admin/tours/edit/:id" element={<TourForm />} />
          <Route path="/admin/day-out-packages" element={<DayOutPackages />} />
          <Route path="/admin/inquiries/tours" element={<TourInquiries />} />
          <Route path="/admin/inquiries/day-out" element={<DayOutInquiries />} />
          <Route path="/admin/inquiries/contact" element={<ContactInquiries />} />
          <Route path="/admin/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
