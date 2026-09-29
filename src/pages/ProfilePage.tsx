import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ShieldCheck, Bell, Lock, ChevronRight, CheckCircle2, Building, BookOpen, LogIn, LogOut, Key, ArrowLeftRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { MOCK_USER } from '../data/mockUser';
import { useCampus } from '../hooks/useCampusAccess';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage: React.FC = () => {
  const { isVerified, campusName, campusShortName, city, revokeCampus, verifyCampus } = useCampus();
  const { currentUser, userDoc, isAuthenticated, isAnonymous, signOut, signInAnonymously } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [ecoTipsEnabled, setEcoTipsEnabled] = useState(true);

  // Active display values: prioritize authenticated user if present, else fallback to prototype demo profile
  const displayName = userDoc?.name || currentUser?.displayName || MOCK_USER.name;
  const displayEmail = userDoc?.email || currentUser?.email || MOCK_USER.email;
  const userRole = userDoc?.role || 'student';
  const displayUid = currentUser?.uid ? `uid_${currentUser.uid.slice(0, 8)}...` : 'demo_prachi_2026';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Student Profile & Settings"
        description="Manage your college campus association, authentication state, and privacy controls."
        badge={
          <Badge variant={isVerified ? 'emerald' : 'amber'} size="md">
            {isVerified ? `Verified Student` : 'Guest Session'}
          </Badge>
        }
        showBackButton
      />

      {/* Profile Card */}
      <Card variant="accent" padding="lg" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md shadow-emerald-700/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{displayName}</h2>
                <Badge variant={isVerified ? 'emerald' : 'amber'} size="sm">
                  {isVerified ? 'Campus Verified' : 'Public Mode'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{displayEmail}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium">
                <span className="capitalize">{userRole.replace('_', ' ')}</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-400">{displayUid}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/campus">
              <Button variant="outline" size="sm" leftIcon={<Building className="w-4 h-4" />}>
                {isVerified ? 'Campus Menu' : 'Access Campus Menu'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Institution Affiliation Details */}
        <div className="pt-4 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled Institution</span>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>{campusName || MOCK_USER.defaultCampus}</span>
            </div>
            <span className="text-[11px] text-slate-500">{city || 'Delhi, India'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Campus Verification Status</span>
            <div className="font-bold flex items-center gap-1.5 text-slate-800">
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Verified via Physical QR</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-800">Unverified (Public Mode)</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              {isVerified ? 'Full stall menus unlocked' : 'Prices protected'}
            </span>
          </div>
        </div>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Preferences & Controls
        </h3>

        {/* Authentication State Card */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Firebase Authentication</h4>
                <p className="text-xs text-slate-500">
                  {isAuthenticated
                    ? isAnonymous
                      ? 'Signed in anonymously as Guest Student'
                      : `Signed in as ${currentUser?.email}`
                    : 'Running in frictionless student session'}
                </p>
              </div>
            </div>

            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<LogIn className="w-3.5 h-3.5" />}
                onClick={() => signInAnonymously()}
              >
                Anonymous Sign In
              </Button>
            )}
          </div>
        </Card>

        {/* Campus Access Control Section */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Campus Access Session</h4>
                <p className="text-xs text-slate-500">
                  Controls access to live {campusShortName || 'MAIT'} canteen prices and daily availability.
                </p>
              </div>
            </div>

            {isVerified ? (
              <Button variant="danger" size="sm" onClick={revokeCampus}>
                Revoke Access
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => verifyCampus('mait')}>
                Verify (Demo)
              </Button>
            )}
          </div>
        </Card>

        {/* Notifications Setting */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Smart Swap Alerts</h4>
                <p className="text-xs text-slate-500">
                  Notify when healthier or cheaper canteen specials are ready at lunch.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Eco & Carbon Tips</h4>
                <p className="text-xs text-slate-500">
                  Weekly summary of food choices and ecological impact.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={ecoTipsEnabled}
              onChange={(e) => setEcoTipsEnabled(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Privacy & Data Governance</h4>
                <p className="text-xs text-slate-500">
                  Zero commercial tracking. Food telemetry is used strictly for nutritional & ecological analytics.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Protected
            </span>
          </div>
        </Card>

        {/* Switch Portal Role */}
        <Link
          to="/"
          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                  Switch Portal Role
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Student / Manager
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Return to the role selection landing screen to switch between Student and Manager portals.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>

        {/* About EcoBite & Architecture */}
        <Link
          to="/context"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                About EcoBite AI & Architecture
              </h4>
              <p className="text-xs text-slate-500">
                Review product vision, multi-campus database principles, and Gemini AI boundaries.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 space-y-1 pt-4">
        <div>EcoBite AI Prototype • Version 1.0.0 (Firebase Platform Foundation)</div>
        <div>Pilot Campus: Maharaja Agrasen Institute of Technology (MAIT)</div>
      </div>
    </div>
  );
};
