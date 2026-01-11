import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBookings, getBookingParticipants } from '../services/api';
import SchematicMap from './SchematicMap';
import CrowdAnalytics from './CrowdAnalytics';

const TEMPLE_COORDINATES = {
    // Somnath Temple
    '1': { lat: 20.8880, lng: 70.4010, name: 'Somnath Temple' },
    // Dwarkadhish Temple
    '2': { lat: 22.2376, lng: 68.9676, name: 'Dwarkadhish Temple' },
    // Ambaji Temple
    '3': { lat: 24.3333, lng: 72.8500, name: 'Ambaji Temple' },
    // Default
    'default': { lat: 20.8880, lng: 70.4010, name: 'Temple' }
};

export default function HeatMap() {
    const { templeId } = useParams();
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [hoveredZoneId, setHoveredZoneId] = useState(null);

    // New State for Interactivity
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [playbackHour, setPlaybackHour] = useState(12); // Default 12 PM
    const [isPlaying, setIsPlaying] = useState(false);

    const [stats, setStats] = useState({
        totalVisitors: 0,
        peakHour: 'N/A',
        crowdLevel: 'Low'
    });

    const [mapCenter, setMapCenter] = useState(TEMPLE_COORDINATES['1']);
    const [zones, setZones] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [baseData, setBaseData] = useState(null); // Store fetched data to avoid refetching

    const [templeDetails, setTempleDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Try to get dynamic details if available, else fallback
                const details = TEMPLE_COORDINATES[templeId] || TEMPLE_COORDINATES['default'];
                // Check if we can get name from API? For now, we rely on the hardcoded map or default
                // But we can improve the "default" name
                setMapCenter(details);
                fetchHeatMapData(details);
            } catch (e) { console.error(e); }
        };
        fetchDetails();
    }, [templeId, selectedDate]);

    // Live Mode Simulation
    useEffect(() => {
        let interval;
        if (isLiveMode) {
            interval = setInterval(() => {
                simulateLiveMovement();
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLiveMode, zones]);

    // Playback Animation
    useEffect(() => {
        let interval;
        if (isPlaying && !isLiveMode) {
            interval = setInterval(() => {
                setPlaybackHour(prev => {
                    if (prev >= 23) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isLiveMode]);

    // Update Zones based on Playback Hour (when not in Live Mode)
    useEffect(() => {
        if (!isLiveMode && baseData) {
            updateZonesForHour(playbackHour);
        }
    }, [playbackHour, isLiveMode, baseData]);

    const simulateLiveMovement = () => {
        // Only update stats slightly to show interactivity if needed, but rely on real data fetch
        // For now, we'll keep it static based on fetch to ensure accuracy as requested
    };

    const updateZonesForHour = (hour) => {
        if (!baseData || !baseData.hourlyCounts) return;

        // Get density for this hour (simple approximation based on total hourly count)
        // In a real app, we'd have per-zone data per hour. 
        // Here we distribute the hourly total across zones based on their capacity weights.

        const hourLabel = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : hour === 0 ? '12 AM' : `${hour} AM`;
        const totalForHour = baseData.hourlyCounts[hourLabel] || 0;

        const newZones = baseData.baseZones.map(zone => {
            let count = 0;
            // Distribute total visitors roughly: Queue 40%, Mandap 30%, Sanctum 10%, Parking 20%
            if (zone.id === 'queue') count = Math.floor(totalForHour * 0.4);
            if (zone.id === 'mandap') count = Math.floor(totalForHour * 0.3);
            if (zone.id === 'sanctum') count = Math.floor(totalForHour * 0.1);
            if (zone.id === 'parking') count = Math.floor(totalForHour * 0.2);

            return updateZoneColor({ ...zone, current: count });
        });

        setZones(newZones);
    };

    const updateZoneColor = (zone) => {
        const density = zone.current / zone.capacity;
        let color = '#22c55e'; // Green
        if (density > 0.5) color = '#eab308'; // Yellow
        if (density > 0.8) color = '#f97316'; // Orange
        if (density > 1.0) color = '#dc2626'; // Red
        return { ...zone, color };
    };

    const fetchHeatMapData = async (center) => {
        try {
            setLoading(true);
            const allBookings = await getBookings();

            const filteredBookings = allBookings.filter(b =>
                (templeId ? String(b.templeId) === String(templeId) : true) &&
                b.bookingDate === selectedDate
            );

            // Aggregate data for Crowd Analytics (Hourly)
            const hours = [
                '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
                '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'
            ];

            const hourlyCounts = {};
            hours.forEach(h => hourlyCounts[h] = 0);

            let totalVisitors = 0;
            await Promise.all(filteredBookings.map(async (b) => {
                try {
                    const participants = await getBookingParticipants(b.bookingId);
                    const count = participants ? participants.length : 0;
                    if (count > 0) {
                        totalVisitors += count;

                        if (b.slotTime) {
                            const [startStr, endStr] = b.slotTime.split(' - ');
                            let startHour = parseInt(startStr.split(':')[0]);
                            let endHour = parseInt(endStr.split(':')[0]);

                            // Normalize to 12-hour format for matching
                            for (let h = startHour; h < endHour; h++) {
                                const ampm = h >= 12 ? 'PM' : 'AM';
                                const displayHour = h > 12 ? h - 12 : h; // 13 -> 1, 12 -> 12
                                const key = `${displayHour} ${ampm}`;
                                if (hourlyCounts[key] !== undefined) {
                                    hourlyCounts[key] += count;
                                }
                            }
                        }
                    }
                } catch (e) { console.error(e); }
            }));

            const analyticsData = hours.map(hour => ({
                time: hour,
                density: hourlyCounts[hour]
            }));

            setAnalyticsData(analyticsData);

            // Define Zones relative to the temple center
            const baseZones = [
                { id: 'sanctum', name: 'Sanctum Sanctorum', capacity: 50, latOffset: 0, lngOffset: 0, radius: 15 },
                { id: 'mandap', name: 'Main Mandap', capacity: 200, latOffset: 0.00015, lngOffset: 0, radius: 25 },
                { id: 'queue', name: 'Queue Complex', capacity: 500, latOffset: -0.00015, lngOffset: -0.0002, radius: 35 },
                { id: 'parking', name: 'Parking Area', capacity: 1000, latOffset: -0.0004, lngOffset: 0.0003, radius: 50 },
            ];

            // Store base data for playback
            setBaseData({ baseZones, hourlyCounts });

            // Initial Load (Default to 12 PM or current time if today)
            const currentHour = new Date().getHours();
            const isToday = selectedDate === new Date().toISOString().split('T')[0];
            const displayHour = isToday ? currentHour : 12;

            // Get count for the current display hour
            const ampm = displayHour >= 12 ? 'PM' : 'AM';
            const h12 = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
            const currentHourCount = hourlyCounts[`${h12} ${ampm}`] || 0;

            const initialZones = baseZones.map(zone => {
                let count = 0;
                // Distribute REAL visitors roughly: Queue 40%, Mandap 30%, Sanctum 10%, Parking 20%
                if (currentHourCount > 0) {
                    if (zone.id === 'queue') count = Math.floor(currentHourCount * 0.4);
                    if (zone.id === 'mandap') count = Math.floor(currentHourCount * 0.3);
                    if (zone.id === 'sanctum') count = Math.floor(currentHourCount * 0.1);
                    if (zone.id === 'parking') count = Math.floor(currentHourCount * 0.2);
                }

                return updateZoneColor({
                    ...zone,
                    current: count,
                    lat: center.lat + zone.latOffset,
                    lng: center.lng + zone.lngOffset
                });
            });

            setZones(initialZones);

            let crowdLevel = 'Low';
            if (totalVisitors > 500) crowdLevel = 'Moderate';
            if (totalVisitors > 1000) crowdLevel = 'High';
            if (totalVisitors > 2000) crowdLevel = 'Critical';

            // Calculate Peak Hour
            let maxDensity = 0;
            let peakHour = 'N/A';
            analyticsData.forEach(d => {
                if (d.density > maxDensity) {
                    maxDensity = d.density;
                    peakHour = d.time;
                }
            });

            setStats({
                totalVisitors,
                peakHour: peakHour !== 'N/A' ? `${peakHour} - ${parseInt(peakHour) + 1} ${peakHour.includes('AM') ? 'AM' : 'PM'}` : 'N/A', // Simple approx
                crowdLevel
            });

        } catch (error) {
            console.error("Failed to fetch heatmap data", error);
        } finally {
            setLoading(false);
        }
    };

    const hoveredZoneData = zones.find(z => z.id === hoveredZoneId);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Temple Heat Map</h1>
                    <div className="flex items-center gap-2 mt-2">
                        {isLiveMode ? (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        ) : (
                            <span className="h-3 w-3 rounded-full bg-slate-300"></span>
                        )}
                        <p className="text-slate-500 text-sm font-medium">
                            {isLiveMode ? 'Live Monitoring (Simulated) • ' : 'Real Data View • '} {mapCenter.name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Live Mode Toggle */}
                    <button
                        onClick={() => setIsLiveMode(!isLiveMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isLiveMode
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                    >
                        {isLiveMode ? '🔴 LIVE ON' : '⚪ GO LIVE'}
                    </button>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Visitors</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-slate-800">{stats.totalVisitors}</p>
                        <span className="text-xs text-green-600 font-medium">
                            {isLiveMode ? 'Live Count' : 'Daily Total'}
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Crowd Level</h3>
                    <p className={`text-3xl font-bold ${stats.crowdLevel === 'Critical' ? 'text-red-600' :
                        stats.crowdLevel === 'High' ? 'text-orange-600' :
                            stats.crowdLevel === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
                        }`}>{stats.crowdLevel}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Est. Peak Hour</h3>
                    <p className="text-3xl font-bold text-slate-800">{stats.peakHour}</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
                {/* Left: Schematic Map */}
                <div className="lg:col-span-2 h-full">
                    <SchematicMap zones={zones} onZoneHover={setHoveredZoneId} />
                </div>

                {/* Right: Analytics & Info */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Crowd Analytics Chart */}
                    <div className="flex-1 min-h-0">
                        <CrowdAnalytics data={analyticsData} />
                    </div>

                    {/* Zone Information Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-orange-500">ℹ️</span> Zone Information
                        </h3>
                        {hoveredZoneData ? (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Zone Name</span>
                                    <span className="text-xl font-bold text-slate-800">{hoveredZoneData.name}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Current Visitors</span>
                                    <span className="text-xl font-bold text-orange-600">{hoveredZoneData.current}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Capacity</span>
                                    <span className="text-slate-800">{hoveredZoneData.capacity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${hoveredZoneData.current / hoveredZoneData.capacity > 0.8 ? 'bg-red-100 text-red-700' :
                                        hoveredZoneData.current / hoveredZoneData.capacity > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {hoveredZoneData.current / hoveredZoneData.capacity > 0.8 ? 'CRITICAL' :
                                            hoveredZoneData.current / hoveredZoneData.capacity > 0.5 ? 'MODERATE' : 'NORMAL'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <p>Hover over a zone to see details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
