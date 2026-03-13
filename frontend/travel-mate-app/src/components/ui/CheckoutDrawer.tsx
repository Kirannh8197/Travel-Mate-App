import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CreditCard, Lock, Check, Car, Sparkles, ArrowRight,
    Smartphone, ChevronUp, 
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { StatusModal } from './StatusModal'; // ── NEW IMPORT

// const BACKEND = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''; // Add to your .env file

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

// ── UPI SVG Icons ──────────────────────────────────────────────────────
const GPayIcon = () => (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
        <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.4-17.7 10.7z" />
        <path fill="#FBBC05" d="M24 46c5.5 0 10.4-1.9 14.2-5l-6.6-5.4C29.6 37.3 27 38 24 38c-6 0-10.7-3.9-12.3-9.5l-7 5.4C8 40.5 15.4 46 24 46z" />
        <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 2.9-2.9 5.4-5.5 7l6.6 5.4c3.9-3.6 6.1-8.9 6.1-15 0-1-.2-2-.5-3.9z" />
    </svg>
);
const PhonePeIcon = () => (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect width="48" height="48" rx="10" fill="#5F259F" />
        <text x="24" y="34" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white" fontFamily="Arial">Pe</text>
    </svg>
);
const UPI_APPS = [
    { id: 'gpay', name: 'Google Pay', Icon: GPayIcon },
    { id: 'phonepe', name: 'PhonePe', Icon: PhonePeIcon },
    { id: 'other', name: 'Other UPI ID', Icon: () => <svg viewBox="0 0 48 48" className="w-7 h-7"><rect width="48" height="48" rx="8" fill="#f5f5f5" stroke="#ddd" strokeWidth="1.5" /><text x="24" y="31" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#6B7280" fontFamily="Arial">UPI</text></svg> },
];

// ── Step Indicator ──────────────────────────────────────────────────────
const STEPS = ['Payment', 'Arrival', 'Confirmed'];
const StepDots = ({ step }: { step: number }) => (
    <div className="flex items-center justify-center gap-3 mb-8">
        {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500
                    ${i < step ? 'bg-green-500 text-white shadow shadow-green-200'
                        : i === step ? 'bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] text-white shadow-lg shadow-[var(--tm-ethereal-purple)]/30 scale-110'
                            : 'bg-gray-100 text-gray-400'}`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-[var(--tm-deep-indigo)]' : 'text-gray-400'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`w-6 h-0.5 rounded-full transition-all ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
        ))}
    </div>
);

