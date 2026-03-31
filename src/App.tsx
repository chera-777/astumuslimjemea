import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import QuranReader from "./pages/QuranReader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Donations from "./pages/Donations";
import StudentPortal from "./pages/StudentPortal";
import AmirsPortal from "./pages/AmirsPortal";
import SectorPortal from "./pages/amirs/SectorPortal";
import CommitteePortal from "./pages/CommitteePortal";
import GuestPortal from "./pages/GuestPortal";
import Resources from "./pages/Resources";
import Governance from "./pages/Governance";
import Community from "./pages/Community";
import Groups from "./pages/Groups";
import News from "./pages/News";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import Ramadan from "./pages/Ramadan";
import PrayerTimes from "./pages/PrayerTimes";
import Events from "./pages/Events";
import Support from "./pages/Support";
import Khadims from "./pages/Khadims";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/ramadan" element={<ProtectedRoute><Ramadan /></ProtectedRoute>} />
            <Route path="/prayer-times" element={<ProtectedRoute><PrayerTimes /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/khadims" element={<ProtectedRoute><Khadims /></ProtectedRoute>} />
            <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />

            {/* Role-restricted portals */}
            <Route path="/portal/student" element={<ProtectedRoute allowedRoles={["student", "admin"]}><StudentPortal /></ProtectedRoute>} />
            <Route path="/portal/amirs" element={<ProtectedRoute allowedRoles={["amir", "admin"]}><AmirsPortal /></ProtectedRoute>} />
            <Route path="/portal/amirs/:sector" element={<ProtectedRoute allowedRoles={["amir", "admin"]}><SectorPortal /></ProtectedRoute>} />
            <Route path="/portal/committee" element={<ProtectedRoute allowedRoles={["committee", "admin"]}><CommitteePortal /></ProtectedRoute>} />
            <Route path="/portal/guest" element={<GuestPortal />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
