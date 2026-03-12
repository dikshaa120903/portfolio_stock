import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Line } from 'recharts';
import { Target, TrendingUp, AlertCircle, Link, LineChart, Activity } from 'lucide-react';
import { stockService } from '../services/api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0 && payload[0].payload) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#0f111a]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-50">
                <p className="text-[#a4a9c3] text-xs font-semibold tracking-widest mb-3 border-b border-white/10 pb-2">{data.date}</p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-8">
                        <span className="text-[#fbbf24] font-medium text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#fbbf24]" /> Gold (X)
                        </span>
                        <span className="text-white font-bold">₹{Number(data.x_gold).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center gap-8">
                        <span className="text-[#94a3b8] font-medium text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#94a3b8]" /> Silver (Y)
                        </span>
                        <span className="text-white font-bold">₹{Number(data.y_silver).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const GoldSilverCorrelation = () => {
    const [timeframe, setTimeframe] = useState(120);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const timeframes = [
        { label: "1 Month", days: 30 },
        { label: "3 Months", days: 90 },
        { label: "6 Months", days: 180 },
        { label: "1 Year", days: 365 },
        { label: "2 Years", days: 730 },
        { label: "5 Years", days: 1825 }
    ];

    const loadCorrelation = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await stockService.getGoldSilverCorrelation(timeframe);
            if (res.data.status === "error") {
                setError(res.data.message);
            } else {
                setData(res.data);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch precious metals correlation mapping.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCorrelation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeframe]);


    const getCorrelationStrength = (r) => {
        const absR = Math.abs(r);
        if (absR >= 0.8) return { text: "Very Strong", color: "text-emerald-400" };
        if (absR >= 0.6) return { text: "Strong", color: "text-emerald-400" };
        if (absR >= 0.4) return { text: "Moderate", color: "text-amber-400" };
        if (absR >= 0.2) return { text: "Weak", color: "text-rose-400" };
        return { text: "None/Negligible", color: "text-rose-500" };
    };

    return (
        <div className="p-4 md:p-8 max-w-[1700px] mx-auto animate-fade-in relative font-sans text-[#a4a9c3]">
            {/* Background */}
            <div className="fixed inset-0 bg-[#06070a] -z-50 pointer-events-none"></div>

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
                    Precious Metals <span className="text-2xl font-bold bg-[#1e2029] text-amber-400 px-4 py-1.5 rounded-full border border-amber-500/20 tracking-wide">Correlation</span>
                </h1>
                <p className="text-lg text-[#8f95b2] max-w-4xl leading-relaxed tracking-wide font-medium">
                    Analyze the paired market behavior between Gold (GC=F) and Silver (SI=F).
                    This module utilizes a Scikit-Learn Linear Regression model to map their Pearson relationship over time.
                </p>
            </div>

            {/* Controls */}
            <div className="bg-[#0a0b0e] border border-white/10 rounded-2xl p-4 sm:p-6 mb-10 shadow-2xl flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link size={24} className="text-indigo-400" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Time Horizon Selection</h2>
                </div>
                <div className="flex bg-[#111216] border border-white/10 rounded-xl p-1 overflow-x-auto">
                    {timeframes.map(tf => (
                        <button
                            key={tf.days}
                            onClick={() => setTimeframe(tf.days)}
                            className={cn(
                                "px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                timeframe === tf.days
                                    ? "bg-indigo-500 text-white shadow-lg"
                                    : "text-[#8f95b2] hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ERROR HANDLER */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center mb-10 shadow-2xl">
                    <AlertCircle size={40} className="mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">Data Integrity Error</h3>
                    <p className="font-medium text-rose-400/80">{error}</p>
                    <button onClick={loadCorrelation} className="mt-6 px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl font-bold text-rose-300 transition-colors">
                        Retry Fetch
                    </button>
                </div>
            )}

            {/* Main Content */}
            {!error && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* The Chart Room */}
                    <div className="lg:col-span-3 bg-[#0a0b0e] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col relative min-h-[600px]">

                        {/* Ambient Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-amber-500 opacity-10 blur-[120px] pointer-events-none"></div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mb-6 shadow-2xl"></div>
                                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Plotting Regression...</h3>
                                <p className="text-[#8f95b2] font-medium max-w-md mx-auto">Calculating the least-squares best fit line between GC=F and SI=F trajectories.</p>
                            </div>
                        ) : data && (
                            <div className="p-6 md:p-10 flex flex-col flex-1 h-full relative z-10 w-full">
                                <h2 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                                    <LineChart className="text-amber-500" />
                                    Linear Regression Scatter
                                </h2>
                                <p className="text-[#8f95b2] text-sm mb-8 font-medium">Gold Pricing vs Silver Pricing (₹ INR)</p>

                                <div className="flex-1 w-full min-h-[500px]" style={{ height: '500px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                type="number"
                                                dataKey="x_gold"
                                                name="Gold Price"
                                                domain={['auto', 'auto']}
                                                stroke="#6b7280"
                                                fontSize={11}
                                                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                                            />
                                            <YAxis
                                                type="number"
                                                dataKey="y_silver"
                                                name="Silver Price"
                                                domain={['auto', 'auto']}
                                                stroke="#6b7280"
                                                fontSize={11}
                                                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                                                dx={-10}
                                            />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#4f46e5', strokeWidth: 1 }} />

                                            {/* The Actual Scatter Points */}
                                            <Scatter name="Actual Trading Days" data={data.scatter} fill="#fbbf24" shape="circle" />

                                            {/* The Mathematical Trendline */}
                                            <Scatter name="Regression Line" data={data.trendline} line={{ stroke: '#6366f1', strokeWidth: 3 }} shape={() => null} />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stat Dashboard Container */}
                    <div className="lg:col-span-1 flex flex-col gap-6 w-full">
                        {!loading && data && (
                            <>
                                {/* R Score */}
                                <div className="bg-[#0a0b0e] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold text-[#8f95b2] uppercase tracking-wider">Pearson Correlation (R)</h3>
                                        <Target size={18} className="text-indigo-400" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-5xl font-black text-white tracking-tighter mb-2">{data.pearson_r.toFixed(3)}</p>
                                        <p className={cn("text-sm font-bold tracking-wide", getCorrelationStrength(data.pearson_r).color)}>
                                            {getCorrelationStrength(data.pearson_r).text} Relationship
                                        </p>
                                    </div>
                                </div>

                                {/* R Squared */}
                                <div className="bg-[#0a0b0e] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold text-[#8f95b2] uppercase tracking-wider">Model Fit ($R^2$)</h3>
                                        <Activity size={18} className="text-emerald-400" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-4xl font-black text-white tracking-tighter mb-2">{(data.r_squared * 100).toFixed(1)}%</p>
                                        <p className="text-sm font-medium text-[#8f95b2] leading-relaxed">
                                            Percentage of variation in Silver prices explained purely by Gold's movement.
                                        </p>
                                    </div>
                                </div>

                                {/* Mathematical Breakdown */}
                                <div className="bg-[#111216] border border-white/5 rounded-3xl p-6 shadow-Inner flex-1">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b border-white/10">Equation Breakdown</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[#8f95b2] text-xs font-bold uppercase tracking-widest mb-1">Slope (m)</p>
                                            <p className="text-xl font-bold text-white">{data.slope.toFixed(4)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[#8f95b2] text-xs font-bold uppercase tracking-widest mb-1">Y-Intercept (b)</p>
                                            <p className="text-xl font-bold text-white">₹{data.intercept.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        </div>

                                        <div className="pt-6 border-t border-white/10">
                                            <p className="text-[#8f95b2] text-xs font-bold uppercase tracking-widest leading-loose text-center">
                                                Silver = ({data.slope.toFixed(2)} × Gold) <br /> + {data.intercept.toFixed(0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {loading && (
                            <div className="flex-1 bg-[#0a0b0e] border border-white/5 rounded-3xl flex items-center justify-center min-h-[400px]">
                                <p className="text-[#8f95b2] font-medium animate-pulse">Computing metrics...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoldSilverCorrelation;
