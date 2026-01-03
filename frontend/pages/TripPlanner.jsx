import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TripHeader from '../components/planner/TripHeader';
import ItineraryTimeline from '../components/planner/ItineraryTimeline';
import CitySearch from '../components/planner/CitySearch';
import BudgetView from '../components/planner/BudgetView';
import TripCalendar from '../components/planner/TripCalendar';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const TripPlanner = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary'); // itinerary, budget
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isAddCityOpen, setIsAddCityOpen] = useState(false);

    const fetchTrip = async () => {
        try {
            const res = await api.get(`/trips/${id}`);
            setTrip(res.data);
        } catch (error) {
            console.error("Error fetching trip", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            // Logic to reorder stops in Frontend state first
            const oldIndex = trip.stops.findIndex(s => s.id === active.id);
            const newIndex = trip.stops.findIndex(s => s.id === over.id);

            const newStops = arrayMove(trip.stops, oldIndex, newIndex);

            // Optimistic update
            setTrip({ ...trip, stops: newStops });

            // API Call
            const stopIds = newStops.map(s => s.id);
            await api.patch(`/trips/${trip.id}/stops`, { stopIds });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (loading) return <div>Loading...</div>;
    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="h-full flex flex-col">
            <TripHeader
                trip={trip}
                setTrip={setTrip}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onCalendarClick={() => setIsCalendarOpen(true)}
            />

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row mt-4 gap-4">
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {activeTab === 'itinerary' && (
                        <>
                            <div className="flex justify-end mb-4 pr-4">
                                <button
                                    onClick={() => setIsAddCityOpen(true)}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    <Plus size={18} />
                                    <span>Add City / Activity</span>
                                </button>
                            </div>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={trip.stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                    <ItineraryTimeline stops={trip.stops} onRefresh={fetchTrip} />
                                </SortableContext>
                            </DndContext>
                        </>
                    )}
                    {activeTab === 'budget' && (
                        <BudgetView
                            tripId={trip.id}
                            durationDays={
                                trip.start_date && trip.end_date
                                    ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1
                                    : 1
                            }
                        />
                    )}

                </div>


            </div>

            {/* Calendar Modal */}
            {isCalendarOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsCalendarOpen(false)}>
                    <div className="w-full max-w-5xl h-[80vh] bg-[#1E1E1E] rounded-xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsCalendarOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <TripCalendar trip={trip} />
                    </div>
                </div>
            )}

            {/* Add City/Activity Modal */}
            {isAddCityOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsAddCityOpen(false)}>
                    <div className="w-full max-w-md h-[70vh] bg-[#1E1E1E] rounded-xl overflow-hidden shadow-2xl relative flex flex-col p-6" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsAddCityOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-6 font-serif">Add to Trip</h2>
                        <div className="flex-1 overflow-hidden">
                            <CitySearch
                                tripId={trip.id}
                                stops={trip.stops}
                                onAdd={() => {
                                    fetchTrip();
                                    // We keep it open if adding multiple? Or close?
                                    // User said "adding the city ... as a popup". Usually implies finish = close.
                                    // But user might want to add activity after city.
                                    // I will leave it open for better UX, or user can close manually.
                                    // Actually, let's close it, as `CitySearch` has its own flow.
                                    setIsAddCityOpen(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripPlanner;
