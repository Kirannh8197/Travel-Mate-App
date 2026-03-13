import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ImagePlus, Loader2, Save, Check, MapPin, Globe, Building, Info, Star } from 'lucide-react';
import { hotelService } from '../../../services/hotel.service';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const BACKEND = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const AMENITY_OPTIONS = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Valet', 'Parking'];
const imgUrl = (p: string) => !p ? '' : p.startsWith('http') ? p : `${BACKEND}/uploads/${p}`;

export const EditHotelModal = ({ hotel, onClose, onSaved }: { hotel: any; onClose: () => void; onSaved: (updated: any) => void }) => {
    // ── FORM STATE ──
    const [name, setName] = useState(hotel.name || '');
    const [description, setDescription] = useState(hotel.description || '');
    const [price, setPrice] = useState(String(hotel.pricePerNight || ''));
    const [amenities, setAmenities] = useState<string[]>(hotel.amenities || []);
    
    // Address State (Added State Column)
    const [city, setCity] = useState(hotel.address?.city || '');
    const [state, setState] = useState(hotel.address?.state || '');
    const [country, setCountry] = useState(hotel.address?.country || '');
    
    // Location Logic: Only show Map if coordinates are [0, 0]
    const initialCoords = hotel.location?.coordinates || [0, 0];
    const needsLocation = initialCoords[0] === 0 && initialCoords[1] === 0;
    const [lng, setLng] = useState(initialCoords[0]);
    const [lat, setLat] = useState(initialCoords[1]);

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    
    const mapContainer = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleAmenity = (am: string) =>
        setAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);

    useEffect(() => {
        if (!needsLocation || !mapContainer.current || !MAPBOX_TOKEN) return;
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [77.5946, 12.9716],
            zoom: 10
        });
        const marker = new mapboxgl.Marker({ draggable: true, color: '#7c3aed' })
            .setLngLat([77.5946, 12.9716]).addTo(map);

        const updateCoords = (c: { lng: number; lat: number }) => { setLng(c.lng); setLat(c.lat); };
        marker.on('dragend', () => updateCoords(marker.getLngLat()));
        map.on('click', (e) => { marker.setLngLat(e.lngLat); updateCoords(e.lngLat); });
        return () => map.remove();
    }, [needsLocation]);

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        const fd = new FormData();
        fd.append('name', name);
        fd.append('description', description);
        fd.append('pricePerNight', price);
        fd.append('amenities', JSON.stringify(amenities));
        fd.append('address', JSON.stringify({ city, state, country }));
        
        if (needsLocation) {
            fd.append('location', JSON.stringify({ type: 'Point', coordinates: [lng, lat] }));
        }
        newFiles.forEach(f => fd.append('images', f));

        try {
            const res = await hotelService.updateHotel(hotel._id, fd);
            setSaved(true);
            setTimeout(() => onSaved(res.data || res), 1000);
        } catch (e: any) {
            setSaveError(e.response?.data?.message || 'Update failed.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={onClose}>
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col border border-white/20">
                
                {/* ── HEADER ── */}
                <div className="bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] p-8 text-white shrink-0 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <h2 className="text-3xl font-serif font-black tracking-tight">Refine Your Sanctuary</h2>
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest mt-1">Property ID: {hotel.hotelId}</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── FORM BODY ── */}
                <div className="p-8 space-y-8 overflow-y-auto elite-scrollbar">
                    
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[var(--tm-ethereal-purple)] mb-2">
                            <Building className="w-4 h-4" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Identity & Pricing</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Hotel Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-[var(--tm-ethereal-purple)] outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nightly Rate (₹)</label>
                                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-[var(--tm-ethereal-purple)] outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[var(--tm-liquid-blue)] mb-2">
                            <MapPin className="w-4 h-4" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Location Details</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">City</label>
                                <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xs font-bold outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">State</label>
                                <input value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xs font-bold outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Country</label>
                                <input value={country} onChange={e => setCountry(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xs font-bold outline-none" />
                            </div>
                        </div>

                        {needsLocation ? (
                            <div className="mt-4 p-1 bg-gray-100 rounded-3xl overflow-hidden shadow-inner">
                                <div ref={mapContainer} className="h-44 rounded-[1.4rem] overflow-hidden" />
                                <p className="text-[9px] text-gray-400 font-bold uppercase text-center py-2">Drag marker to exact location</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Verified Position</p>
                                    <p className="text-xs font-bold text-gray-700">Geolocation Locked: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Star className="w-4 h-4" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Premium Amenities</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {AMENITY_OPTIONS.map(am => (
                                <button key={am} onClick={() => toggleAmenity(am)} type="button"
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${amenities.includes(am) ? 'bg-amber-500 text-white border-transparent shadow-lg shadow-amber-200' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                                    {am}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                         <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Info className="w-4 h-4" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Property Story</h3>
                        </div>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} 
                            placeholder="Tell guests what makes this stay unique..."
                            className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-sm font-medium focus:border-[var(--tm-ethereal-purple)] outline-none transition-all resize-none leading-relaxed" />
                    </div>

                    {/* Photo Upload */}
                    <div className="pt-4">
                        <input ref={fileInputRef} type="file" multiple onChange={(e) => setNewFiles(Array.from(e.target.files || []))} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} type="button" className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-xs font-black text-gray-400 hover:text-[var(--tm-ethereal-purple)] hover:border-[var(--tm-ethereal-purple)] transition-all flex items-center justify-center gap-2 bg-gray-50/50">
                            <ImagePlus className="w-5 h-5" /> {newFiles.length > 0 ? `${newFiles.length} Photos Selected` : 'Update Gallery Photos'}
                        </button>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 shrink-0">
                    {saveError && <p className="text-xs text-red-500 font-bold text-center mb-2">⚠ {saveError}</p>}
                    <button onClick={handleSave} disabled={saving || saved} 
                        className="w-full py-4 rounded-2xl font-black text-white shadow-2xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 text-lg"
                        style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                        {saving ? <><Loader2 className="w-6 h-6 animate-spin" />Syncing...</> : saved ? <><Check className="w-6 h-6" />Sanctuary Updated</> : <><Save className="w-6 h-6" />Publish Changes</>}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};