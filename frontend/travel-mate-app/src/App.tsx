import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'

import { LandingPage } from './pages/LandingPage'
import { SearchPage } from './pages/SearchPage'
import { HotelDetailPage } from './pages/HotelDetailPage'
import { LoginPage } from './pages/LoginPage'          
import { SignupPage } from './pages/SignupPage'        
import { SandboxBooking } from './pages/SandboxBooking'
import { ReviewPortal } from './pages/ReviewPortal'
import { ListHotelWizard } from './pages/ListHotelWizard'

import { UserDashboard } from './components/ui/UserDashboard'
import { HostDashboard } from './components/ui/HostDashboard'
import { AdminDashboard } from './components/ui/AdminDashboard'

import { useUserStore } from './store/useUserStore'
import type { JSX } from 'react'

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { isAuthenticated, role } = useUserStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />; 
  }

  return children;
};

const DashboardRouter = () => {
  const { role } = useUserStore();
  
  switch (role) {
    case 'ADMIN':      return <AdminDashboard />;
    case 'HOTEL_HOST': return <HostDashboard />;
    case 'USER':
    default:           return <UserDashboard />;
  }
};

function App() {
  const { isAuthenticated } = useUserStore();

  return (
    <BrowserRouter>
      <div className="w-full min-h-screen flex flex-col text-gray-900 font-sans selection:bg-[var(--tm-ethereal-purple)] selection:text-white">
        
        <Navbar />

        <main className="flex-grow flex flex-col relative w-full">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/hotel/:hotelId" element={<HotelDetailPage />} />
            
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            
            <Route path="/list-hotel" element={
              <ProtectedRoute allowedRoles={['HOTEL_HOST', 'ADMIN']}>
                <ListHotelWizard />
              </ProtectedRoute>
            } />

            <Route path="/booking" element={
              <ProtectedRoute>
                <SandboxBooking />
              </ProtectedRoute>
            } />

            <Route path="/review" element={
              <ProtectedRoute>
                <ReviewPortal />
              </ProtectedRoute>
            } />

            <Route path="/payment" element={<Navigate to="/search" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;