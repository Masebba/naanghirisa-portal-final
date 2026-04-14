
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserRole, User, Notification } from '../../types';
import { BRAND, COLORS } from '../../constants';
import { authService } from '../../services/authService';
import { getNotifications, markNotificationRead, subscribeStoreUpdates } from '../../services/mockData';
import logo from "../../assets/logo.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = () => setNotifications(getNotifications(user.id));
    fetchNotifs();
    const unsubscribe = subscribeStoreUpdates(fetchNotifs);
    const interval = setInterval(fetchNotifs, 5000);
    return () => { clearInterval(interval); unsubscribe(); };
  }, [user.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications(user.id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: 'fa-chart-pie', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER] },
    { name: 'User Access', path: '/dashboard/users', icon: 'fa-users-gear', roles: [UserRole.SUPER_ADMIN] },
    { name: 'Volunteer Hub', path: '/dashboard/volunteers', icon: 'fa-hands-helping', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.VOLUNTEER] },
    { name: 'Giving Ledger', path: '/dashboard/donations', icon: 'fa-circle-dollar-to-slot', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER] },
    { name: 'Accountability', path: '/dashboard/accountability', icon: 'fa-file-invoice-dollar', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.VOLUNTEER] },
    { name: 'Audits', path: '/dashboard/transparency', icon: 'fa-eye', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER] },
    { name: 'Campaigns', path: '/dashboard/campaigns', icon: 'fa-bullhorn', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER] },
    { name: 'Feedback', path: '/dashboard/feedback', icon: 'fa-comment-dots', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER] },
    { name: 'Programs', path: '/dashboard/programs', icon: 'fa-heart-pulse', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN] },
    { name: 'News CMS', path: '/dashboard/news', icon: 'fa-newspaper', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN] },
    { name: 'Content CMS', path: '/dashboard/content', icon: 'fa-pen-to-square', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN] },
    { name: 'About', path: '/dashboard/about', icon: 'fa-book-open', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN] },
    { name: 'Contact', path: '/dashboard/contact', icon: 'fa-address-book', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN] },
    { name: 'Profile', path: '/dashboard/profile', icon: 'fa-user-gear', roles: [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER] },
    { name: 'Settings', path: '/dashboard/settings', icon: 'fa-sliders', roles: [UserRole.SUPER_ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter overflow-x-hidden">
      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#FFF7F1] text-slate-500 transition-transform duration-300 z-50 flex flex-col border-r border-slate-300 shadow-lg ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="py-2 w-auto h-16 flex flex-col items-center border-b border-orange-400">
          {/* Logo*/}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Naanghirisa" className="h-10 md:h-16 w-auto" />
          </Link>
        </div>
        <nav className="flex-grow px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenu.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 transition-all group ${isActive ? 'bg-orange-400 text-white shadow-lg' : 'hover:bg-white/5 hover:text-orange-400'}`}
              >
                <i className={`fas ${item.icon} w-5 text-sm ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-orange-400'}`}></i>
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full py-3 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-red-500 transition-all">
            <i className="fas fa-power-off mr-2"></i> Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow transition-all duration-300 flex flex-col min-w-0 lg:ml-60">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-orange-400/50 sticky top-0 z-30 px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600"><i className="fas fa-bars text-xl"></i></button>
            <h2 className="hidden sm:block text-xl font-black uppercase tracking-tighter truncate">{filteredMenu.find(m => m.path === location.pathname)?.name || 'Portal'}</h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifs(!showNotifs)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 relative">
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Alerts</h4>
                    <span className="text-[9px] font-bold text-orange-600">{unreadCount} New</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} onClick={() => handleMarkRead(n.id)} className={`p-5 border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-orange-50/20' : ''}`}>
                        <p className="text-xs font-black text-slate-900 uppercase">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    )) : <div className="py-10 text-center text-slate-300 italic text-xs">No alerts</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase">{user.name}</p>
                <p className="text-[8px] text-orange-600 font-black">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white overflow-hidden font-black">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-3 md:p-5 flex-grow">
          {children}
        </div>

        <footer className="px-10 py-6 border-t border-slate-200 flex justify-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          &copy; {new Date().getFullYear()} Naanghirisa Organisation
        </footer>
      </div>
    </div>
  );
};
