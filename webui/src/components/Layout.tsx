import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from './Toast';
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  HomeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function Layout() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { startOAuth, handleLogout, loading } = useAuth();

  const navItems = [
    { path: '/', label: 'Push', icon: HomeIcon },
    { path: '/sync', label: 'Sync', icon: ArrowPathIcon, protected: true },
    { path: '/settings', label: 'Settings', icon: Cog6ToothIcon, protected: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-gray-800">Notion WebUI</h1>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              if (item.protected && !isAuthenticated) return null;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
                    active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <button
              onClick={startOAuth}
              disabled={loading}
              className="px-4 py-1.5 bg-black text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? 'Connecting...' : 'Connect Notion'}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
