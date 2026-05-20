import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, MapPin, CalendarDays, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfirmationPage = () => {
    const location = useLocation();
    const { bookingId, hotel, dates, totalAmount, paymentStatus } = location.state || {};

    if (!bookingId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Link to="/" className="text-blue-600 hover:underline">Go Home</Link>
            </div>
        );
    }

    // Parse dates string like "2026-04-19 to 2026-04-20"
    const parsedDates = dates ? dates.split(' to ') : ['Check-in', 'Check-out'];
    const formatDate = (d) => {
        try {
            return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return d; }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle size={40} className="text-green-600" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h1>
                <p className="text-gray-500 mb-8">Yay! You are going to <strong>{hotel?.name}</strong></p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                        <span className="text-gray-500 text-sm">Booking ID</span>
                        <span className="font-mono font-bold text-gray-900">{bookingId}</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Hotel</p>
                            <p className="font-medium text-gray-900 flex items-center">
                                <MapPin size={14} className="mr-1 text-blue-600" />
                                {hotel?.name} — {hotel?.location}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold flex items-center">
                                    <CalendarDays size={12} className="mr-1" /> Check-in
                                </p>
                                <p className="font-medium text-gray-900">{formatDate(parsedDates[0])}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold flex items-center">
                                    <CalendarDays size={12} className="mr-1" /> Check-out
                                </p>
                                <p className="font-medium text-gray-900">{formatDate(parsedDates[1])}</p>
                            </div>
                        </div>
                        {totalAmount && (
                            <div className="pt-2 border-t border-gray-200 mt-2">
                                <p className="text-xs text-gray-400 uppercase font-bold flex items-center">
                                    <IndianRupee size={12} className="mr-1" /> {paymentStatus === 'Pending' ? 'Payment Pending' : 'Total Paid'}
                                </p>
                                <p className={`text-xl font-bold ${paymentStatus === 'Pending' ? 'text-amber-600' : 'text-green-600'}`}>
                                    ₹{totalAmount.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/dashboard"
                        className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        View My Bookings
                    </Link>
                    <Link
                        to="/"
                        className="block w-full bg-white text-gray-700 font-bold py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmationPage;
