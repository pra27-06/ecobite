import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Minus 
} from 'lucide-react';
import { Button } from './Button';
import { orderService } from '../services/orderService';
import type { MenuItemDoc, OrderRequestDoc } from '../types';
import { MAIT_CANTEENS_DOCS } from '../data/maitMenuData';

export interface OrderIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItemDoc | null;
  campusId: string;
  isCampusVerified: boolean;
  onOrderSuccess?: (order: OrderRequestDoc) => void;
}

export const OrderIntentModal: React.FC<OrderIntentModalProps> = ({
  isOpen,
  onClose,
  item,
  campusId,
  isCampusVerified,
  onOrderSuccess,
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderRequestDoc | null>(null);

  if (!isOpen || !item) return null;

  const foundCanteen = MAIT_CANTEENS_DOCS.find((c) => c.canteenId === item.canteenId);
  const canteenName = foundCanteen?.name || item.canteenId || 'Campus Canteen';
  const unitPrice = item.price !== null && item.price !== undefined ? item.price : 0;
  const totalPrice = unitPrice * quantity;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await orderService.createOrder({
        campusId,
        isCampusVerified,
        canteenId: item.canteenId,
        items: [
          {
            menuItemId: item.menuItemId,
            name: item.name,
            quantity,
          },
        ],
      });

      if (res.success && res.data) {
        setCreatedOrder(res.data);
        if (onOrderSuccess) {
          onOrderSuccess(res.data);
        }
      } else {
        setErrorMessage(res.error || 'Failed to send order request. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error sending order.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setQuantity(1);
    setErrorMessage(null);
    setCreatedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* State 1: Unverified Campus Guardrail */}
        {!isCampusVerified ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Campus Verification Required
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Scan/open your college campus access link to place a campus order.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  handleModalClose();
                  navigate('/campus');
                }}
              >
                Access Campus Menu
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500"
                onClick={handleModalClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : createdOrder ? (
          /* State 2: Order Confirmed Success Screen */
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Order Queued
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Order request sent to the canteen.
              </h3>
              <p className="text-xs text-slate-500">
                Your order is now in the live canteen preparation queue.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Order Reference:</span>
                <span className="font-mono font-black text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  #{createdOrder.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Item:</span>
                <span className="font-bold text-slate-800">
                  {createdOrder.items[0]?.name} × {createdOrder.items[0]?.quantity}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Canteen Stall:</span>
                <span className="font-semibold text-slate-700">{createdOrder.canteenName}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500">Total Price:</span>
                <span className="font-black text-slate-900">₹{createdOrder.totalAmount}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  handleModalClose();
                  navigate('/orders');
                }}
              >
                View in My Orders
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-slate-600"
                onClick={handleModalClose}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* State 3: Order Confirmation Form */
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Confirm Your Order
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Store className="w-3 h-3 text-slate-400" />
                  <span>{canteenName} • {campusId}</span>
                </p>
              </div>
            </div>

            {/* Item Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <span className="text-[11px] text-slate-500 capitalize">{item.category}</span>
                </div>
                <span className="font-black text-slate-900 text-base">
                  ₹{unitPrice}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Quantity:</span>
                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isSubmitting}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-bold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10 || isSubmitting}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  Estimated Total:
                </span>
                <span className="text-base font-black text-emerald-700">
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            {/* Required Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Campus pre-order request: </strong>
                This sends a preparation signal to the canteen queue to reduce counter crowding. Payment is not included in this prototype.
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isSubmitting}
                className="flex-1 justify-center text-xs"
                onClick={handleModalClose}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                onClick={handleConfirmOrder}
              >
                {isSubmitting ? 'Sending order...' : 'Confirm Order'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
