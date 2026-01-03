import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Clock, DollarSign } from 'lucide-react';

import { Trash2 } from 'lucide-react';
import api from '../../lib/api';

const SortableStop = ({ stop, index, onDelete, onDeleteActivity }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: stop.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-6 relative pl-8 border-l-2 border-dashed border-white/20 group/item">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-slate-900" />

            {/* Trash button positioned outside/relative for ease of access */}
            <button
                onClick={() => onDelete(stop.id)}
                className="absolute right-0 top-0 -mt-3 text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-full z-10"
                title="Remove City"
            >
                <Trash2 size={16} />
            </button>

            <div className="glass-card p-4">
                <div className="flex justify-between items-start mb-4" {...attributes} {...listeners}>
                    <div className="flex items-center space-x-3 cursor-grab active:cursor-grabbing">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                            {stop.city_image && <img src={stop.city_image} alt={stop.city_name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{stop.city_name}</h3>
                            <p className="text-white/50 text-xs">{stop.city_country}</p>
                        </div>
                    </div>
                    <div className="text-right text-xs text-white/40">
                        Day {index + 1}
                    </div>
                </div>

                {/* Activities */}
                <div className="space-y-2 mt-2">
                    {stop.activities && stop.activities.map((activity) => (
                        <div key={activity.id} className="bg-white/5 rounded-md p-2 flex items-center justify-between text-sm hover:bg-white/10 transition-colors group/activity">
                            <div className="flex items-center space-x-3">
                                <div className="p-1 rounded bg-indigo-500/20 text-indigo-200">
                                    <MapPin size={12} />
                                </div>
                                <span className="font-medium">{activity.name}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-white/50 text-xs">
                                {activity.scheduled_at && (
                                    <span className="flex items-center"><Clock size={10} className="mr-1" /> {new Date(activity.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                                <span className="flex items-center"><DollarSign size={10} className="mr-0" />{activity.cost}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteActivity(activity.id);
                                    }}
                                    className="text-red-400 opacity-0 group-hover/activity:opacity-100 hover:text-red-300 transition-opacity"
                                    title="Remove Activity"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {(!stop.activities || stop.activities.length === 0) && (
                        <div className="text-center p-2 text-white/30 text-xs italic border border-dashed border-white/10 rounded">
                            Drag activities here or specify time
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ItineraryTimeline = ({ stops, onRefresh }) => {

    // In a real app we might lift this logic, but for now lets do a quick prop drill or direct call
    const handleDelete = async (stopId) => {
        if (!confirm('Are you sure you want to remove this city?')) return;
        try {
            await api.delete(`/stops/${stopId}`);
            onRefresh(); // Refresh parent state
        } catch (e) {
            console.error("Failed to delete stop", e);
        }
    }

    const handleDeleteActivity = async (activityId) => {
        if (!confirm('Remove this activity?')) return;
        try {
            await api.delete(`/assignments/${activityId}`);
            onRefresh();
        } catch (e) {
            console.error("Failed to delete activity", e);
        }
    }

    return (
        <div className="p-4">
            {stops.map((stop, index) => (
                <SortableStop key={stop.id} stop={stop} index={index} onDelete={handleDelete} onDeleteActivity={handleDeleteActivity} />
            ))}
            {stops.length === 0 && (
                <div className="text-center p-8 text-white/50 bg-white/5 rounded-xl border border-dashed border-white/20">
                    No stops added yet. Search specifically for cities to add to your trip on the right.
                </div>
            )}
        </div>
    );
};

export default ItineraryTimeline;
