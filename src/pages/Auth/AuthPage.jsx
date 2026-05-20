import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Hotel, Sparkles, ShieldCheck, Zap, Globe, Phone, ChevronDown } from 'lucide-react';
import { logIn, signUp, getCurrentUser, googleSignIn } from '../../utils/authUtils';

const floatingAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    }
};

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (isLogin) {
                const res = logIn({ email: formData.email, password: formData.password });
                if (!res.ok) {
                    setError(res.error);
                    setIsLoading(false);
                    return;
                }
                setIsLoading(false);
                navigate(location?.state?.from || '/dashboard');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match.');
                setIsLoading(false);
                return;
            }
            const res = signUp({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
            if (!res.ok) {
                setError(res.error);
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            navigate(location?.state?.from || '/dashboard');
        }, 700);
    };

    const [showGooglePopup, setShowGooglePopup] = useState(false);
    const [googleStep, setGoogleStep] = useState('choose'); // choose, email, password
    const [googleEmail, setGoogleEmail] = useState('');
    const [googlePassword, setGooglePassword] = useState('');
    
    // Persistent Google Accounts simulation
    const [googleAccounts, setGoogleAccounts] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('staybuddy_sim_google_accounts') || '[]');
        const defaults = [
            { name: 'Aditya Kumar', email: 'aditya.kumar@gmail.com', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' },
            { name: 'Guest User', email: 'guest.staybuddy@gmail.com', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest' }
        ];
        // Merge saved accounts, avoiding duplicates by email
        const merged = [...defaults];
        saved.forEach(s => {
            if (!merged.some(m => m.email === s.email)) merged.push(s);
        });
        return merged;
    });

    const handleGoogleSelect = (account) => {
        setIsLoading(true);
        setShowGooglePopup(false);
        // Persist this account for next time
        const currentSaved = JSON.parse(localStorage.getItem('staybuddy_sim_google_accounts') || '[]');
        if (!currentSaved.some(s => s.email === account.email)) {
            localStorage.setItem('staybuddy_sim_google_accounts', JSON.stringify([account, ...currentSaved]));
        }

        setTimeout(() => {
            googleSignIn(account);
            setIsLoading(false);
            navigate(location?.state?.from || '/dashboard');
        }, 1500);
    };

    const handleGoogleNext = () => {
        if (googleStep === 'email') {
            if (!googleEmail.includes('@')) {
                setError('Please enter a valid email.');
                return;
            }
            setGoogleStep('password');
        } else if (googleStep === 'password') {
            if (googlePassword.length < 4) {
                setError('Password is too short.');
                return;
            }
            // Success!
            const newAccount = {
                name: googleEmail.split('@')[0],
                email: googleEmail,
                photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${googleEmail}`
            };
            handleGoogleSelect(newAccount);
        }
    };

    const handleSocial = (provider) => {
        if (provider === 'Google') {
            setGoogleStep('choose');
            setShowGooglePopup(true);
            return;
        }
        setError('');
        setIsLoading(true);
        // ... rest for other providers if any
    };

    const features = [
        { icon: ShieldCheck, label: 'Secure Login', color: 'text-green-500', bg: 'bg-green-100' },
        { icon: Zap, label: 'Instant Booking', color: 'text-yellow-500', bg: 'bg-yellow-100' },
        { icon: Globe, label: '1000+ Hotels', color: 'text-blue-500', bg: 'bg-blue-100' },
    ];

    return (
        <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 pt-16">
            {/* Left Panel — Hero */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-16 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 opacity-40 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-200 opacity-40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Content */}
                <div className="relative z-10 text-center">
                    <motion.div {...floatingAnimation} className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-xl shadow-blue-100">
                        <Hotel size={44} className="text-blue-600" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black text-slate-900 mb-3 tracking-tight"
                    >
                        StayBuddy
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 mb-12 max-w-sm mx-auto font-medium"
                    >
                        Your smart companion for seamless hotel & cab bookings.
                    </motion.p>

                    {/* Feature Pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col space-y-4"
                    >
                        {features.map(({ icon: Icon, label, color, bg }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center space-x-4 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm"
                            >
                                <div className={`${bg} p-2 rounded-xl`}>
                                    <Icon size={24} className={color} />
                                </div>
                                <span className="text-slate-800 font-bold text-lg">{label}</span>
                                <Sparkles size={16} className="text-indigo-300 ml-auto" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel — Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                            <Hotel size={20} className="text-blue-600" />
                        </div>
                        <span className="text-slate-900 font-black text-xl tracking-tight">StayBuddy</span>
                    </div>

                    {/* Toggle Tabs */}
                    <div className="flex bg-slate-50/80 border border-slate-100 rounded-2xl p-1.5 mb-8">
                        {['Login', 'Sign Up'].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setIsLogin(tab === 'Login')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    (isLogin && tab === 'Login') || (!isLogin && tab === 'Sign Up')
                                        ? 'bg-white text-blue-700 shadow-sm border border-slate-100/50'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-black text-slate-900 mb-1">
                                {isLogin ? 'Welcome back! 👋' : 'Join StayBuddy! 🚀'}
                            </h2>
                            <p className="text-sm text-slate-500 mb-8 font-medium">
                                {isLogin ? 'Sign in to access your bookings.' : 'Create an account to start booking.'}
                            </p>

                            {/* Social Login */}
                            <div className="grid grid-cols-1 gap-3 mb-8">
                                {[
                                    { name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg' }
                                ].map(({ name, icon }) => (
                                    <button
                                        key={name} type="button"
                                        onClick={() => handleSocial(name)}
                                        className="flex items-center justify-center space-x-2 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                    >
                                        <img src={icon} alt={name} className="w-5 h-5" />
                                        <span>Continue with {name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center space-x-3 mb-8">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">or continue with email</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                                        {error}
                                    </div>
                                )}
                                {!isLogin && (
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text" required placeholder="Full Name"
                                            maxLength={40}
                                            pattern=".*[A-Za-z].*"
                                            onInvalid={(e) => e.target.setCustomValidity('must use an alphabet')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.slice(0, 40) })}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email" required placeholder="Email Address"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel" placeholder="Phone Number (optional)"
                                            inputMode="numeric"
                                            maxLength={10}
                                            pattern="[6-9][0-9]{9}"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'} required placeholder="Password"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                    <button
                                        type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {!isLogin && (
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'} required placeholder="Confirm Password"
                                            value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                        <button
                                            type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                )}

                                {isLogin && (
                                    <div className="text-right">
                                        <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    disabled={isLoading}
                                    className="w-full py-3.5 mt-2 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full"
                                            />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {!isLogin && (
                                <p className="text-xs text-slate-500 text-center mt-6 font-medium leading-relaxed">
                                    By creating an account, you agree to our{' '}
                                    <span className="text-blue-600 font-bold cursor-pointer hover:underline">Terms of Service</span>
                                    {' '}and{' '}
                                    <span className="text-blue-600 font-bold cursor-pointer hover:underline">Privacy Policy</span>.
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Google Account Selector Popup */}
            <AnimatePresence>
                {showGooglePopup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowGooglePopup(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100"
                        >
                            <div className="p-8">
                                <div className="flex justify-center mb-6">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-10 h-10" />
                                </div>

                                <AnimatePresence mode="wait">
                                    {googleStep === 'choose' && (
                                        <motion.div
                                            key="choose"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                        >
                                            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Sign in with Google</h3>
                                            <p className="text-sm text-slate-500 text-center mb-8">Choose an account to continue to StayBuddy</p>
                                            
                                            <div className="space-y-3">
                                                {googleAccounts.map((account) => (
                                                    <button
                                                        key={account.email}
                                                        onClick={() => handleGoogleSelect(account)}
                                                        className="w-full flex items-center space-x-4 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                                                    >
                                                        <img src={account.photo} alt={account.name} className="w-10 h-10 rounded-full border border-slate-200" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-slate-900 text-sm truncate">{account.name}</p>
                                                            <p className="text-xs text-slate-500 truncate">{account.email}</p>
                                                        </div>
                                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                                    </button>
                                                ))}
                                                
                                                <button
                                                    onClick={() => setGoogleStep('email')}
                                                    className="w-full flex items-center space-x-4 p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <User size={20} className="text-slate-500" />
                                                    </div>
                                                    <p className="font-bold text-slate-700 text-sm">Use another account</p>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {(googleStep === 'email' || googleStep === 'password') && (
                                        <motion.div
                                            key="login"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                        >
                                            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Sign in</h3>
                                            <p className="text-sm text-slate-500 text-center mb-8">to continue to StayBuddy</p>
                                            
                                            <div className="space-y-6">
                                                {googleStep === 'email' ? (
                                                    <div className="space-y-1">
                                                        <div className="relative group">
                                                            <input
                                                                type="email"
                                                                value={googleEmail}
                                                                onChange={(e) => setGoogleEmail(e.target.value)}
                                                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-transparent peer"
                                                                placeholder="Email or phone"
                                                                autoFocus
                                                            />
                                                            <label className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-medium text-blue-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-blue-600 peer-focus:text-xs">
                                                                Email or phone
                                                            </label>
                                                        </div>
                                                        <p className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">Forgot email?</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2 mb-6 px-3 py-1.5 rounded-full border border-slate-100 w-fit mx-auto">
                                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                                                <User size={12} className="text-slate-500" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">{googleEmail}</span>
                                                            <ChevronDown size={14} className="text-slate-400" />
                                                        </div>
                                                        <div className="relative group">
                                                            <input
                                                                type="password"
                                                                value={googlePassword}
                                                                onChange={(e) => setGooglePassword(e.target.value)}
                                                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-transparent peer"
                                                                placeholder="Enter your password"
                                                                autoFocus
                                                            />
                                                            <label className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-medium text-blue-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-blue-600 peer-focus:text-xs">
                                                                Enter your password
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-4">
                                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" id="show-pass" />
                                                            <label htmlFor="show-pass" className="text-sm font-medium text-slate-700">Show password</label>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-6">
                                                    <button
                                                        onClick={() => setGoogleStep(googleStep === 'password' ? 'email' : 'choose')}
                                                        className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        {googleStep === 'password' ? 'Back' : 'Create account'}
                                                    </button>
                                                    <button
                                                        onClick={handleGoogleNext}
                                                        className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                <p className="text-[10px] text-slate-400 mt-8 text-center leading-relaxed">
                                    To continue, Google will share your name, email address, and profile picture with StayBuddy.
                                </p>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>

    );
};

export default AuthPage;
