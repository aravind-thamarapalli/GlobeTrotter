import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../../lib/api';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#10b981'];

const BudgetView = ({ tripId, durationDays = 1 }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState('pie');

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await api.get(`/trips/${tripId}/budget`);
                setData(res.data);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        fetchBudget();
    }, [tripId]);

    if (loading) return <div className="p-10 text-center animate-pulse">Calculating expenses...</div>;
    if (!data) return <div>No data</div>;

    const dailyAvg = (data.total / Math.max(durationDays, 1)).toFixed(2);
    // Hardcoded limit for demo, optimally this comes from user settings
    const dailyLimit = 300;
    const isOverBudget = dailyAvg > dailyLimit;

    return (
        <div className="glass-card p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Financial Overview</h2>
                    <p className="text-sm text-white/50">Keep track of your spending habits.</p>
                </div>
                <div className="flex space-x-2 bg-white/10 p-1 rounded-lg">
                    <button onClick={() => setChartType('pie')} className={`px-3 py-1 text-sm rounded-md transition-all ${chartType === 'pie' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/10'}`}>Pie</button>
                    <button onClick={() => setChartType('bar')} className={`px-3 py-1 text-sm rounded-md transition-all ${chartType === 'bar' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/10'}`}>Bar</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                {/* Visuals */}
                <div className="h-[300px] lg:h-auto bg-white/5 rounded-2xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={data.breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="cost"
                                    nameKey="category"
                                >
                                    {data.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        ) : (
                            <BarChart data={data.breakdown}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip cursor={{ fill: 'white', opacity: 0.1 }} contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px' }} />
                                <Bar dataKey="cost" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                    {data.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Metrics */}
                <div className="flex flex-col justify-center space-y-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-2xl border border-white/10">
                        <span className="text-white/60 text-sm uppercase tracking-wider">Total Estimated Cost</span>
                        <div className="text-5xl font-bold text-white mt-1">
                            ${data.total.toLocaleString()}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${isOverBudget ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50'}`}>
                            <span className="text-white/60 text-xs uppercase">Avg / Day</span>
                            <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                                ${dailyAvg}
                            </div>
                            {isOverBudget && <span className="text-xs text-red-300 mt-1 block">⚠️ Over daily limit ($300)</span>}
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-white/60 text-xs uppercase">Items</span>
                            <div className="text-2xl font-bold text-white">
                                {data.breakdown.length} Categories
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold mb-3 text-white/80">Expense Details</h4>
                        <div className="space-y-3 h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.breakdown.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="capitalize text-white/90 font-medium">{item.category}</span>
                                    </div>
                                    <span className="font-mono text-white/70">${item.cost.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetView;
