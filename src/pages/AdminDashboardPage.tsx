import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  Tag, 
  AlertCircle,
  Store,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { menuService } from '../services/menuService';
import { MAIT_CANTEENS_DOCS } from '../data/maitMenuData';
import type { MenuItemDoc } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { userDoc, setSimulatedRole } = useAuth();

  const isMaitAdmin = userDoc?.role === 'campus_admin' && userDoc?.campusId === 'MAIT';

  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItemDoc[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<MenuItemDoc | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editSource, setEditSource] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Item Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCanteenId, setNewCanteenId] = useState('amul-shop');
  const [newCategory, setNewCategory] = useState('Snacks');
  const [newPrice, setNewPrice] = useState<number>(30);
  const [newDesc, setNewDesc] = useState('');

  const loadMenu = async () => {
    if (!isMaitAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await menuService.getAdminCampusMenu('MAIT', true);
    setIsLoading(false);
    if (res.success && res.data) {
      setMenuItems(res.data);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [isMaitAdmin]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((i) => i.category && set.add(i.category));
    return ['all', ...Array.from(set)];
  }, [menuItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCanteen = selectedCanteen === 'all' || item.canteenId === selectedCanteen;
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCanteen && matchCat && matchQuery;
    });
  }, [menuItems, selectedCanteen, selectedCategory, searchQuery]);

  // Handle open edit modal
  const handleOpenEdit = (item: MenuItemDoc) => {
    setEditingItem(item);
    setEditPrice(item.price ?? 50);
    setEditAvailable(item.available);
    setEditCategory(item.category);
    setEditSource(item.source || 'MAIT menu board physical audit');
    setFeedbackMsg(null);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (editPrice < 0) {
      setFeedbackMsg({ type: 'error', text: 'Price cannot be negative.' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    const oldPrice = editingItem.price;

    const res = await menuService.updateMenuItem(
      editingItem.menuItemId,
      {
        price: editPrice,
        available: editAvailable,
        category: editCategory,
        source: editSource,
      },
      'MAIT',
      true
    );

    setIsSaving(false);

    if (res.success && res.data) {
      setFeedbackMsg({
        type: 'success',
        text: `✓ Saved in Firestore: ${editingItem.name} price changed from ₹${oldPrice} to ₹${editPrice}. Students now see this live price.`,
      });
      setEditingItem(null);
      // Reload menu
      loadMenu();
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to update menu item.',
      });
    }
  };

  // Handle create new dish
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSaving(true);
    const res = await menuService.addMenuItem(
      {
        campusId: 'MAIT',
        canteenId: newCanteenId,
        name: newName.trim(),
        category: newCategory,
        price: Number(newPrice),
        available: true,
        description: newDesc.trim() || 'Prepared fresh on campus counters.',
        verified: true,
        source: 'MAIT dining staff addition',
      },
      'MAIT',
      true
    );

    setIsSaving(false);

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `✓ Added new dish "${newName}" to ${newCanteenId} at ₹${newPrice}.`,
      });
      setIsAdding(false);
      setNewName('');
      setNewDesc('');
      loadMenu();
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to create menu item.',
      });
    }
  };

  // 1. ACCESS DENIED SCREEN IF NOT AN AUTHORIZED CAMPUS ADMIN
  if (!isMaitAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <PageHeader
          title="Campus Admin Portal"
          description="Institution management interface for dining operations."
          badge={<Badge variant="rose" size="md">Restricted Access</Badge>}
          showBackButton
        />

        <Card padding="lg" className="text-center space-y-5 border-rose-200">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <Badge variant="rose" size="md">
              Access Denied: 403 Forbidden
            </Badge>
            <h2 className="text-xl font-black text-slate-900">
              Campus Administrator Authorization Required
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This dashboard is strictly protected by Firestore security rules. Regular student accounts cannot view admin controls, edit menu items, change prices, or modify campus availability.
            </p>
          </div>

          {/* Hackathon Evaluator Role Switcher */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Evaluator Demo Switch</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              To test the admin pricing workflow (e.g. changing <em>Paneer Sandwich</em> from <strong>₹30 to ₹35</strong> and seeing it propagate immediately to student views), switch your local session to an authorized MAIT Administrator:
            </p>
            <Button
              variant="primary"
              size="md"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              onClick={() => setSimulatedRole('campus_admin', 'MAIT')}
              className="w-full sm:w-auto"
            >
              Simulate MAIT Campus Admin Role
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. AUTHORIZED CAMPUS ADMIN DASHBOARD
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Admin Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                MAIT Campus Admin Active
              </span>
              <span className="text-xs text-slate-400">PSP Area, Rohini, Delhi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Maharaja Agrasen Institute of Technology
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMenu}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-white border-slate-700 hover:bg-slate-800"
          >
            Refresh Data
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSimulatedRole('student', 'MAIT')}
          >
            Switch to Student Session
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Demo Guidance Card */}
      <Card variant="accent" padding="md" className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Interactive Admin Demo Flow</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          1. Find <strong>Paneer Sandwich</strong> (Amul Shop) below.<br />
          2. Click <strong>Edit</strong> and change price from <strong>₹30 to ₹35</strong>.<br />
          3. Click <strong>Save Changes</strong>.<br />
          4. Click <strong>"Switch to Student Session"</strong> above, navigate to Campus Access or Search, and confirm the price now reads <strong>₹35</strong> directly from Firestore without hardcoding!
        </p>
      </Card>

      {/* Stall Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MAIT_CANTEENS_DOCS.map((canteen) => {
          const count = menuItems.filter((i) => i.canteenId === canteen.canteenId).length;
          return (
            <Card
              key={canteen.canteenId}
              padding="sm"
              className={`space-y-1 cursor-pointer transition-all ${
                selectedCanteen === canteen.canteenId ? 'ring-2 ring-emerald-500 bg-emerald-50/40' : ''
              }`}
              onClick={() => setSelectedCanteen(selectedCanteen === canteen.canteenId ? 'all' : canteen.canteenId)}
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">{canteen.name}</span>
                <Store className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900">{count}</div>
              <div className="text-[10px] text-slate-400 truncate">{canteen.location}</div>
            </Card>
          );
        })}
      </div>

      {/* Search, Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MAIT dishes to edit (e.g. Paneer Sandwich, Patties, Chole Bhature)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAdding(true)}
          >
            Add New Dish
          </Button>
        </div>
      </div>

      {/* Canteen Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCanteen('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            selectedCanteen === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Stalls ({menuItems.length})
        </button>
        {MAIT_CANTEENS_DOCS.map((c) => (
          <button
            key={c.canteenId}
            onClick={() => setSelectedCanteen(c.canteenId)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              selectedCanteen === c.canteenId
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1 shrink-0">
          <Tag className="w-3 h-3 text-slate-400" /> Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors capitalize shrink-0 ${
              selectedCategory === cat
                ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table or Loading */}
      {isLoading ? (
        <LoadingState label="Synchronizing MAIT verified canteen catalog..." />
      ) : (
        <Card padding="none" className="overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Dish Name</th>
                <th className="py-3.5 px-4">Canteen Counter</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (INR)</th>
                <th className="py-3.5 px-4">Inventory State</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4">Source Audit</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const canteen = MAIT_CANTEENS_DOCS.find((c) => c.canteenId === item.canteenId);
                return (
                  <tr key={item.menuItemId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                        {canteen?.name || item.canteenId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap capitalize">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900">
                        ₹{item.price}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.available ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {item.available ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Verified Base'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                      {item.source || 'MAIT menu board physical audit'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(item)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No dishes match filter</h4>
            <p className="text-xs text-slate-400">Try clearing your search query.</p>
          </div>
        )}
      </Card>
      )}

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Modify Firestore Document
                </span>
                <h3 className="text-lg font-black text-slate-900">{editingItem.name}</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Price Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Canteen Selling Price (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Changing this price will update Firestore and student menus immediately.
                </p>
              </div>

              {/* Category Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Available on Campus</span>
                  <span className="text-[10px] text-slate-400">
                    Toggling off hides item from student Smart Swap recommendations.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editAvailable}
                  onChange={(e) => setEditAvailable(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Source Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Source Verification Record</label>
                <input
                  type="text"
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSaving}
                leftIcon={<Check className="w-4 h-4" />}
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Add New Campus Dish</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa, Sprouted Chaat"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Canteen Counter</label>
                  <select
                    value={newCanteenId}
                    onChange={(e) => setNewCanteenId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    {MAIT_CANTEENS_DOCS.map((c) => (
                      <option key={c.canteenId} value={c.canteenId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Category</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button variant="outline" size="md" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" isLoading={isSaving} type="submit">
                  Create Dish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
