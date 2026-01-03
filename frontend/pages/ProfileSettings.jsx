import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Camera, Save, Trash2, Globe, MapPin, User, Mail, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        email: '',
        avatar_url: '',
        language: 'en' // Default generic preference
    });
    const [savedCities, setSavedCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, citiesRes] = await Promise.all([
                api.get('/auth/me'),
                api.get('/saved-cities')
            ]);
            setUser({ ...userRes.data, language: 'en' }); // merging default lang
            setSavedCities(citiesRes.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.patch('/auth/me', {
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url
            });
            setUser({ ...user, ...res.data });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Failed to update profile.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        try {
            await api.delete('/auth/me');
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Failed to delete account');
        }
    };

    const handleUnsaveCity = async (cityId) => {
        try {
            await api.delete(`/saved-cities/${cityId}`);
            setSavedCities(savedCities.filter(c => c.id !== cityId));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 text-white pb-20">
            <h1 className="text-3xl font-bold font-serif mb-8 border-b border-gray-700 pb-4">Settings</h1>

            {message && (
                <div className={`p-4 mb-6 rounded-lg ${message.includes('Failed') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile Form */}
                <div className="md:col-span-2 space-y-8">

                    {/* Public Profile Section */}
                    <section className="bg-[#1E1E1E] p-6 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                            <User size={20} className="text-[var(--color-brand-medium)]" />
                            <span>Public Profile</span>
                        </h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-white/10">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera size={20} />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-400 mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={user.name}
                                            onChange={e => setUser({ ...user, name: e.target.value })}
                                            className="w-full bg-[#121212] border border-[#333] rounded-lg p-2.5 text-white focus:border-[var(--color-brand-medium)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-400 mb-1">Avatar URL</label>
                                        <input
                                            type="text"
                                            value={user.avatar_url || ''}
                                            onChange={e => setUser({ ...user, avatar_url: e.target.value })}
                                            placeholder="https://example.com/photo.jpg"
                                            className="w-full bg-[#121212] border border-[#333] rounded-lg p-2.5 text-white focus:border-[var(--color-brand-medium)] outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="btn-primary flex items-center space-x-2 px-6 py-2 rounded-lg">
                                    <Save size={18} />
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Account Settings */}
                    <section className="bg-[#1E1E1E] p-6 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                            <Mail size={20} className="text-[var(--color-brand-medium)]" />
                            <span>Account Details</span>
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    onChange={e => setUser({ ...user, email: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#333] rounded-lg p-2.5 text-white focus:border-[var(--color-brand-medium)] outline-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <h3 className="font-bold mb-2 text-sm text-gray-300">Preferences</h3>
                                <div className="flex items-center justify-between bg-[#121212] p-3 rounded-lg border border-[#333]">
                                    <div className="flex items-center space-x-3">
                                        <Globe size={18} className="text-gray-400" />
                                        <span className="text-sm">Language</span>
                                    </div>
                                    <select
                                        value={user.language}
                                        onChange={e => setUser({ ...user, language: e.target.value })}
                                        className="bg-transparent text-sm outline-none text-[var(--color-brand-light)] font-medium cursor-pointer"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="border border-red-900/30 bg-red-900/10 p-6 rounded-xl">
                        <h2 className="text-xl font-bold mb-4 text-red-400">Danger Zone</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-red-200">Delete Account</h3>
                                <p className="text-sm text-red-200/60">Permanently remove your account and all trip data.</p>
                            </div>
                            <button onClick={handleDeleteAccount} className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium">
                                Delete Account
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right Column: Saved Destinations */}
                <div className="space-y-6">
                    <section className="bg-[#1E1E1E] p-6 rounded-xl border border-white/5 h-full">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                            <MapPin size={20} className="text-[var(--color-brand-medium)]" />
                            <span>Saved Destinations</span>
                        </h2>

                        {savedCities.length === 0 ? (
                            <div className="text-center py-10 text-white/30 border border-dashed border-white/10 rounded-lg">
                                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No saved locations yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {savedCities.map(city => (
                                    <div key={city.id} className="group relative bg-[#121212] p-3 rounded-lg border border-[#333] hover:border-[var(--color-brand-medium)] transition-colors flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                                            {city.image_url ? (
                                                <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-xs">{city.name[0]}</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{city.name}</h4>
                                            <p className="text-xs text-white/50 truncate">{city.country}</p>
                                        </div>
                                        <button
                                            onClick={() => handleUnsaveCity(city.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 bg-white/5 rounded transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
