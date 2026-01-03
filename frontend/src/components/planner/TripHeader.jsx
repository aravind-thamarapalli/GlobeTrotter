import React from 'react';
import api from '../../lib/api';
import { Share2, Globe, Lock, Calendar, DollarSign, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';

const TripHeader = ({ trip, setTrip, activeTab, setActiveTab, onCalendarClick }) => {

    const togglePublic = async () => {
        try {
            const res = await api.patch(`/trips/${trip.id}/make-public`, { is_public: !trip.is_public });
            setTrip({ ...trip, is_public: res.data.is_public, public_slug: res.data.public_slug });
        } catch (e) {
            console.error(e);
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/public/${trip.public_slug}`;
        navigator.clipboard.writeText(url);
        alert('Link copied: ' + url);
    };

    return (
        <div className="glass-card p-6 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{trip.title}</h1>
                    <p className="text-white/60 text-sm">
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button onClick={togglePublic} className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${trip.is_public ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'bg-white/5 border-white/10 text-white/60'}`}>
                        {trip.is_public ? <Globe size={18} /> : <Lock size={18} />}
                        <span>{trip.is_public ? 'Public' : 'Private'}</span>
                    </button>
                    {trip.is_public && (
                        <button onClick={copyLink} className="btn-glass flex items-center space-x-2">
                            <Share2 size={18} />
                            <span>Share</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex space-x-1 bg-white/5 p-1 rounded-lg w-max">
                <button onClick={() => setActiveTab('itinerary')} className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${activeTab === 'itinerary' ? 'bg-[var(--color-brand-medium)] shadow-lg text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    <LayoutList size={18} /> <span>Itinerary</span>
                </button>
                <button onClick={() => setActiveTab('budget')} className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${activeTab === 'budget' ? 'bg-[var(--color-brand-medium)] shadow-lg text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    <DollarSign size={18} /> <span>Budget</span>
                </button>
                <button onClick={onCalendarClick} className="px-4 py-2 rounded-md flex items-center space-x-2 transition-all text-white/60 hover:text-white hover:bg-white/5">
                    <Calendar size={18} /> <span>Calendar</span>
                </button>
            </div>
        </div>
    );
};

export default TripHeader;
