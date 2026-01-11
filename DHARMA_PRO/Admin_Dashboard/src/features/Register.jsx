import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerAdmin } from "../services/api";

export default function Register({ onRegister }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (name && email && password) {
            try {
                setIsLoading(true);
                const response = await registerAdmin({
                    adminName: name,
                    email: email,
                    password: password
                });

                // Call onRegister with the response data or just the user info
                // Assuming response contains the created user or token
                onRegister({ name, email });
                navigate("/");
            } catch (err) {
                setError(err.message || "Registration failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("Please fill in all fields");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transform rotate-3">
                            <span className="text-3xl">📝</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Join the community of devotees</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:border-orange-300"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:border-orange-300"
                                placeholder="admin@dharma.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:border-orange-300"
                                placeholder="Create a strong password"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="text-orange-700 font-semibold hover:text-orange-800 hover:underline transition-colors">
                                Sign In Here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
