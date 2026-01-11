import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createSlot, getSlots, updateSlot, deleteSlot, getTemple, getBookings, getBookingParticipants, getParticipant } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

const timeOptions = Array.from({ length: 40 }, (_, i) => {
  const h = Math.floor((i * 30) / 60);
  const m = (i * 30) % 60;
  return `${String(h + 4).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const initialSlotState = {
  date: new Date().toISOString().split("T")[0],
  fromTime: "09:00",
  toTime: "11:00",
  onlineCapacity: 0,
  offlineCapacity: 0,
  onlineBooked: 0,
  offlineBooked: 0,
};

export default function SlotManager() {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ ...initialSlotState, id: 1 });

  const [temple, setTemple] = useState(null);

  // inline edit state
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);

  // --- API Integration ---
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templeId) {
      fetchTempleDetails();
      fetchSlots();
    }
  }, [templeId]);

  const fetchTempleDetails = async () => {
    try {
      const data = await getTemple(templeId);
      setTemple(data);
    } catch (error) {
      console.error("Failed to fetch temple details", error);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await getSlots(templeId);
      let realUsageMap = {};

      try {
        // Fetch all bookings and filter by current temple
        const allBookings = await getBookings();
        const relevantBookings = allBookings.filter(b => String(b.templeId) === String(templeId) && b.slotId);

        // Fetch participants for each booking (Parallel)
        const usagePromises = relevantBookings.map(async (b) => {
          try {
            // We use getBookingParticipants to get the list for this booking
            const participants = await getBookingParticipants(b.bookingId);

            // Note: If we needed specific details per participant, we could use getParticipant(p.id) here,
            // but for counting "Offline Data" (usage), the list length is sufficient.

            return {
              slotId: b.slotId,
              count: participants ? participants.length : 0,
              type: b.bookingType
            };
          } catch (e) {
            return { slotId: b.slotId, count: 0, type: b.bookingType };
          }
        });

        const usages = await Promise.all(usagePromises);

        usages.forEach(({ slotId, count, type }) => {
          if (!realUsageMap[slotId]) {
            realUsageMap[slotId] = { online: 0, offline: 0 };
          }

          // Check for Kiosk/Offline types (case-insensitive)
          // This updates the 'offline data' (offlineBooked count)
          const isOffline = ['KIOSK', 'OFFLINE', 'WALKIN'].includes(String(type).toUpperCase());

          if (isOffline) {
            realUsageMap[slotId].offline += count;
          } else {
            realUsageMap[slotId].online += count;
          }
        });

      } catch (e) {
        console.error("Failed to fetch real usage", e);
      }

      const mappedSlots = data.map(s => {
        const usage = realUsageMap[s.slotId || s.id] || { online: 0, offline: 0 };
        return {
          id: s.slotId || s.id,
          date: s.date,
          fromTime: s.startTime.slice(0, 5),
          toTime: s.endTime.slice(0, 5),
          onlineCapacity: s.capacity - (s.reservedOfflineTickets || 0),
          offlineCapacity: s.reservedOfflineTickets || 0,
          onlineBooked: usage.online,
          offlineBooked: usage.offline,
        };
      });
      setSlots(mappedSlots);
      setNewSlot({ ...initialSlotState, id: mappedSlots.length + 1 });
    } catch (error) {
      console.error("Failed to load slots", error);
    } finally {
      setLoading(false);
    }
  };

  // --- helpers ---
  const isTimeConflict = (slot, ignoreId = null) => {
    return slots.some((s) => {
      if (ignoreId && s.id === ignoreId) return false;
      if (s.date !== slot.date) return false;

      const startA = parseInt(slot.fromTime.replace(":", ""));
      const endA = parseInt(slot.toTime.replace(":", ""));
      const startB = parseInt(s.fromTime.replace(":", ""));
      const endB = parseInt(s.toTime.replace(":", ""));

      // Overlap logic
      return startA < endB && endA > startB;
    });
  };

  const calculateMetrics = (slot) => {
    const totalCapacity = slot.onlineCapacity + slot.offlineCapacity;
    const totalBooked = slot.onlineBooked + slot.offlineBooked;

    return {
      totalCapacity,
      totalBooked,
      totalRemaining: totalCapacity - totalBooked,
      onlineRemaining: slot.onlineCapacity - slot.onlineBooked,
      offlineRemaining: slot.offlineCapacity - slot.offlineBooked,
    };
  };

  const validateSlot = (slot, { isEdit = false } = {}) => {
    if (slot.toTime <= slot.fromTime) {
      alert("❌ 'To Time' must be later than 'From Time'");
      return false;
    }

    if (slot.onlineCapacity < 0 || slot.offlineCapacity < 0) {
      alert("❌ Capacity cannot be negative");
      return false;
    }

    if ((slot.onlineCapacity + slot.offlineCapacity) <= 0) {
      alert("❌ Total capacity must be greater than 0");
      return false;
    }

    if (slot.onlineBooked > slot.onlineCapacity || slot.offlineBooked > slot.offlineCapacity) {
      alert("❌ Booked value cannot exceed capacity");
      return false;
    }

    const conflict = isTimeConflict(slot, isEdit ? slot.id : null);
    if (conflict) {
      alert("⚠ Slot already exists or overlaps with another slot. Please choose a different time.");
      return false;
    }

    return true;
  };

  const handleApiError = (error) => {
    console.error("API Error:", error);
    if (error.message.includes("Invalid or expired token") || error.message.includes("Not authenticated") || error.message.includes("401")) {
      alert("Session expired. Please login again.");
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      navigate("/login");
    } else {
      alert("❌ Error: " + error.message);
    }
  };

  // --- create slot ---
  const handleAddSlot = async () => {
    if (!validateSlot(newSlot)) return;

    setLoading(true);
    try {
      const payload = {
        date: newSlot.date,
        startTime: newSlot.fromTime + ":00",
        endTime: newSlot.toTime + ":00",
        capacity: newSlot.onlineCapacity + newSlot.offlineCapacity,
        reservedOfflineTickets: newSlot.offlineCapacity,
        templeId: parseInt(templeId)
      };

      console.log("Creating slot with payload:", payload);

      const createdSlot = await createSlot(payload);

      const mappedSlot = {
        id: createdSlot.slotId || createdSlot.id,
        date: createdSlot.date,
        fromTime: createdSlot.startTime,
        toTime: createdSlot.endTime,
        onlineCapacity: createdSlot.capacity - (createdSlot.reservedOfflineTickets || 0),
        offlineCapacity: createdSlot.reservedOfflineTickets || 0,
        onlineBooked: 0,
        offlineBooked: 0,
      };

      const updatedSlots = [...slots, mappedSlot];
      setSlots(updatedSlots);
      setNewSlot({ ...initialSlotState, id: updatedSlots.length + 1 }); // Reset form
      alert("✅ Slot created successfully!");
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // --- delete slot ---
  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;

    try {
      await deleteSlot(id);
      const updated = slots.filter((s) => s.id !== id);
      setSlots(updated);

      if (editingSlotId === id) {
        setEditingSlotId(null);
        setEditingDraft(null);
      }
      alert("✅ Slot deleted successfully");
    } catch (error) {
      handleApiError(error);
    }
  };

  // --- edit slot (inline) ---
  const startEditing = (slot) => {
    setEditingSlotId(slot.id);
    setEditingDraft({ ...slot });
  };

  const cancelEditing = () => {
    setEditingSlotId(null);
    setEditingDraft(null);
  };

  const handleEditChange = (field, value) => {
    setEditingDraft((prev) => {
      if (!prev) return prev;

      if (["onlineCapacity", "offlineCapacity", "onlineBooked", "offlineBooked"].includes(field)) {
        const num = Number(value);
        return { ...prev, [field]: Number.isNaN(num) ? 0 : num };
      }

      return { ...prev, [field]: value };
    });
  };

  const saveEditedSlot = async () => {
    if (!editingDraft) return;

    if (!validateSlot(editingDraft, { isEdit: true })) return;

    try {
      const payload = {
        date: editingDraft.date,
        startTime: editingDraft.fromTime + ":00", // Ensure seconds are added if needed
        endTime: editingDraft.toTime + ":00",
        capacity: editingDraft.onlineCapacity + editingDraft.offlineCapacity,
        reservedOfflineTickets: editingDraft.offlineCapacity,
        remaining: (editingDraft.onlineCapacity + editingDraft.offlineCapacity) - (editingDraft.onlineBooked + editingDraft.offlineBooked) // Optional, but good to send if backend accepts it
      };

      await updateSlot(editingDraft.id, payload);

      const updatedSlots = slots.map((s) =>
        s.id === editingDraft.id ? editingDraft : s
      );
      setSlots(updatedSlots);
      setEditingSlotId(null);
      setEditingDraft(null);
      alert("✅ Slot updated successfully");
    } catch (error) {
      handleApiError(error);
    }
  };

  // sort slots by date then fromTime
  const sortedSlots = [...slots].sort((a, b) => {
    if (a.date === b.date) return a.fromTime.localeCompare(b.fromTime);
    return a.date.localeCompare(b.date);
  });

  return (
    <div className="p-4 md:p-8 min-h-screen bg-orange-50">

      {/* Back Button */}
      <button
        onClick={() => navigate(`/temple/${templeId}/dashboard`)}
        className="mb-8 flex items-center text-orange-800 hover:text-red-900 transition font-medium"
      >
        ← Return to Dashboard
      </button>

      <h2 className="text-4xl font-bold text-red-900 mb-6">
        {temple?.templeName || "Loading..."} <span className="text-sm text-gray-500">(ID: {templeId})</span>{" "}
        <span className="text-orange-600 text-2xl">Slot Administration</span>
      </h2>

      {/* NEW SLOT FORM */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-orange-200 mb-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-4">
          Create New Slot (ID: {newSlot.id})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <label className="text-sm font-medium text-orange-900 flex flex-col">
            Date
            <DatePicker
              selected={new Date(newSlot.date)}
              minDate={new Date()}
              onChange={(date) =>
                setNewSlot({ ...newSlot, date: date.toISOString().split("T")[0] })
              }
              className="mt-1 p-2 border border-orange-200 rounded-md bg-orange-50"
            />
          </label>

          {/* Total Capacity Live Calculation */}
          <div className="mt-6 text-sm font-semibold text-orange-900 bg-orange-50 p-3 rounded-md">
            Total Capacity:{" "}
            <span className="text-green-700 font-bold">
              {newSlot.onlineCapacity + newSlot.offlineCapacity}
            </span>
          </div>
        </div>

        {/* Time Row */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="text-sm font-medium text-orange-900 flex flex-col">
            From Time
            <select
              value={newSlot.fromTime}
              onChange={(e) => setNewSlot({ ...newSlot, fromTime: e.target.value })}
              className="mt-1 p-2 border border-orange-200 rounded-md bg-orange-50"
            >
              {timeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-orange-900 flex flex-col">
            To Time
            <select
              value={newSlot.toTime}
              onChange={(e) => setNewSlot({ ...newSlot, toTime: e.target.value })}
              className="mt-1 p-2 border border-orange-200 rounded-md bg-orange-50"
            >
              {timeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Capacity Row */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="text-sm font-medium text-blue-900 flex flex-col">
            Online Capacity
            <input
              type="number"
              min="0"
              value={newSlot.onlineCapacity}
              onChange={(e) =>
                setNewSlot({ ...newSlot, onlineCapacity: Number(e.target.value) })
              }
              className="mt-1 p-2 border border-blue-200 rounded-md bg-blue-50"
            />
          </label>

          <label className="text-sm font-medium text-red-900 flex flex-col">
            Offline Capacity
            <input
              type="number"
              min="0"
              value={newSlot.offlineCapacity}
              onChange={(e) =>
                setNewSlot({ ...newSlot, offlineCapacity: Number(e.target.value) })
              }
              className="mt-1 p-2 border border-red-200 rounded-md bg-red-50"
            />
          </label>
        </div>

        {/* Create Button */}
        <button
          onClick={handleAddSlot}
          disabled={loading}
          className={`mt-6 w-3xs px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-700 hover:to-red-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : "Create Slot"}
        </button>
      </div>

      {/* EXISTING SLOTS DISPLAY */}
      <h3 className="font-bold text-lg mb-4">Existing Slots</h3>

      {sortedSlots.map((slot) => {
        const isEditing = editingSlotId === slot.id;
        const current = isEditing && editingDraft ? editingDraft : slot;
        const m = calculateMetrics(current);

        return (
          <div
            key={slot.id}
            className="bg-white p-6 rounded-lg shadow-md border border-orange-200 mb-6 relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-orange-400 to-red-600 rounded-l-lg"></div>

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <span className="px-4 py-1 bg-orange-100 border border-orange-300 text-orange-700 font-semibold rounded-full">
                SLOT ID #{slot.id}
              </span>

              {/* Date (static vs edit) */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <DatePicker
                    selected={new Date(current.date)}
                    onChange={(date) =>
                      handleEditChange("date", date.toISOString().split("T")[0])
                    }
                    className="p-1 border border-orange-200 rounded-md bg-orange-50 text-sm"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600">
                    {current.date}
                  </span>
                )}
              </div>

              {/* Time display / edit */}
              {isEditing ? (
                <div className="flex gap-2 items-center">
                  <select
                    value={current.fromTime}
                    onChange={(e) => handleEditChange("fromTime", e.target.value)}
                    className="p-1 border border-orange-200 rounded-md bg-orange-50 text-sm"
                  >
                    {timeOptions.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500">to</span>
                  <select
                    value={current.toTime}
                    onChange={(e) => handleEditChange("toTime", e.target.value)}
                    className="p-1 border border-orange-200 rounded-md bg-orange-50 text-sm"
                  >
                    {timeOptions.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="px-4 py-1 bg-red-50 border border-red-300 text-red-700 font-bold rounded-full">
                  TIME: {current.fromTime} - {current.toTime}
                </span>
              )}
            </div>

            {/* Edit / Delete buttons */}
            <div className="flex justify-end gap-3 mb-2">
              {isEditing ? (
                <>
                  <button
                    onClick={saveEditedSlot}
                    className="px-4 py-1 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-1 rounded-md bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(slot)}
                    className="px-4 py-1 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="px-4 py-1 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            <hr className="border-orange-200 mb-4" />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* SUMMARY */}
              <div className="border border-orange-300 bg-orange-50 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-3">TOTAL DARSHAN SUMMARY</h3>
                <div className="grid grid-cols-3 gap-3 text-center font-semibold">
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p>Total Capacity</p>
                    <p className="text-2xl">{m.totalCapacity}</p>
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded-md p-3">
                    <p>Booked</p>
                    <p className="text-2xl">{m.totalBooked}</p>
                  </div>
                  <div className="bg-green-100 border border-green-300 rounded-md p-3">
                    <p>Remaining</p>
                    <p className="text-2xl">{m.totalRemaining}</p>
                  </div>
                </div>
              </div>

              {/* ONLINE */}
              <div className="border border-blue-300 bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-3">ONLINE BOOKING QUOTA</h3>
                <div className="grid grid-cols-3 gap-3 text-center font-semibold">
                  <div className="bg-blue-100 border border-blue-300 rounded-md p-3">
                    <p>Capacity</p>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={current.onlineCapacity}
                        onChange={(e) =>
                          handleEditChange("onlineCapacity", e.target.value)
                        }
                        className="mt-1 w-full text-center border border-blue-300 rounded-md bg-blue-50 text-sm"
                      />
                    ) : (
                      <p className="text-2xl">{current.onlineCapacity}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p>Booked</p>
                    <p className="text-2xl">{current.onlineBooked}</p>
                  </div>

                  <div className="bg-green-100 border border-green-300 rounded-md p-3">
                    <p>Available</p>
                    <p className="text-2xl">{m.onlineRemaining}</p>
                  </div>
                </div>
              </div>

              {/* OFFLINE */}
              <div className="border border-red-300 bg-red-50 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-3">OFFLINE/WALK-IN QUOTA</h3>
                <div className="grid grid-cols-3 gap-3 text-center font-semibold">
                  <div className="bg-red-100 border border-red-300 rounded-md p-3">
                    <p>Capacity</p>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={current.offlineCapacity}
                        onChange={(e) =>
                          handleEditChange("offlineCapacity", e.target.value)
                        }
                        className="mt-1 w-full text-center border border-red-300 rounded-md bg-red-50 text-sm"
                      />
                    ) : (
                      <p className="text-2xl">{current.offlineCapacity}</p>
                    )}
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p>Booked</p>
                    <p className="text-2xl">{current.offlineBooked}</p>
                  </div>

                  <div className="bg-green-100 border border-green-300 rounded-md p-3">
                    <p>Available</p>
                    <p className="text-2xl">{m.offlineRemaining}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
