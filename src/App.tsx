import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
const QuranReader = lazy(() => import("./pages/QuranReader"));
const Ramadan = lazy(() => import("./pages/Ramadan"));
const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const Admin = lazy(() => import("./pages/Admin"));
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
import Support from "./pages/Support";
import Khadims from "./pages/Khadims";
import DuaPage from "./pages/DuaPage";
import HadithPage from "./pages/HadithPage";
import AdhkarPage from "./pages/AdhkarPage";
import TasbihPage from "./pages/TasbihPage";
import AzanPage from "./pages/AzanPage";
import AzanFullscreen from "./pages/AzanFullscreen";
import Academic from "./pages/Academic";
import Challenges from "./pages/Challenges";
import NotFound from "./pages/NotFound";
import { AzanNotificationBridge } from "@/components/AzanNotificationBridge";
import { RealtimeNotificationBridge } from "@/components/RealtimeNotificationBridge";


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AzanNotificationBridge />
          <RealtimeNotificationBridge />

          <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="/quran/:surahNumber" element={<ProtectedRoute><QuranReader /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/ramadan" element={<ProtectedRoute><Ramadan /></ProtectedRoute>} />
            <Route path="/prayer-times" element={<ProtectedRoute><PrayerTimes /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/khadims" element={<ProtectedRoute><Khadims /></ProtectedRoute>} />
            <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
            <Route path="/dua" element={<ProtectedRoute><DuaPage /></ProtectedRoute>} />
            <Route path="/hadith" element={<ProtectedRoute><HadithPage /></ProtectedRoute>} />
            <Route path="/adhkar" element={<ProtectedRoute><AdhkarPage /></ProtectedRoute>} />
            <Route path="/tasbih" element={<ProtectedRoute><TasbihPage /></ProtectedRoute>} />
            <Route path="/azan" element={<ProtectedRoute><AzanPage /></ProtectedRoute>} />
            <Route path="/azan/now" element={<ProtectedRoute><AzanFullscreen /></ProtectedRoute>} />
            <Route path="/academic" element={<ProtectedRoute><Academic /></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><Admin /></ProtectedRoute>} />

            {/* Role-restricted portals */}
            <Route path="/portal/student" element={<ProtectedRoute allowedRoles={["student", "admin"]}><StudentPortal /></ProtectedRoute>} />
            <Route path="/portal/amirs" element={<ProtectedRoute allowedRoles={["amir", "admin"]}><AmirsPortal /></ProtectedRoute>} />
            <Route path="/portal/amirs/:sector" element={<ProtectedRoute allowedRoles={["amir", "admin"]}><SectorPortal /></ProtectedRoute>} />
            <Route path="/portal/committee" element={<ProtectedRoute allowedRoles={["committee", "admin"]}><CommitteePortal /></ProtectedRoute>} />
            <Route path="/portal/guest" element={<GuestPortal />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
