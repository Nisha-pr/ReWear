import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Lazy load all pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const AddItemPage = lazy(() => import('./pages/AddItemPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 1rem' }} />
      <p style={{ color: '#6B7280', fontWeight: 500 }}>Loading...</p>
    </div>
  </div>
);

// OAuth Success Handler — reads token from URL and saves it
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      saveAuth(token).then(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return <PageLoader />;
};

// Layout that includes Navbar + Footer (not for chat/auth pages)
const MainLayout = ({ children, noFooter = false }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 65px)' }}>{children}</main>
    {!noFooter && <Footer />}
  </>
);

// Layout without navigation (auth pages)
const AuthLayout = ({ children }) => (
  <main>{children}</main>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth pages - no navbar/footer */}
              <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
              <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

              {/* OAuth success handler */}
              <Route path="/auth/success" element={<OAuthSuccess />} />

              {/* Chat page - full screen, no footer */}
              <Route path="/chat/:swapId" element={
                <ProtectedRoute>
                  <MainLayout noFooter>
                    <ChatPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Main pages with Navbar + Footer */}
              <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
              <Route path="/browse" element={<MainLayout><BrowsePage /></MainLayout>} />
              <Route path="/item/:id" element={<MainLayout><ItemDetailPage /></MainLayout>} />

              <Route path="/add-item" element={
                <ProtectedRoute>
                  <MainLayout><AddItemPage /></MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout><DashboardPage /></MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute>
                  <MainLayout><AdminPanel /></MainLayout>
                </AdminRoute>
              } />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{ top: 80 }}
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#1B5E20', secondary: 'white' },
                style: { background: '#F0FFF4', border: '1px solid rgba(27,94,32,0.2)', color: '#1a1a2e' },
              },
              error: {
                iconTheme: { primary: '#dc2626', secondary: 'white' },
                style: { background: '#FFF5F5', border: '1px solid rgba(220,38,38,0.2)', color: '#1a1a2e' },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
