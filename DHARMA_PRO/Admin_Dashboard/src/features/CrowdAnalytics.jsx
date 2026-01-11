import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CrowdAnalytics({ data }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-orange-500">📈</span> Crowd Analytics
                </h3>
                <p className="text-slate-500 text-sm mt-1">Crowd throughout the day</p>
            </div>

            <div className="flex-1 w-full min-h-0">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="time"
                                stroke="#94a3b8"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#fb923c' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="density"
                                stroke="#fb923c"
                                strokeWidth={3}
                                dot={{ fill: '#fb923c', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#fff', stroke: '#fb923c' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p>No data available for this date</p>
                    </div>
                )}
            </div>
        </div>
    );
}
