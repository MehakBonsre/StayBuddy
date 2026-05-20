import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const SupportPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: "How do I cancel my booking?",
            answer: "You can cancel your booking from the 'My Bookings' section. Cancellation charges may apply depending on the hotel or cab policy."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept Credit/Debit cards, UPI, Net Banking, and select Wallets."
        },
        {
            question: "Do you offer refunds?",
            answer: "Refunds are processed within 5-7 business days to the original payment method after cancellation approval."
        },
        {
            question: "How can I contact the driver?",
            answer: "Once your cab is booked, you will receive the driver's contact details via SMS and in the app."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const openGlobalChat = () => {
        const chatBtn = document.querySelector('button[title="Chat with Buddy AI"]');
        if (chatBtn) {
            chatBtn.click();
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Support</h1>
                    <p className="text-gray-600 text-lg">We're here to help you 24/7</p>
                </motion.div>

                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center"
                    >
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                        <p className="text-gray-600 mb-4">Talk to our support team</p>
                        <a href="tel:+911234567890" className="text-blue-600 font-medium hover:underline">+91 12345 67890</a>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center"
                    >
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                        <p className="text-gray-600 mb-4">Send us your queries</p>
                        <a href="mailto:support@staybuddy.com" className="text-blue-600 font-medium hover:underline">support@staybuddy.com</a>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center"
                    >
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Chat Support</h3>
                        <p className="text-gray-600 mb-4">Instant chat with us</p>
                        <button onClick={openGlobalChat} className="text-blue-600 font-medium hover:underline">Start Chat</button>
                    </motion.div>
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <HelpCircle className="mr-2 text-blue-600" /> Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                                >
                                    <span className="font-medium text-gray-900">{faq.question}</span>
                                    {openFaq === index ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
