import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Leaf, Search, Camera, TrendingUp, User, BookOpen, ShieldCheck } from 'lucide-react';
import { CampusStatus } from './CampusStatus';
import { useAuth } from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { userDoc } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight text-slate-900 flex items-center gap-1.5">
                EcoBite <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">AI</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Campus Food Intelligence
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
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
              <span>Search</span>
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
              <span>Scan Food</span>
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
              <span>Impact</span>
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

            {userDoc?.role === 'campus_admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`
                }
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <CampusStatus compact />
          </div>
        </div>
      </div>
    </header>
  );
};
