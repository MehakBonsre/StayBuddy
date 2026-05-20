import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { MapPin, Star, Clock, Car, X, ArrowRight, Calendar, ArrowLeft, Users, Search, ChevronDown } from 'lucide-react';
import { cabs, coupons, hotels } from '../../data/mockData';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateCoupon, calculateDiscount } from '../../utils/couponUtils';
import { haversineDistanceKm } from '../../utils/geoUtils';
import { getCurrentUser } from '../../utils/authUtils';

// Derive unique city list from hotels data as local fallback
const localCities = [...new Set(hotels.map(h => {
    const parts = h.location.split(',');
    return { city: parts[0]?.trim(), full: h.location };
}))].filter(c => c.city).slice(0, 30);

import PaymentModal from '../../components/features/PaymentModal';

const CabsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Ride states
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [pickupGeo, setPickupGeo] = useState(null); // { lat, lon, label? }
    const [dropoffGeo, setDropoffGeo] = useState(null); // { lat, lon, label? }
    const [distanceKm, setDistanceKm] = useState(null);
    const [distanceLoading, setDistanceLoading] = useState(false);
    const [rideDate, setRideDate] = useState(new Date().toISOString().split('T')[0]);
    const [rideTime, setRideTime] = useState('10:00');
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [passengerCount, setPassengerCount] = useState(1);
    const [selectedCab, setSelectedCab] = useState(null);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [showPayment, setShowPayment] = useState(false);

    // Location suggestion states
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
    const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
    const [loadingPickup, setLoadingPickup] = useState(false);
    const [loadingDropoff, setLoadingDropoff] = useState(false);

    const pickupRef = useRef(null);
    const dropoffRef = useRef(null);

    const toDateInput = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const isPastDateOnly = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (!Number.isFinite(d.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };

    const isRideDateInvalid = isPastDateOnly(rideDate);

    useEffect(() => {
        const s = location.state;
        if (!s) return;
        if (typeof s.pickup === 'string') setPickup(s.pickup);
        if (typeof s.dropoff === 'string') setDropoff(s.dropoff);
        if (typeof s.datetime === 'string' && s.datetime.includes('T')) {
            const [d, t] = s.datetime.split('T');
            if (d) setRideDate(d);
            if (t) setRideTime(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const geocodePlace = async (query) => {
        if (!query || query.trim().length < 2) return null;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1&addressdetails=1`,
                { headers: { 'User-Agent': 'StayBuddy/1.0' } }
            );
            const data = await response.json();
            if (!data || data.length === 0) return null;
            const item = data[0];
            const lat = Number(item.lat);
            const lon = Number(item.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
            return { lat, lon, label: item.display_name };
        } catch {
            return null;
        }
    };

    const ensurePickupGeo = async () => {
        if (!pickup || pickupGeo) return;
        setDistanceLoading(true);
        const geo = await geocodePlace(pickup);
        if (geo) setPickupGeo(geo);
        setDistanceLoading(false);
    };

    const ensureDropoffGeo = async () => {
        if (!dropoff || dropoffGeo) return;
        setDistanceLoading(true);
        const geo = await geocodePlace(dropoff);
        if (geo) setDropoffGeo(geo);
        setDistanceLoading(false);
    };

    // Build suggestions: filter localCities first, then optionally fetch API
    const buildLocalSuggestions = (query) => {
        if (!query || query.length < 1) {
            // Show all popular cities when empty
            return localCities.map(c => ({ name: c.city, fullAddress: c.full }));
        }
        const q = query.toLowerCase();
        return localCities
            .filter(c => c.city.toLowerCase().includes(q) || c.full.toLowerCase().includes(q))
            .map(c => ({ name: c.city, fullAddress: c.full }));
    };

    const searchLocations = async (query, isDropoff = false) => {
        const listSetter = isDropoff ? setDropoffSuggestions : setPickupSuggestions;
        const loadSetter = isDropoff ? setLoadingDropoff : setLoadingPickup;

        // Always show local matches first
        const localResults = buildLocalSuggestions(query);
        if (localResults.length > 0) {
            listSetter(localResults);
        }

        if (!query || query.length < 2) return;

        loadSetter(true);
        try {
            // Precise India-wide search (streets, shops, cities)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=10&addressdetails=1`,
                { headers: { 'User-Agent': 'StayBuddy/1.0' } }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const apiResults = data.map(item => ({
                    name: item.name || item.display_name?.split(',')[0],
                    fullAddress: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                })).filter(r => r.name);

                // Merge: localResults first, then API results not already in local
                const combined = [...localResults];
                apiResults.forEach(api => {
                    if (!combined.some(l => l.name.toLowerCase() === api.name.toLowerCase())) {
                        combined.push(api);
                    }
                });
                listSetter(combined);
            }
        } catch (err) {
            // Silently fall back to local only
        } finally {
            loadSetter(false);
        }
    };

    const handlePickupChange = (val) => {
        setPickup(val);
        setPickupGeo(null);
        setDistanceKm(null);
        searchLocations(val, false);
        if (val.length > 0) setShowPickupSuggestions(true);
    };

    const handleDropoffChange = (val) => {
        setDropoff(val);
        setDropoffGeo(null);
        setDistanceKm(null);
        searchLocations(val, true);
        if (val.length > 0) setShowDropoffSuggestions(true);
    };

    const selectPickup = async (loc) => {
        setPickup(loc.name);
        setShowPickupSuggestions(false);
        setPickupSuggestions([]);

        const lat = Number(loc.lat);
        const lon = Number(loc.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            setPickupGeo({ lat, lon, label: loc.fullAddress });
            return;
        }

        setDistanceLoading(true);
        const geo = await geocodePlace(loc.fullAddress || loc.name);
        if (geo) setPickupGeo(geo);
        setDistanceLoading(false);
    };

    const selectDropoff = async (loc) => {
        setDropoff(loc.name);
        setShowDropoffSuggestions(false);
        setDropoffSuggestions([]);

        const lat = Number(loc.lat);
        const lon = Number(loc.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            setDropoffGeo({ lat, lon, label: loc.fullAddress });
            return;
        }

        setDistanceLoading(true);
        const geo = await geocodePlace(loc.fullAddress || loc.name);
        if (geo) setDropoffGeo(geo);
        setDistanceLoading(false);
    };

    // Show popular cities on focus when empty
    const handlePickupFocus = () => {
        if (!pickup) setPickupSuggestions(buildLocalSuggestions(''));
        setShowPickupSuggestions(true);
    };

    const handleDropoffFocus = () => {
        if (!dropoff) setDropoffSuggestions(buildLocalSuggestions(''));
        setShowDropoffSuggestions(true);
    };

    useEffect(() => {
        const km = haversineDistanceKm(pickupGeo, dropoffGeo);
        setDistanceKm(km);
    }, [pickupGeo, dropoffGeo]);

    const ratePerKmByCategory = {
        Mini: 12,
        Sedan: 16,
        SUV: 20,
    };

    const drivers = [
        { name: 'Rajesh Kumar', rating: 4.8, platePrefix: 'DL', color: 'White', phone: '9876543210' },
        { name: 'Amit Sharma', rating: 4.7, platePrefix: 'HR', color: 'Silver', phone: '9898989898' },
        { name: 'Neha Verma', rating: 4.9, platePrefix: 'PB', color: 'Blue', phone: '9812345678' },
        { name: 'Sanjay Singh', rating: 4.6, platePrefix: 'UP', color: 'Black', phone: '9765432109' },
        { name: 'Priya Nair', rating: 4.8, platePrefix: 'MH', color: 'Red', phone: '9900123456' },
    ];

    const pickDriverForCab = (cabId) => {
        const randomIndex = Math.floor(Math.random() * drivers.length);
        const d = drivers[randomIndex];
        const plateNum = `${d.platePrefix} ${Math.floor(10 + Math.random() * 90)} ${String.fromCharCode(65 + (randomIndex % 26))}${String.fromCharCode(65 + ((randomIndex + 7) % 26))} ${Math.floor(1000 + Math.random() * 9000)}`;
        return { ...d, plate: plateNum, carColor: d.color };
    };

    const getEstimatedFare = (cab) => {
        if (!cab) return 0;
        const ratePerKm = ratePerKmByCategory[cab.category] ?? 15;
        if (!distanceKm || !Number.isFinite(distanceKm)) return cab.baseFare;
        return Math.round(cab.baseFare + distanceKm * ratePerKm);
    };

    const applyCoupon = () => {
        const code = couponCode.toUpperCase().trim();
        const validation = validateCoupon(code, 'cab', coupons);
        if (validation.valid) {
            setAppliedCoupon(validation.coupon);
            setCouponError('');
        } else {
            setCouponError(validation.error);
            setAppliedCoupon(null);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const confirmBooking = () => {
        const user = getCurrentUser();
        if (!user) {
            alert('Please login first (top right) to book a ride.');
            return;
        }
        if (!pickup || !dropoff || !selectedCab) {
            alert('Please select pickup, dropoff, and a cab');
            return;
        }
        if (isRideDateInvalid) {
            alert('Please select today or a future date for the ride.');
            return;
        }
        setShowPayment(true);
    };

    const handleRideSuccess = (method) => {
        const pm =
            method === 'cash' ? 'Cash'
            : method === 'upi' ? 'UPI'
            : method === 'card' ? 'Card'
            : method === 'wallet' ? 'Wallet'
            : paymentMethod;
        const paymentStatus = method === 'cash' ? 'Pending' : 'Paid';
        const subtotal = getEstimatedFare(selectedCab);
        const discountAmount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0;
        const finalFare = Math.round(subtotal - discountAmount);

        navigate('/ride-confirmation', {
            state: {
                rideId: `RIDE-${Math.floor(Math.random() * 10000)}`,
                cab: selectedCab,
                paymentMethod: pm,
                driver: pickDriverForCab(selectedCab?.id),
                pickup,
                dropoff,
                rideDate,
                rideTime,
                passengerCount,
                fare: finalFare,
                discount: discountAmount,
                coupon: appliedCoupon,
                paymentStatus,
                distanceKm: distanceKm ? Number(distanceKm.toFixed(2)) : null,
                pickupGeo,
                dropoffGeo
            }
        });
        setSelectedCab(null);
    };

    // Location Dropdown Component
    const LocationDropdown = ({ suggestions, loading, onSelect, show }) => {
        if (!show) return null;
        return (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {loading && (
                    <div className="px-4 py-2.5 text-xs text-slate-500 flex items-center space-x-2">
                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span>Searching...</span>
                    </div>
                )}
                {suggestions.length > 0 ? (
                    <>
                        {!loading && suggestions.length > 0 && (
                            <div className="px-3 py-1.5 text-xs text-slate-400 font-semibold uppercase border-b border-slate-100">
                                {suggestions[0]?.fullAddress?.includes('India') || true ? '📍 Locations' : 'Results'}
                            </div>
                        )}
                        {suggestions.map((loc, idx) => (
                            <button
                                key={idx}
                                onMouseDown={(e) => { e.preventDefault(); onSelect(loc); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b last:border-b-0 border-slate-100 flex items-start space-x-2 group transition-colors"
                            >
                                <MapPin size={13} className="text-blue-500 mt-0.5 shrink-0 group-hover:text-blue-700" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{loc.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{loc.fullAddress}</p>
                                </div>
                            </button>
                        ))}
                    </>
                ) : !loading && (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        No locations found. Try a different search.
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors group"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Book Your Ride</h1>
                        <p className="text-slate-600">Safe, comfortable, and affordable rides</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        {/* Location & Date Selection */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Where are you going?</h2>

                            {/* Pickup Location */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <MapPin size={16} className="inline mr-2 text-blue-600" />
                                    Pickup Location
                                </label>
                                <div className="relative" ref={pickupRef}>
                                    <input
                                        type="text"
                                        value={pickup}
                                        onChange={(e) => handlePickupChange(e.target.value)}
                                        onFocus={handlePickupFocus}
                                        onBlur={() => {
                                            setTimeout(() => setShowPickupSuggestions(false), 150);
                                            ensurePickupGeo();
                                        }}
                                        placeholder="Enter city or location (e.g. Goa, Mumbai)..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 pr-10"
                                    />
                                    {pickup && (
                                        <button onClick={() => { setPickup(''); setPickupGeo(null); setDistanceKm(null); setPickupSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                            <X size={16} />
                                        </button>
                                    )}
                                    <LocationDropdown
                                        suggestions={pickupSuggestions}
                                        loading={loadingPickup}
                                        onSelect={selectPickup}
                                        show={showPickupSuggestions}
                                    />
                                </div>
                            </div>

                            {/* Swap Button */}
                            <div className="flex justify-center mb-4">
                                <button
                                    onClick={() => {
                                        const t = pickup;
                                        setPickup(dropoff);
                                        setDropoff(t);
                                        const g = pickupGeo;
                                        setPickupGeo(dropoffGeo);
                                        setDropoffGeo(g);
                                    }}
                                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                                    title="Swap locations"
                                >
                                    <ArrowRight className="transform rotate-90 text-blue-600" size={20} />
                                </button>
                            </div>

                            {/* Dropoff Location */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <MapPin size={16} className="inline mr-2 text-green-600" />
                                    Dropoff Location
                                </label>
                                <div className="relative" ref={dropoffRef}>
                                    <input
                                        type="text"
                                        value={dropoff}
                                        onChange={(e) => handleDropoffChange(e.target.value)}
                                        onFocus={handleDropoffFocus}
                                        onBlur={() => {
                                            setTimeout(() => setShowDropoffSuggestions(false), 150);
                                            ensureDropoffGeo();
                                        }}
                                        placeholder="Enter city or location (e.g. Jaipur, Delhi)..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 pr-10"
                                    />
                                    {dropoff && (
                                        <button onClick={() => { setDropoff(''); setDropoffGeo(null); setDistanceKm(null); setDropoffSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                            <X size={16} />
                                        </button>
                                    )}
                                    <LocationDropdown
                                        suggestions={dropoffSuggestions}
                                        loading={loadingDropoff}
                                        onSelect={selectDropoff}
                                        show={showDropoffSuggestions}
                                    />
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Calendar size={16} className="inline mr-2 text-slate-600" />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={rideDate}
                                        onChange={(e) => setRideDate(e.target.value)}
                                        min={toDateInput(new Date())}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Clock size={16} className="inline mr-2 text-slate-600" />
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={rideTime}
                                        onChange={(e) => setRideTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                    />
                                </div>
                            </div>

                            {isRideDateInvalid && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
                                    Past dates are not allowed. Please select today or a future date.
                                </div>
                            )}

                            {/* Passenger Count */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <Users size={16} className="inline mr-2 text-slate-600" />
                                    Number of Passengers
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[1, 2, 3, 4].map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => setPassengerCount(count)}
                                            className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all border flex items-center justify-center ${passengerCount === count
                                                ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Users size={14} className="mr-1" />
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cab Selection */}
                        {pickup && dropoff && !isRideDateInvalid && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Select Your Ride</h2>
                                <div className="space-y-4">
                                    {['Mini', 'Sedan', 'SUV'].map((category) => {
                                        const categoryCabs = cabs.filter(cab => cab.category === category);
                                        if (categoryCabs.length === 0) return null;
                                        return (
                                            <div key={category}>
                                                <h3 className="text-sm font-bold text-slate-600 uppercase mb-3 px-3 py-2 border-l-4 border-blue-600">
                                                    {category} Cabs
                                                </h3>
                                                <div className="space-y-3">
                                                    {categoryCabs.map((cab) => (
                                                        <motion.button
                                                            key={cab.id}
                                                            onClick={() => setSelectedCab(cab)}
                                                            whileHover={{ scale: 1.02 }}
                                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedCab?.id === cab.id
                                                                ? 'border-blue-600 bg-blue-50'
                                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <img
                                                                        src={cab.image}
                                                                        alt={cab.type}
                                                                        referrerPolicy="no-referrer"
                                                                        className="w-16 h-12 object-cover rounded-lg"
                                                                        onError={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70"%3E%3Crect fill="%23e5e7eb" width="100" height="70"/%3E%3Ctext x="50" y="35" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ECar%3C/text%3E%3C/svg%3E'}
                                                                    />
                                                                    <div>
                                                                        <p className="font-bold text-slate-900">{cab.type}</p>
                                                                        <p className="text-xs text-slate-500">{cab.desc}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-lg font-bold text-slate-900">₹{getEstimatedFare(cab)}</p>
                                                                    <p className="text-xs text-slate-500">
                                                                        {distanceKm ? `~${distanceKm.toFixed(1)} km` : (distanceLoading ? 'Calculating…' : 'Base Fare')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Booking Details</h3>

                            {/* Route Summary */}
                            <div className="mb-4 pb-4 border-b border-slate-200">
                                <div className="flex items-start gap-2 mb-3">
                                    <MapPin size={14} className="text-blue-600 mt-1 shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-xs text-slate-500 mb-0.5">Pickup</p>
                                        <p className="font-semibold text-slate-900">{pickup || 'Not selected'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={14} className="text-green-600 mt-1 shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-xs text-slate-500 mb-0.5">Dropoff</p>
                                        <p className="font-semibold text-slate-900">{dropoff || 'Not selected'}</p>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                                    <span>Distance</span>
                                    <span className="font-semibold text-slate-700">
                                        {distanceKm ? `${distanceKm.toFixed(1)} km` : (distanceLoading ? 'Calculating…' : '—')}
                                    </span>
                                </div>
                            </div>

                            {/* Date & Time Summary */}
                            <div className="mb-4 pb-4 border-b border-slate-200 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Date:</span>
                                    <span className="font-semibold text-slate-900">{new Date(rideDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Time:</span>
                                    <span className="font-semibold text-slate-900">{rideTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Passengers:</span>
                                    <span className="font-semibold text-slate-900 flex items-center">
                                        <Users size={14} className="mr-1" />{passengerCount}
                                    </span>
                                </div>
                            </div>

                            {/* Cab Selection Summary */}
                            {selectedCab && (
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <p className="text-xs text-slate-500 mb-2">Selected Cab</p>
                                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{selectedCab.type}</p>
                                            <p className="text-xs text-slate-600">{selectedCab.desc}</p>
                                        </div>
                                        <p className="text-lg font-bold text-blue-600">₹{getEstimatedFare(selectedCab)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Coupon Section */}
                            <div className="mb-4 pb-4 border-b border-slate-200">
                                {!appliedCoupon ? (
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 mb-2 block">Have a coupon?</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter code"
                                                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={applyCoupon}
                                                className="bg-blue-600 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-xs font-bold text-green-900">{appliedCoupon.code} Applied ✓</p>
                                        <p className="text-xs text-green-700 mt-1">{appliedCoupon.description}</p>
                                        <button onClick={removeCoupon} className="text-xs text-red-600 hover:text-red-700 font-semibold mt-2">
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            {selectedCab && (() => {
                                const subtotal = getEstimatedFare(selectedCab);
                                const discount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0;
                                const total = Math.round(subtotal - discount);
                                return (
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Fare (distance-based)</span>
                                            <span className="font-semibold text-slate-900">₹{subtotal}</span>
                                        </div>
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Discount ({appliedCoupon.code})</span>
                                                <span className="font-semibold text-green-600">-₹{Math.round(discount)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-200 pt-2 flex justify-between">
                                            <span className="font-bold text-slate-900">Total</span>
                                            <span className="text-xl font-bold text-slate-900">₹{total}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {false && selectedCab && (
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Base Fare</span>
                                        <span className="font-semibold text-slate-900">₹{selectedCab.baseFare}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Discount ({appliedCoupon.code})</span>
                                            <span className="font-semibold text-green-600">-₹{Math.round(calculateDiscount(selectedCab.baseFare, appliedCoupon))}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 pt-2 flex justify-between">
                                        <span className="font-bold text-slate-900">Total</span>
                                        <span className="text-xl font-bold text-slate-900">
                                            ₹{Math.round(selectedCab.baseFare - (appliedCoupon ? calculateDiscount(selectedCab.baseFare, appliedCoupon) : 0))}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Book Button */}
                            <button
                                onClick={confirmBooking}
                                disabled={!pickup || !dropoff || !selectedCab || isRideDateInvalid}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                            >
                                Book Ride
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedCab && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    onPaymentSuccess={(method) => {
                        const pm =
                            method === 'cash' ? 'Cash'
                            : method === 'upi' ? 'UPI'
                            : method === 'card' ? 'Card'
                            : method === 'wallet' ? 'Wallet'
                            : 'Card';
                        setPaymentMethod(pm);
                        handleRideSuccess(method);
                    }}
                    amount={Math.round(getEstimatedFare(selectedCab) - (appliedCoupon ? calculateDiscount(getEstimatedFare(selectedCab), appliedCoupon) : 0))}
                    itemType="Cab Ride"
                    includeCash
                    cashLabel="Cash"
                />
            )}
        </div>
    );
};

export default CabsPage;
