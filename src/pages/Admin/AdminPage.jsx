import { useState } from 'react';
import { bookings } from '../../data/mockData';
import { Plus, Hotel } from 'lucide-react';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('bookings');

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                        <Plus size={18} />
                        <span>Add Hotel</span>
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 flex space-x-6">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`font-medium pb-2 border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                        >
                            All Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('hotels')}
                            className={`font-medium pb-2 border-b-2 transition-colors ${activeTab === 'hotels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                        >
                            Manage Hotels
                        </button>
                    </div>

                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                                        <th className="pb-3 font-normal">Booking ID</th>
                                        <th className="pb-3 font-normal">Type</th>
                                        <th className="pb-3 font-normal">Name</th>
                                        <th className="pb-3 font-normal">Date</th>
                                        <th className="pb-3 font-normal">Amount</th>
                                        <th className="pb-3 font-normal">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                                            <td className="py-4 font-mono text-gray-500">{booking.id}</td>
                                            <td className="py-4 capitalize">{booking.type}</td>
                                            <td className="py-4 font-medium text-gray-900">{booking.name}</td>
                                            <td className="py-4 text-gray-500">{booking.date}</td>
                                            <td className="py-4 font-medium">₹{booking.price}</td>
                                            <td className="py-4">
                                                <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold border border-green-100">
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
