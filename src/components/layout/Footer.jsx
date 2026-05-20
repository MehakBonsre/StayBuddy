import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="text-2xl font-bold text-blue-400">
                            StayBuddy
                        </Link>
                        <p className="mt-4 text-gray-400 text-sm">
                            Your one-stop destination for seamless hotel and cab bookings. Experience travel like never before.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/hotels" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                                    Book Hotels
                                </Link>
                            </li>
                            <li>
                                <Link to="/cabs" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                                    Book Cabs
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                                    My Bookings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-3 text-gray-400 text-sm">
                                <MapPin size={16} className="text-blue-400" />
                                <span>123 Travel Road, Wanderlust City</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400 text-sm">
                                <Phone size={16} className="text-blue-400" />
                                <span>+1 234 567 8900</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400 text-sm">
                                <Mail size={16} className="text-blue-400" />
                                <span>support@staybuddy.com</span>
                            </li>
                        </ul>
                        <div className="mt-6 flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} StayBuddy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
