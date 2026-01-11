import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CameraView() {
    const { templeId } = useParams();
    const navigate = useNavigate();

    // Mock Temple Data
    const temple = {
        templeId: templeId,
        templeName: templeId?.includes('Somnath') ? 'Somnath Temple' :
            templeId?.includes('Dwarka') ? 'Dwarkadhish Temple' :
                templeId?.includes('Ambaji') ? 'Ambaji Temple' : 'Temple'
    };

    // Mock Camera Feeds
    const cameras = [
        { id: 1, name: "Main Entrance", status: "Live" },
        { id: 2, name: "Sanctum Sanctorum", status: "Live" },
        { id: 3, name: "Parking Lot A", status: "Live" },
        { id: 4, name: "Parking Lot B", status: "Maintenance" },
        { id: 5, name: "Queue Complex", status: "Live" },
        { id: 6, name: "Exit Gate", status: "Live" },
    ];

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/temple/${templeId}/dashboard`)}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-300 hover:text-white"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Surveillance System</h1>
                        <p className="text-gray-400">{temple.templeName} • {cameras.length} Cameras Active</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold animate-pulse">LIVE REC</span>
                </div>
            </div>

            {/* Camera Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map((cam) => (
                    <div key={cam.id} className="bg-black rounded-xl overflow-hidden border border-gray-800 relative group">
                        {/* Mock Video Feed Placeholder */}
                        <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <span className="text-6xl opacity-20"></span>

                            {/* Timestamp Overlay */}
                            <div className="absolute top-4 right-4 text-xs font-mono text-green-400">
                                {new Date().toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Camera Info */}
                        <div className="p-4 flex justify-between items-center bg-gray-900">
                            <div>
                                <h3 className="font-semibold text-sm">{cam.name}</h3>
                                <p className="text-xs text-gray-500">CAM-{cam.id.toString().padStart(3, '0')}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${cam.status === 'Live' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
