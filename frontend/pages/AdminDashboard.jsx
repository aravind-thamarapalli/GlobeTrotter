import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Map, Activity, Globe } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="p-8">Loading stats...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6 flex items-center space-x-4">
                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-300"><Users size={24} /></div>
                    <div>
                        <p className="text-white/50 text-sm">Total Users</p>
                        <p className="text-2xl font-bold">{stats.users}</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4">
                    <div className="bg-purple-500/20 p-3 rounded-full text-purple-300"><Map size={24} /></div>
                    <div>
                        <p className="text-white/50 text-sm">Total Trips</p>
                        <p className="text-2xl font-bold">{stats.trips}</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4">
                    <div className="bg-green-500/20 p-3 rounded-full text-green-300"><Globe size={24} /></div>
                    <div>
                        <p className="text-white/50 text-sm">Cities</p>
                        <p className="text-2xl font-bold">{stats.cities}</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4">
                    <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-300"><Activity size={24} /></div>
                    <div>
                        <p className="text-white/50 text-sm">Activities</p>
                        <p className="text-2xl font-bold">{stats.activities}</p>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8">
                <h2 className="text-xl font-bold mb-6">Popular Destinations</h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.popularCities}>
                            <XAxis dataKey="name" stroke="#ffffff50" />
                            <YAxis stroke="#ffffff50" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1b4b', border: 'none' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="visit_count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
