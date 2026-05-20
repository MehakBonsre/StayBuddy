import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Hotel, Car, User, Menu, X, Calendar, Headphones, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const checkAuthStatus = () => {
        const storedUser = localStorage.getItem('staybuddy_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuthStatus();
        window.addEventListener('authChange', checkAuthStatus);
        window.addEventListener('storage', checkAuthStatus);
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('authChange', checkAuthStatus);
            window.removeEventListener('storage', checkAuthStatus);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('staybuddy_user');
        window.dispatchEvent(new Event('authChange'));
        setUser(null);
        navigate('/');
        setIsOpen(false);
    };

    const navLinks = [
        { name: 'Hotels', path: '/hotels', icon: <Hotel size={20} /> },
        { name: 'Cabs', path: '/cabs', icon: <Car size={20} /> },
        { name: 'My Bookings', path: '/dashboard', icon: <Calendar size={20} /> },
        { name: 'Support', path: '/support', icon: <Headphones size={20} /> },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20' 
                    : 'bg-white shadow-md border-b border-gray-100'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                            StayBuddy
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center space-x-1 font-medium transition-colors ${
                                    location.pathname === link.path
                                        ? 'text-blue-600'
                                        : 'text-gray-600 hover:text-blue-600'
                                    }`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        ))}
                        
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold text-slate-800">
                                    Hi, {user.name}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-1 px-4 py-2 rounded-full transition-all bg-red-50 text-red-600 hover:bg-red-100 font-semibold"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="flex items-center space-x-1 px-4 py-2 rounded-full transition-all bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                            >
                                <User size={18} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-gray-800"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white shadow-lg border-t overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            {user && (
                                <div className="px-3 py-3 mb-2 border-b border-gray-100 flex items-center justify-between">
                                    <span className="font-bold text-gray-800">Hi, {user.name}</span>
                                </div>
                            )}
                            
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center space-x-2 px-3 py-3 rounded-md text-base font-bold text-red-600 hover:bg-red-50 text-left"
                                >
                                    <LogOut size={20} />
                                    <span>Sign Out</span>
                                </button>
                            ) : (
                                <Link
                                    to="/auth"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-bold text-blue-600 hover:bg-blue-50"
                                >
                                    <User size={20} />
                                    <span>Login / Signup</span>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
