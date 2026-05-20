import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
    ArrowLeft, Star, MapPin, CheckCircle, ShieldCheck,
    CalendarDays, Users, BedDouble, TicketPercent,
    ChevronDown, Gift,
    UtensilsCrossed, Baby, UserRound, Plus, Minus,
} from 'lucide-react';
import { hotels, coupons } from '../../data/mockData';
import { validateCoupon, calculateDiscount } from '../../utils/couponUtils';
import { getCurrentUser, addUserBooking } from '../../utils/authUtils';

const MEAL_OPTIONS = [
    { key: 'none',      label: 'No Meals',     emoji: '🚫', price: 0,    desc: 'Meals not included' },
    { key: 'breakfast', label: 'Breakfast',     emoji: '🍳', price: 500,  desc: '₹500/night' },
    { key: 'lunch',     label: 'Lunch',         emoji: '🍱', price: 700,  desc: '₹700/night' },
    { key: 'dinner',    label: 'Dinner',        emoji: '🍽️', price: 800,  desc: '₹800/night' },
    { key: 'allDay',    label: 'All Meals',     emoji: '🌟', price: 1500, desc: '₹1,500/night' },
];

const Counter = ({ label, icon: Icon, value, onInc, onDec, min = 0, iconColor = 'text-blue-600' }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
            <Icon size={18} className={iconColor} />
            <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        <div className="flex items-center space-x-3">
            <button
                type="button"
                onClick={onDec}
                disabled={value <= min}
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <Minus size={14} />
            </button>
            <span className="w-6 text-center font-bold text-slate-900">{value}</span>
            <button
                type="button"
                onClick={onInc}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
                <Plus size={14} />
            </button>
        </div>
    </div>
);