// ── Step 1: Payment ─────────────────────────────────────────────────────
const PaymentStep = ({ booking, executePayment }: { booking: any; executePayment: () => Promise<boolean> }) => {
    const [mode, setMode] = useState<'card' | 'upi'>('card');
    const [card, setCard] = useState('');
    const [name, setName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [flipped, setFlipped] = useState(false);
    const [upiApp, setUpiApp] = useState('gpay');
    const [upiId, setUpiId] = useState('');
    const [upiSent, setUpiSent] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleCardPay = async () => {
        if (!name || card.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) return;
        setProcessing(true);
        await executePayment(); // Backend API & Modal trigger
        setProcessing(false);
    };

    const handleUpiSend = async () => {
        setUpiSent(true);
        setProcessing(true);
        // Simulate app redirect delay
        await new Promise(r => setTimeout(r, 1500));
        await executePayment(); // Backend API & Modal trigger
        setProcessing(false);
        setUpiSent(false);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            {/* Booking Summary Pill */}
            <div className="bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] rounded-2xl p-4 mb-6 shadow-xl text-white">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{booking.hotelName}</p>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-sm">{booking.roomLabel} · {booking.nights} night{booking.nights > 1 ? 's' : ''}</p>
                        <p className="text-white/60 text-xs">{booking.checkIn} → {booking.checkOut}</p>
                    </div>
                    <p className="text-2xl font-black">₹{booking.grand?.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6">
                <button onClick={() => setMode('card')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'card' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}>
                    <CreditCard className="w-4 h-4" /> Card
                </button>
                <button onClick={() => setMode('upi')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'upi' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}>
                    <Smartphone className="w-4 h-4" /> UPI
                </button>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'card' && (
                    <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {/* 3D Card Flip */}
                        <div className="perspective-1000 mb-5 cursor-pointer" onClick={() => setFlipped(f => !f)}>
                            <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6 }}
                                style={{ transformStyle: 'preserve-3d' }} className="relative h-36 w-full">
                                <div style={{ backfaceVisibility: 'hidden' }}
                                    className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] rounded-2xl p-5 text-white shadow-2xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-9 h-6 bg-yellow-400 rounded-md opacity-90" />
                                        <div className="flex gap-1"><div className="w-6 h-6 rounded-full bg-red-500/80" /><div className="w-6 h-6 rounded-full bg-yellow-500/80 -ml-2" /></div>
                                    </div>
                                    <p className="font-mono text-sm tracking-widest mb-3 text-white/90">{card || '•••• •••• •••• ••••'}</p>
                                    <div className="flex justify-between items-end">
                                        <div><p className="text-white/40 text-xs uppercase">Card Holder</p><p className="font-bold text-xs">{name || 'YOUR NAME'}</p></div>
                                        <div><p className="text-white/40 text-xs uppercase">Expires</p><p className="font-bold text-xs">{expiry || 'MM/YY'}</p></div>
                                    </div>
                                </div>
                                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="h-8 bg-gray-600 mt-8" />
                                    <div className="flex items-center gap-4 px-5 mt-3">
                                        <div className="flex-1 h-7 bg-white/10 rounded" />
                                        <div className="bg-white text-gray-900 px-3 py-1.5 rounded font-mono font-bold text-sm">{cvv || '•••'}</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={card} onChange={e => setCard(formatCard(e.target.value))} placeholder="Card Number"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono text-sm focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                            </div>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Cardholder Name"
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-mono font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                                <input value={cvv} type="password" onChange={e => setCvv(e.target.value.slice(0, 4))} placeholder="CVV"
                                    onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-mono font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                            </div>
                        </div>
                        <button onClick={handleCardPay} disabled={processing}
                            className="w-full mt-5 py-3.5 rounded-2xl font-black text-white text-base shadow-2xl shadow-[var(--tm-ethereal-purple)]/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                            {processing ? <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing Securely…</span></div>
                                : <div className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" />Pay ₹{booking.grand?.toLocaleString('en-IN')}</div>}
                        </button>
                    </motion.div>
                )}

                {mode === 'upi' && (
                    <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {UPI_APPS.map(app => (
                                <button key={app.id} onClick={() => setUpiApp(app.id)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${upiApp === app.id ? 'border-[var(--tm-ethereal-purple)] bg-purple-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                                    <app.Icon />
                                    <span className="text-xs font-black text-gray-700">{app.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    value={upiId}
                                    onChange={e => {
                                        if (upiApp !== 'other') {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setUpiId(digits);
                                        } else {
                                            setUpiId(e.target.value.slice(0, 50));
                                        }
                                    }}
                                    placeholder={upiApp === 'other' ? 'yourname@upi' : '10-digit UPI mobile number'}
                                    inputMode={upiApp !== 'other' ? 'numeric' : 'text'}
                                    maxLength={upiApp !== 'other' ? 10 : 50}
                                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-sm font-bold focus:outline-none transition-all pr-12 ${
                                        upiApp !== 'other' && upiId.length === 10
                                            ? 'border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                                            : 'border-gray-200 focus:border-[var(--tm-ethereal-purple)] focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10'
                                    }`}
                                />
                                {upiApp !== 'other' && (
                                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black transition-colors ${
                                        upiId.length === 10 ? 'text-green-500' : 'text-gray-400'
                                    }`}>
                                        {upiId.length === 10 ? '✓' : `${upiId.length}/10`}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {upiSent && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-3">
                                <div className="w-6 h-6 border-[3px] border-amber-400 border-t-amber-600 rounded-full animate-spin flex-shrink-0" />
                                <p className="text-sm font-black text-amber-800">Check your {UPI_APPS.find(a => a.id === upiApp)?.name} app to approve ₹{booking.grand?.toLocaleString('en-IN')}</p>
                            </motion.div>
                        )}
                        
                        <button onClick={handleUpiSend} disabled={!upiId || processing || upiSent}
                            className="w-full py-3.5 rounded-2xl font-black text-white text-base shadow-xl shadow-[var(--tm-ethereal-purple)]/30 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                            {upiSent || processing ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing Gateway…</> : <><Smartphone className="w-4 h-4" />Pay ₹{booking.grand?.toLocaleString('en-IN')} via UPI</>}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> 256-bit SSL encrypted
            </p>
        </motion.div>
    );
};

// ── Step 2: Arrival Sequence (Cab) ──────────────────────────────────────
const ArrivalStep = ({ booking, onSkip, onRideBooked }: { booking: any; onSkip: () => void; onRideBooked: () => void }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [fare, setFare] = useState<number | null>(null);
    const [paying, setPaying] = useState(false);
    const [paid, setPaid] = useState(false);

    const hotelLng = booking.hotelLng || 77.59;
    const hotelLat = booking.hotelLat || 12.97;

    const drawRoute = async (m: mapboxgl.Map, uLng: number, uLat: number) => {
        try {
            const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${uLng},${uLat};${hotelLng},${hotelLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
            const json = await res.json();
            const route = json.routes?.[0];
            if (!route) return;
            const distKm = route.distance / 1000;
            setDistance(distKm);
            setFare(Math.round(distKm * 15));
            const addLayer = () => {
                if (m.getSource('route')) return;
                m.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: route.geometry } });
                m.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#7c3aed', 'line-width': 4, 'line-opacity': 0.85 } });
                m.fitBounds([[Math.min(uLng, hotelLng) - 0.05, Math.min(uLat, hotelLat) - 0.05], [Math.max(uLng, hotelLng) + 0.05, Math.max(uLat, hotelLat) + 0.05]], { padding: 60 });
            };
            if (m.loaded()) { addLayer(); } else { m.on('load', addLayer); }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!mapContainer.current) return;
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const m = new mapboxgl.Map({ container: mapContainer.current, style: 'mapbox://styles/mapbox/dark-v11', center: [hotelLng, hotelLat], zoom: 11 });
        mapRef.current = m;
        new mapboxgl.Marker({ color: '#7c3aed' }).setLngLat([hotelLng, hotelLat]).addTo(m);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => { const { longitude: ul, latitude: ult } = pos.coords; new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([ul, ult]).addTo(m); drawRoute(m, ul, ult); },
                () => { const sl = hotelLng - 0.07, slt = hotelLat - 0.06; new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([sl, slt]).addTo(m); drawRoute(m, sl, slt); }
            );
        }
        return () => m.remove();
    }, []);

    const handleRidePay = async () => {
        setPaying(true);
        await new Promise(r => setTimeout(r, 1500));
        setPaid(true);
        await new Promise(r => setTimeout(r, 800));
        onRideBooked();
    };

    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 flex-shrink-0">
                    <Car className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-serif font-black text-gray-900 text-xl">Your Arrival Sequence</h3>
                    <p className="text-sm text-gray-500 font-medium">A premium chauffeur — included in your luxury experience.</p>
                </div>
            </div>
            <div ref={mapContainer} className="h-48 rounded-2xl overflow-hidden shadow-xl border border-gray-100 mb-4" />
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2 shadow-inner mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Vehicle</span><span className="font-bold text-gray-900">Premium Sedan</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Distance</span><span className="font-bold text-gray-900">{distance ? `${distance.toFixed(1)} km` : '—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Est. Time</span><span className="font-bold text-gray-900">{distance ? `~${Math.ceil(distance / 25 * 60)} mins` : '—'}</span></div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200 font-black"><span>Ride Fare</span><span className="text-[var(--tm-ethereal-purple)] text-base">₹{fare?.toLocaleString('en-IN') || '…'}</span></div>
            </div>
            <button onClick={handleRidePay} disabled={paying || paid || !fare}
                className="w-full py-3.5 rounded-2xl font-black text-white text-base shadow-xl shadow-[var(--tm-ethereal-purple)]/20 disabled:opacity-60 flex items-center justify-center gap-2 transition-all active:scale-95 mb-3"
                style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : paid ? <><Check className="w-5 h-5" />Arrival Booked!</>
                        : <><Car className="w-4 h-4" />Confirm Chauffeur · ₹{fare?.toLocaleString('en-IN') || '…'}</>}
            </button>
            <button onClick={onSkip} className="w-full text-sm text-gray-400 hover:text-gray-600 font-bold text-center transition-colors py-2">
                I'll arrange my own transit
            </button>
        </motion.div>
    );
};

