import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Bot, ExternalLink, Loader2 } from 'lucide-react';
import { hotels } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const QUICK_REPLIES = [
    'Hotels in Goa',
    'How to book a hotel?',
    'Book a cab',
    'How to login?',
    'Available coupons',
    'Cancel booking',
];

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "👋 Hi! I'm **Buddy AI** — your StayBuddy travel assistant!\n\nI can help you with:",
            cards: [
                { icon: '🏨', label: 'Find Hotels in any city' },
                { icon: '🚕', label: 'Book Cabs & Hotels' },
                { icon: '🔐', label: 'Login & Signup Help' },
                { icon: '💳', label: 'Payments & Bookings' },
                { icon: '❌', label: 'Cancellations & Refunds' },
                { icon: '🎟️', label: 'Coupons & Offers' },
            ],
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (text, type = 'bot', extras = {}) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type,
            text,
            timestamp: new Date(),
            ...extras
        }]);
    };

    const getBotResponse = (userMessage) => {
        const msg = userMessage.toLowerCase().trim();

        // ── HOTELS BY LOCATION ──
        const hotelLocMatch = msg.match(/hotel[s]?\s+(?:in|at|near)\s+(.+)/i)
            || (msg.includes('hotel') && msg.match(/\bin\s+([a-z\s]+)$/i));
        if (hotelLocMatch || msg === 'hotels' || msg.includes('show hotels') || msg.includes('list hotels')) {
            let location = '';
            if (hotelLocMatch) {
                location = hotelLocMatch[1]?.trim().replace(/\?$/, '');
            }
            const found = location
                ? hotels.filter(h => h.location.toLowerCase().includes(location.toLowerCase()))
                : hotels.slice(0, 5);

            if (found.length > 0) {
                return {
                    text: location
                        ? `🏨 Found **${found.length} hotel${found.length > 1 ? 's' : ''}** in **${location}**:`
                        : `🏨 Here are some featured hotels:`,
                    hotelCards: found.slice(0, 5),
                    followUp: found.length > 5 ? `...and ${found.length - 5} more. Visit Hotels page to see all!` : null
                };
            } else {
                return {
                    text: `😕 No hotels found in **"${location}"**.\n\nWe cover cities like Goa, Mumbai, Manali, Jaipur, Bengaluru, Hyderabad, and many more!\n\nTry asking for "Hotels in Goa" or "Hotels in Mumbai".`
                };
            }
        }

        // ── LOGIN HELP ──
        if (msg.includes('login') || msg.includes('sign in') || msg.includes('signin')) {
            return {
                text: `🔐 **How to Login:**\n1. Click the **"Login"** button in the top-right corner\n2. Enter your email & password\n3. Click **"Sign In"**\n\n✨ Don't have an account? I can help you sign up!`,
                action: { label: 'Go to Login →', path: '/auth' }
            };
        }

        // ── SIGNUP HELP ──
        if (msg.includes('signup') || msg.includes('sign up') || msg.includes('register') || msg.includes('create account')) {
            return {
                text: `📝 **How to Sign Up:**\n1. Click **"Login"** (top-right)\n2. Select **"Create Account"** tab\n3. Fill in your name, email & password\n4. Click **"Sign Up"**\n\n🎉 That's it! Start booking right away.`,
                action: { label: 'Create Account →', path: '/auth' }
            };
        }

        // ── BOOK HOTEL ──
        if (msg.includes('book hotel') || msg.includes('hotel booking') || msg.includes('how to book')) {
            return {
                text: `🏨 **Hotel Booking Steps:**\n1. Go to the **Hotels** page\n2. Browse & click a hotel to view details\n3. Select check-in/check-out dates & rooms\n4. On the booking page:\n   • Choose **Meal Plan** (Breakfast / Lunch / Dinner)\n   • Set **Adults & Children** count\n5. Fill in guest details & choose payment\n6. Apply a **coupon** if you have one\n7. Click **"Pay & Confirm"**\n\n✅ Your booking will appear in **"My Bookings"**!`,
                action: { label: 'Browse Hotels →', path: '/hotels' }
            };
        }

        // ── BOOK CAB ──
        if (msg.includes('book cab') || msg.includes('cab booking') || msg.includes('book ride') || msg.includes('ride') || msg.includes('cab')) {
            return {
                text: `🚕 **Cab Booking Steps:**\n1. Go to the **Cabs** page\n2. Enter **Pickup** location\n3. Enter **Dropoff** location\n4. Select date & time\n5. Choose number of passengers\n6. Pick a cab (Mini / Sedan / SUV)\n7. Apply coupon (optional)\n8. Click **"Book Ride"**\n\n📍 Driver details are shown immediately!`,
                action: { label: 'Book a Cab →', path: '/cabs' }
            };
        }

        // ── MY BOOKINGS ──
        if (msg.includes('my booking') || msg.includes('my order') || msg.includes('see booking') || msg.includes('view booking') || msg.includes('dashboard')) {
            return {
                text: `📋 **My Bookings:**\nAll your hotel stays and cab rides are saved in **"My Bookings"** (Dashboard).\n\nYou can:\n• View booking details\n• Download invoices\n• Cancel upcoming bookings\n• Book again`,
                action: { label: 'View My Bookings →', path: '/dashboard' }
            };
        }

        // ── CANCEL / REFUND ──
        if (msg.includes('cancel') || msg.includes('refund')) {
            return {
                text: `❌ **How to Cancel a Booking:**\n1. Go to **"My Bookings"** (Dashboard)\n2. Click on the booking you want to cancel\n3. Click **"Cancel Booking"**\n4. Confirm the cancellation\n\n💰 Refund is processed within **5-7 business days** to your original payment method.`,
                action: { label: 'My Bookings →', path: '/dashboard' }
            };
        }

        // ── PAYMENT ──
        if (msg.includes('payment') || msg.includes('pay') || msg.includes('upi') || msg.includes('card')) {
            return {
                text: `💳 **Accepted Payment Methods:**\n✅ UPI (Google Pay, PhonePe, etc.)\n✅ Credit / Debit Card\n✅ Pay at Hotel (for hotel bookings)\n✅ Cash (for cab rides)\n\n🔒 All payments are **100% secure** and encrypted.`
            };
        }

        // ── COUPONS ──
        if (msg.includes('coupon') || msg.includes('discount') || msg.includes('offer') || msg.includes('promo')) {
            return {
                text: `🎟️ **Available Coupons:**\n\n• **NEW10** – 10% off (New customers, all bookings)\n• **HOTEL15** – 15% off hotels (Min. ₹2,000)\n• **CAB20** – 20% off cabs (Min. ₹300)\n• **WEEKEND10** – 10% off weekends\n• **FLAT100** – Flat ₹100 off (Min. ₹500)\n\n💡 Enter the code on the booking page before confirming!`
            };
        }

        // ── MEAL OPTIONS ──
        if (msg.includes('meal') || msg.includes('breakfast') || msg.includes('lunch') || msg.includes('dinner') || msg.includes('food')) {
            return {
                text: `🍽️ **Meal Plans Available:**\n\n• **Breakfast** – +₹500/night\n• **Lunch** – +₹700/night\n• **Dinner** – +₹800/night\n• **All Day (B+L+D)** – +₹1,500/night\n\nMeal preferences can be selected on the hotel booking page and the price is automatically adjusted!`
            };
        }

        // ── PRICE / COST ──
        if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('rate') || msg.includes('cheap') || msg.includes('expensive')) {
            return {
                text: `💰 **Hotel Pricing:**\nHotels start from as low as ₹3,000/night!\n\n🏷️ Use filters on the Hotels page to sort by price.\n\n**Cab Fares:**\n• Mini – From ₹180/ride\n• Sedan – From ₹360/ride\n• SUV – From ₹480/ride\n\nPrices are fixed — no surge pricing!`,
                action: { label: 'Browse Hotels →', path: '/hotels' }
            };
        }

        // ── CONTACT / SUPPORT ──
        if (msg.includes('contact') || msg.includes('support') || msg.includes('help desk') || msg.includes('customer care')) {
            return {
                text: `📞 **Customer Support:**\n\n• **Email:** support@staybuddy.in\n• **Phone:** 1800-123-4567 (Toll-free)\n• **Hours:** 24/7\n\nYou can also visit our **Support** page for more help.`,
                action: { label: 'Support Page →', path: '/support' }
            };
        }

        // ── GREETINGS ──
        if (msg.match(/^(hi|hello|hey|namaste|good morning|good evening|good afternoon|howdy|sup|hii|heyy)[\s!?]*$/i)) {
            return {
                text: `Hey there! 👋 Welcome to **StayBuddy**!\n\nI'm Buddy AI, your travel assistant. What can I help you with today?\n\n💡 Try asking:\n• "Hotels in Goa"\n• "How to book a hotel?"\n• "Available coupons"`
            };
        }

        // ── THANK YOU ──
        if (msg.includes('thank') || msg.includes('thanks') || msg.includes('great') || msg.includes('awesome') || msg.includes('perfect')) {
            return { text: `😊 You're welcome! Have a wonderful trip! 🌟\n\nIs there anything else I can help you with?` };
        }

        // ── HELP ──
        if (msg.includes('help') || msg === '?') {
            return {
                text: `🤖 **I can help you with:**\n\n🏨 Hotels – "Hotels in [city]"\n🚕 Cabs – "How to book a cab?"\n🔐 Account – "How to login?"\n💳 Payments – "Payment methods"\n🎟️ Discounts – "Show coupons"\n❌ Cancellations – "How to cancel?"\n\nJust type your question!`
            };
        }

        // ── DEFAULT ──
        return {
            text: `🤔 I'm not sure about that, but I'll try my best!\n\nYou asked: *"${userMessage}"*\n\n💡 Try asking:\n• "Hotels in Goa"\n• "How to book a hotel or cab?"\n• "Available coupons"\n• "How to cancel?"\n\nOr type **"help"** to see all options.`
        };
    };

    const handleSend = (text = null) => {
        const msgText = text || input;
        if (!msgText.trim()) return;
        setInput('');

        addMessage(msgText, 'user');

        setIsTyping(true);
        setTimeout(() => {
            const response = getBotResponse(msgText);
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'bot',
                timestamp: new Date(),
                ...response
            }]);
            setIsTyping(false);
        }, 600 + Math.random() * 500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            // Bold (**text**)
            const parts = line.split(/\*\*(.+?)\*\*/g);
            return (
                <span key={i}>
                    {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
                    {i < text.split('\n').length - 1 && <br />}
                </span>
            );
        });
    };

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 text-white rounded-full p-4 shadow-2xl transition-shadow"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                title="Chat with Buddy AI"
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={24} /></motion.span>
                        : <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={24} /></motion.span>
                    }
                </AnimatePresence>
                {!isOpen && (
                    <motion.span
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                    />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 z-50 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}
                    >
                        {/* Header */}
                        <div
                            className="p-4 flex items-center justify-between text-white"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Buddy AI</h3>
                                    <div className="flex items-center space-x-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <p className="text-xs text-blue-100">Online & Ready</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="h-80 overflow-y-auto p-3 space-y-3 bg-slate-50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.type === 'bot' && (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                                            <Bot size={14} className="text-white" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] space-y-2 ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                                        {/* Text bubble */}
                                        {msg.text && (
                                            <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.type === 'user'
                                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                                                }`}>
                                                {formatText(msg.text)}
                                            </div>
                                        )}

                                        {/* Feature Cards (welcome message) */}
                                        {msg.cards && (
                                            <div className="grid grid-cols-2 gap-1.5 w-full">
                                                {msg.cards.map((card, i) => (
                                                    <div key={i} className="bg-white rounded-xl px-2.5 py-2 border border-gray-200 shadow-sm text-xs flex items-center space-x-1.5">
                                                        <span>{card.icon}</span>
                                                        <span className="text-gray-700 font-medium">{card.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Hotel Cards */}
                                        {msg.hotelCards && (
                                            <div className="space-y-1.5 w-full">
                                                {msg.hotelCards.map((hotel) => (
                                                    <motion.button
                                                        key={hotel.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        onClick={() => { navigate(`/hotels/${hotel.id}`); setIsOpen(false); }}
                                                        className="w-full text-left bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center space-x-2.5"
                                                    >
                                                        <img src={hotel.image} alt={hotel.name} className="w-11 h-11 rounded-lg object-cover shrink-0" onError={(e) => e.target.style.display='none'} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate">{hotel.name}</p>
                                                            <p className="text-[10px] text-gray-500 truncate">📍 {hotel.location}</p>
                                                            <div className="flex items-center space-x-1.5 mt-0.5">
                                                                <span className="text-[10px] text-yellow-600 font-semibold">⭐ {hotel.rating}</span>
                                                                <span className="text-[10px] text-blue-600 font-bold">₹{hotel.price}/night</span>
                                                            </div>
                                                        </div>
                                                        <ExternalLink size={12} className="text-gray-400 shrink-0" />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Follow up text */}
                                        {msg.followUp && (
                                            <p className="text-[10px] text-gray-500 italic">{msg.followUp}</p>
                                        )}

                                        {/* Action Button */}
                                        {msg.action && (
                                            <button
                                                onClick={() => { navigate(msg.action.path); setIsOpen(false); }}
                                                className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-semibold flex items-center space-x-1"
                                            >
                                                <span>{msg.action.label}</span>
                                                <ExternalLink size={10} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end space-x-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200">
                                        <div className="flex space-x-1.5">
                                            {[0, 0.15, 0.3].map((delay, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        <div className="px-3 py-2 bg-white border-t border-gray-100 flex space-x-2 overflow-x-auto scrollbar-hide">
                            {QUICK_REPLIES.map((reply) => (
                                <button
                                    key={reply}
                                    onClick={() => handleSend(reply)}
                                    className="shrink-0 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors font-medium whitespace-nowrap"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask anything about travel..."
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-gray-50"
                                />
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="p-2 rounded-full text-white disabled:bg-gray-300 transition-colors shrink-0"
                                    style={{ background: input.trim() ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : undefined }}
                                >
                                    <Send size={16} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
