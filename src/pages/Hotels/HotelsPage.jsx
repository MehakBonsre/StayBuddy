import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MapPin, Star, Wifi, Coffee, Filter, X, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { hotels } from '../../data/mockData';
import { useNavigate, useLocation } from 'react-router-dom';

const ALL_AMENITIES = [...new Set(hotels.flatMap(h => h.amenities))].sort();

const HotelsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showFilters, setShowFilters] = useState(false);

    const isPastDateOnly = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (!Number.isFinite(d.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };
    
    // Initialize search from navigation state if it exists (from Home page search)
    const initialSearch = location.state?.search || '';
    const [search, setSearch] = useState(initialSearch);
    const checkIn = location.state?.dates || '';
    const invalidCheckIn = isPastDateOnly(checkIn);

    // Filter state
    const [priceRange, setPriceRange] = useState([0, 8000]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [sortBy, setSortBy] = useState('default');

    const minPrice = 0;
    const maxPrice = 8000;

    const toggleRating = (r) => {
        setSelectedRatings(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    };

    const toggleAmenity = (a) => {
        setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
    };

    const clearFilters = () => {
        setPriceRange([0, 8000]);
        setSelectedRatings([]);
        setSelectedAmenities([]);
        setSortBy('default');
        setSearch('');
    };

    const activeFilterCount = selectedRatings.length + selectedAmenities.length
        + (priceRange[0] > 0 || priceRange[1] < 8000 ? 1 : 0)
        + (sortBy !== 'default' ? 1 : 0);

    // Filter and sort
    let filteredHotels = hotels.filter(hotel => {
        if (hotel.price < priceRange[0] || hotel.price > priceRange[1]) return false;
        if (selectedRatings.length > 0 && !selectedRatings.some(r => hotel.rating >= r)) return false;
        if (selectedAmenities.length > 0 && !selectedAmenities.every(a => hotel.amenities.includes(a))) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!hotel.name.toLowerCase().includes(q) && !hotel.location.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    if (invalidCheckIn) filteredHotels = [];

    if (sortBy === 'price_asc') filteredHotels = [...filteredHotels].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') filteredHotels = [...filteredHotels].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') filteredHotels = [...filteredHotels].sort((a, b) => b.rating - a.rating);

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Explore Hotels</h1>
                        <p className="text-gray-500 mt-1">
                            {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 md:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search location or hotel..."
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="default">Sort by</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating">Best Rated</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all relative ${showFilters
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <SlidersHorizontal size={16} />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {invalidCheckIn && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
                        No hotels available for past check-in date ({checkIn}). Please select today or a future date.
                    </div>
                )}

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 mb-6 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center space-x-1"
                                    >
                                        <X size={14} />
                                        <span>Clear All</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Price Range */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Price per Night</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>₹{priceRange[0].toLocaleString()}</span>
                                            <span>₹{priceRange[1].toLocaleString()}</span>
                                        </div>
                                        <div className="relative h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="absolute h-2 bg-blue-600 rounded-full"
                                                style={{
                                                    left: `${(priceRange[0] / maxPrice) * 100}%`,
                                                    right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                                                }}
                                            />
                                            <input
                                                type="range"
                                                min={minPrice}
                                                max={maxPrice}
                                                step={100}
                                                value={priceRange[0]}
                                                onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 500), priceRange[1]])}
                                                className="absolute w-full h-2 opacity-0 cursor-pointer"
                                            />
                                            <input
                                                type="range"
                                                min={minPrice}
                                                max={maxPrice}
                                                step={100}
                                                value={priceRange[1]}
                                                onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 500)])}
                                                className="absolute w-full h-2 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[[0, 3000], [3000, 5000], [5000, 7000], [7000, 8000]].map(([min, max]) => (
                                                <button
                                                    key={`${min}-${max}`}
                                                    onClick={() => setPriceRange([min, max])}
                                                    className={`text-xs px-2 py-1.5 rounded-lg border font-medium transition-colors ${priceRange[0] === min && priceRange[1] === max
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    ₹{min/1000}k – ₹{max/1000}k
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Star Rating</h4>
                                    <div className="space-y-2">
                                        {[4.5, 4.0, 3.5, 3.0].map(r => (
                                            <label key={r} className="flex items-center space-x-3 cursor-pointer group">
                                                <div
                                                    onClick={() => toggleRating(r)}
                                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedRatings.includes(r)
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-gray-300 group-hover:border-blue-400'
                                                        }`}
                                                >
                                                    {selectedRatings.includes(r) && <span className="text-white text-xs">✓</span>}
                                                </div>
                                                <span className="text-sm text-gray-700">
                                                    {Array.from({ length: Math.floor(r) }, (_, i) => '⭐').join('')} {r}+ Stars
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Amenities</h4>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                        {ALL_AMENITIES.map(amenity => (
                                            <button
                                                key={amenity}
                                                onClick={() => toggleAmenity(amenity)}
                                                className={`text-xs px-2.5 py-1.5 rounded-full border font-medium transition-all ${selectedAmenities.includes(amenity)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                                                    }`}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Filter Chips */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(priceRange[0] > 0 || priceRange[1] < 8000) && (
                            <span className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                <span>₹{priceRange[0]/1000}k – ₹{priceRange[1]/1000}k</span>
                                <button onClick={() => setPriceRange([0, 8000])}><X size={12} /></button>
                            </span>
                        )}
                        {selectedRatings.map(r => (
                            <span key={r} className="flex items-center space-x-1 text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                                <span>{r}+ Stars</span>
                                <button onClick={() => toggleRating(r)}><X size={12} /></button>
                            </span>
                        ))}
                        {selectedAmenities.map(a => (
                            <span key={a} className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                <span>{a}</span>
                                <button onClick={() => toggleAmenity(a)}><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Listings Grid */}
                {filteredHotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHotels.map((hotel, index) => (
                            <motion.div
                                key={hotel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.05, 0.4) }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer"
                                onClick={() => navigate(`/hotels/${hotel.id}`)}
                            >
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={hotel.image}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop'; }}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center text-xs font-bold text-gray-800 shadow-sm">
                                        <Star size={14} className="text-yellow-400 mr-1 fill-yellow-400" />
                                        {hotel.rating}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                                            <div className="flex items-center text-gray-500 text-sm mt-1">
                                                <MapPin size={14} className="mr-1" />
                                                {hotel.location}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amenities Preview */}
                                    <div className="flex space-x-3 my-4 text-gray-400 flex-wrap gap-y-1">
                                        {hotel.amenities.slice(0, 3).map((amt, i) => (
                                            <span key={i} className="text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{amt}</span>
                                        ))}
                                        {hotel.amenities.length > 3 && (
                                            <span className="text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">+{hotel.amenities.length - 3}</span>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                        <div>
                                            <span className="text-xs text-gray-400 uppercase font-semibold">Price per night</span>
                                            <div className="flex items-baseline">
                                                <span className="text-2xl font-bold text-blue-600">₹{hotel.price}</span>
                                                <span className="text-sm text-gray-400 ml-1 line-through">₹{Math.round(hotel.price * 1.2)}</span>
                                            </div>
                                        </div>
                                        <button className="bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter size={30} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No hotels match your filters</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or search term.</p>
                        <button onClick={clearFilters} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                            Clear Filters
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HotelsPage;
