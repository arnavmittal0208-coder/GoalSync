import { BrowserRouter, Routes, Route, Navigate, Suspense } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { lazy } from 'react';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Employee
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const MyGoals = lazy(() => import('./pages/employee/MyGoals'));
const CreateGoal = lazy(() => import('./pages/employee/CreateGoal'));
const CheckIns = lazy(() => import('./pages/employee/CheckIns'));
const EmployeeAnalytics = lazy(() => import('./pages/employee/EmployeeAnalytics'));

// Manager
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const GoalApprovals = lazy(() => import('./pages/manager/GoalApprovals'));
const TeamDirectory = lazy(() => import('./pages/manager/TeamDirectory'));
const TeamAnalytics = lazy(() => import('./pages/manager/TeamAnalytics'));
const SharedGoals = lazy(() => import('./pages/manager/SharedGoals'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const Reports = lazy(() => import('./pages/admin/Reports'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
      <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />

      {/* Employee Routes */}
      <Route path="/employee" element={
        <ProtectedRoute roles={['employee']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><EmployeeDashboard /></Suspense>} />
        <Route path="goals" element={<Suspense fallback={<PageLoader />}><MyGoals /></Suspense>} />
        <Route path="goals/create" element={<Suspense fallback={<PageLoader />}><CreateGoal /></Suspense>} />
        <Route path="checkins" element={<Suspense fallback={<PageLoader />}><CheckIns /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><EmployeeAnalytics /></Suspense>} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><ManagerDashboard /></Suspense>} />
        <Route path="approvals" element={<Suspense fallback={<PageLoader />}><GoalApprovals /></Suspense>} />
        <Route path="team" element={<Suspense fallback={<PageLoader />}><TeamDirectory /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><TeamAnalytics /></Suspense>} />
        <Route path="shared" element={<Suspense fallback={<PageLoader />}><SharedGoals /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoader />}><UserManagement /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
        <Route path="cycles" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="audit" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
        <Route path="goals" element={<Suspense fallback={<PageLoader />}><GoalApprovals /></Suspense>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 500,
              padding: '12px 16px',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.2)',
            },
            success: { iconTheme: { primary: '#5eead4', secondary: '#0f172a' } },
            error: { iconTheme: { primary: '#fca5a5', secondary: '#7f1d1d' } },
          }}
          containerStyle={{ bottom: 18, right: 18 }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
