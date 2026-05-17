import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';

// Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyGoals from './pages/employee/MyGoals';
import CreateGoal from './pages/employee/CreateGoal';
import CheckIns from './pages/employee/CheckIns';
import EmployeeAnalytics from './pages/employee/EmployeeAnalytics';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';
import GoalApprovals from './pages/manager/GoalApprovals';
import TeamDirectory from './pages/manager/TeamDirectory';
import TeamAnalytics from './pages/manager/TeamAnalytics';
import SharedGoals from './pages/manager/SharedGoals';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Employee Routes */}
      <Route path="/employee" element={
        <ProtectedRoute roles={['employee']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="goals" element={<MyGoals />} />
        <Route path="goals/create" element={<CreateGoal />} />
        <Route path="checkins" element={<CheckIns />} />
        <Route path="analytics" element={<EmployeeAnalytics />} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="approvals" element={<GoalApprovals />} />
        <Route path="team" element={<TeamDirectory />} />
        <Route path="analytics" element={<TeamAnalytics />} />
        <Route path="shared" element={<SharedGoals />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="cycles" element={<Reports />} />
        <Route path="analytics" element={<AdminDashboard />} />
        <Route path="audit" element={<Reports />} />
        <Route path="goals" element={<GoalApprovals />} />
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
