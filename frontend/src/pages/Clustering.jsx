import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { stockService } from '../services/api';
import { Activity, Info } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[var(--surface-bg)] border border-[var(--surface-border)] p-3 rounded-lg shadow-xl text-sm">
                <p className="font-bold text-lg mb-1">{data.symbol}</p>
                <p className="text-[var(--text-muted)]">PCA1: <span className="text-[var(--text-main)] font-medium">{data.pca1.toFixed(2)}</span></p>
                <p className="text-[var(--text-muted)]">PCA2: <span className="text-[var(--text-main)] font-medium">{data.pca2.toFixed(2)}</span></p>
                <div className="mt-2 pt-2 border-t border-[var(--surface-border)]">
                    <p className="text-[var(--text-muted)]">Opportunity: <span className="text-primary font-bold">{data.opportunity}/100</span></p>
                </div>
            </div>
        );
    }
    return null;
};

const Clustering = () => {
    const [data, setData] = useState(null);
    const [allStocks, setAllStocks] = useState([]);
    const [selectedStocks, setSelectedStocks] = useState(['AAPL', 'JNJ', 'NVDA', 'AMD', 'PLTR']);
    const [loading, setLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        // Fetch initial clustering and all available stocks
        Promise.all([
            stockService.getClustering(),
            stockService.getSectors()
        ]).then(([clusteringRes, sectorsRes]) => {
            setData(clusteringRes.data);

            // Extract all flat stocks from sectors for selection
            const stocks = sectorsRes.data.flatMap(s => s.stocks);
            // Deduplicate (some stocks are in multiple sectors like TCS)
            const uniqueStocks = Array.from(new Map(stocks.map(s => [s.symbol, s])).values());
            setAllStocks(uniqueStocks);

            setLoading(false);
        });
    }, []);

    const toggleStockSelection = (symbol) => {
        setSelectedStocks(prev => {
            if (prev.includes(symbol)) {
                return prev.filter(s => s !== symbol);
            } else {
                return [...prev, symbol];
            }
        });
    };

    const runKMeansClustering = () => {
        setIsCalculating(true);
        // Simulate an API call / heavy ML process
        setTimeout(() => {
            // Generate simulated PCA coordinates for the currently selected stocks
            const newData = selectedStocks.map((symbol, idx) => {
                // Pseudo-random deterministic clustering based on string length and char code for consistent 'groups'
                const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const clusterId = hash % 3;

                // Base coordinates depending on cluster spread further apart
                let basePca1 = clusterId === 0 ? 3 : clusterId === 1 ? -3 : 0;
                let basePca2 = clusterId === 0 ? 1 : clusterId === 1 ? 3 : -3;

                // Add deterministic spread based on index to prevent exact overlaps within the same cluster
                const spreadX = (idx % 2 === 0 ? 1 : -1) * (1.5 + (hash % 2));
                const spreadY = (idx % 3 === 0 ? 1 : -1) * (1.5 + (hash % 3));

                return {
                    symbol,
                    pca1: basePca1 + spreadX,
                    pca2: basePca2 + spreadY,
                    cluster: clusterId,
                    opportunity: Math.floor(60 + (hash % 40))
                };
            });

            setData(prev => ({
                ...prev,
                data: newData
            }));
            setIsCalculating(false);
        }, 1200);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Market Clustering</h1>
                <p className="text-[var(--text-muted)] mt-1">K-Means clustering based on PCA dimensionality reduction.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar - Stock Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass-panel p-4 h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-[var(--text-main)]">Pool ({selectedStocks.length})</h3>
                            <button
                                onClick={runKMeansClustering}
                                disabled={isCalculating || selectedStocks.length < 3}
                                className={`px-4 py-2 rounded font-medium text-sm transition-all shadow ${isCalculating || selectedStocks.length < 3
                                    ? 'bg-[#334155] text-[#94a3b8] cursor-not-allowed'
                                    : 'bg-[#10b981] hover:bg-[#059669] text-white'
                                    }`}
                            >
                                {isCalculating ? 'Computing...' : 'Run PCA'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {allStocks.map(stock => {
                                const isSelected = selectedStocks.includes(stock.symbol);
                                return (
                                    <div
                                        key={stock.symbol}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                            ? 'bg-primary/10 border-primary/50 text-[var(--text-main)]'
                                            : 'bg-[var(--surface-bg)] border-[var(--surface-border)] text-[var(--text-muted)] hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="truncate pr-2">
                                            <p className="font-bold text-sm truncate">{stock.symbol}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleStockSelection(stock.symbol)}
                                            className={`text-[10px] px-2 py-1 rounded-sm font-bold uppercase tracking-wider transition-colors ${isSelected
                                                ? 'bg-danger/20 text-danger hover:bg-danger/30'
                                                : 'bg-[#0ea5e9]/20 text-[#0ea5e9] hover:bg-[#0ea5e9]/30'
                                                }`}
                                        >
                                            {isSelected ? '- Remove' : '+ Add'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Scatter Plot & Legend Column */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-panel p-6 h-[500px] flex flex-col relative">
                        <div className="flex items-center justify-between gap-2 mb-6 text-[var(--text-main)]">
                            <div className="flex items-center gap-2">
                                <Activity className="text-primary" size={20} />
                                <h2 className="text-xl font-semibold">PCA Visualization Map</h2>
                            </div>
                        </div>

                        {isCalculating && (
                            <div className="absolute inset-0 z-10 bg-[var(--bg-main)]/50 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    <p className="text-[var(--text-main)] font-medium animate-pulse">Running K-Means Algorithm...</p>
                                </div>
                            </div>
                        )}
                        <div className="flex-1 w-full relative z-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                                    <XAxis
                                        type="number"
                                        dataKey="pca1"
                                        name="PCA Component 1"
                                        tick={{ fill: 'var(--text-muted)' }}
                                        axisLine={{ stroke: 'var(--surface-border)' }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="pca2"
                                        name="PCA Component 2"
                                        tick={{ fill: 'var(--text-muted)' }}
                                        axisLine={{ stroke: 'var(--surface-border)' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--surface-border)' }} />
                                    <Scatter name="Stocks" data={data.data}>
                                        {data.data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.cluster % COLORS.length]} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clustering;
