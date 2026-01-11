import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddStaff() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Staff',
        temple: 'Somnath Temple'
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock API call
        setTimeout(() => {
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <span className="text-xl">←</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Add New Staff Member</h1>
                    <p className="text-slate-500">Create a new account for temple staff or admin.</p>
                </div>
            </div>

            {showSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        ✓
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Staff Member Added!</h3>
                    <p className="text-slate-600">Redirecting to dashboard...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            placeholder="e.g. Rajesh Kumar"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            placeholder="e.g. rajesh@dharma.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Role</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option>Staff</option>
                                <option>Admin</option>
                                <option>Manager</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Assigned Temple</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
                                value={formData.temple}
                                onChange={(e) => setFormData({ ...formData, temple: e.target.value })}
                            >
                                <option>Somnath Temple</option>
                                <option>Dwarkadhish</option>
                                <option>Ambaji Temple</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-200"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