// ── Step 3: Confirmation ────────────────────────────────────────────────
const ConfirmStep = ({ booking, hasRide, onClose }: { booking: any; hasRide: boolean; onClose: () => void }) => {
    const navigate = useNavigate();
    return (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }}
                className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-yellow-200">
                <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-3xl font-serif font-black text-gray-900 mb-2">Your Sanctuary Awaits!</h3>
            <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                {hasRide ? 'Your chauffeur is confirmed. Sit back and let us handle the rest.' : 'Make your way to the hotel at your leisure.'}
            </p>
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-4 mb-6 text-left space-y-2 border border-gray-100 shadow-inner">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Room</span><span className="font-bold text-gray-900">{booking.roomLabel}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Check-In</span><span className="font-bold text-gray-900">{booking.checkIn} · 12:00 PM</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Check-Out</span><span className="font-bold text-gray-900">{booking.checkOut} · 12:00 PM</span></div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-gray-200"><span className="text-gray-700">Total Paid</span><span className="text-[var(--tm-ethereal-purple)]">₹{booking.grand?.toLocaleString('en-IN')}</span></div>
                {hasRide && <div className="flex justify-between text-sm text-green-700 font-bold pt-1 border-t border-green-100"><span>Chauffeur Transfer</span><span>Confirmed</span></div>}
            </div>
            <div className="flex gap-3">
                <button onClick={() => { onClose(); navigate('/dashboard'); }}
                    className="flex-1 py-3 rounded-2xl font-black text-white text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                    My Dashboard <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => { onClose(); navigate('/search'); }}
                    className="flex-1 py-3 rounded-2xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm transition-all active:scale-95">
                    Explore More
                </button>
            </div>
        </motion.div>
    );
};

