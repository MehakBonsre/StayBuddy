import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookings as mockBookings } from '../../data/mockData';
import { getUserBookings, getCurrentUser } from '../../utils/authUtils';
import { Hotel, Car, Calendar, CheckCircle, X, XCircle, Clock, Search, Download, RotateCcw, Filter, ArrowLeft, ChevronDown, Eye, Printer, Share2, MapPin, IndianRupee, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedBookingId, setExpandedBookingId] = useState(null);

    // Fetch only the current user's bookings
    const getMergedBookings = () => {
        return getUserBookings();
    };

    const [allBookings, setAllBookings] = useState(getMergedBookings);

    // Filter bookings
    const filteredBookings = allBookings.filter(booking => {
        // Search filter
        const matchesSearch = (booking.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (booking.id || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        // Tab filter
        if (activeFilter === 'all') return true;
        if (activeFilter === 'hotels') return booking.type === 'hotel';
        if (activeFilter === 'cabs') return booking.type === 'cab';
        if (activeFilter === 'upcoming') return booking.status === 'Confirmed';
        if (activeFilter === 'completed') return booking.status === 'Completed';

        return true;
    });

    const filterTabs = [
        { id: 'all', label: 'All Bookings', count: allBookings.length },
        { id: 'hotels', label: 'Hotels', count: allBookings.filter(b => b.type === 'hotel').length },
        { id: 'cabs', label: 'Cabs', count: allBookings.filter(b => b.type === 'cab').length },
        { id: 'upcoming', label: 'Upcoming', count: allBookings.filter(b => b.status === 'Confirmed').length },
        { id: 'completed', label: 'Completed', count: allBookings.filter(b => b.status === 'Completed').length },
    ];

    // Quick Stats
    const totalSpent = allBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const upcomingCount = allBookings.filter(b => b.status === 'Confirmed').length;
    const completedCount = allBookings.filter(b => b.status === 'Completed').length;

    const cancelBooking = (bookingId) => {
        const updated = allBookings.map(b =>
            b.id === bookingId ? { ...b, status: 'Cancelled' } : b
        );
        setAllBookings(updated);
        // Persist cancellation back to user-specific storage
        const user = getCurrentUser();
        if (user) {
            localStorage.setItem(`staybuddy_bookings_${user.id}`, JSON.stringify(updated));
        }
    };

    const downloadInvoice = (booking) => {
        const invoiceContent = `
        STAYBUDDY - BOOKING INVOICE
        ==========================
        
        Booking ID: ${booking.id}
        Type: ${booking.type === 'hotel' ? 'Hotel' : 'Cab'}
        Name: ${booking.name}
        Date: ${booking.date}
        Amount: ₹${booking.price}
        Status: ${booking.status}
        
        Thank you for your booking!
        `;
        
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceContent));
        element.setAttribute('download', `invoice-${booking.id}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'Completed':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Payment Pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Confirmed':
                return <CheckCircle size={14} className="mr-1" />;
            case 'Completed':
                return <CheckCircle size={14} className="mr-1" />;
            case 'Payment Pending':
                return <Clock size={14} className="mr-1" />;
            case 'Cancelled':
                return <XCircle size={14} className="mr-1" />;
            default:
                return <Clock size={14} className="mr-1" />;
        }
    };

    return (
        <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors group"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
                        <p className="text-slate-600">Manage and track all your reservations</p>
                    </div>

                    {/* Search */}
                    <div className="mt-4 md:mt-0 relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search bookings, IDs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72 bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Total Spent</p>
                                <p className="text-2xl font-bold text-slate-900">₹{totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <IndianRupee size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Upcoming</p>
                                <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Completed</p>
                                <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TrendingUp size={24} className="text-purple-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeFilter === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${activeFilter === tab.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredBookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                                    className="w-full text-left p-6 hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                        {/* Booking Info */}
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`p-3 rounded-xl shrink-0 ${booking.type === 'hotel'
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                                    : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                                                }`}>
                                                {booking.type === 'hotel' ? <Hotel size={24} /> : <Car size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 truncate">{booking.name}</h3>
                                                <div className="flex items-center text-sm text-slate-500 mt-2 gap-4">
                                                    <span className="flex items-center">
                                                        <Calendar size={14} className="mr-1.5" />
                                                        {booking.date}
                                                    </span>
                                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                                        {booking.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Status */}
                                        <div className="flex items-center gap-6 lg:shrink-0">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 mb-1 font-medium">Total Paid</p>
                                                <p className="text-2xl font-bold text-slate-900">₹{(booking.price || 0).toLocaleString()}</p>
                                            </div>

                                            <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center border ${getStatusColor(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                <span>{booking.status}</span>
                                            </div>

                                            <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedBookingId === booking.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                {expandedBookingId === booking.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-slate-200 px-6 py-4 bg-slate-50/50 space-y-4"
                                    >
                                        {/* Booking Details Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600 mb-1">Booking Type</p>
                                                <p className="text-sm text-slate-900 capitalize">{booking.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600 mb-1">Booking Status</p>
                                                <p className="text-sm text-slate-900">{booking.status}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button
                                                onClick={() => downloadInvoice(booking)}
                                                className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                            >
                                                <Download size={16} className="mr-2" />
                                                Invoice
                                            </button>
                                            <button
                                                onClick={() => navigate(booking.type === 'hotel' ? '/hotels' : '/cabs')}
                                                className="flex items-center px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                            >
                                                <RotateCcw size={16} className="mr-2" />
                                                Book Again
                                            </button>
                                            <button className="flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200">
                                                <Share2 size={16} className="mr-2" />
                                                Share
                                            </button>
                                            {booking.status === 'Confirmed' && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to cancel this booking?')) {
                                                            cancelBooking(booking.id);
                                                        }
                                                    }}
                                                    className="flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                                >
                                                    <X size={16} className="mr-2" />
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {filteredBookings.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200"
                        >
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter size={40} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                {searchQuery
                                    ? `No results for "${searchQuery}". Try a different search term.`
                                    : 'No bookings match the selected filter. Start booking today!'}
                            </p>
                            <button
                                onClick={() => navigate('/hotels')}
                                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Hotels
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
