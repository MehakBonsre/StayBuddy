import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, Car, Calendar, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';

const SearchWidget = () => {
    const [activeTab, setActiveTab] = useState('hotels');
    const navigate = useNavigate();

    const toDateInput = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const toDateTimeLocalInput = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
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

    const isPastDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return false;
        const d = new Date(dateTimeStr);
        if (!Number.isFinite(d.getTime())) return false;
        return d < new Date();
    };

    // Hotel Search State
    const [hotelLocation, setHotelLocation] = useState('');
    const [hotelDates, setHotelDates] = useState('');
    const [hotelGuests, setHotelGuests] = useState('2 Guests');

    // Cab Search State
    const [cabPickup, setCabPickup] = useState('');
    const [cabDropoff, setCabDropoff] = useState('');
    const [cabDateTime, setCabDateTime] = useState('');

    // Error states
    const [errors, setErrors] = useState({});

    // Suggestions state
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(null); // 'hotelLoc', 'cabPickup', 'cabDrop'

    const searchIndiaLocations = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6&addressdetails=1`,
                { headers: { 'User-Agent': 'StayBuddy/1.0' } }
            );
            const data = await response.json();
            if (data) {
                setSuggestions(data.map(item => ({
                    name: item.name || item.display_name.split(',')[0],
                    full: item.display_name
                })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showSuggestions === 'hotelLoc') searchIndiaLocations(hotelLocation);
            if (showSuggestions === 'cabPickup') searchIndiaLocations(cabPickup);
            if (showSuggestions === 'cabDrop') searchIndiaLocations(cabDropoff);
        }, 300);
        return () => clearTimeout(timer);
    }, [hotelLocation, cabPickup, cabDropoff, showSuggestions]);

    const handleSelect = (loc, type) => {
        if (type === 'hotelLoc') {
            setHotelLocation(loc.name);
            setErrors(prev => ({ ...prev, hotelLocation: '' }));
        }
        if (type === 'cabPickup') {
            setCabPickup(loc.name);
            setErrors(prev => ({ ...prev, cabPickup: '' }));
        }
        if (type === 'cabDrop') {
            setCabDropoff(loc.name);
            setErrors(prev => ({ ...prev, cabDropoff: '' }));
        }
        setShowSuggestions(null);
    };

    const handleSearchHotels = () => {
        const newErrors = {};
        if (!hotelLocation.trim()) newErrors.hotelLocation = 'Please enter a location';
        if (!hotelDates) newErrors.hotelDates = 'Please select a date';
        else if (isPastDateOnly(hotelDates)) newErrors.hotelDates = 'Select today or future date';
        if (!hotelGuests || hotelGuests === '0 Guests') newErrors.hotelGuests = 'Specify guests';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        navigate('/hotels', { state: { search: hotelLocation, dates: hotelDates, guests: hotelGuests } });
    };

    const handleSearchCabs = () => {
        const newErrors = {};
        if (!cabPickup.trim()) newErrors.cabPickup = 'Please enter pickup';
        if (!cabDropoff.trim()) newErrors.cabDropoff = 'Please enter dropoff';
        if (!cabDateTime) newErrors.cabDateTime = 'Select date & time';
        else if (isPastDateTime(cabDateTime)) newErrors.cabDateTime = 'Select future time';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        navigate('/cabs', { state: { pickup: cabPickup, dropoff: cabDropoff, datetime: cabDateTime } });
    };

    const SuggestionsDropdown = ({ type }) => (
        <AnimatePresence>
            {showSuggestions === type && suggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
                >
                    {suggestions.map((loc, i) => (
                        <button
                            key={i}
                            onMouseDown={() => handleSelect(loc, type)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 flex items-start space-x-3"
                        >
                            <MapPin size={14} className="text-blue-500 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{loc.full}</p>
                            </div>
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto -mt-24 relative z-20 border border-gray-100">
            {/* Tabs */}
            <div className="flex space-x-8 border-b mb-6">
                <button
                    onClick={() => { setActiveTab('hotels'); setErrors({}); }}
                    className={`flex items-center space-x-2 pb-4 px-2 border-b-2 transition-colors ${activeTab === 'hotels'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Hotel size={20} />
                    <span className="font-semibold text-sm">Hotels</span>
                </button>
                <button
                    onClick={() => { setActiveTab('cabs'); setErrors({}); }}
                    className={`flex items-center space-x-2 pb-4 px-2 border-b-2 transition-colors ${activeTab === 'cabs'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Car size={20} />
                    <span className="font-semibold text-sm">Cabs</span>
                </button>
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'hotels' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                            <div className={`flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border ${errors.hotelLocation ? 'border-red-500' : 'border-gray-100'} focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all`}>
                                <MapPin size={18} className="text-blue-500" />
                                <input
                                    type="text"
                                    value={hotelLocation}
                                    onChange={(e) => { setHotelLocation(e.target.value); setShowSuggestions('hotelLoc'); setErrors(prev => ({ ...prev, hotelLocation: '' })); }}
                                    onFocus={() => setShowSuggestions('hotelLoc')}
                                    onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                                    placeholder="City, Area or Hotel in India"
                                    className="bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-400 text-sm font-medium"
                                />
                                {loading && showSuggestions === 'hotelLoc' && <Loader2 size={16} className="animate-spin text-blue-500" />}
                            </div>
                            {errors.hotelLocation && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-0">
                                    {errors.hotelLocation}
                                </motion.p>
                            )}
                            <SuggestionsDropdown type="hotelLoc" />
                        </div>
                        <div className="space-y-1 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-in</label>
                            <div className={`flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border ${errors.hotelDates ? 'border-red-500' : 'border-gray-100'} focus-within:border-blue-500 transition-all`}>
                                <Calendar size={18} className="text-blue-500" />
                                <input
                                    type="date"
                                    value={hotelDates}
                                    onChange={(e) => { setHotelDates(e.target.value); setErrors(prev => ({ ...prev, hotelDates: '' })); }}
                                    min={toDateInput(new Date())}
                                    className="bg-transparent border-none outline-none w-full text-gray-800 text-sm font-medium cursor-pointer"
                                />
                            </div>
                            {errors.hotelDates && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-0">
                                    {errors.hotelDates}
                                </motion.p>
                            )}
                        </div>
                        <div className="space-y-1 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Guests</label>
                            <div className={`flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border ${errors.hotelGuests ? 'border-red-500' : 'border-gray-100'} focus-within:border-blue-500 transition-all`}>
                                <Users size={18} className="text-blue-500" />
                                <input
                                    type="number"
                                    value={hotelGuests.replace(/\D/g, '')}
                                    onChange={(e) => { setHotelGuests(`${e.target.value || 0} Guests`); setErrors(prev => ({ ...prev, hotelGuests: '' })); }}
                                    min="1"
                                    placeholder="2"
                                    className="bg-transparent border-none outline-none w-full text-gray-800 text-sm font-medium"
                                />
                            </div>
                            {errors.hotelGuests && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-0">
                                    {errors.hotelGuests}
                                </motion.p>
                            )}
                        </div>
                        <button
                            onClick={handleSearchHotels}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <span>Search</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">From (Pickup)</label>
                            <div className={`flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border ${errors.cabPickup ? 'border-red-500' : 'border-gray-100'} focus-within:border-blue-500 transition-all`}>
                                <MapPin size={18} className="text-blue-500" />
                                <input
                                    type="text"
                                    value={cabPickup}
                                    onChange={(e) => { setCabPickup(e.target.value); setShowSuggestions('cabPickup'); setErrors(prev => ({ ...prev, cabPickup: '' })); }}
                                    onFocus={() => setShowSuggestions('cabPickup')}
                                    onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                                    placeholder="Pickup in India"
                                    className="bg-transparent border-none outline-none w-full text-gray-800 text-sm font-medium"
                                />
                                {loading && showSuggestions === 'cabPickup' && <Loader2 size={16} className="animate-spin text-blue-500" />}
                            </div>
                            {errors.cabPickup && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-0">
                                    {errors.cabPickup}
                                </motion.p>
                            )}
                            <SuggestionsDropdown type="cabPickup" />
                        </div>
                        <div className="space-y-1 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">To (Dropoff)</label>
                            <div className={`flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border ${errors.cabDropoff ? 'border-red-500' : 'border-gray-100'} focus-within:border-blue-500 transition-all`}>
                                <MapPin size={18} className="text-green-500" />
                                <input
                                    type="text"
                                    value={cabDropoff}
                                    onChange={(e) => { setCabDropoff(e.target.value); setShowSuggestions('cabDrop'); setErrors(prev => ({ ...prev, cabDropoff: '' })); }}
                                    onFocus={() => setShowSuggestions('cabDrop')}
                                    onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                                    placeholder="Drop location"
                                    className="bg-transparent border-none outline-none w-full text-gray-800 text-sm font-medium"
                                />
                                {loading && showSuggestions === 'cabDrop' && <Loader2 size={16} className="animate-spin text-blue-500" />}
                            </div>
                            {errors.cabDropoff && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-0">
                                    {errors.cabDropoff}
                                </motion.p>
                            )}
                            <SuggestionsDropdown type="cabDrop" />
                        </div>
                        <div className="space-y-1 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</label>
                            <div className={`flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border ${errors.cabDateTime ? 'border-red-500' : 'border-gray-100'} focus-within:border-blue-500 transition-all`}>
                                <Calendar size={18} className="text-blue-500" />
                                <input
                                    type="datetime-local"
                                    value={cabDateTime}
                                    onChange={(e) => { setCabDateTime(e.target.value); setErrors(prev => ({ ...prev, cabDateTime: '' })); }}
                                    min={toDateTimeLocalInput(new Date())}
                                    className="bg-transparent border-none outline-none w-full text-gray-800 text-sm font-medium cursor-pointer"
                                />
                            </div>
                            {errors.cabDateTime && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-0">
                                    {errors.cabDateTime}
                                </motion.p>
                            )}
                        </div>
                        <button
                            onClick={handleSearchCabs}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <span>Find Cab</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SearchWidget;
