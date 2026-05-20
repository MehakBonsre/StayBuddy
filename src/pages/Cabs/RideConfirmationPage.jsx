import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Phone, Star, Car, Users, MapPin, Clock, X, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { addUserBooking } from '../../utils/authUtils';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Car Icon
const carIcon = L.divIcon({
    html: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white transform -rotate-45">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.6 2 11.8 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
           </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const RideConfirmationPage = () => {
    const location = useLocation();
    const { rideId, cab, driver, pickup, dropoff, fare, passengerCount, pickupGeo, dropoffGeo, paymentMethod, paymentStatus } = location.state || {};
    const [showTracking, setShowTracking] = useState(false);
    
    // Mock coordinates (Since we don't have a real geocoder service for every string, we use offsets for simulation)
    const [pickupCoords] = useState(() => {
        const lat = Number(pickupGeo?.lat);
        const lon = Number(pickupGeo?.lon);
        return Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : [19.0760, 72.8777];
    }); // Mumbai default
    const [dropoffCoords] = useState(() => {
        const lat = Number(dropoffGeo?.lat);
        const lon = Number(dropoffGeo?.lon);
        return Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : [18.5204, 73.8567];
    }); // Pune default
    const [carPos, setCarPos] = useState([19.0700, 72.8700]);
    const [eta, setEta] = useState(5);

    useEffect(() => {
        if (showTracking) {
            const interval = setInterval(() => {
                setCarPos(prev => {
                    const latDiff = (pickupCoords[0] - prev[0]) * 0.1;
                    const lngDiff = (pickupCoords[1] - prev[1]) * 0.1;
                    if (Math.abs(latDiff) < 0.0001) return prev;
                    return [prev[0] + latDiff, prev[1] + lngDiff];
                });
                setEta(prev => Math.max(1, prev - 1));
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [showTracking, pickupCoords]);

    // Save booking to localStorage
    useEffect(() => {
        if (rideId && cab) {
            const newBooking = {
                id: rideId,
                type: 'cab',
                name: `${cab.type} - ${pickup} to ${dropoff}`,
                date: new Date().toLocaleDateString('en-IN'),
                status: paymentStatus === 'Pending' ? 'Payment Pending' : 'Confirmed',
                price: fare || cab.baseFare
            };
            addUserBooking(newBooking);
        }
    }, [rideId, cab, pickup, dropoff, fare, paymentStatus]);

    if (!rideId) return <div className="min-h-screen flex items-center justify-center font-bold">No ride details found. <Link to="/" className="text-blue-600 ml-2">Go Home</Link></div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 flex items-center justify-center font-sans">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                        <Car size={40} className="text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">On the way!</h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Your ride with <span className="text-blue-600 font-bold">{driver.name}</span> is arriving.</p>
                </div>

                {/* Driver Info Card */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 mb-6">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">👨🏽‍✈️</div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">{driver.name}</h3>
                                <div className="flex items-center text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full w-fit">
                                    <Star size={10} className="fill-yellow-600 mr-1" />
                                    {driver.rating}
                                </div>
                            </div>
                        </div>
                        <a href={`tel:${driver.phone || '1234567890'}`} className="bg-green-500 p-3 rounded-full text-white shadow-lg shadow-green-200 hover:scale-110 active:scale-95 transition-all">
                            <Phone size={20} />
                        </a>
                    </div>
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Plate Number</p>
                            <p className="font-mono font-bold text-lg text-gray-900">{driver.plate}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Vehicle</p>
                            <p className="font-bold text-gray-900">{driver.carColor} {cab.type}</p>
                        </div>
                    </div>
                </div>

                {/* Locations Summary */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center mt-1">
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                            <div className="w-0.5 h-6 bg-slate-200" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pickup</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{pickup}</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full mt-1" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Dropoff</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{dropoff}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Payment</p>
                            <p className="font-bold text-gray-900">{paymentMethod || '—'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Status</p>
                            <p className={`font-bold ${paymentStatus === 'Pending' ? 'text-amber-700' : 'text-green-700'}`}>
                                {paymentStatus || 'Paid'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fare</p>
                        <p className="text-lg font-black text-slate-900">₹{(fare || cab.baseFare).toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowTracking(true)}
                        className="bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center space-x-2"
                    >
                        <Navigation size={18} />
                        <span>Track Ride</span>
                    </button>
                    <Link
                        to="/dashboard"
                        className="bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center"
                    >
                        Dashboard
                    </Link>
                </div>

                {/* Tracking Modal */}
                <AnimatePresence>
                    {showTracking && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                            onClick={() => setShowTracking(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 30 }}
                                className="bg-white rounded-[2rem] overflow-hidden w-full max-w-2xl shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="p-6 bg-white border-b flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Real-time Tracking</h2>
                                        <div className="flex items-center text-xs font-bold text-blue-600 mt-1">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2" />
                                            Live Search India Map
                                        </div>
                                    </div>
                                    <button onClick={() => setShowTracking(false)} className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                        <X size={20} className="text-gray-600" />
                                    </button>
                                </div>

                                {/* Leaflet Map */}
                                <div className="h-[400px] w-full relative">
                                    <MapContainer 
                                        center={pickupCoords} 
                                        zoom={13} 
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={pickupCoords}>
                                            <Popup><b>Pickup Point</b><br />{pickup}</Popup>
                                        </Marker>
                                        <Marker position={dropoffCoords}>
                                            <Popup><b>Dropoff Point</b><br />{dropoff}</Popup>
                                        </Marker>
                                        <Marker position={carPos} icon={carIcon}>
                                            <Popup><b>{driver.name}</b> is here</Popup>
                                        </Marker>
                                        <Polyline positions={[pickupCoords, dropoffCoords]} color="blue" weight={3} opacity={0.5} dashArray="10, 10" />
                                    </MapContainer>
                                    
                                    {/* Overlay Status */}
                                    <div className="absolute bottom-6 left-6 right-6 z-[1000]">
                                        <div className="bg-white/95 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ETA</p>
                                                    <p className="text-lg font-bold text-gray-900">{eta} mins</p>
                                                </div>
                                            </div>
                                            <div className="h-10 w-px bg-slate-200" />
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                                                    <Navigation size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance</p>
                                                    <p className="text-lg font-bold text-gray-900">2.4 km</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default RideConfirmationPage;
