import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateAdminProfile, deleteAdminProfile } from '../services/api';

export default function Profile({ user, onUpdate, onLogout }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        adminName: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                adminName: user.name || '',
                email: user.email || '',
                password: '' // Don't populate password
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const updateData = {
                adminName: formData.adminName,
                email: formData.email
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await updateAdminProfile(updateData, user.token);

            // Update local user state
            onUpdate({
                ...user,
                name: formData.adminName,
                email: formData.email
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteAdminProfile(user.token);
            onLogout();
            navigate('/login');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
            setShowDeleteConfirm(false);
        } finally {
            setIsLoading(false);
        }
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
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500">Manage your account settings</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password (leave blank to keep current)</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-3 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                    >
                        Delete Account
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Account?</h3>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                            >
                                {isLoading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