import PaymentModal from '../../components/features/PaymentModal';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const hotel = hotels.find((h) => String(h.id) === id);
    const bookingSelection = location.state || {};
    const user = getCurrentUser();

    const isPastDateOnly = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (!Number.isFinite(d.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [selectedMeals, setSelectedMeals] = useState([]); // ['breakfast','lunch','dinner']
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const applyCoupon = () => {
        const code = couponCode.toUpperCase().trim();
        const validation = validateCoupon(code, 'hotel', coupons);
        if (validation.valid) { setAppliedCoupon(validation.coupon); setCouponError(''); }
        else { setCouponError(validation.error); setAppliedCoupon(null); }
    };

    const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

    if (!hotel) return null;

    const nights = bookingSelection.nights || 1;
    const rooms = bookingSelection.rooms || 1;
    const guests = adults + children;
    const invalidCheckIn = isPastDateOnly(bookingSelection.checkIn);

    // Pricing
    const basePrice = hotel.price * nights * rooms;
    const mealKeys = selectedMeals;
    const mealPricePerPerson = mealKeys.reduce((sum, k) => sum + (MEAL_OPTIONS.find(m => m.key === k)?.price || 0), 0);
    const adultMealPrice = mealPricePerPerson * nights * rooms * adults;
    const childMealPrice = Math.round(mealPricePerPerson * nights * rooms * children * 0.5);
    const totalMealPrice = adultMealPrice + childMealPrice;
    const subtotal = basePrice + totalMealPrice;

    const mealLabel = selectedMeals.length === 0 ? '' : selectedMeals.map((k) => {
        const m = MEAL_OPTIONS.find(x => x.key === k);
        return m?.label || k;
    }).join(' + ');
    const taxAmount = Math.round(subtotal * 0.18);
    const discountAmount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0;
    const totalAmount = Math.round(subtotal + taxAmount - discountAmount);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login first (top right) to confirm booking.');
            return;
        }
        if (invalidCheckIn) {
            alert('Past check-in dates are not allowed. Please select today or a future date.');
            return;
        }
        setShowPayment(true);
    };

    const handlePaymentSuccess = (method) => {
        setIsSubmitting(true);
        const bookingId = `BK-${Math.floor(Math.random() * 10000)}`;
        const paymentMethod =
            method === 'cash' ? 'Pay at Hotel'
            : method === 'upi' ? 'UPI'
            : method === 'card' ? 'Card'
            : method === 'wallet' ? 'Wallet'
            : 'Card';
        const paymentStatus = method === 'cash' ? 'Pending' : 'Paid';

        // Save to user-specific storage
        const newBooking = {
            id: bookingId,
            type: 'hotel',
            name: hotel.name,
            date: `${bookingSelection.checkIn || 'Check-in'} to ${bookingSelection.checkOut || 'Check-out'}`,
            status: method === 'cash' ? 'Payment Pending' : 'Confirmed',
            price: totalAmount
        };
        addUserBooking(newBooking);

        setTimeout(() => {
            navigate('/booking-confirmation', {
                state: { bookingId, hotel, details: { ...formData, paymentMethod }, paymentStatus, dates: `${bookingSelection.checkIn || 'Check-in'} to ${bookingSelection.checkOut || 'Check-out'}`, totalAmount }
            });
        }, 500);
    };

    return (
        <div className="min-h-screen pt-20 pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-100">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Hotel
                </button>

                <div className="mb-7 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Confirm Your Booking</h1>
                            <p className="text-sm text-slate-500 mt-2">Secure checkout with transparent pricing and instant confirmation.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-semibold">
                                <CalendarDays size={14} className="mr-1.5" />
                                {bookingSelection.checkIn || 'Check-in'} to {bookingSelection.checkOut || 'Check-out'}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-semibold">
                                <Users size={14} className="mr-1.5" />
                                {guests} Guests
                            </span>
                            <span className="inline-flex items-center rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 text-xs font-semibold">
                                <BedDouble size={14} className="mr-1.5" />
                                {rooms} Room{rooms > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Form */}
                    <section className="lg:col-span-2 space-y-6">
                        {/* Guest Count */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <Users size={20} className="mr-2 text-blue-600" />
                                Guest Count
                            </h2>
                            <div className="divide-y divide-slate-100">
                                <Counter
                                    label="Adults"
                                    icon={UserRound}
                                    iconColor="text-blue-600"
                                    value={adults}
                                    min={1}
                                    onInc={() => setAdults(a => a + 1)}
                                    onDec={() => setAdults(a => Math.max(1, a - 1))}
                                />
                                <Counter
                                    label="Children (under 12)"
                                    icon={Baby}
                                    iconColor="text-pink-500"
                                    value={children}
                                    min={0}
                                    onInc={() => setChildren(c => c + 1)}
                                    onDec={() => setChildren(c => Math.max(0, c - 1))}
                                />
                            </div>
                        </div>

                        {/* Meal Plan */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <UtensilsCrossed size={20} className="mr-2 text-orange-500" />
                                Meal Plan
                                <span className="ml-2 text-xs font-normal text-slate-500">(price adjusts automatically)</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {MEAL_OPTIONS.map((opt) => {
                                    const active = opt.key === 'none'
                                        ? selectedMeals.length === 0
                                        : opt.key === 'allDay'
                                            ? ['breakfast', 'lunch', 'dinner'].every(k => selectedMeals.includes(k))
                                            : selectedMeals.includes(opt.key);

                                    const handleClick = () => {
                                        if (opt.key === 'none') {
                                            setSelectedMeals([]);
                                            return;
                                        }
                                        if (opt.key === 'allDay') {
                                            const all = ['breakfast', 'lunch', 'dinner'];
                                            const alreadyAll = all.every(k => selectedMeals.includes(k));
                                            setSelectedMeals(alreadyAll ? [] : all);
                                            return;
                                        }
                                        setSelectedMeals(prev => prev.includes(opt.key) ? prev.filter(k => k !== opt.key) : [...prev, opt.key]);
                                    };

                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={handleClick}
                                            className={`text-left p-4 rounded-xl border-2 transition-all ${active
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <span className="text-2xl">{opt.emoji}</span>
                                            <p className="font-bold text-slate-900 text-sm mt-1">{opt.label}</p>
                                            <p className="text-xs text-slate-500">{opt.desc}</p>
                                            {opt.price > 0 && opt.key !== 'allDay' && (
                                                <p className="text-xs text-orange-600 font-semibold mt-1">
                                                    +₹{opt.price} × {nights} night{nights > 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Guest Details Form */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Guest Details</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                        <input
                                            required type="text"
                                            maxLength={40}
                                            pattern=".*[A-Za-z].*"
                                            onInvalid={(e) => e.target.setCustomValidity('must use an alphabet')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 40) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                        <input
                                            required type="email"
                                            inputMode="email"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                        <input
                                            required type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            pattern="[6-9][0-9]{9}"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || invalidCheckIn}
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {isSubmitting ? 'Processing...' : `Pay & Confirm — ₹${totalAmount.toLocaleString()}`}
                                    </button>
                                    {invalidCheckIn && (
                                        <p className="mt-3 text-xs text-red-600 font-semibold text-center">
                                            No booking allowed for past check-in date ({bookingSelection.checkIn}).
                                        </p>
                                    )}
                                    <div className="mt-4 flex items-center justify-center text-xs text-slate-500">
                                        <ShieldCheck size={14} className="mr-1 text-green-500" />
                                        Secure Payment Encrypted
                                    </div>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* Sidebar Summary */}
                    <aside className="lg:col-span-1">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 sticky top-24 shadow-sm space-y-4">
                            <h3 className="text-slate-900 font-bold text-lg">Booking Summary</h3>

                            <div className="flex gap-3">
                                <img src={hotel.image} alt={hotel.name} className="w-24 h-24 rounded-xl object-cover border border-slate-200" onError={e => e.target.style.display='none'} />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-base leading-tight">{hotel.name}</h4>
                                    <div className="flex items-center text-xs text-slate-500 mt-1">
                                        <MapPin size={12} className="mr-1" />{hotel.location}
                                    </div>
                                    <div className="flex items-center text-xs text-amber-500 mt-1.5 font-bold">
                                        <Star size={10} className="mr-1 fill-amber-500" />{hotel.rating}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                                <p className="font-semibold text-slate-700">Trip Snapshot</p>
                                <p>{bookingSelection.checkIn || 'N/A'} → {bookingSelection.checkOut || 'N/A'}</p>
                                <p>{nights} night{nights > 1 ? 's' : ''} · {adults} adult{adults > 1 ? 's' : ''}{children > 0 ? ` · ${children} child${children > 1 ? 'ren' : ''}` : ''} · {rooms} room{rooms > 1 ? 's' : ''}</p>
                                {selectedMeals.length > 0 && (
                                    <p className="text-orange-600 font-semibold">
                                        Meals: {selectedMeals.includes('breakfast') ? 'Breakfast' : ''}
                                        {selectedMeals.includes('lunch') ? `${selectedMeals.includes('breakfast') ? ' + ' : ''}Lunch` : ''}
                                        {selectedMeals.includes('dinner') ? `${(selectedMeals.includes('breakfast') || selectedMeals.includes('lunch')) ? ' + ' : ''}Dinner` : ''}
                                    </p>
                                )}
                            </div>

                            {/* Coupon */}
                            <div className="border-t border-slate-200 pt-4">
                                {!appliedCoupon ? (
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center">
                                            <TicketPercent size={13} className="mr-1" />Have a coupon?
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text" value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter code"
                                                className="flex-1 min-w-0 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button type="button" onClick={applyCoupon}
                                                className="shrink-0 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CheckCircle size={16} className="text-green-600 mr-2" />
                                            <div>
                                                <p className="text-xs font-bold text-green-900">{appliedCoupon.code} Applied</p>
                                                <p className="text-xs text-green-700">{appliedCoupon.description}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={removeCoupon} className="text-xs text-red-600 hover:text-red-700 font-semibold">Remove</button>
                                    </div>
                                )}
                            </div>

                            {/* Available Coupons */}
                            <div className="border-t border-slate-200 pt-4">
                                <button type="button" onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                                    <span className="flex items-center"><Gift size={13} className="mr-1.5" />Available Coupons</span>
                                    <ChevronDown size={14} className={`transition-transform ${showAvailableCoupons ? 'rotate-180' : ''}`} />
                                </button>
                                {showAvailableCoupons && (
                                    <div className="mt-3 space-y-2.5">
                                        {Object.values(coupons).map((coupon) => (
                                            <button
                                                key={coupon.code}
                                                type="button"
                                                onClick={() => { setCouponCode(coupon.code); }}
                                                className="w-full text-left bg-amber-50 border border-amber-200 rounded-lg p-3 hover:bg-amber-100 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <div>
                                                        <p className="text-xs font-bold text-amber-900">{coupon.code}</p>
                                                        <p className="text-xs text-amber-700">{coupon.description}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                                                        {coupon.type === 'percentage' ? `${(coupon.discount * 100).toFixed(0)}%` : `₹${coupon.discount}`}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-amber-500">Tap to apply →</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t border-slate-200 pt-4 space-y-2.5 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Room ({nights}n × {rooms} room)</span>
                                    <span>₹{basePrice.toLocaleString()}</span>
                                </div>
                                {totalMealPrice > 0 && (
                                    <div className="flex justify-between text-orange-600">
                                        <span>{mealLabel} × {nights}n</span>
                                        <span>+₹{totalMealPrice.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600">
                                    <span>Taxes (18%)</span>
                                    <span>₹{taxAmount.toLocaleString()}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600 font-semibold">
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <span>-₹{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-slate-900 text-lg">
                                <span>Total Amount</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            
            <PaymentModal 
                isOpen={showPayment} 
                onClose={() => setShowPayment(false)} 
                onPaymentSuccess={handlePaymentSuccess} 
                amount={totalAmount} 
                itemType="Hotel Stay" 
                includeCash
                cashLabel="Pay at Hotel"
            />
        </div>
    );
};

export default BookingPage;
