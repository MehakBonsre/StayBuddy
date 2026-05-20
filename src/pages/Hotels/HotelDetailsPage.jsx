import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Check, Calendar, Users, ArrowLeft, ShieldCheck, Sparkles, BedDouble, Clock3 } from 'lucide-react';
import { hotels } from '../../data/mockData';

const HotelDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const hotel = hotels.find((h) => String(h.id) === id);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const toDateInput = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [checkIn, setCheckIn] = useState(toDateInput(today));
    const [checkOut, setCheckOut] = useState(toDateInput(tomorrow));
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);

    const nights = useMemo(() => {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const diff = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
    }, [checkIn, checkOut]);

    if (!hotel) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800">Hotel not found</h2>
            </div>
        );
    }

    const subtotal = hotel.price * nights * rooms;
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;
    const formatCurrency = (amount) => `INR ${amount}`;

    return (
        <div className="bg-slate-50 min-h-screen pt-16 pb-16">
            <div className="relative h-[62vh] w-full overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-8 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-3"
                    >
                        {hotel.name}
                    </motion.h1>
                    <div className="flex flex-wrap items-center gap-3 text-lg">
                        <span className="flex items-center bg-white/10 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            <MapPin size={18} className="mr-2" /> {hotel.location}
                        </span>
                        <span className="flex items-center bg-yellow-400/20 px-3 py-1 rounded-full text-yellow-200 font-bold border border-yellow-400/40 backdrop-blur-sm">
                            <Star size={16} className="mr-2 fill-yellow-300" /> {hotel.rating} Rating
                        </span>
                        <span className="flex items-center bg-emerald-400/20 px-3 py-1 rounded-full text-emerald-100 font-semibold border border-emerald-300/40 backdrop-blur-sm">
                            <Sparkles size={16} className="mr-2" /> Premium Stay
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About The Hotel</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">{hotel.description}</p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center text-blue-600 mb-2"><Clock3 size={16} className="mr-2" />Flexible Timing</div>
                            <p className="text-sm text-slate-600">Smooth check-in/check-out selection with instant fare updates.</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center text-blue-600 mb-2"><BedDouble size={16} className="mr-2" />Room Control</div>
                            <p className="text-sm text-slate-600">Adjust rooms and guests to match your group size precisely.</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center text-blue-600 mb-2"><ShieldCheck size={16} className="mr-2" />Secure Booking</div>
                            <p className="text-sm text-slate-600">Transparent pricing with taxes shown before checkout.</p>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {hotel.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                        <Check size={14} />
                                    </div>
                                    <span className="font-medium text-slate-700">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sticky top-24">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-slate-500 text-sm">Price starts from</p>
                                <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(hotel.price)}<span className="text-sm text-slate-400 font-normal">/night</span></h3>
                            </div>
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                Available
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="border border-slate-200 rounded-xl p-3 hover:border-blue-500 transition-colors">
                                <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Check-in - Check-out</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center text-slate-700 font-medium">
                                        <Calendar size={18} className="mr-2 text-blue-600" />
                                        <input
                                            type="date"
                                            value={checkIn}
                                            min={toDateInput(today)}
                                            onChange={(e) => {
                                                const nextCheckIn = e.target.value;
                                                setCheckIn(nextCheckIn);
                                                if (new Date(checkOut) <= new Date(nextCheckIn)) {
                                                    const nextOut = new Date(nextCheckIn);
                                                    nextOut.setDate(nextOut.getDate() + 1);
                                                    setCheckOut(toDateInput(nextOut));
                                                }
                                            }}
                                            className="w-full bg-transparent outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center text-slate-700 font-medium">
                                        <Calendar size={18} className="mr-2 text-blue-600" />
                                        <input
                                            type="date"
                                            value={checkOut}
                                            min={checkIn}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            className="w-full bg-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 hover:border-blue-500 transition-colors">
                                <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Guests & Rooms</label>
                                <div className="flex items-center text-slate-700 font-medium mb-3">
                                    <Users size={18} className="mr-2 text-blue-600" />
                                    <span>{guests} Guests, {rooms} Room{rooms > 1 ? 's' : ''}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center justify-between border border-slate-200 rounded-lg px-2 py-1">
                                        <button type="button" className="px-2 text-slate-600" onClick={() => setGuests((g) => Math.max(1, g - 1))}>-</button>
                                        <span className="text-sm font-semibold">{guests}</span>
                                        <button type="button" className="px-2 text-slate-600" onClick={() => setGuests((g) => Math.min(10, g + 1))}>+</button>
                                    </div>
                                    <div className="flex items-center justify-between border border-slate-200 rounded-lg px-2 py-1">
                                        <button type="button" className="px-2 text-slate-600" onClick={() => setRooms((r) => Math.max(1, r - 1))}>-</button>
                                        <span className="text-sm font-semibold">{rooms}</span>
                                        <button type="button" className="px-2 text-slate-600" onClick={() => setRooms((r) => Math.min(5, r + 1))}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>Room charge ({nights} night{nights > 1 ? 's' : ''}, {rooms} room{rooms > 1 ? 's' : ''})</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>Taxes & Fees</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between font-bold text-slate-900 text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate(`/hotels/${hotel.id}/book`, {
                                    state: { checkIn, checkOut, guests, rooms, nights },
                                })
                            }
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            Book Now
                        </button>
                        <p className="text-center text-slate-400 text-xs mt-4">You won't be charged yet</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default HotelDetailsPage;