// ── Main Drawer Component ───────────────────────────────────────────────
interface CheckoutDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        hotelName: string;
        hotelMongoId: string;
        hotelLng?: number;
        hotelLat?: number;
        roomLabel: string;
        roomType: string;
        nights: number;
        checkIn: string;
        checkOut: string;
        grand: number;
    } | null;
}

export const CheckoutDrawer = ({ isOpen, onClose, booking }: CheckoutDrawerProps) => {
    const { user } = useUserStore();
    const [step, setStep] = useState(0);
    const [hasRide, setHasRide] = useState(false);

    // ── STATUS MODAL STATE ──
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string; onComplete: () => void }>({
        isOpen: false, type: 'success', title: '', message: '', onComplete: () => {}
    });

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setHasRide(false);
        }
    }, [isOpen]);

  const executePayment = async (): Promise<boolean> => {
        // Safety check: Satisfies TypeScript that booking and user are NOT undefined
        if (!booking || !user) return false;

        try {
            const targetId = String(user.userId || user._id);
            
            // 1. CREATE the booking (It will default to 'PENDING' in the DB)
            const newBookingRes = await bookingService.createBooking({
                userId: targetId,
                hotelId: booking.hotelMongoId,
                checkInDate: booking.checkIn,
                checkOutDate: booking.checkOut,
                totalAmount: booking.grand
            });

            // Extract the actual ID depending on how your backend wraps the response
            const newBookingId = newBookingRes.data?._id || newBookingRes._id;

            // 2. Simulate Payment Gateway processing delay for UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 3. 🚨 AUTO-CONFIRM THE BOOKING! 🚨
            // Tell the database the payment was successful so the user can Check-In later!
            if (newBookingId) {
                await bookingService.confirmBooking(newBookingId);
            }

            // 4. Show Success Modal
            setModalState({
                isOpen: true,
                type: 'success',
                title: 'Payment Successful',
                message: `Your reservation at ${booking.hotelName} is secure. Let's arrange your arrival.`,
                onComplete: () => {
                    setModalState(s => ({ ...s, isOpen: false }));
                    setStep(1); // Advance to Cab Step
                }
            });
            return true;
        } catch (error: any) {
            // Show Error Modal
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Transaction Failed',
                message: error.response?.data?.message || 'We could not process your payment. Please check your details.',
                onComplete: () => setModalState(s => ({ ...s, isOpen: false }))
            });
            return false;
        }
    };
    return (
        <>
            <AnimatePresence>
                {isOpen && booking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-[80] bg-gray-900/50 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[90] bg-white/95 backdrop-blur-2xl rounded-t-3xl shadow-2xl border-t border-gray-200/60 max-h-[92vh] overflow-y-auto"
                        >
                            <div className="flex justify-center pt-4 pb-2">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                            </div>

                            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <ChevronUp className="w-4 h-4" />
                                    <span className="text-sm font-bold">Secure Checkout</span>
                                </div>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="px-6 py-5 max-w-lg mx-auto">
                                <StepDots step={step} />
                                <AnimatePresence mode="wait">
                                    {step === 0 && <PaymentStep key="pay" booking={booking} executePayment={executePayment} />}
                                    {step === 1 && <ArrivalStep key="arrive" booking={booking} onSkip={() => { setHasRide(false); setStep(2); }} onRideBooked={() => { setHasRide(true); setStep(2); }} />}
                                    {step === 2 && <ConfirmStep key="done" booking={booking} hasRide={hasRide} onClose={onClose} />}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Centralized Status Modal Overlay ── */}
            <StatusModal
                isOpen={modalState.isOpen}
                onClose={modalState.onComplete}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
            />
        </>
    );
};