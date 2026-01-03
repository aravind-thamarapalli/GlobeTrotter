import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Search, Globe, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
    const [myTrips, setMyTrips] = useState([]);
    const [recommendedTrips, setRecommendedTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my_trips'); // 'my_trips' | 'recommended'

    // Filters
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [myTripsRes, citiesRes] = await Promise.all([
                    api.get('/trips'),
                    api.get('/cities?limit=10') // Mock recommendation from cities
                ]);
                setMyTrips(myTripsRes.data);

                // Transform cities into "Recommended Trips" format
                const recs = citiesRes.data.map(city => ({
                    id: `rec_${city.id}`,
                    title: `Experience ${city.name}`,
                    cover_photo_url: city.image_url,
                    start_date: null,
                    is_public: true,
                    is_recommendation: true,
                    location: `${city.name}, ${city.country}`,
                    description: city.description,
                    cost_est: Math.floor(Math.random() * 2000) + 1000
                }));
                setRecommendedTrips(recs);

            } catch (error) {
                console.error("Error fetching data", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredTrips = (activeTab === 'my_trips' ? myTrips : recommendedTrips).filter(trip => {
        const lowerSearch = searchTerm.toLowerCase();

        const matchesTitle = trip.title.toLowerCase().includes(lowerSearch);
        const matchesLocation = trip.location ? trip.location.toLowerCase().includes(lowerSearch) : false;
        const matchesDescription = trip.description ? trip.description.toLowerCase().includes(lowerSearch) : false;

        return matchesTitle || matchesLocation || matchesDescription;
    });

    if (loading) return <div className="p-8 text-center text-white/50 animate-pulse">Loading adventure...</div>;

    return (
        <div>
            {/* Hero Section */}
            <div className="mb-10 text-center relative py-10">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300"
                >
                    Ready for your next adventure?
                </motion.h1>
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setActiveTab('my_trips')}
                        className={`px-6 py-2 rounded-full transition-all ${activeTab === 'my_trips' ? 'bg-white text-blue-900 font-bold shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        My Trips
                    </button>
                    <button
                        onClick={() => setActiveTab('recommended')}
                        className={`px-6 py-2 rounded-full transition-all ${activeTab === 'recommended' ? 'bg-white text-blue-900 font-bold shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        Recommended Trips
                    </button>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
                    <input
                        type="text"
                        placeholder="Search by city, country, or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input w-full pl-10"
                    />
                </div>

                {activeTab === 'my_trips' && (
                    <Link to="/create-trip" className="btn-primary flex items-center space-x-2 shadow-lg hover:shadow-primary/50 whitespace-nowrap">
                        <Plus size={20} />
                        <span>Plan New Trip</span>
                    </Link>
                )}
            </div>

            {/* Content Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredTrips.length > 0 ? filteredTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} isRecommendation={activeTab === 'recommended'} />
                    )) : (
                        <div className="col-span-full text-center py-20 text-white/50">
                            <Globe size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-xl">No trips found matching your criteria.</p>
                            {activeTab === 'my_trips' && (
                                <Link to="/create-trip" className="text-blue-300 underline mt-2 block">Create one now?</Link>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const TripCard = ({ trip, isRecommendation }) => {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass-card overflow-hidden group relative hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 h-full flex flex-col"
        >
            <Link to={isRecommendation ? `/create-trip?template=${trip.id}` : `/trip/${trip.id}`} className="block h-full flex flex-col">
                <div className="h-56 bg-gray-800 relative overflow-hidden shrink-0">
                    {trip.cover_photo_url ? (
                        <img src={trip.cover_photo_url} alt={trip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                    {trip.is_public && !isRecommendation && (
                        <span className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> Public
                        </span>
                    )}

                    {isRecommendation && (
                        <span className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Recommended
                        </span>
                    )}

                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h3 className="text-2xl font-bold mb-1 truncate text-white shadow-black">{trip.title}</h3>
                        <div className="flex items-center text-sm text-white/80">
                            {isRecommendation ? (
                                <>
                                    <MapPin size={14} className="mr-2" />
                                    <span>{trip.location}</span>
                                </>
                            ) : (
                                <>
                                    <Calendar size={14} className="mr-2" />
                                    <span>{trip.start_date ? format(new Date(trip.start_date), 'MMMM d, yyyy') : 'Date TBD'}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white/5 group-hover:bg-white/10 transition-colors flex-grow flex flex-col justify-between">
                    {isRecommendation ? (
                        <>
                            <p className="text-sm text-white/70 mb-4 line-clamp-3">{trip.description}</p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                <div className="flex items-center text-green-400">
                                    <DollarSign size={16} />
                                    <span className="font-bold">Est. ${trip.cost_est}</span>
                                </div>
                                <span className="text-xs text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
                                    View Details <TrendingUp size={12} />
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-1/3 h-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                                </div>
                                <div className="flex justify-between text-xs text-white/50">
                                    <span>Progress</span>
                                    <span>30%</span>
                                </div>
                            </div>
                            <p className="text-xs text-white/40 text-right mt-4">Planning in progress</p>
                        </>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};

export default Dashboard;
