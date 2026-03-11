// V's_new_start — Premium-Plus: Modular architecture, centralized layout
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { SearchPage } from './pages/SearchPage'
import { LandingPage } from './pages/LandingPage'
import { ListHotelWizard } from './components/ui/ListHotelWizard'
import { SandboxBooking } from './pages/SandboxBooking'
import { ReviewPortal } from './pages/ReviewPortal'
import { HotelDetailPage } from './pages/HotelDetailPage'
import { useUserStore } from './store/useUserStore'
import { UserDashboard } from './components/ui/UserDashboard'
import { HostDashboard } from './components/ui/HostDashboard'
import { AdminDashboard } from './components/ui/AdminDashboard'

// Role-based Dashboard Router
const DashboardRouter = () => {
  const { user, role } = useUserStore();
  if (!user) {
    return (
      <div className="p-12 text-center text-gray-400 mt-24">
        Please sign in to access your dashboard.
      </div>
    );
  }
  switch (role) {
    case 'ADMIN':     return <AdminDashboard />;
    case 'HOTEL_HOST': return <HostDashboard />;
    case 'USER':
    default:          return <UserDashboard />;
  }
};

function App() {
  const { isAuthenticated } = useUserStore();

  return (
    <BrowserRouter>
      {/* V's_new_start — w-full is the final chain link: body(block)→#root(100%)→this div(w-full)→elite-container(mx-auto) ✓ */}
      <div className="w-full min-h-screen flex flex-col text-gray-900 font-sans selection:bg-[var(--tm-ethereal-purple)] selection:text-white">
      {/* V's_new_end */}

        {/* ── Extracted, Modular Navbar ── */}
        <Navbar />

        {/* ── Main Content — Full-Width Centered ── */}
        <main className="flex-grow flex flex-col relative w-full">
          <Routes>
            {/* Redirect logged-in users away from landing */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/search"    element={<SearchPage />} />
            <Route path="/hotel/:hotelId" element={<HotelDetailPage />} />
            <Route path="/list-hotel" element={<ListHotelWizard />} />
            <Route path="/booking"   element={<SandboxBooking />} />
            <Route path="/review"    element={<ReviewPortal />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            {/* /payment route kept as catch-all redirect — drawer handles payment now */}
            <Route path="/payment"   element={<Navigate to="/search" />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;
// V's_new_end
