import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Camera, TrendingUp, User, Building2, Store, ArrowLeftRight } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't render mobile nav on landing page
  if (pathname === '/' || pathname === '') {
    return null;
  }

  const isManagerRoute = pathname.startsWith('/manager') || pathname.startsWith('/owner') || pathname.startsWith('/canteen-owner');

  if (isManagerRoute) {
    const managerNavItems = [
      { to: '/owner/dashboard', label: 'Dashboard', icon: Store },
      { to: '/', label: 'Switch Role', icon: ArrowLeftRight },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 px-3 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {managerNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
                    isActive
                      ? 'text-indigo-400 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    );
  }

  // Student Mobile Navigation
  const studentNavItems = [
    { to: '/student', label: 'Home', icon: Home },
    { to: '/campus', label: 'Campus', icon: Building2 },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/scan', label: 'Analyze', icon: Camera, isSpecial: true },
    { to: '/impact', label: 'Impact', icon: TrendingUp },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                  item.isSpecial
                    ? 'relative -top-3'
                    : isActive
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.isSpecial ? (
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-700/25 transition-transform active:scale-95 ${
                        isActive ? 'bg-emerald-700' : 'bg-emerald-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  ) : (
                    <div
                      className={`p-1 rounded-lg transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                  <span
                    className={`text-[9px] mt-0.5 tracking-tight ${
                      item.isSpecial ? 'font-semibold text-emerald-800' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
