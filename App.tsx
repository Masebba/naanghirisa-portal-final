import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastViewport } from './components/ToastViewport';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Transparency from './pages/Transparency';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Contact from './pages/Contact';
import Volunteer from './pages/Volunteer';
import Donate from './pages/Donate';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import ContentManager from './pages/dashboard/ContentManager';
import AboutManager from './pages/dashboard/AboutManager';
import ProgramsManager from './pages/dashboard/ProgramsManager';
import TransparencyManager from './pages/dashboard/TransparencyManager';
import CampaignsManager from './pages/dashboard/CampaignsManager';
import NewsManager from './pages/dashboard/NewsManager';
import DonationsManager from './pages/dashboard/DonationsManager';
import ContactManager from './pages/dashboard/ContactManager';
import UserManager from './pages/dashboard/UserManager';
import VolunteerManager from './pages/dashboard/VolunteerManager';
import FeedbackManager from './pages/dashboard/FeedbackManager';
import SystemSettings from './pages/dashboard/SystemSettings';
import AccountabilityManager from './pages/dashboard/AccountabilityManager';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import { UserRole, User } from './types';
import { authService } from './services/authService';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const location = useLocation();

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location.pathname]);

  return (
    <>
      <ToastViewport />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/programs" element={<Layout><Programs /></Layout>} />
        <Route path="/programs/:id" element={<Layout><ProgramDetail /></Layout>} />
        <Route path="/transparency" element={<Layout><Transparency /></Layout>} />
        <Route path="/campaigns" element={<Layout><Campaigns /></Layout>} />
        <Route path="/campaigns/:id" element={<Layout><CampaignDetail /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
        <Route path="/news/:id" element={<Layout><NewsDetail /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/volunteer" element={<Layout><Volunteer /></Layout>} />
        <Route path="/donate" element={<Layout><Donate /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout user={user || { name: 'Guest', role: UserRole.GUEST, email: '', id: '' }}>
                <Routes>
                  <Route index element={<Overview />} />
                  <Route path="users" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><UserManager /></ProtectedRoute>} />
                  <Route path="accountability" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.VOLUNTEER]}><AccountabilityManager /></ProtectedRoute>} />
                  <Route path="content" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN]}><ContentManager /></ProtectedRoute>} />
                  <Route path="about" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN]}><AboutManager /></ProtectedRoute>} />
                  <Route path="programs" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN]}><ProgramsManager /></ProtectedRoute>} />
                  <Route path="transparency" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER]}><TransparencyManager /></ProtectedRoute>} />
                  <Route path="campaigns" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER]}><CampaignsManager /></ProtectedRoute>} />
                  <Route path="news" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN]}><NewsManager /></ProtectedRoute>} />
                  <Route path="donations" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER]}><DonationsManager /></ProtectedRoute>} />
                  <Route path="volunteers" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.VOLUNTEER]}><VolunteerManager /></ProtectedRoute>} />
                  <Route path="feedback" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER]}><FeedbackManager /></ProtectedRoute>} />
                  <Route path="contact" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN]}><ContactManager /></ProtectedRoute>} />
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="settings" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><SystemSettings /></ProtectedRoute>} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
