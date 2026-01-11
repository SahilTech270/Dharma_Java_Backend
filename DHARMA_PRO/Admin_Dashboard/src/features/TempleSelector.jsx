import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTemple, getBookings, getBookingParticipants, getSlots } from "../services/api";
import SomnathImage from "../assets/somanth.jpg";
import DwarkaImage from "../assets/dwarka.jpg";
import AmbajiImage from "../assets/ambaji.jpg";
import PavagadhImage from "../assets/pavagadh.jpg";

export default function TempleSelector({ temples }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTempleName, setNewTempleName] = useState("");
  const [newTempleLocation, setNewTempleLocation] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [templeStats, setTempleStats] = useState({});


  useEffect(() => {
    fetchTempleStats();
  }, [temples]);

  const fetchTempleStats = async () => {
    try {
      const allBookings = await getBookings();
      const today = new Date().toISOString().split('T')[0];
      const todaysBookings = allBookings.filter(b => b.bookingDate === today);

      const stats = {};

      // Initialize stats
      temples.forEach(t => {
        stats[t.templeId] = { activeSlots: 0, totalVisitors: 0 };
      });

      // Fetch data for each temple in parallel
      await Promise.all(temples.map(async (temple) => {
        const tId = temple.templeId;

        // 1. Fetch Slots for this specific temple
        try {
          const slots = await getSlots(tId);
          // Count slots for today
          const activeSlotsCount = slots.filter(s => s.date === today).length;
          if (stats[tId]) {
            stats[tId].activeSlots = activeSlotsCount;
          }
        } catch (err) {
          console.error(`Failed to fetch slots for temple ${tId}`, err);
        }

        // 2. Calculate Total Visitors (from bookings)
        const templeBookings = todaysBookings.filter(b => String(b.templeId) === String(tId));
        let totalVisitors = 0;

        await Promise.all(templeBookings.map(async (b) => {
          try {
            const participants = await getBookingParticipants(b.bookingId);
            totalVisitors += participants ? participants.length : 0;
          } catch (e) {
            // console.error(`Error fetching participants for booking ${b.bookingId}`, e);
          }
        }));

        if (stats[tId]) {
          stats[tId].totalVisitors = totalVisitors;
        }
      }));

      setTempleStats(stats);
    } catch (error) {
      console.error("Failed to fetch temple stats:", error);
    }
  };

  const handleAddTemple = async (e) => {
    e.preventDefault();
    if (!newTempleName || !newTempleLocation) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      await createTemple({
        templeName: newTempleName,
        location: newTempleLocation
      });
      alert("Temple created successfully! Reloading...");
      setShowAddModal(false);
      setNewTempleName("");
      setNewTempleLocation("");
      window.location.reload(); // Simple reload to fetch new data since we don't have a global refresh context yet
    } catch (error) {
      console.error("Failed to create temple:", error);
      alert("Failed to create temple");
    } finally {
      setIsCreating(false);
    }
  };

  // Enhanced temple data with images
  const enhancedTemples = temples.map(temple => {
    const { templeName } = temple;

    let image = "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1000"; // Default
    const lowerName = templeName.toLowerCase();
    if (lowerName.includes("somnath")) image = SomnathImage;
    if (lowerName.includes("dwarka") || lowerName.includes("dwarkadhish")) image = DwarkaImage;
    if (lowerName.includes("ambaji")) image = AmbajiImage;
    if (lowerName.includes("pavagadh")) image = PavagadhImage;

    return { ...temple, image };
  });

  const filteredTemples = enhancedTemples.filter(temple =>
    temple.templeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (temple.location && temple.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectTemple = (templeId) => {
    navigate(`/temple/${templeId}/dashboard`);
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 ml-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Select Temple</h1>
          <p className="text-slate-500 mt-1">Choose a temple to manage slots and services.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <input
              type="text" 
              placeholder="Search temples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition shadow-sm whitespace-nowrap"
          >
            + Add Temple
          </button>
        </div>
      </div>

      {/* Add Temple Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Temple</h2>
            <form onSubmit={handleAddTemple} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temple Name</label>
                <input
                  type="text"
                  value={newTempleName}
                  onChange={(e) => setNewTempleName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g. Somnath Temple"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newTempleLocation}
                  onChange={(e) => setNewTempleLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g. Veraval, Gujarat"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Temple"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temple Cards Grid */}
      {filteredTemples.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ml-4">
          {filteredTemples.map((temple) => (
            <div
              key={temple.templeId}
              onClick={() => handleSelectTemple(temple.templeId)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
            >
              {/* Image Section */}
              <div className="h-48 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img
                  src={temple.image}
                  alt={temple.templeName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 z-20">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-md border border-white/30">
                    Active
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                  {temple.templeName}
                </h3>

                <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                  <span></span> {temple.location || "Gujarat"}
                </p>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-orange-50 p-2 rounded-lg text-center">
                    <p className="text-xs text-orange-600 font-bold">Active Slots</p>
                    <p className="text-lg font-black text-slate-800">
                      {templeStats[temple.templeId]?.activeSlots || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg text-center">
                    <p className="text-xs text-blue-600 font-bold">Visitors</p>
                    <p className="text-lg font-black text-slate-800">
                      {templeStats[temple.templeId]?.totalVisitors || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium group-hover:text-orange-500 transition-colors">Enter Dashboard</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">No temples found</h3>
          <p className="text-slate-500">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}

