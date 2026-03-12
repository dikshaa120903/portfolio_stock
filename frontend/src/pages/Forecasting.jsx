import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Cpu, Activity, AlertCircle } from 'lucide-react';
import { stockService } from '../services/api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f111a]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-50">
                <p className="text-[#a4a9c3] text-xs font-semibold uppercase tracking-widest mb-3">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-8 mb-2 last:mb-0">
                        <span className="text-white font-medium flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }} />
                            {entry.name}
                        </span>
                        <span className="text-white font-bold tracking-tight">
                            ₹{Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Forecasting = () => {
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState('');
    const [availableStocks, setAvailableStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState('');
    const [selectedModel, setSelectedModel] = useState('ARIMA');
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSectors = async () => {
            try {
                const res = await stockService.getSectors();
                const fetchedSectors = res.data || [];
                const commoditiesSector = {
                    id: "commodities",
                    name: "COMMODITIES",
                    stocks: [
                        { symbol: "GC=F", name: "Gold Futures" },
                        { symbol: "SI=F", name: "Silver Futures" },
                        { symbol: "CL=F", name: "Crude Oil Futures" }
                    ]
                };
                const allSectors = [...fetchedSectors, commoditiesSector];
                setSectors(allSectors);
                if (allSectors.length > 0) {
                    setSelectedSector(allSectors[0].name);
                }
            } catch (err) {
                console.error("Failed to load sectors:", err);
            }
        };
        loadSectors();
    }, []);

    useEffect(() => {
        if (selectedSector && sectors.length > 0) {
            const sectorData = sectors.find(s => s.name === selectedSector);
            if (sectorData && sectorData.stocks) {
                setAvailableStocks(sectorData.stocks);
                if (sectorData.stocks.length > 0) {
                    setSelectedStock(sectorData.stocks[0].symbol);
                }
            }
        }
    }, [selectedSector, sectors]);

    const availableModels = [
        { id: "ARIMA", name: "ARIMA (Statistical Auto-Regressive)" },
        { id: "LSTM", name: "LSTM (Deep Neural Network)" }
    ];

    const fetchForecast = async () => {
        if (!selectedStock) return;
        setLoading(true);
        setError(null);
        try {
            const res = await stockService.getForecastAnalysis(selectedStock.toUpperCase(), selectedModel.toLowerCase());

            // Format data for Recharts
            const combinedChartData = [];
            const d = res.data;

            // Map historical
            for (let i = 0; i < d.historical_dates.length; i++) {
                combinedChartData.push({
                    date: d.historical_dates[i],
                    Actual: d.historical_prices[i],
                    Forecast: null
                });
            }
            // Bind the last actual to forecast for visual continuity
            if (combinedChartData.length > 0) {
                const lastIdx = combinedChartData.length - 1;
                combinedChartData[lastIdx].Forecast = combinedChartData[lastIdx].Actual;
            }

            // Map future
            for (let i = 0; i < d.future_dates.length; i++) {
                combinedChartData.push({
                    date: d.future_dates[i],
                    Actual: null,
                    Forecast: d.future_predicted_prices[i]
                });
            }

            setForecastData({
                raw: d,
                chart: combinedChartData
            });

        } catch (err) {
            console.error(err);
            setError("Failed to generate forecast algorithm. The backend model may still be booting or the symbol relies on restricted data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForecast();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStock, selectedModel]);


    return (
        <div className="p-4 md:p-8 max-w-[1700px] mx-auto animate-fade-in relative font-sans text-[#a4a9c3]">

            {/* Very Subtle Page Background Mesh */}
            <div className="fixed inset-0 bg-[#06070a] -z-50 pointer-events-none"></div>

            <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
                    Stock Forecasting <span className="text-2xl font-bold bg-[#1e2029] text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-500/20 tracking-wide">AI</span>
                </h1>
                <p className="text-lg text-[#8f95b2] max-w-4xl leading-relaxed tracking-wide font-medium">
                    Select any asset to extrapolate its pricing trajectory 30 days into the future. Compare mathematical statistical modeling (ARIMA) against state-of-the-art Sequential Deep Learning patterns.
                </p>
            </div>

            {/* CONTROL BAR */}
            <div className="bg-[#0a0b0e] border border-white/10 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xl flex flex-col sm:flex-row gap-6 items-center">

                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-[#8f95b2] uppercase tracking-widest mb-2">Sector</label>
                    <div className="relative">
                        <select
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            className="w-full bg-[#111216] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-indigo-500/50 appearance-none shadow-inner transition-colors hover:bg-[#181a20]"
                        >
                            {sectors.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <Activity size={18} className="text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-[#8f95b2] uppercase tracking-widest mb-2">Stock</label>
                    <div className="relative">
                        <select
                            value={selectedStock}
                            onChange={(e) => setSelectedStock(e.target.value)}
                            className="w-full bg-[#111216] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-indigo-500/50 appearance-none shadow-inner transition-colors hover:bg-[#181a20]"
                        >
                            {availableStocks.map(s => (
                                <option key={s.symbol} value={s.symbol}>{s.name} ({s.symbol})</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <Target size={18} className="text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-[#8f95b2] uppercase tracking-widest mb-2">Algorithm Infrastructure</label>
                    <div className="relative">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-[#111216] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-emerald-500/50 appearance-none shadow-inner transition-colors hover:bg-[#181a20]"
                        >
                            {availableModels.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <Cpu size={18} className="text-emerald-400" />
                        </div>
                    </div>
                </div>

            </div>

            {/* ERROR HANDLER */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center mb-10 max-w-2xl mx-auto shadow-2xl">
                    <AlertCircle size={40} className="mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">Engine Refused Connection</h3>
                    <p className="font-medium text-rose-400/80">{error}</p>
                    <button onClick={fetchForecast} className="mt-6 px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl font-bold text-rose-300 transition-colors">
                        Reboot Model
                    </button>
                </div>
            )}

            {/* MAIN TERMINAL */}
            {!error && (
                <div className="relative bg-[#0a0b0e] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl min-h-[600px] flex flex-col">

                    {/* Ambient Glow */}
                    <div className={cn(
                        "absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 opacity-15 blur-[120px] pointer-events-none transition-colors duration-1000",
                        selectedModel === 'ARIMA' ? "bg-indigo-500" : "bg-emerald-500"
                    )}></div>

                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className={cn(
                                "animate-spin rounded-full h-16 w-16 border-b-2 mb-6 shadow-2xl",
                                selectedModel === 'ARIMA' ? "border-indigo-500" : "border-emerald-500"
                            )}></div>
                            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Compiling Tensor Graphs...</h3>
                            <p className="text-[#8f95b2] font-medium max-w-md mx-auto">Allocating compute arrays to train the {selectedModel} layer on localized 5-year trajectories.</p>
                        </div>
                    ) : forecastData && (
                        <div className="p-8 md:p-10 relative z-10 flex flex-col h-full flex-1">

                            {/* Terminal Top Bar */}
                            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-12 border-b border-white/5 pb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                                        <Target size={28} className={selectedModel === 'ARIMA' ? "text-indigo-400" : "text-emerald-400"} />
                                        Prediction Output
                                    </h2>
                                    <p className="text-[#8f95b2] font-medium tracking-wide">30-day extrapolated pathing locked onto {forecastData.raw.ticker}.</p>
                                </div>

                                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="text-center px-4">
                                        <p className="text-[#8f95b2] text-xs font-bold uppercase tracking-wider mb-1">Model Fit (R²)</p>
                                        <p className="text-xl font-black text-white">{forecastData.raw.metrics.r2.toFixed(3)}</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="text-center px-4">
                                        <p className="text-[#8f95b2] text-xs font-bold uppercase tracking-wider mb-1">Avg Margin Error</p>
                                        <p className="text-xl font-black text-white">₹{forecastData.raw.metrics.mae.toFixed(0)}</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="text-center px-4">
                                        <p className="text-[#8f95b2] text-xs font-bold uppercase tracking-wider mb-1">Directional Hit</p>
                                        <p className="text-xl font-black text-emerald-400">{forecastData.raw.metrics.directional_accuracy.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Space */}
                            <div className="w-full mt-4" style={{ height: '450px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={forecastData.chart} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8f95b2" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8f95b2" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={selectedModel === 'ARIMA' ? "#818cf8" : "#34d399"} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={selectedModel === 'ARIMA' ? "#818cf8" : "#34d399"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                                        <YAxis domain={['auto', 'auto']} stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val.toLocaleString()}`} dx={-10} />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)', strokeWidth: 1 }} />

                                        <Area
                                            name="Historical"
                                            type="monotone"
                                            dataKey="Actual"
                                            stroke="#8f95b2"
                                            fill="url(#colorActual)"
                                            strokeWidth={2}
                                            activeDot={{ r: 5, fill: '#8f95b2', strokeWidth: 0 }}
                                        />
                                        <Area
                                            name={`${selectedModel} Projection`}
                                            type="monotone"
                                            dataKey="Forecast"
                                            stroke={selectedModel === 'ARIMA' ? "#818cf8" : "#10b981"}
                                            fill="url(#colorForecast)"
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            activeDot={{ r: 8, fill: selectedModel === 'ARIMA' ? "#818cf8" : "#10b981", strokeWidth: 0, shadow: '0 0 10px yellow' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Forecasting;
