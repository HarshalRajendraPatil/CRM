import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/Dashboard';

import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDetail from './pages/admin/UserDetail';
import CreateUser from './pages/admin/CreateUser';
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';
import InvitationPage from './pages/invitations/InvitationPage';
import UserInvitations from './pages/invitations/UserInvitations';
import NotificationsPage from './pages/NotificationsPage';

// CRM pages
import CrmDashboard from './pages/crm/CrmDashboard';
import CrmContacts from './pages/crm/CrmContacts';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin route component (accessible only by system-admin)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.roleGlobal !== 'system-admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public route component (accessible only when not authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Notifications route */}
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* CRM routes */}
        <Route path="/crm/:projectId">
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <CrmDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="contacts" 
            element={
              <ProtectedRoute>
                <CrmContacts />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Projects routes */}
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:id" 
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Invitations routes */}
        <Route 
          path="/invitations" 
          element={
            <ProtectedRoute>
              <UserInvitations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/invitations/:token" 
          element={<InvitationPage />} 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users/create" 
          element={
            <AdminRoute>
              <CreateUser />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users/:id" 
          element={
            <AdminRoute>
              <UserDetail />
            </AdminRoute>
          } 
        />
        
        {/* 404 page - redirect to home or dashboard based on auth status */}
        <Route 
          path="*" 
          element={
            <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
