import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  Search, 
  Camera, 
  TrendingUp, 
  User, 
  BookOpen, 
  Store, 
  Building2, 
  ArrowLeftRight, 
  Sparkles,
  BarChart3,
  ShoppingBag
} from 'lucide-react';
import { CampusStatus } from './CampusStatus';
import { DemoAccessModal } from './DemoAccessModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const pathname = location.pathname;
  const isManagerRoute = pathname.startsWith('/manager') || pathname.startsWith('/owner') || pathname.startsWith('/canteen-owner');

  // Manager-Specific Navigation Header
  if (isManagerRoute) {
    return (
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Manager Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                  EcoBite <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold uppercase tracking-wider border border-indigo-500/40">MANAGER</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Canteen Operations &amp; Demand Intelligence
                </div>
              </div>
            </div>

            {/* Manager Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              <NavLink
                to="/owner/dashboard"
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Manager Dashboard</span>
              </NavLink>

              <NavLink
                to="/owner/orders"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders</span>
              </NavLink>

              <NavLink
                to="/context"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Architecture</span>
              </NavLink>
            </nav>

            {/* Switch Role Button */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-2xs"
                title="Switch Role or Exit to Entry Screen"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Switch Role</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Student-Specific Navigation Header
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Student Brand Logo */}
          <Link to="/student" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight text-slate-900 flex items-center gap-1.5">
                EcoBite <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">STUDENT</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Campus Food Decision Platform
              </div>
            </div>
          </Link>

          {/* Student Desktop Navigation Links - ONLY STUDENT CONTROLS */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/student"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/campus"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Menu</span>
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Food</span>
            </NavLink>

            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Food Analysis</span>
            </NavLink>

            <NavLink
              to="/swap"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Swap</span>
            </NavLink>

            <NavLink
              to="/impact"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>My Impact</span>
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </NavLink>

            <NavLink
              to="/context"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-200 text-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
              title="Architecture & Documentation"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </NavLink>
          </nav>

          {/* Right Status & Role Switch */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
              title="Switch Role"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Switch Role</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Judge Demo</span>
            </button>
            <CampusStatus compact />
          </div>
        </div>
      </div>

      {/* Interactive Demo Modal */}
      <DemoAccessModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </header>
  );
};
