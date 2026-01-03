import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Search, Plus, Building, MapPin } from 'lucide-react';

const CitySearch = ({ tripId, stops, onAdd }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [mode, setMode] = useState('cities'); // 'cities' or 'activities'
    const [loading, setLoading] = useState(false);

    const [selectedCity, setSelectedCity] = useState(null);
    const [dates, setDates] = useState({ arrival: '', departure: '' });

    useEffect(() => {
        const search = async () => {
            if (!query && mode === 'cities') { setResults([]); return; }

            setLoading(true);
            try {
                const endpoint = mode === 'cities' ? '/cities' : '/activities';
                // For activities, we might need more filters, but basic text search for now
                // My activity controller doesn't support 'search' text query, only logic filters.
                // I should stick to Cities for now or Fix controller.
                // Let's assume I fix controller or just do Cities first.

                if (mode === 'cities') {
                    const res = await api.get(`/cities?search=${query}`);
                    setResults(res.data);
                } else {
                    const res = await api.get(`/activities?search=${query}`);
                    setResults(res.data);
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };

        const timeout = setTimeout(search, 500);
        return () => clearTimeout(timeout);
    }, [query, mode]);

    const initiateAddCity = (city) => {
        setSelectedCity(city);
        // Default dates to today/tomorrow or similar
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        setDates({ arrival: today, departure: tomorrow });
    };

    const confirmAddCity = async () => {
        if (!selectedCity) return;
        try {
            await api.post(`/trips/${tripId}/stops`, {
                city_id: selectedCity.id,
                arrival_date: new Date(dates.arrival).toISOString(),
                departure_date: new Date(dates.departure).toISOString(),
            });
            onAdd();
            setSelectedCity(null);
        } catch (e) {
            console.error(e);
        }
    };

    const addActivity = async (activity) => {
        const relevantStop = stops?.find(s => s.city_id === activity.city_id);

        if (!relevantStop) {
            alert(`You need to add the city for this activity to your trip first.`);
            return;
        }

        try {
            await api.post(`/stops/${relevantStop.id}/activities`, {
                activity_id: activity.id,
                scheduled_at: relevantStop.arrival_date
            });
            onAdd();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-4 bg-white/5 p-1 rounded-lg">
                <button onClick={() => setMode('cities')} className={`flex-1 py-2 text-sm font-medium rounded-md ${mode === 'cities' ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}>
                    Find Cities
                </button>
                <button onClick={() => setMode('activities')} className={`flex-1 py-2 text-sm font-medium rounded-md ${mode === 'activities' ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}>
                    Find Activities
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-white/40" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={mode === 'cities' ? "Search for a city..." : "Search activities..."}
                    className="glass-input w-full pl-10"
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {loading && <div className="text-center text-white/50 text-sm">Searching...</div>}

                {mode === 'cities' && results.map((city) => (
                    <div key={city.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center space-x-3 transition-colors group">
                        <div className="w-12 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                            {city.image_url && <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{city.name}</h4>
                            <p className="text-xs text-white/50 truncate">{city.country}</p>
                        </div>
                        <button onClick={() => initiateAddCity(city)} className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} />
                        </button>
                    </div>
                ))}

                {/* Date Selection Modal/Overlay */}
                {selectedCity && (
                    <div className="absolute inset-0 z-50 bg-[#1E1E1E] p-4 flex flex-col space-y-4">
                        <h3 className="text-lg font-bold">Add {selectedCity.name}</h3>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">Arrival</label>
                            <input
                                type="date"
                                value={dates.arrival}
                                onChange={e => setDates({ ...dates, arrival: e.target.value })}
                                className="glass-input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">Departure</label>
                            <input
                                type="date"
                                value={dates.departure}
                                onChange={e => setDates({ ...dates, departure: e.target.value })}
                                className="glass-input w-full"
                            />
                        </div>
                        <div className="flex space-x-2 pt-2">
                            <button onClick={() => setSelectedCity(null)} className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancel</button>
                            <button onClick={confirmAddCity} className="flex-1 py-2 rounded btn-primary">Add City</button>
                        </div>
                    </div>
                )}

                {mode === 'activities' && results.map((activity) => (
                    <div key={activity.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 flex items-center space-x-3 transition-colors group">
                        <div className="w-12 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                            {activity.image_url && <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{activity.name}</h4>
                            <div className="flex items-center space-x-2 text-xs text-white/50">
                                <span className="capitalize">{activity.type}</span>
                                <span>•</span>
                                <span>${activity.cost}</span>
                            </div>
                        </div>
                        <button onClick={() => addActivity(activity)} className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CitySearch;
