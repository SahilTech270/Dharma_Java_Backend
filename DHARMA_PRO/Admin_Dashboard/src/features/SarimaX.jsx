import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Calendar, Users, Activity, Flag, AlertCircle } from 'lucide-react';
import { addTrainingData } from '../services/api';

export default function SarimaX() {
    const { templeId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        visitors: 0,
        day_of_week: new Date().getDay(),
        is_weekend: false,
        festival_name: "None", // Default string as API likely expects string
        is_festival: false,
        festival_intensity: 0,
        day_type: "Normal"
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        // Construct payload explicitly casting types as requested
        const payload = {
            date: formData.date,
            visitors: parseInt(formData.visitors),
            day_of_week: parseInt(formData.day_of_week),
            is_weekend: formData.is_weekend,
            festival_name: formData.festival_name,
            is_festival: formData.is_festival,
            festival_intensity: parseInt(formData.festival_intensity),
            day_type: formData.day_type
        };

        try {
            await addTrainingData(payload);
            setStatus({ type: 'success', message: 'Training data successfully submitted!' });
            // Optional: Reset form?
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Failed to submit data.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-inter">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">SarimaX Intelligence</h1>
                    <p className="text-slate-500 text-sm mt-1">Input data for predictive modeling</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                    Back
                </button>
            </div>

            {/* Form Card */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-orange-50/30">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        Data Entry Form
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Date & Visitor Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" /> Visitors Count
                            </label>
                            <input
                                type="number"
                                name="visitors"
                                value={formData.visitors}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Day Attributes Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Day of Week (0-6)</label>
                            <input
                                type="number"
                                name="day_of_week"
                                min="0"
                                max="6"
                                value={formData.day_of_week}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                            />
                            <p className="text-[10px] text-slate-400">0=Sunday, 6=Saturday</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Day Type</label>
                            <input
                                type="text"
                                name="day_type"
                                value={formData.day_type}
                                onChange={handleChange}
                                placeholder="e.g. Normal, Holiday"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                            />
                        </div>

                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_weekend"
                                        checked={formData.is_weekend}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600 transition-colors">Is Weekend?</span>
                            </label>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Festival Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Flag className="w-4 h-4 text-orange-600" /> Festival Details
                            </h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_festival"
                                    checked={formData.is_festival}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-slate-600">Is Festival?</span>
                            </label>
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${formData.is_festival ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Festival Name</label>
                                <input
                                    type="text"
                                    name="festival_name"
                                    value={formData.festival_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Intensity (1-10)</label>
                                <input
                                    type="number"
                                    name="festival_intensity"
                                    min="0"
                                    max="10"
                                    value={formData.festival_intensity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 px-6 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 
                                ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-orange-500 hover:to-red-500 active:scale-[0.98]'}`}
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Submit Data
                                </>
                            )}
                        </button>
                    </div>

                </form>
                {/* Status Message */}
                {status && (
                    <div className={`mx-8 mb-8 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <AlertCircle className="w-5 h-5" />
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}
