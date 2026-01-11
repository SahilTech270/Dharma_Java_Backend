import React, { useState } from 'react';

export default function SchematicMap({ zones, onZoneHover }) {
    const [hoveredZone, setHoveredZone] = useState(null);

    const handleMouseEnter = (zoneId) => {
        setHoveredZone(zoneId);
        if (onZoneHover) onZoneHover(zoneId);
    };

    const handleMouseLeave = () => {
        setHoveredZone(null);
        if (onZoneHover) onZoneHover(null);
    };

    const getZoneColor = (zoneId) => {
        const zone = zones.find(z => z.id === zoneId);
        return zone ? zone.color : '#334155';
    };

    const getZoneOpacity = (zoneId) => {
        return hoveredZone === zoneId ? '1' : '0.8';
    };

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full relative overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-orange-500">🗺️</span> Interactive Temple Map
            </h3>

            {/* Schematic Layout Container */}
            <div className="relative w-full h-[500px] border-2 border-orange-100 rounded-xl p-4 bg-slate-50">

                {/* Grid Layout */}
                <div className="grid grid-cols-12 grid-rows-12 gap-2 h-full w-full">

                    {/* Sanctum (Top Center) */}
                    <div
                        className="col-start-5 col-span-4 row-start-2 row-span-3 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 border border-slate-200 shadow-md group"
                        style={{ backgroundColor: getZoneColor('sanctum'), opacity: getZoneOpacity('sanctum') }}
                        onMouseEnter={() => handleMouseEnter('sanctum')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-white font-bold text-sm drop-shadow-md group-hover:scale-110 transition-transform">Sanctum</span>
                    </div>

                    {/* Exit Path (Below Sanctum) */}
                    <div className="col-start-4 col-span-6 row-start-5 row-span-1 bg-slate-200 rounded flex items-center justify-center">
                        <span className="text-slate-500 text-xs">Exit Path</span>
                    </div>

                    {/* Assembly Hall / Mandap (Center) */}
                    <div
                        className="col-start-4 col-span-6 row-start-6 row-span-3 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 border border-slate-200 shadow-md group"
                        style={{ backgroundColor: getZoneColor('mandap'), opacity: getZoneOpacity('mandap') }}
                        onMouseEnter={() => handleMouseEnter('mandap')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-white font-bold text-sm drop-shadow-md group-hover:scale-110 transition-transform">Assembly Hall</span>
                    </div>

                    {/* Prasad (Left) */}
                    <div className="col-start-2 col-span-2 row-start-6 row-span-3 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                        <span className="text-emerald-700 font-medium text-xs">Prasad</span>
                    </div>

                    {/* Ghat Area (Right) */}
                    <div className="col-start-10 col-span-2 row-start-6 row-span-3 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                        <span className="text-amber-700 font-medium text-xs">Ghat Area</span>
                    </div>

                    {/* Queue Hall (Bottom Center) */}
                    <div
                        className="col-start-4 col-span-6 row-start-9 row-span-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 border border-slate-200 shadow-md group"
                        style={{ backgroundColor: getZoneColor('queue'), opacity: getZoneOpacity('queue') }}
                        onMouseEnter={() => handleMouseEnter('queue')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-white font-bold text-sm drop-shadow-md group-hover:scale-110 transition-transform">Queue Hall</span>
                    </div>

                    {/* Main Gate (Bottom) */}
                    <div className="col-start-6 col-span-2 row-start-11 row-span-1 border-2 border-orange-300 rounded flex items-center justify-center bg-orange-50">
                        <span className="text-orange-600 text-xs font-bold">Main Gate</span>
                    </div>

                    {/* Parking (Bottom Left) */}
                    <div
                        className="col-start-2 col-span-3 row-start-12 row-span-1 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 border border-slate-200 shadow-md group"
                        style={{ backgroundColor: getZoneColor('parking'), opacity: getZoneOpacity('parking') }}
                        onMouseEnter={() => handleMouseEnter('parking')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-white font-bold text-xs drop-shadow-md group-hover:scale-110 transition-transform">Parking</span>
                    </div>

                    {/* Front Road (Bottom Right) */}
                    <div className="col-start-5 col-span-7 row-start-12 row-span-1 bg-slate-100 rounded flex items-center justify-center border-t border-dashed border-slate-300">
                        <span className="text-slate-400 text-xs tracking-widest">FRONT ROAD</span>
                    </div>

                </div>
            </div>

            <p className="text-slate-400 text-xs mt-4 text-center">Hover over a zone to see live details</p>
        </div>
    );
}

