import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import ItineraryTimeline from '../components/planner/ItineraryTimeline'; // We can reuse but need to handle dnd context carefully or disable it
import { motion } from 'framer-motion';
import { Copy, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicTrip = () => {
    const { slug } = useParams();
    const [trip, setTrip] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/public/${slug}`);
                setTrip(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchTrip();
    }, [slug]);

    const handleCopy = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await api.post(`/public/${slug}/copy`);
            navigate('/dashboard');
        } catch (e) {
            console.error(e);
        }
    };

    if (!trip) return <div className="p-8 text-center">Loading or Not Found...</div>;

    // For public view, we don't need drag and drop. 
    // We can just render the stops list without Sortable wrappers if we want, or render ItineraryTimeline with dnd disabled/read-only mode.
    // ItineraryTimeline expects sortable context, so let's just map manually for simplicity/read-only.

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <header className="mb-8 text-center relative">
                <div className="absolute inset-0 z-0 h-64 rounded-3xl overflow-hidden opacity-50">
                    {trip.cover_photo_url && <img src={trip.cover_photo_url} className="w-full h-full object-cover" alt="Cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                </div>

                <div className="relative z-10 pt-32 pb-8">
                    <h1 className="text-5xl font-bold mb-4">{trip.title}</h1>
                    <div className="flex justify-center items-center space-x-4 mb-6">
                        <span className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                            <Calendar size={18} />
                            <span>{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</span>
                        </span>
                    </div>

                    <button onClick={handleCopy} className="btn-primary shadow-2xl shadow-indigo-500/50 flex items-center space-x-2 mx-auto px-8 py-3 text-lg">
                        <Copy size={20} />
                        <span>Copy to My Trips</span>
                    </button>
                </div>
            </header>

            <div className="space-y-8 relative pl-8 border-l-2 border-dashed border-white/10">
                {trip.stops.map((stop, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        key={stop.id}
                        className="relative"
                    >
                        <div className="absolute left-[-41px] top-0 w-6 h-6 rounded-full bg-indigo-500 ring-8 ring-slate-900 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                        </div>
                        <div className="glass-card p-6 hover:bg-white/10 transition-colors">
                            <div className="flex items-center space-x-4 mb-4">
                                <img src={stop.city_image} alt={stop.city_name} className="w-16 h-16 rounded-xl object-cover" />
                                <div>
                                    <h3 className="text-xl font-bold">{stop.city_name}</h3>
                                    <p className="text-white/50">{stop.city_country}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stop.activities && stop.activities.map(activity => (
                                    <div key={activity.id} className="bg-black/20 p-4 rounded-lg flex items-center space-x-3">
                                        <div className="min-w-[60px] h-[60px] rounded bg-gray-700 overflow-hidden">
                                            {activity.image_url && <img src={activity.image_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{activity.name}</p>
                                            <p className="text-xs text-white/50 capitalize">{activity.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PublicTrip;
