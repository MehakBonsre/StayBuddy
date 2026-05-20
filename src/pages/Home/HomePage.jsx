import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Clock, Heart } from 'lucide-react';
import SearchWidget from '../../components/features/SearchWidget';
import { hotels } from '../../data/mockData';

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative h-[500px] w-full bg-gray-900 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/10" />

                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                        Explore the World with StayBuddy
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
                    >
                        One platform for seamless hotel & cab bookings. Discover your next adventure.
                    </motion.p>
                </div>
            </div>

            {/* Search Widget */}
            <div className="px-4 sm:px-6 lg:px-8">
                <SearchWidget />
            </div>

            {/* Featured Hotels */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Featured Hotels</h2>
                    <a href="/hotels" className="text-blue-600 font-medium hover:text-blue-700 flex items-center hover:underline">
                        View All <ArrowRight size={16} className="ml-1" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hotels.slice(0, 4).map((hotel) => (
                        <motion.div
                            key={hotel.id}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 border border-gray-100 group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={hotel.image}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center text-xs font-bold text-gray-800">
                                    <Star size={12} className="text-yellow-400 mr-1 fill-yellow-400" />
                                    {hotel.rating}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{hotel.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{hotel.location}</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs text-gray-400">Starts from</span>
                                        <p className="text-blue-600 font-bold text-lg">₹{hotel.price}</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/hotels/${hotel.id}`)}
                                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Bookings</h3>
                        <p className="text-gray-500 text-sm">Your bookings are protected with our top-notch security systems.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">24/7 Support</h3>
                        <p className="text-gray-500 text-sm">We are here to help you anytime, anywhere, round the clock.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Heart size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Best Experience</h3>
                        <p className="text-gray-500 text-sm">Curated hotels and cabs for the most comfortable journey.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
