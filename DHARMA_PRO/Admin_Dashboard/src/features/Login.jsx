import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginAdmin, getAdminProfile } from "../services/api";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (username && password) {
            try {
                setIsLoading(true);
                // 1. Login to get token
                const loginResponse = await loginAdmin({
                    username: username,
                    password: password
                });

                // 2. Fetch admin profile using the token
                // Assuming loginResponse contains access_token
                if (!loginResponse.access_token) {
                    throw new Error("No access token received");
                }

                const profileResponse = await getAdminProfile(loginResponse.access_token);

                // 3. Combine data and notify app
                const userData = {
                    ...profileResponse,
                    token: loginResponse.access_token
                };

                onLogin(userData);
                navigate("/");
            } catch (err) {
                console.error("Login flow error:", err);
                setError(err.message || "Login failed. Please check your credentials.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("Please enter username and password");
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
                            <span className="text-3xl"></span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
                        <p className="text-gray-500">Sign in to manage your temple darshans</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:border-orange-300"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:border-orange-300"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
