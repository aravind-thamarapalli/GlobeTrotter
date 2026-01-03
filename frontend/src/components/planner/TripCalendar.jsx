import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isWithinInterval,
    parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Filter } from 'lucide-react';

const TripCalendar = ({ trip }) => {
    const [currentMonth, setCurrentMonth] = useState(
        trip.start_date ? parseISO(trip.start_date) : new Date()
    );

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Helper to find stops for a specific day
    const getStopsForDay = (day) => {
        return trip.stops.filter(stop => {
            if (!stop.arrival_date) return false;
            const start = parseISO(stop.arrival_date);
            const end = stop.departure_date ? parseISO(stop.departure_date) : start;
            // Check if day is within interval (start <= day <= end), ignoring time
            // To be precise, we compare YYYY-MM-DD strings or zeroed dates
            const checkDay = format(day, 'yyyy-MM-dd');
            const startStr = format(start, 'yyyy-MM-dd');
            const endStr = format(end, 'yyyy-MM-dd');
            return checkDay >= startStr && checkDay <= endStr;
            // isWithinInterval can be tricky with times, string comparison is safer for 'dates'
        });
    };

    const getActivitiesForDay = (day) => {
        const activities = [];
        trip.stops.forEach(stop => {
            if (stop.activities) {
                stop.activities.forEach(activity => {
                    if (activity.scheduled_at && isSameDay(parseISO(activity.scheduled_at), day)) {
                        activities.push(activity);
                    }
                });
            }
        });
        return activities;
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-white">
            {/* Toolbar matching image */}
            <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#121212]">
                <div className="hidden md:block text-2xl font-bold font-serif px-2">GlobalTrotter</div>
                <div className="flex-1 flex justify-end space-x-2">
                    <div className="flex items-center bg-[#2C2C2C] px-3 py-1.5 rounded text-sm text-gray-300 border border-[#444] w-64">
                        <input type="text" placeholder="Search bar..." className="bg-transparent border-none outline-none w-full placeholder-gray-500" />
                    </div>
                    <button className="flex items-center space-x-1 px-3 py-1.5 border border-[#444] rounded text-sm hover:bg-[#2C2C2C]">
                        <span>Group by</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 border border-[#444] rounded text-sm hover:bg-[#2C2C2C]">
                        <Filter size={14} />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 border border-[#444] rounded text-sm hover:bg-[#2C2C2C]">
                        <ArrowUpDown size={14} />
                        <span>Sort by...</span>
                    </button>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="p-4 flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 hover:bg-[#333] rounded-full"><ChevronLeft /></button>
                <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-[#333] rounded-full"><ChevronRight /></button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-7 border border-[#333] bg-[#2C2C2C]">
                    {/* Weekday Headers */}
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-xs font-medium text-gray-400 border-b border-[#333] bg-[#1a1a1a]">
                            {day}
                        </div>
                    ))}

                    {/* Days */}
                    {calendarDays.map((day, dayIdx) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const stops = getStopsForDay(day);
                        const activities = getActivitiesForDay(day);

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[120px] p-2 border-b border-r border-[#333] relative ${!isCurrentMonth ? 'bg-[#181818] text-gray-600' : 'bg-[#1E1E1E]'}`}
                            >
                                <span className="text-sm font-medium">{format(day, 'd')}</span>
                                <div className="mt-2 space-y-1">
                                    {/* City/Stop Markers */}
                                    {stops.map((stop, idx) => (
                                        <div
                                            key={`stop-${stop.id}-${dayIdx}`}
                                            className="text-[10px] uppercase font-bold tracking-wider p-1 rounded bg-[#333] text-gray-400 truncate border border-[#444]"
                                            title={`City: ${stop.city_name}`}
                                        >
                                            {stop.city_name}
                                        </div>
                                    ))}

                                    {/* Activity/Event Markers */}
                                    {activities.map((activity, idx) => (
                                        <div
                                            key={`activity-${activity.id}`}
                                            className="text-xs p-1.5 rounded bg-[var(--color-brand-medium)] text-white hover:bg-[var(--color-brand-dark)] transition-colors shadow-sm cursor-pointer truncate"
                                            title={`${activity.name} (${activity.type})`}
                                        >
                                            <span className="font-semibold">{activity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TripCalendar;
