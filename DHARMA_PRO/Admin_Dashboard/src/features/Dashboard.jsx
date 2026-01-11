import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Bell } from 'lucide-react';
import KioskTicket from '../components/KioskTicket';

import { getBookings, getBookingParticipants, getSlots, createKioskBooking, addParticipant } from '../services/api';

// Real Temple Timings Data
const TEMPLE_TIMINGS = {
    '1': { // Somnath
        name: 'Somnath Temple',
        darshan: '6:00 AM - 10:00 PM',
        aarti: { morning: '7:00 AM', noon: '12:00 PM', evening: '7:00 PM' }
    },
    '2': { // Dwarkadhish
        name: 'Dwarkadhish Temple',
        darshan: '6:30 AM - 1:00 PM, 5:00 PM - 9:30 PM',
        aarti: { morning: '6:30 AM', noon: '10:30 AM', evening: '7:30 PM' }
    },
    '3': { // Ambaji
        name: 'Ambaji Temple',
        darshan: '7:30 AM - 11:30 AM, 12:30 PM - 4:15 PM, 7:00 PM - 9:00 PM',
        aarti: { morning: '7:00 AM', noon: '12:00 PM', evening: '7:00 PM' }
    },
    '4': { // Pavagadh
        name: 'Mahakali Temple',
        darshan: '5:00 AM - 7:00 PM',
        aarti: { morning: '5:00 AM', noon: 'N/A', evening: '6:30 PM' }
    },
    'default': {
        name: 'Temple',
        darshan: '6:00 AM - 9:00 PM',
        aarti: { morning: '7:00 AM', noon: '12:00 PM', evening: '7:30 PM' }
    }
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { templeId } = useParams();
    const [timeRange, setTimeRange] = useState('Week');
    const [systemAlerts, setSystemAlerts] = useState([]); // Will be populated with mock data
    const [selectedDate, setSelectedDate] = useState('');

    // Kiosk Mode State
    const [showKioskModal, setShowKioskModal] = useState(false);
    const [todaysSlots, setTodaysSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [kioskFormData, setKioskFormData] = useState({
        name: '',
        mobileNumber: '',
        age: '',
        gender: 'Male',
        photoIdType: 'Aadhar Card',
        photoIdNumber: '',

        participant_by_category: 'Adult',
        additionalDevotees: []
    });
    const [kioskLoading, setKioskLoading] = useState(false);
    const [kioskSuccess, setKioskSuccess] = useState(false);
    const [kioskError, setKioskError] = useState(null);
    const [bookingResult, setBookingResult] = useState(null);

    // State for real data
    const [stats, setStats] = useState([
        { title: 'Total Visitors', value: '0', change: '0%', color: 'orange' },
        { title: 'Active Slots', value: '0', change: '0%', color: 'red' },
        { title: 'Parking Occupancy', value: '0%', change: '0%', color: 'amber' },
    ]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allBookings, setAllBookings] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);

    const handleKioskFormChange = (e) => {
        const { name, value } = e.target;
        setKioskFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddDevotee = () => {
        setKioskFormData(prev => ({
            ...prev,
            additionalDevotees: [
                ...prev.additionalDevotees,
                { name: '', age: '', gender: 'Male', photoIdType: 'Aadhar Card', photoIdNumber: '', participant_by_category: 'Adult' }
            ]
        }));
    };

    const handleRemoveDevotee = (index) => {
        setKioskFormData(prev => ({
            ...prev,
            additionalDevotees: prev.additionalDevotees.filter((_, i) => i !== index)
        }));
    };

    const handleDevoteeChange = (index, field, value) => {
        setKioskFormData(prev => {
            const newDevotees = [...prev.additionalDevotees];
            newDevotees[index] = { ...newDevotees[index], [field]: value };
            return { ...prev, additionalDevotees: newDevotees };
        });
    };

    const handleKioskSubmit = async (e) => {
        e.preventDefault();
        setKioskLoading(true);
        setKioskError(null);

        if (!selectedSlot) {
            setKioskError("Please select a slot.");
            setKioskLoading(false);
            return;
        }

        try {
            const totalParticipants = 1 + kioskFormData.additionalDevotees.length;

            const payload = {
                bookingId: 0,
                ...kioskFormData,
                numberOfParticipants: totalParticipants,
                age: parseInt(kioskFormData.age),
                slotId: selectedSlot.slotId || selectedSlot.id,
                templeId: selectedSlot.templeId || (templeId ? parseInt(templeId) : 0),
                date: new Date().toISOString().split('T')[0],
                bookingType: 'OFFLINE', // Explicitly mark as OFFLINE
                userId: 1 // Admin user default
            };

            console.log("Submitting Kiosk Booking Payload:", payload);
            const newBooking = await createKioskBooking(payload);
            const bookingId = newBooking.bookingId || newBooking.id;

            if (bookingId) {
                // 1. Add Primary Participant explicitly
                await addParticipant({
                    bookingId: bookingId,
                    name: kioskFormData.name,
                    age: parseInt(kioskFormData.age),
                    gender: kioskFormData.gender,
                    photoIdType: kioskFormData.photoIdType,
                    photoIdNumber: kioskFormData.photoIdNumber,
                    participant_by_category: kioskFormData.participant_by_category
                });

                // 2. Add Additional Participants
                if (kioskFormData.additionalDevotees.length > 0) {
                    await Promise.all(kioskFormData.additionalDevotees.map(devotee =>
                        addParticipant({
                            bookingId: bookingId,
                            name: devotee.name,
                            age: parseInt(devotee.age),
                            gender: devotee.gender,
                            photoIdType: devotee.photoIdType,
                            photoIdNumber: devotee.photoIdNumber,
                            participant_by_category: devotee.participant_by_category
                        })
                    ));
                }
            }

            setKioskSuccess(true);

            // Construct full booking object using the response and form data for the Ticket View
            setBookingResult({
                bookingId: newBooking.bookingId || newBooking.id, // Ensure ID is captured
                bookingDate: kioskFormData.bookingDate || newBooking.date || new Date().toISOString().split('T')[0],
                slotTime: selectedSlot.startTime ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : (selectedSlot.slotTime || `Slot #${selectedSlot.id}`), // Get time from selectedSlot
                slotId: selectedSlot.id || selectedSlot.slotId, // Ensure SlotID is captured
                templeId: selectedSlot.templeId,
                numberOfParticipants: totalParticipants,
                participants: [
                    {
                        name: kioskFormData.name,
                        age: kioskFormData.age,
                        gender: kioskFormData.gender,
                        photoIdNumber: kioskFormData.photoIdNumber
                    },
                    ...kioskFormData.additionalDevotees
                ]
            });

            // Refetch data immediately
            fetchDashboardData();

        } catch (err) {
            console.error(err);
            setKioskError(err.message || "Failed to book ticket. Please try again.");
        } finally {
            setKioskLoading(false);
        }
    };





    const handleResolveAlert = (id) => {
        setSystemAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    const handleDismissAlert = (id) => {
        setSystemAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    const quickActions = [
        { title: 'Manage Slots', path: `/temple/${templeId}/slots`, color: 'bg-orange-600' },
        { title: 'Surveillance', path: `/temple/${templeId}/camera`, color: 'bg-amber-600' },
        { title: 'Kiosk Mode', path: 'KIOSK_ACTION', color: 'bg-indigo-600' },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, [templeId, selectedDate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const allBookingsData = await getBookings();
            setAllBookings(allBookingsData); // Store raw data for chart processing

            // Filter by templeId if present
            const filteredBookings = templeId
                ? allBookingsData.filter(b => String(b.templeId) === String(templeId))
                : allBookingsData;

            // 1. Calculate "Visitors Today"
            const today = new Date().toISOString().split('T')[0];
            const todaysBookings = filteredBookings.filter(b => b.bookingDate === today);

            // Fetch participants for today's bookings to get accurate visitor count
            let visitorsToday = 0;
            await Promise.all(todaysBookings.map(async (b) => {
                try {
                    const participants = await getBookingParticipants(b.bookingId);
                    visitorsToday += participants ? participants.length : 0;
                } catch (e) {
                    console.error("Error counting participants", e);
                }
            }));

            // 2. Active Slots (Unique slots booked today)
            // 2. Active Slots (Unique slots available TODAY)
            let activeSlots = 0;
            // Always fetch slots to update todaysSlots state
            try {
                const slots = await getSlots(templeId); // If templeId is undefined, it returns all slots
                const todaysActiveSlots = slots.filter(s => s.date === today);
                activeSlots = todaysActiveSlots.length;

                // Fetch accurate booked count for each slot
                const enrichedSlots = await Promise.all(todaysActiveSlots.map(async (slot) => {
                    // Filter bookings for this slot
                    const slotRefId = slot.slotId || slot.id;
                    const slotBookings = todaysBookings.filter(b => b.slotId == slotRefId);
                    let onlineBooked = 0;
                    let offlineBooked = 0;

                    await Promise.all(slotBookings.map(async (b) => {
                        try {
                            const p = await getBookingParticipants(b.bookingId);
                            const count = p ? p.length : 0;
                            const isOffline = ['KIOSK', 'OFFLINE', 'WALKIN'].includes(String(b.bookingType).toUpperCase());

                            if (isOffline) {
                                offlineBooked += count;
                            } else {
                                onlineBooked += count;
                            }
                        } catch (e) { }
                    }));

                    return {
                        ...slot,
                        onlineBooked,
                        offlineBooked,
                        // Show OFFLINE Availability as requested
                        currentBooked: offlineBooked,
                        offlineQuota: slot.reservedOfflineTickets || 0,
                        capacity: slot.capacity // Keep original capacity for reference if needed
                    };
                }));

                setTodaysSlots(enrichedSlots);

            } catch (err) {
                console.error("Failed to fetch slots for dashboard", err);
            }

            console.log("Dashboard Data:", { visitorsToday, bookingsToday: todaysBookings.length, activeSlots });

            setStats([
                { title: 'Total Visitors', value: visitorsToday.toString(), change: 'Today', color: 'orange' },
                { title: 'Active Slots', value: activeSlots.toString(), change: 'Today', color: 'red' },
                { title: 'Total Bookings', value: filteredBookings.length.toString(), change: 'All Time', color: 'amber' },
            ]);

            // 3. Process Recent Bookings (Last 5)
            let recentBookingsData = filteredBookings
                .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

            if (selectedDate) {
                recentBookingsData = recentBookingsData.filter(b => b.bookingDate === selectedDate);
            }

            recentBookingsData = recentBookingsData.slice(0, 5);

            const recentBookingsWithUsers = await Promise.all(recentBookingsData.map(async (b) => {
                let userName = `User ${b.userId}`;
                try {
                    // Try to get first participant name as the "User"
                    const participants = await getBookingParticipants(b.bookingId);
                    if (participants && participants.length > 0) {
                        userName = participants[0].name;
                        if (participants.length > 1) {
                            userName += ` +${participants.length - 1}`;
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch participants for booking ${b.bookingId}`, err);
                }

                return {
                    id: `#BK-${b.bookingId}`,
                    user: userName,
                    temple: `Temple ${b.templeId}`, // Could fetch temple name if needed, but ID is faster
                    status: b.status || 'Confirmed',
                    time: b.bookingDate,
                    type: b.bookingType || b.booking_type || 'Normal'
                };
            }));

            setRecentBookings(recentBookingsWithUsers);

            // MOCK NOTIFICATIONS (Use data so the Alert Button has something to show)
            if (systemAlerts.length === 0) {
                setSystemAlerts([
                    { id: 1, title: 'Traffic Spike', msg: 'High visitor flow detected at Gate 3.', time: '10m ago', type: 'warning' },
                    { id: 2, title: 'Server Maintenance', msg: 'Scheduled for tonight at 2:00 AM.', time: '2h ago', type: 'info' }
                ]);
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    // Effect to process chart data whenever timeRange, templeId, or bookings change
    useEffect(() => {
        const processChartData = async () => {
            if (allBookings.length === 0) return;

            setChartLoading(true);
            try {
                // Filter by templeId first
                const filteredBookings = templeId
                    ? allBookings.filter(b => String(b.templeId) === String(templeId))
                    : allBookings;

                let labels = [];
                let counts = {};

                if (timeRange === 'Day') {
                    // Hourly breakdown for today
                    labels = [...Array(24)].map((_, i) => `${String(i).padStart(2, '0')}:00`);
                    labels.forEach(l => counts[l] = 0);

                    const todayStr = new Date().toISOString().split('T')[0];
                    const todayBookings = filteredBookings.filter(b => b.bookingDate === todayStr);

                    await Promise.all(todayBookings.map(async (b) => {
                        try {
                            const participants = await getBookingParticipants(b.bookingId);
                            const count = participants ? participants.length : 0;

                            if (b.slotTime) {
                                const startHour = b.slotTime.split(':')[0]; // "10"
                                const key = `${startHour.padStart(2, '0')}:00`;
                                if (counts[key] !== undefined) {
                                    counts[key] += count;
                                }
                            }
                        } catch (e) { console.error(e); }
                    }));

                } else if (timeRange === 'Week') {
                    // Last 7 Days
                    labels = [...Array(7)].map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return d.toISOString().split('T')[0];
                    }).reverse();
                    labels.forEach(l => counts[l] = 0);

                    const relevantBookings = filteredBookings.filter(b => labels.includes(b.bookingDate));
                    await Promise.all(relevantBookings.map(async (b) => {
                        try {
                            const participants = await getBookingParticipants(b.bookingId);
                            if (participants) counts[b.bookingDate] += participants.length;
                        } catch (e) { console.error(e); }
                    }));

                } else if (timeRange === 'Month') {
                    // Last 30 Days
                    labels = [...Array(30)].map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return d.toISOString().split('T')[0];
                    }).reverse();
                    labels.forEach(l => counts[l] = 0);

                    const relevantBookings = filteredBookings.filter(b => labels.includes(b.bookingDate));
                    await Promise.all(relevantBookings.map(async (b) => {
                        try {
                            const participants = await getBookingParticipants(b.bookingId);
                            if (participants) counts[b.bookingDate] += participants.length;
                        } catch (e) { console.error(e); }
                    }));

                } else if (timeRange === 'Year') {
                    // Monthly breakdown for current year
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    labels = months;
                    months.forEach(m => counts[m] = 0);

                    const currentYear = new Date().getFullYear();
                    const relevantBookings = filteredBookings.filter(b => new Date(b.bookingDate).getFullYear() === currentYear);

                    await Promise.all(relevantBookings.map(async (b) => {
                        try {
                            const participants = await getBookingParticipants(b.bookingId);
                            if (participants) {
                                const monthIndex = new Date(b.bookingDate).getMonth();
                                const monthName = months[monthIndex];
                                counts[monthName] += participants.length;
                            }
                        } catch (e) { console.error(e); }
                    }));
                }

                const processedData = labels.map(label => ({
                    name: label,
                    visitors: counts[label]
                }));

                setChartData(processedData);
            } catch (error) {
                console.error("Error processing chart data:", error);
            } finally {
                setChartLoading(false);
            }
        };

        processChartData();
    }, [allBookings, timeRange, templeId]);

    // Use chartData instead of static data


    return (
        <div className="space-y-8 relative max-w-7xl mx-auto ml-4">


            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-slate-200/60">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                        Dashboard <span className="text-orange-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        Welcome back! Here's what's happening at the temple today.
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Alert Button */}
                    <button
                        onClick={() => {
                            const alertsSection = document.getElementById('system-alerts-section');
                            if (alertsSection) {
                                alertsSection.scrollIntoView({ behavior: 'smooth' });
                                // Highlight effect
                                alertsSection.classList.add('ring-4', 'ring-orange-200');
                                setTimeout(() => alertsSection.classList.remove('ring-4', 'ring-orange-200'), 1500);
                            }
                        }}
                        className="relative px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-all shadow-sm active:scale-95 flex items-center justify-center group"
                    >
                        <Bell size={20} className="group-hover:animate-swing" />
                        {systemAlerts.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                {systemAlerts.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150`}></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">

                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${stat.change.startsWith('+') || stat.change === 'Today' || stat.change === 'All Time'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {stat.change}
                            </span>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
                            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid (3 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Visitor Analytics Chart */}
                    <div className="glass-card p-8 rounded-3xl">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Visitor Analytics</h3>
                                <p className="text-sm text-slate-500 font-medium">Traffic trends over time</p>
                            </div>
                            <div className="flex bg-slate-100/80 p-1 rounded-xl">
                                {['Day', 'Week', 'Month', 'Year'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range
                                            ? 'bg-white text-orange-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-80 w-full relative">
                            {chartLoading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                                        <span className="text-xs font-bold text-orange-600">Updating Chart...</span>
                                    </div>
                                </div>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', visitors: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                                            padding: '12px 16px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="visitors"
                                        fill="url(#colorGradient)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                        animationDuration={1000}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ea580c" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#ea580c" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Bookings Table */}
                    <div className="glass-card rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
                                    <p className="text-xs text-slate-500 font-medium">Latest slot reservations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="date"
                                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-600 bg-white shadow-sm"
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                                <button className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                                    View All
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Booking ID</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Temple</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                                {booking.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {booking.user.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-700 block">{booking.user}</span>
                                                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border
                                                            ${booking.type === 'Special'
                                                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                                : booking.type === 'OFFLINE'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                                    : 'bg-slate-50 text-slate-500 border-slate-100'
                                                            }`}>
                                                            {booking.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">{booking.temple}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${booking.status === 'Confirmed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : booking.status === 'Pending'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 font-medium text-xs">{booking.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3 width) */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span></span> Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (action.path === 'KIOSK_ACTION') {
                                            setShowKioskModal(true);
                                        } else if (action.path.startsWith('http')) {
                                            window.open(action.path, '_blank');
                                        } else {
                                            navigate(action.path);
                                        }
                                    }}
                                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-transparent ${action.color} text-white shadow-md group relative overflow-hidden`}
                                >
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-3xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300"></span>
                                    <span className="text-xs font-bold text-center leading-tight tracking-wide">{action.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced System Alerts */}
                    <div id="system-alerts-section" className="glass-card p-6 rounded-3xl transition-all duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <span></span> System Alerts
                            </h3>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                                {systemAlerts.length} New
                            </span>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {systemAlerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                    <span className="text-4xl mb-2 opacity-50"></span>
                                    <p className="text-sm font-medium">All systems normal</p>
                                </div>
                            ) : (
                                systemAlerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${alert.type === 'critical' ? 'border-red-500 ring-1 ring-red-50' :
                                        alert.type === 'warning' ? 'border-amber-500 ring-1 ring-amber-50' :
                                            'border-blue-500 ring-1 ring-blue-50'
                                        }`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-bold ${alert.type === 'critical' ? 'text-red-700' :
                                                alert.type === 'warning' ? 'text-amber-700' :
                                                    'text-blue-700'
                                                }`}>{alert.title}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{alert.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{alert.msg}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleResolveAlert(alert.id)}
                                                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                                            >
                                                Resolve
                                            </button>
                                            <button
                                                onClick={() => handleDismissAlert(alert.id)}
                                                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Kiosk Mode Modal */}
            {showKioskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    {selectedSlot ? 'Book Kiosk Ticket' : 'Active Kiosk Slots'}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    {selectedSlot ? `Booking for Slot #${selectedSlot.slotId || selectedSlot.id}` : 'Available slots for today'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowKioskModal(false);
                                    setSelectedSlot(null);
                                    setKioskError(null);
                                    setKioskSuccess(false);
                                    setBookingResult(null);
                                }}
                                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                x
                            </button>
                        </div>



                        <div className="p-6 overflow-y-auto h-full">
                            {bookingResult ? (
                                <KioskTicket
                                    booking={bookingResult}
                                    onClose={() => {
                                        setShowKioskModal(false);
                                        setBookingResult(null); // Reset
                                        setSelectedSlot(null);
                                        setKioskSuccess(false);
                                    }}
                                    onRegisterNew={() => {
                                        setBookingResult(null); // Clear result to show form again
                                        setKioskSuccess(false);
                                        setKioskFormData({
                                            name: '',
                                            mobileNumber: '',
                                            age: '',
                                            gender: 'Male',
                                            photoIdType: 'Aadhar Card',
                                            photoIdNumber: '',
                                            participant_by_category: 'Adult',
                                            additionalDevotees: []
                                        });
                                    }}
                                />
                            ) : kioskSuccess ? ( // Fallback just in case
                                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">

                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                                    <p className="text-slate-500">Ticket has been successfully generated.</p>
                                </div>
                            ) : selectedSlot ? (
                                <form onSubmit={handleKioskSubmit} className="space-y-4 animate-fade-in">
                                    {kioskError && (
                                        <div className="p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
                                            <span></span> {kioskError}
                                        </div>
                                    )}

                                    <div className="space-y-1 mb-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                                        <input
                                            type="tel"
                                            name="mobileNumber"
                                            required
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            value={kioskFormData.mobileNumber}
                                            onChange={handleKioskFormChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                            placeholder="Enter 10-digit mobile"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={kioskFormData.name}
                                                onChange={handleKioskFormChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                                placeholder="Enter name"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                required
                                                min="1"
                                                max="120"
                                                value={kioskFormData.age}
                                                onChange={handleKioskFormChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                                placeholder="Age"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
                                            <select
                                                name="gender"
                                                value={kioskFormData.gender}
                                                onChange={handleKioskFormChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all appearance-none"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                            <select
                                                name="participant_by_category"
                                                value={kioskFormData.participant_by_category}
                                                onChange={handleKioskFormChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all appearance-none"
                                            >
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                                <option value="Senior Citizen">Senior Citizen</option>
                                                <option value="Foreigner">Foreigner</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">ID Type</label>
                                            <select
                                                name="photoIdType"
                                                value={kioskFormData.photoIdType}
                                                onChange={handleKioskFormChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all appearance-none"
                                            >
                                                <option value="Aadhar Card">Aadhar Card</option>
                                                <option value="PAN Card">PAN Card</option>
                                                <option value="Driving License">Driving License</option>
                                                <option value="Passport">Passport</option>
                                                <option value="Voter ID">Voter ID</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">ID Number</label>
                                            <input
                                                type="text"
                                                name="photoIdNumber"
                                                required
                                                value={kioskFormData.photoIdNumber}
                                                onChange={handleKioskFormChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                                                placeholder="Enter ID Number"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Devotees Section */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Additional Devotees</h4>
                                            <button
                                                type="button"
                                                onClick={handleAddDevotee}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <span>+</span> Add Devotee
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {kioskFormData.additionalDevotees.map((devotee, index) => (
                                                <div key={index} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDevotee(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-full flex items-center justify-center shadow-sm transition-all z-10"
                                                        title="Remove Devotee"
                                                    >
                                                        ✕
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                                                            <input
                                                                type="text"
                                                                value={devotee.name}
                                                                onChange={(e) => handleDevoteeChange(index, 'name', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
                                                                placeholder="Name"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                                                            <input
                                                                type="number"
                                                                value={devotee.age}
                                                                onChange={(e) => handleDevoteeChange(index, 'age', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
                                                                placeholder="0"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                                                            <select
                                                                value={devotee.gender}
                                                                onChange={(e) => handleDevoteeChange(index, 'gender', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
                                                            >
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">ID No.</label>
                                                            <input
                                                                type="text"
                                                                value={devotee.photoIdNumber}
                                                                onChange={(e) => handleDevoteeChange(index, 'photoIdNumber', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
                                                                placeholder="Optional"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {kioskFormData.additionalDevotees.length === 0 && (
                                                <div className="text-center py-4 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    No additional devotees added
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSlot(null)}
                                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={kioskLoading}
                                            className={`flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 ${kioskLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {kioskLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <span>Confirm Booking</span>
                                                    <span>→</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : todaysSlots.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                        📅
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No Active Slots</h3>
                                    <p className="text-slate-500">There are no slots scheduled for today.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {todaysSlots.map((slot) => {
                                        const availabilityPercentage = slot.offlineQuota > 0 ? Math.round((slot.currentBooked / slot.offlineQuota) * 100) : 0;
                                        const isFull = slot.currentBooked >= slot.offlineQuota;

                                        return (
                                            <button
                                                key={slot.id}
                                                disabled={isFull}
                                                onClick={() => !isFull && setSelectedSlot(slot)}
                                                className={`w-full text-left border rounded-xl p-4 transition-all group relative overflow-hidden ${isFull
                                                    ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                                                    : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 hover:shadow-md cursor-pointer'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${isFull ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                                            Slot #{slot.id}
                                                        </span>
                                                        <h4 className="text-lg font-bold text-slate-900 mt-2">
                                                            {slot.startTime || slot.slotTime?.split(' - ')[0] || 'Unknown Time'}
                                                            <span className="text-slate-400 mx-2">-</span>
                                                            {slot.endTime || slot.slotTime?.split(' - ')[1] || 'Unknown Time'}
                                                        </h4>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isFull
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        }`}>
                                                        {isFull ? 'FULL' : 'AVAILABLE'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span className="text-slate-500">Offline Availability</span>
                                                        <span className="text-slate-900">
                                                            {Math.max(0, slot.offlineQuota - slot.currentBooked)} / {slot.offlineQuota}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-indigo-500'
                                                                }`}
                                                            style={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {!isFull && (
                                                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 font-bold text-sm bg-white/80 px-3 py-1 rounded-lg shadow-sm">
                                                        Select Slot →
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {!selectedSlot && !kioskSuccess && (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setShowKioskModal(false)}
                                    className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
