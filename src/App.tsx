import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
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
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portal/student" element={<StudentPortal />} />
            <Route path="/portal/amirs" element={<AmirsPortal />} />
            <Route path="/portal/amirs/:sector" element={<SectorPortal />} />
            <Route path="/portal/committee" element={<CommitteePortal />} />
            <Route path="/portal/guest" element={<GuestPortal />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/community" element={<Community />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/news" element={<News />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/services" element={<Services />} />
            <Route path="/ramadan" element={<Ramadan />} />
            <Route path="/events" element={<Events />} />
            <Route path="/support" element={<Support />} />
            <Route path="/khadims" element={<Khadims />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
