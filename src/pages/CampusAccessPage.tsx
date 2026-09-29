import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Building, 
  LogOut, 
  Info, 
  Lock, 
  Search, 
  Store, 
  Check
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useCampus } from '../hooks/useCampusAccess';
import { MAIT_CANTEENS_DOCS } from '../data/maitMenuData';
import { menuService } from '../services/menuService';
import type { MenuItemDoc } from '../types';

export const CampusAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { isVerified, campusName, city, verifyCampus, revokeCampus } = useCampus();
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [campusMenuItems, setCampusMenuItems] = useState<MenuItemDoc[]>([]);

  useEffect(() => {
    if (isVerified) {
      menuService.getCampusMenu('MAIT', true).then((res) => {
        if (res.success && res.data) {
          setCampusMenuItems(res.data);
        }
      });
    } else {
      setCampusMenuItems([]);
    }
  }, [isVerified]);

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      verifyCampus('mait');
      setIsSimulatingScan(false);
    }, 600);
  };

  // Extract unique categories for MAIT items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    campusMenuItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return ['all', ...Array.from(cats)];
  }, [campusMenuItems]);

  // Filter menu items by canteen, category, and search query
  const filteredItems = useMemo(() => {
    return campusMenuItems.filter((item) => {
      const matchesCanteen = selectedCanteenId === 'all' || item.canteenId === selectedCanteenId;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = 
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCanteen && matchesCategory && matchesSearch;
    });
  }, [campusMenuItems, selectedCanteenId, selectedCategory, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Campus Access & Verification"
        description="Scan your campus's official EcoBite QR to unlock verified campus food data."
        badge={
          <Badge variant={isVerified ? 'emerald' : 'amber'} size="md">
            {isVerified ? `MAIT Campus — Verified` : 'General Public Mode'}
          </Badge>
        }
        showBackButton
      />

      {/* Main Status & Action Card */}
      {isVerified ? (
        /* Verified State Card */
        <Card variant="accent" padding="lg" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-700/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm">
                    Verified Campus
                  </Badge>
                  <span className="text-xs text-slate-400">QR Session Active</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {campusName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {city}, India • Pilot College Ground Truth
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/search')}
              >
                Scan / Search Food
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                onClick={revokeCampus}
              >
                Leave Campus / Revoke Access
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/80 border border-emerald-100">
              <span className="block text-slate-400 text-[10px] font-bold uppercase">4 Official Stalls</span>
              <span className="font-semibold text-slate-800">Amul, Food Mast, Juice, Nescafé</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-emerald-100">
              <span className="block text-slate-400 text-[10px] font-bold uppercase">Pricing State</span>
              <span className="font-semibold text-emerald-700">75+ Ground-Truth Dishes Verified</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-emerald-100">
              <span className="block text-slate-400 text-[10px] font-bold uppercase">Smart Swaps</span>
              <span className="font-semibold text-slate-800">Bounded to MAIT Menu</span>
            </div>
          </div>
        </Card>
      ) : (
        /* Not Verified State Card */
        <Card variant="highlight" padding="lg" className="space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <Badge variant="amber" size="md">
              Current Status: Not Verified
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Unlock Your Campus Canteen
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are currently viewing general national food intelligence. To see real canteen prices, stall menus, and campus Smart Swaps, verify your physical campus access.
            </p>
          </div>

          {/* Verification CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<QrCode className="w-5 h-5" />}
              isLoading={isSimulatingScan}
              onClick={handleSimulateScan}
            >
              Scan Official Campus QR
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            (Demo Action: Clicking the button above simulates scanning the official MAIT QR code poster stationed at the canteen).
          </p>

          {/* Preview of locked canteens */}
          <div className="pt-6 border-t border-amber-200/60 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Protected Campus Stalls (Prices Locked)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MAIT_CANTEENS_DOCS.map((canteen) => (
                <div
                  key={canteen.canteenId}
                  className="p-3.5 rounded-xl bg-white/70 border border-amber-100 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-sm">{canteen.name}</span>
                    <span className="block text-[11px] text-slate-500">{canteen.location}</span>
                  </div>
                  <Badge variant="amber" size="sm">
                    Locked
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* VERIFIED CAMPUS MENU EXPLORER */}
      {isVerified && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>MAIT Official Canteen Catalog</span>
              </h2>
              <p className="text-xs text-slate-500">
                Authentic prices extracted directly from on-site menu board photos. Zero hallucinated numbers.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
              {filteredItems.length} items shown
            </span>
          </div>

          {/* Canteen Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCanteenId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                selectedCanteenId === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Stalls ({campusMenuItems.length})
            </button>
            {MAIT_CANTEENS_DOCS.map((canteen) => (
              <button
                key={canteen.canteenId}
                onClick={() => setSelectedCanteenId(canteen.canteenId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  selectedCanteenId === canteen.canteenId
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {canteen.name}
              </button>
            ))}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search canteen dishes (e.g. patties, maggi, juice, chawal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-100 text-emerald-900 font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => {
              const canteen = MAIT_CANTEENS_DOCS.find((c) => c.canteenId === item.canteenId);
              return (
                <div
                  key={item.menuItemId}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {canteen?.name || item.canteenId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {item.name}
                    </h4>

                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {item.variants ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-medium">Sizes:</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            {Object.entries(item.variants).map(([size, price]) => (
                              <span key={size} className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                {size[0]}: ₹{price}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Authentic Price</span>
                          <span className="text-base font-black text-slate-900">₹{item.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <Check className="w-2.5 h-2.5" />
                        Photo Verified
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">No dishes match your filter</h4>
              <p className="text-xs text-slate-400">
                Try selecting "All Stalls" or clearing the search keyword.
              </p>
            </div>
          )}
        </section>
      )}

      {/* QR Architecture Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md" className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <h3>How Campus QR Works</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your campus QR identifies the campus. It does <strong>not</strong> store the entire menu or price list inside the QR code. Scanning the QR safely authenticates your campus identity and tells EcoBite to fetch the latest verified documents from Cloud Firestore.
          </p>
        </Card>

        <Card padding="md" className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Building className="w-4 h-4 text-emerald-600" />
            <h3>Multi-Campus Ready Architecture</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Selecting a college from a public dropdown does not grant access. For this hackathon prototype, <strong>MAIT</strong> is the only active campus with authentic records. Additional campuses (DTU, NSUT) will be onboarded cleanly without frontend code modifications.
          </p>
        </Card>
      </div>

      {/* Verification Card Visual Specimen */}
      <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Campus Poster QR Code Specimen</span>
          </div>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">
            ID: MAIT-MAIN-CANTEEN-2026
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Physical posters stationed inside college dining halls provide students a single scan point. This guarantees that campus pricing remains exclusive to enrolled students physically on premises.
        </p>
      </div>
    </div>
  );
};
