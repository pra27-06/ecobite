import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  ChefHat, 
  Bell, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { orderService } from '../services/orderService';
import type { OrderRequestDoc, OrderRequestStatus } from '../types';

export const StudentOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRequestDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to student's live order queue
    const unsubscribe = orderService.subscribeToStudentOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const formatOrderTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const getStatusBadge = (status: OrderRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            PENDING — Sent to Canteen
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
            <ChefHat className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
            PREPARING — Kitchen Preparing
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-md shadow-emerald-700/20 animate-pulse">
            <Bell className="w-3.5 h-3.5 text-white" />
            READY FOR COLLECTION
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="My Campus Pre-Orders"
        description="Real-time preparation queue tracking for your campus meals. Reduces cafeteria line friction."
        badge={
          <Badge variant="emerald" size="md">
            Live Queue Tracker
          </Badge>
        }
        showBackButton
      />

      {/* Ground Truth & Prototype Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-800">Operational Pre-Order Queue: </span>
          <span>
            EcoBite sends preparation signals directly to canteen staff to minimize cafeteria waiting times. Payment is handled at the counter per standard campus guidelines.
          </span>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your pre-orders...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-extrabold text-slate-900 text-base">
              No Active Pre-Orders Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When you pre-order a dish from the campus menu, you can track preparation progress and counter collection readiness here.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/campus">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Browse Campus Menu
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Pre-Orders ({orders.length})
            </h3>
            <span className="text-xs text-slate-400">Auto-updating in real-time</span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => {
              const isReady = order.status === 'READY';
              return (
                <div
                  key={order.orderId}
                  className={`p-5 rounded-3xl border transition-all ${
                    isReady
                      ? 'bg-gradient-to-r from-emerald-50/90 via-white to-white border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                        #{order.orderId}
                      </span>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.canteenName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-normal">{order.campusId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatOrderTime(order.createdAt)}</span>
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Ready for collection announcement banner */}
                  {isReady && (
                    <div className="my-3 p-3 rounded-2xl bg-emerald-600 text-white flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-5 h-5 shrink-0 animate-bounce" />
                        <span className="text-xs font-black tracking-wide">
                          Your order is ready! Please collect your meal at the {order.canteenName} counter.
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase shrink-0">
                        Show #{order.orderId}
                      </span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="pt-3 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="text-slate-400 font-medium">× {item.quantity}</span>
                        </div>
                        <span className="font-black text-slate-800">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Total Estimated:</span>
                      <span className="font-black text-slate-900 text-sm">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Status Progression Stepper */}
                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="space-y-1">
                        <div className="h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-700 block">Requested</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            order.status === 'PREPARING' || order.status === 'READY' || order.status === 'COMPLETED'
                              ? 'bg-indigo-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold block ${
                            order.status === 'PREPARING' ? 'text-indigo-600 font-black' : 'text-slate-400'
                          }`}
                        >
                          Preparing
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            order.status === 'READY' || order.status === 'COMPLETED'
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold block ${
                            order.status === 'READY' ? 'text-emerald-600 font-black animate-pulse' : 'text-slate-400'
                          }`}
                        >
                          Ready
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            order.status === 'COMPLETED' ? 'bg-slate-600' : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold block ${
                            order.status === 'COMPLETED' ? 'text-slate-700 font-black' : 'text-slate-400'
                          }`}
                        >
                          Collected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
