import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Wallet, X, ShieldCheck, Loader2, CheckCircle2, QrCode, ArrowLeft, Lock, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, amount, itemType, includeCash = false, cashLabel = 'Cash' }) => {
    const [step, setStep] = useState('selection'); // selection, details, processing, success
    const [method, setMethod] = useState(null);
    const [processingSubStep, setProcessingSubStep] = useState(0);
    const [cardStage, setCardStage] = useState('form'); // form | otp
    const [cardOtp, setCardOtp] = useState('');
    const [cardOtpError, setCardOtpError] = useState('');
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');
    const [walletProvider, setWalletProvider] = useState('Amazon Pay');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');

    const processingMessages = [
        "Verifying your details...",
        "Connecting to secure payment gateway...",
        "Authorizing transaction with your bank...",
        "Finalizing your booking..."
    ];

    useEffect(() => {
        if (!isOpen) return;
        setStep('selection');
        setMethod(null);
        setProcessingSubStep(0);
        setCardStage('form');
        setCardOtp('');
        setCardOtpError('');
        setUpiId('');
        setUpiError('');
        setWalletProvider('Amazon Pay');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardName('');
    }, [isOpen]);

    useEffect(() => {
        if (step === 'processing') {
            const interval = setInterval(() => {
                setProcessingSubStep(prev => {
                    if (prev < processingMessages.length - 1) return prev + 1;
                    clearInterval(interval);
                    return prev;
                });
            }, 1200);

            const timer = setTimeout(() => {
                setStep('success');
                setTimeout(() => {
                    onPaymentSuccess?.(method);
                    onClose();
                }, 2000);
            }, 5500);

            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        }
    }, [step, method, onClose, onPaymentSuccess]);

    const handleMethodSelect = (selectedMethod) => {
        setMethod(selectedMethod);
        setCardStage('form');
        setCardOtp('');
        setCardOtpError('');
        setUpiId('');
        setUpiError('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardName('');
        if (selectedMethod === 'cash') {
            setStep('processing');
            return;
        }
        setStep('details');
    };

    const handleFinalPay = () => {
        setStep('processing');
    };

    const isCardFormValid = /^\d{16}$/.test(cardNumber.replace(/\s/g, '')) && /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardExpiry) && /^\d{3}$/.test(cardCvv) && /[a-zA-Z]/.test(cardName);


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-900/70 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 30, opacity: 0 }}
                    className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            {step === 'details' && (
                                <button 
                                    onClick={() => setStep('selection')}
                                    className="p-2 hover:bg-white rounded-full transition-colors mr-1 border border-transparent hover:border-slate-200"
                                >
                                    <ArrowLeft size={18} className="text-slate-600" />
                                </button>
                            )}
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Checkout</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{itemType}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Total Amount</p>
                            <p className="text-2xl font-black text-blue-600 leading-none">₹{amount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {step === 'selection' && (
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-4"
                            >
                                <p className="text-slate-600 font-bold text-sm mb-4">Select Payment Method</p>
                                {[
                                    { id: 'upi', name: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone, desc: 'Quick scan or UPI ID', color: 'text-purple-600', bg: 'bg-purple-50' },
                                    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, desc: 'All major cards supported', color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { id: 'wallet', name: 'Wallets', icon: Wallet, desc: 'Amazon Pay, MobiKwik & more', color: 'text-orange-600', bg: 'bg-orange-50' },
                                    ...(includeCash ? [{ id: 'cash', name: cashLabel, icon: Wallet, desc: 'No online payment required', color: 'text-emerald-700', bg: 'bg-emerald-50' }] : [])
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMethodSelect(item.id)}
                                        className="w-full group flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/20 transition-all duration-300 text-left"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`${item.bg} p-3.5 rounded-2xl group-hover:scale-110 transition-transform`}>
                                                <item.icon size={26} className={item.color} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{item.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {step === 'details' && method === 'upi' && (
                            <motion.div 
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Scan with GPay / PhonePe</p>
                                    <div 
                                        className="p-4 bg-white rounded-3xl shadow-lg shadow-slate-200 border border-slate-100 relative group overflow-hidden w-[212px] h-[212px] flex items-center justify-center cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-blue-50/20 animate-pulse pointer-events-none" />
                                        <img 
                                            src="/src/assets/images/payment_qr.png" 
                                            alt="UPI QR Code"
                                            className="w-full h-full object-contain relative z-10 p-2"
                                        />
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600 rounded-tl-xl z-20" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-600 rounded-tr-xl z-20" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-600 rounded-bl-xl z-20" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600 rounded-br-xl z-20" />
                                        
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/90 z-30 text-white text-center p-4">
                                            <Smartphone size={32} className="mb-2" />
                                            <p className="text-xs font-black uppercase tracking-widest">Scan QR in your UPI app</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleFinalPay}
                                        className="mt-5 w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-xs uppercase tracking-widest"
                                    >
                                        I have scanned & paid
                                    </button>
                                    <div className="mt-6 flex flex-col items-center">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Waiting for confirmation…</p>
                                        </div>
                                        <div className="flex items-center space-x-3 grayscale opacity-40">
                                            <div className="w-20 h-6 bg-[url('https://upload.wikimedia.org/wikipedia/commons/b/b5/Google_Pay_%28GPay%29_Logo.svg')] bg-contain bg-no-repeat bg-center" />
                                            <div className="w-12 h-6 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg')] bg-contain bg-no-repeat bg-center" />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center py-2 relative">
                                    <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-slate-100" />
                                    <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Or enter UPI ID</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">UPI ID</label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={upiId}
                                            onChange={(e) => {
                                                const next = e.target.value.replace(/\\s/g, '').slice(0, 60);
                                                setUpiId(next);
                                                setUpiError('');
                                            }}
                                            placeholder="username@upi"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold placeholder:text-slate-300 pb-4"
                                        />
                                        <button
                                            onClick={() => {
                                                const ok = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9]{1,}$/.test(upiId) && !/\\.[a-zA-Z]{2,}$/.test(upiId);
                                                if (!ok) {
                                                    setUpiError('Enter a valid UPI ID (example: name@okaxis).');
                                                    return;
                                                }
                                                handleFinalPay();
                                            }}
                                            className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                        >
                                            Verify & Pay
                                        </button>
                                    </div>
                                    {upiError && <p className="text-xs text-red-600 font-bold pl-1">{upiError}</p>}
                                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 pl-1 mt-1">
                                        <Info size={12} />
                                        <span>Ex: yourname@okaxis, yourname@okhdfcbank</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'details' && method === 'card' && (
                            <motion.div 
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-5"
                            >
                                {cardStage === 'form' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Card Number</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    inputMode="numeric"
                                                    maxLength={19}
                                                    pattern="[0-9 ]*"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={cardNumber}
                                                    onChange={(e) => {
                                                        const formatted = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
                                                        setCardNumber(formatted);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
                                                    <div className="w-8 h-5 bg-slate-200 rounded shrink-0 opacity-40" />
                                                    <div className="w-8 h-5 bg-slate-200 rounded shrink-0 opacity-40" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Expiry (MM/YY)</label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            maxLength={5}
                                            pattern="[0-9/]*"
                                            placeholder="MM / YY"
                                            value={cardExpiry}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                const next = digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                                                setCardExpiry(next);
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                        />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">CVV</label>
                                                <div className="relative">
                                                    <input 
                                                        type="password" 
                                                        placeholder="..."
                                                        maxLength="3"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={cardCvv}
                                                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                                    />
                                                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pb-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Name on Card</label>
                                            <input 
                                                type="text" 
                                                maxLength={30}
                                                pattern=".*[A-Za-z].*"
                                                onInvalid={(e) => e.target.setCustomValidity('must use an alphabet')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                placeholder="Full Name"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value.slice(0, 30))}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => setCardStage('otp')}
                                            disabled={!isCardFormValid}
                                            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-sm uppercase tracking-widest"
                                        >
                                            Send OTP
                                        </button>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">
                                            2-step verification enabled
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Enter OTP</p>
                                            <input
                                                value={cardOtp}
                                                onChange={(e) => {
                                                    setCardOtpError('');
                                                    setCardOtp(e.target.value.replace(/\\D/g, '').slice(0, 6));
                                                }}
                                                inputMode="numeric"
                                                placeholder="6-digit OTP"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black text-xl tracking-widest text-center"
                                            />
                                            {cardOtpError && (
                                                <p className="text-xs text-red-600 font-bold mt-3 text-center">{cardOtpError}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400 font-bold mt-3 text-center">
                                                Demo OTP: <span className="font-black text-slate-600">123456</span>
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => { setCardStage('form'); setCardOtp(''); }}
                                                className="w-full bg-white border border-slate-200 text-slate-700 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (cardOtp.length !== 6) return;
                                                    if (cardOtp !== '123456') {
                                                        setCardOtpError('Incorrect OTP. Try 123456.');
                                                        return;
                                                    }
                                                    handleFinalPay();
                                                }}
                                                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-xs uppercase tracking-widest disabled:opacity-60"
                                                disabled={cardOtp.length !== 6}
                                            >
                                                Verify & Pay
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {step === 'details' && method === 'wallet' && (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-5"
                            >
                                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Choose Wallet</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Amazon Pay', 'MobiKwik', 'Paytm'].map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => setWalletProvider(w)}
                                                className={`py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-colors ${walletProvider === w
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold mt-4">
                                        You will be redirected to <span className="text-slate-700 font-black">{walletProvider}</span> to approve the payment.
                                    </p>
                                </div>

                                <button
                                    onClick={handleFinalPay}
                                    className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-sm uppercase tracking-widest"
                                >
                                    Continue & Pay ₹{amount.toLocaleString()}
                                </button>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <div className="py-12 flex flex-col items-center">
                                <div className="relative mb-10">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="w-24 h-24 border-[6px] border-slate-50 border-t-blue-600 rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck size={32} className="text-blue-200 animate-pulse" />
                                    </div>
                                </div>
                                <motion.div 
                                    key={processingSubStep}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-center"
                                >
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Securely processing...</h3>
                                    <p className="text-slate-500 font-bold text-sm tracking-tight h-6">
                                        {processingMessages[processingSubStep]}
                                    </p>
                                </motion.div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="py-12 flex flex-col items-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200"
                                >
                                    <CheckCircle2 size={48} className="text-white" />
                                </motion.div>
                                <h3 className="text-3xl font-black text-slate-900 mb-2">Payment Success!</h3>
                                <p className="text-green-600 font-black text-sm uppercase tracking-widest">Redirecting to confirmation...</p>
                                
                                <div className="mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID: SB_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                </div>
                            </div>
                        )}

                        {step !== 'processing' && step !== 'success' && (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center space-x-3 text-slate-400">
                                <Lock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">PCI-DSS Compliant Secure Gateway</span>
                                <div className="h-3 w-px bg-slate-200" />
                                <ShieldCheck size={14} className="text-green-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Verified Secure</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
