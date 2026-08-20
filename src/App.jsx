import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">Unauthorized</h1>
        <p className="mt-3 text-slate-600">You do not have access to this page.</p>
        <a href="/login" className="mt-5 inline-block rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500">
          Go to login
        </a>
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <DashboardLayout><UserDashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/store-owner"
        element={
          <ProtectedRoute allowedRoles={['STORE_OWNER']}>
            <DashboardLayout><StoreOwnerDashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
